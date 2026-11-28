-- ============================================================
-- SQL Setup for Multi-Domain Partner QR / vCard (e.g., *.narainstitute.net)
-- Run this in Supabase Dashboard -> SQL Editor AFTER sql/sql_qr_codes_setup.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tambah kolom multi-domain & metadata organisasi pada public.qr_codes
ALTER TABLE public.qr_codes
    ADD COLUMN IF NOT EXISTS public_domain text NOT NULL DEFAULT 'freebuildcv.tech';

ALTER TABLE public.qr_codes
    ADD COLUMN IF NOT EXISTS org_slug text DEFAULT NULL;

ALTER TABLE public.qr_codes
    ADD COLUMN IF NOT EXISTS external_owner_ref text DEFAULT NULL;

UPDATE public.qr_codes
SET public_domain = 'freebuildcv.tech'
WHERE public_domain IS NULL OR trim(public_domain) = '';

-- Hapus constraint unik global lama pada short_code agar slug sama bisa hidup di domain berbeda
-- (mis. asep.freebuildcv.tech dan asep.narainstitute.net)
ALTER TABLE public.qr_codes
    DROP CONSTRAINT IF EXISTS qr_codes_short_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_codes_slug_domain_unique
    ON public.qr_codes (lower(short_code), lower(public_domain));

CREATE INDEX IF NOT EXISTS idx_qr_codes_public_domain
    ON public.qr_codes (lower(public_domain));

CREATE INDEX IF NOT EXISTS idx_qr_codes_org_slug
    ON public.qr_codes (lower(org_slug))
    WHERE org_slug IS NOT NULL;

-- 2. Tabel konfigurasi domain partner terproteksi (secret HANYA dibaca fungsi SECURITY DEFINER)
CREATE TABLE IF NOT EXISTS public.qr_partner_domains (
    domain text PRIMARY KEY,
    org_slug text UNIQUE NOT NULL,
    org_name text NOT NULL,
    signing_secret text NOT NULL,
    allowed_email_domain text DEFAULT NULL,
    waive_custom_domain_credit boolean NOT NULL DEFAULT true,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_partner_domains ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.qr_partner_domains FROM PUBLIC, anon, authenticated;

-- 3. Helper internal: verifikasi Signed Partner JWT (HS256 / HMAC-SHA256) dari Laravel
CREATE OR REPLACE FUNCTION public._decode_verify_qr_partner_token(p_token text)
RETURNS TABLE (
    valid boolean,
    domain text,
    org_slug text,
    org_name text,
    waive_credit boolean,
    payload jsonb,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_parts text[];
    v_header_b64 text;
    v_payload_b64 text;
    v_sig_b64 text;
    v_b64 text;
    v_payload jsonb;
    v_domain text;
    v_exp bigint;
    v_partner public.qr_partner_domains%ROWTYPE;
    v_expected_sig_raw bytea;
    v_expected_sig_b64 text;
BEGIN
    IF p_token IS NULL OR length(trim(p_token)) < 20 THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Token partner kosong atau tidak valid.'::text;
        RETURN;
    END IF;

    v_parts := string_to_array(trim(p_token), '.');
    IF array_length(v_parts, 1) IS DISTINCT FROM 3 THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Format token partner tidak valid.'::text;
        RETURN;
    END IF;

    v_header_b64 := v_parts[1];
    v_payload_b64 := v_parts[2];
    v_sig_b64 := v_parts[3];

    BEGIN
        v_b64 := translate(v_payload_b64, '-_', '+/');
        IF (length(v_b64) % 4) = 2 THEN
            v_b64 := v_b64 || '==';
        ELSIF (length(v_b64) % 4) = 3 THEN
            v_b64 := v_b64 || '=';
        ELSIF (length(v_b64) % 4) = 1 THEN
            RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Encoding payload token tidak valid.'::text;
            RETURN;
        END IF;

        v_payload := convert_from(decode(v_b64, 'base64'), 'UTF8')::jsonb;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Payload token tidak dapat dibaca.'::text;
        RETURN;
    END;

    v_domain := lower(trim(COALESCE(v_payload->>'domain', '')));
    IF v_domain = '' THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Domain partner tidak ditemukan pada token.'::text;
        RETURN;
    END IF;

    SELECT * INTO v_partner
    FROM public.qr_partner_domains pd
    WHERE lower(pd.domain) = v_domain
      AND pd.is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Domain partner belum terdaftar atau nonaktif.'::text;
        RETURN;
    END IF;

    IF v_partner.signing_secret IS NULL
       OR length(trim(v_partner.signing_secret)) < 16
       OR v_partner.signing_secret = 'GANTI_DENGAN_VCARD_PARTNER_SECRET_YANG_SAMA_DENGAN_LARAVEL'
    THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Kunci rahasia partner di Supabase belum dikonfigurasi.'::text;
        RETURN;
    END IF;

    v_expected_sig_raw := hmac(
        convert_to(v_header_b64 || '.' || v_payload_b64, 'UTF8'),
        convert_to(v_partner.signing_secret, 'UTF8'),
        'sha256'
    );
    v_expected_sig_b64 := rtrim(
        translate(
            regexp_replace(encode(v_expected_sig_raw, 'base64'), '[\r\n]+', '', 'g'),
            '+/',
            '-_'
        ),
        '='
    );

    IF digest(v_expected_sig_b64, 'sha256') IS DISTINCT FROM digest(v_sig_b64, 'sha256') THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Tanda tangan token partner tidak cocok.'::text;
        RETURN;
    END IF;

    BEGIN
        v_exp := COALESCE((v_payload->>'exp')::bigint, 0);
    EXCEPTION WHEN OTHERS THEN
        v_exp := 0;
    END;

    IF v_exp < floor(extract(epoch from now()))::bigint THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::text, false, NULL::jsonb, 'Sesi tautan partner sudah kedaluwarsa. Buka ulang tombol vCard dari dashboard.'::text;
        RETURN;
    END IF;

    RETURN QUERY SELECT
        true,
        lower(v_partner.domain),
        v_partner.org_slug,
        v_partner.org_name,
        v_partner.waive_custom_domain_credit,
        v_payload,
        NULL::text;
END;
$$;

REVOKE ALL ON FUNCTION public._decode_verify_qr_partner_token(text) FROM PUBLIC, anon, authenticated;

-- 4. RPC publik: verifikasi partner token saat user masuk dari Dashboard Laravel
CREATE OR REPLACE FUNCTION public.verify_qr_partner_token(p_token text)
RETURNS TABLE (
    valid boolean,
    domain text,
    org_slug text,
    org_name text,
    waive_credit boolean,
    payload jsonb,
    error_message text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT * FROM public._decode_verify_qr_partner_token(p_token);
$$;

REVOKE ALL ON FUNCTION public.verify_qr_partner_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_qr_partner_token(text) TO anon, authenticated;

-- 5. RPC autentikasi: daftar domain yang boleh dipilih user yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_allowed_qr_domains(p_partner_token text DEFAULT NULL)
RETURNS TABLE (
    domain text,
    org_slug text,
    org_name text,
    waive_credit boolean,
    auth_source text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_user_email text;
    v_email_confirmed boolean;
    v_token_valid boolean := false;
    v_token_domain text := NULL;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NOT NULL THEN
        SELECT lower(trim(u.email)), (u.email_confirmed_at IS NOT NULL)
        INTO v_user_email, v_email_confirmed
        FROM auth.users u
        WHERE u.id = v_user_id;
    END IF;

    IF p_partner_token IS NOT NULL AND length(trim(p_partner_token)) > 0 THEN
        SELECT t.valid, t.domain
        INTO v_token_valid, v_token_domain
        FROM public._decode_verify_qr_partner_token(p_partner_token) t
        LIMIT 1;
    END IF;

    RETURN QUERY
    WITH combined AS (
        SELECT
            'freebuildcv.tech'::text AS domain,
            'freebuildcv'::text AS org_slug,
            'FreeBuild CV'::text AS org_name,
            false AS waive_credit,
            'default'::text AS auth_source,
            2 AS sort_priority

        UNION ALL

        SELECT
            lower(pd.domain) AS domain,
            pd.org_slug,
            pd.org_name,
            pd.waive_custom_domain_credit AS waive_credit,
            CASE
                WHEN v_token_valid AND lower(pd.domain) = v_token_domain THEN 'partner_token'
                ELSE 'email_domain'
            END AS auth_source,
            1 AS sort_priority
        FROM public.qr_partner_domains pd
        WHERE pd.is_active = true
          AND (
              (v_token_valid AND lower(pd.domain) = v_token_domain)
              OR (
                  v_email_confirmed = true
                  AND v_user_email IS NOT NULL
                  AND pd.allowed_email_domain IS NOT NULL
                  AND v_user_email LIKE ('%@' || lower(trim(pd.allowed_email_domain)))
              )
          )
    )
    SELECT DISTINCT ON (c.domain)
        c.domain,
        c.org_slug,
        c.org_name,
        c.waive_credit,
        c.auth_source
    FROM combined c
    ORDER BY c.domain, c.sort_priority ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_allowed_qr_domains(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_allowed_qr_domains(text) TO anon, authenticated;

-- 6. Perbarui RPC cek ketersediaan slug per domain
DROP FUNCTION IF EXISTS public.check_qr_slug_available(text, uuid);
DROP FUNCTION IF EXISTS public.check_qr_slug_available(text, uuid, text);

CREATE OR REPLACE FUNCTION public.check_qr_slug_available(
    p_slug text,
    p_exclude_id uuid DEFAULT NULL,
    p_public_domain text DEFAULT 'freebuildcv.tech'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_clean text;
    v_domain text;
BEGIN
    v_clean := lower(trim(COALESCE(p_slug, '')));
    v_domain := lower(trim(COALESCE(NULLIF(trim(p_public_domain), ''), 'freebuildcv.tech')));

    IF length(v_clean) < 3 THEN
        RETURN false;
    END IF;

    RETURN NOT EXISTS (
        SELECT 1
        FROM public.qr_codes qr
        WHERE lower(qr.short_code) = v_clean
          AND lower(qr.public_domain) = v_domain
          AND (p_exclude_id IS NULL OR qr.id <> p_exclude_id)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.check_qr_slug_available(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_qr_slug_available(text, uuid, text) TO authenticated;

-- 7. Perbarui RPC save_user_qr dengan validasi domain partner & keunikan (short_code, public_domain)
DROP FUNCTION IF EXISTS public.save_user_qr(uuid, text, text, text, jsonb, jsonb, boolean, text);
DROP FUNCTION IF EXISTS public.save_user_qr(uuid, text, text, text, jsonb, jsonb, boolean, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.save_user_qr(
    p_id uuid DEFAULT NULL,
    p_short_code text DEFAULT NULL,
    p_qr_type text DEFAULT 'url',
    p_title text DEFAULT 'Kode QR Situs Web',
    p_content_data jsonb DEFAULT '{}'::jsonb,
    p_style_options jsonb DEFAULT '{}'::jsonb,
    p_password_enabled boolean DEFAULT false,
    p_new_password text DEFAULT NULL,
    p_public_domain text DEFAULT 'freebuildcv.tech',
    p_partner_token text DEFAULT NULL,
    p_org_slug text DEFAULT NULL,
    p_external_owner_ref text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    short_code text,
    public_domain text,
    org_slug text,
    external_owner_ref text,
    user_id uuid,
    qr_type text,
    title text,
    content_data jsonb,
    style_options jsonb,
    requires_password boolean,
    scan_count int,
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_user_email text;
    v_email_confirmed boolean := false;
    v_existing_hash text;
    v_existing_domain text;
    v_existing_org text;
    v_existing_ext_ref text;
    v_new_hash text;
    v_saved_id uuid;
    v_clean_title text;
    v_domain text;
    v_partner public.qr_partner_domains%ROWTYPE;
    v_token_valid boolean := false;
    v_token_domain text := NULL;
    v_token_org text := NULL;
    v_token_payload jsonb := NULL;
    v_final_org text := NULL;
    v_final_ext_ref text := NULL;
    v_domain_allowed boolean := false;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Autentikasi diperlukan. Silakan login terlebih dahulu.';
    END IF;

    IF p_qr_type NOT IN ('url', 'vcard', 'pdf', 'image', 'social', 'video', 'business', 'menu') THEN
        RAISE EXCEPTION 'Jenis QR tidak didukung.';
    END IF;

    v_clean_title := COALESCE(NULLIF(trim(p_title), ''), 'Kode QR Situs Web');
    v_domain := lower(trim(COALESCE(NULLIF(trim(p_public_domain), ''), 'freebuildcv.tech')));

    IF p_id IS NOT NULL THEN
        SELECT qr.password_hash, lower(qr.public_domain), qr.org_slug, qr.external_owner_ref
        INTO v_existing_hash, v_existing_domain, v_existing_org, v_existing_ext_ref
        FROM public.qr_codes qr
        WHERE qr.id = p_id AND qr.user_id = v_user_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Data QR tidak ditemukan atau Anda tidak memiliki akses.';
        END IF;
    END IF;

    -- Validasi otorisasi domain khusus partner (selain freebuildcv.tech)
    IF v_domain <> 'freebuildcv.tech' THEN
        SELECT * INTO v_partner
        FROM public.qr_partner_domains pd
        WHERE lower(pd.domain) = v_domain
          AND pd.is_active = true
        LIMIT 1;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Domain "%" tidak terdaftar atau belum diaktifkan.', v_domain;
        END IF;

        IF p_partner_token IS NOT NULL AND length(trim(p_partner_token)) > 0 THEN
            SELECT t.valid, t.domain, t.org_slug, t.payload
            INTO v_token_valid, v_token_domain, v_token_org, v_token_payload
            FROM public._decode_verify_qr_partner_token(p_partner_token) t
            LIMIT 1;
        END IF;

        IF v_token_valid AND v_token_domain = v_domain THEN
            v_domain_allowed := true;
            v_final_org := COALESCE(v_token_org, v_partner.org_slug);
            v_final_ext_ref := COALESCE(NULLIF(trim(v_token_payload->>'external_user_id'), ''), NULLIF(trim(p_external_owner_ref), ''));
        ELSE
            SELECT lower(trim(u.email)), (u.email_confirmed_at IS NOT NULL)
            INTO v_user_email, v_email_confirmed
            FROM auth.users u
            WHERE u.id = v_user_id;

            IF v_email_confirmed
               AND v_user_email IS NOT NULL
               AND v_partner.allowed_email_domain IS NOT NULL
               AND v_user_email LIKE ('%@' || lower(trim(v_partner.allowed_email_domain)))
            THEN
                v_domain_allowed := true;
                v_final_org := v_partner.org_slug;
                v_final_ext_ref := COALESCE(v_existing_ext_ref, NULLIF(trim(p_external_owner_ref), ''));
            ELSIF p_id IS NOT NULL AND v_existing_domain = v_domain THEN
                v_domain_allowed := true;
                v_final_org := COALESCE(v_existing_org, v_partner.org_slug);
                v_final_ext_ref := COALESCE(v_existing_ext_ref, NULLIF(trim(p_external_owner_ref), ''));
            END IF;
        END IF;

        IF NOT v_domain_allowed THEN
            RAISE EXCEPTION 'Akses ditolak: Anda harus membuka builder melalui dashboard resmi % atau masuk dengan email resmi untuk menggunakan domain %.', v_partner.org_name, v_domain;
        END IF;
    ELSE
        v_final_org := COALESCE(NULLIF(trim(p_org_slug), ''), v_existing_org);
        v_final_ext_ref := COALESCE(NULLIF(trim(p_external_owner_ref), ''), v_existing_ext_ref);
    END IF;

    IF p_id IS NOT NULL THEN
        IF NOT p_password_enabled THEN
            v_new_hash := NULL;
        ELSIF p_new_password IS NOT NULL AND length(trim(p_new_password)) > 0 THEN
            v_new_hash := crypt(p_new_password, gen_salt('bf'));
        ELSE
            v_new_hash := v_existing_hash;
        END IF;

        IF p_short_code IS NOT NULL AND length(trim(p_short_code)) > 0 THEN
            IF length(trim(p_short_code)) < 3 THEN
                RAISE EXCEPTION 'Nama domain / short_code minimal 3 karakter.';
            END IF;
            IF EXISTS (
                SELECT 1 FROM public.qr_codes qr2
                WHERE lower(qr2.short_code) = lower(trim(p_short_code))
                  AND lower(qr2.public_domain) = v_domain
                  AND qr2.id <> p_id
            ) THEN
                RAISE EXCEPTION 'Nama domain "%.%" sudah digunakan oleh QR lain.', lower(trim(p_short_code)), v_domain;
            END IF;
        END IF;

        UPDATE public.qr_codes qr
        SET
            short_code = COALESCE(NULLIF(trim(p_short_code), ''), qr.short_code),
            public_domain = v_domain,
            org_slug = v_final_org,
            external_owner_ref = v_final_ext_ref,
            qr_type = p_qr_type,
            title = v_clean_title,
            content_data = p_content_data,
            style_options = p_style_options,
            password_hash = v_new_hash,
            updated_at = now()
        WHERE qr.id = p_id AND qr.user_id = v_user_id
        RETURNING qr.id INTO v_saved_id;
    ELSE
        IF p_short_code IS NULL OR length(trim(p_short_code)) < 3 THEN
            RAISE EXCEPTION 'Nama domain / short_code tidak valid (minimal 3 karakter).';
        END IF;

        IF EXISTS (
            SELECT 1 FROM public.qr_codes qr2
            WHERE lower(qr2.short_code) = lower(trim(p_short_code))
              AND lower(qr2.public_domain) = v_domain
        ) THEN
            RAISE EXCEPTION 'Nama domain "%.%" sudah digunakan oleh QR lain.', lower(trim(p_short_code)), v_domain;
        END IF;

        IF p_password_enabled AND p_new_password IS NOT NULL AND length(trim(p_new_password)) > 0 THEN
            v_new_hash := crypt(p_new_password, gen_salt('bf'));
        ELSE
            v_new_hash := NULL;
        END IF;

        INSERT INTO public.qr_codes (
            short_code,
            public_domain,
            org_slug,
            external_owner_ref,
            user_id,
            qr_type,
            title,
            content_data,
            style_options,
            password_hash
        )
        VALUES (
            trim(p_short_code),
            v_domain,
            v_final_org,
            v_final_ext_ref,
            v_user_id,
            p_qr_type,
            v_clean_title,
            p_content_data,
            p_style_options,
            v_new_hash
        )
        RETURNING public.qr_codes.id INTO v_saved_id;
    END IF;

    RETURN QUERY
    SELECT
        qr.id,
        qr.short_code,
        qr.public_domain,
        qr.org_slug,
        qr.external_owner_ref,
        qr.user_id,
        qr.qr_type,
        qr.title,
        qr.content_data,
        qr.style_options,
        qr.requires_password,
        qr.scan_count,
        qr.is_active,
        qr.created_at,
        qr.updated_at
    FROM public.qr_codes qr
    WHERE qr.id = v_saved_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_user_qr(uuid, text, text, text, jsonb, jsonb, boolean, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_user_qr(uuid, text, text, text, jsonb, jsonb, boolean, text, text, text, text, text) TO authenticated;

-- 8. Perbarui RPC baca publik per (short_code, public_domain)
DROP FUNCTION IF EXISTS public.get_public_qr(text);
DROP FUNCTION IF EXISTS public.get_public_qr(text, text);

CREATE OR REPLACE FUNCTION public.get_public_qr(
    p_short_code text,
    p_public_domain text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    short_code text,
    public_domain text,
    qr_type text,
    title text,
    requires_password boolean,
    content_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_row public.qr_codes%ROWTYPE;
    v_domain text;
BEGIN
    v_domain := NULLIF(lower(trim(COALESCE(p_public_domain, ''))), '');

    SELECT * INTO v_row
    FROM public.qr_codes qr
    WHERE lower(qr.short_code) = lower(trim(COALESCE(p_short_code, '')))
      AND qr.is_active = true
      AND (v_domain IS NULL OR lower(qr.public_domain) = v_domain)
    ORDER BY
        CASE WHEN lower(qr.public_domain) = 'freebuildcv.tech' THEN 0 ELSE 1 END,
        qr.updated_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF NOT v_row.requires_password THEN
        UPDATE public.qr_codes qr
        SET scan_count = qr.scan_count + 1
        WHERE qr.id = v_row.id;
    END IF;

    RETURN QUERY
    SELECT
        v_row.id,
        v_row.short_code,
        v_row.public_domain,
        v_row.qr_type,
        v_row.title,
        v_row.requires_password,
        CASE WHEN v_row.requires_password THEN NULL ELSE v_row.content_data END;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_qr(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_qr(text, text) TO anon, authenticated;

-- 9. Perbarui RPC verifikasi sandi publik per (short_code, public_domain)
DROP FUNCTION IF EXISTS public.verify_qr_password(text, text);
DROP FUNCTION IF EXISTS public.verify_qr_password(text, text, text);

CREATE OR REPLACE FUNCTION public.verify_qr_password(
    p_short_code text,
    p_password text,
    p_public_domain text DEFAULT NULL
)
RETURNS TABLE (
    valid boolean,
    qr_type text,
    title text,
    content_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_row public.qr_codes%ROWTYPE;
    v_domain text;
BEGIN
    v_domain := NULLIF(lower(trim(COALESCE(p_public_domain, ''))), '');

    SELECT * INTO v_row
    FROM public.qr_codes qr
    WHERE lower(qr.short_code) = lower(trim(COALESCE(p_short_code, '')))
      AND qr.is_active = true
      AND (v_domain IS NULL OR lower(qr.public_domain) = v_domain)
    ORDER BY
        CASE WHEN lower(qr.public_domain) = 'freebuildcv.tech' THEN 0 ELSE 1 END,
        qr.updated_at DESC
    LIMIT 1;

    IF NOT FOUND OR v_row.password_hash IS NULL THEN
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::jsonb;
        RETURN;
    END IF;

    IF v_row.password_hash = crypt(COALESCE(p_password, ''), v_row.password_hash) THEN
        UPDATE public.qr_codes qr
        SET scan_count = qr.scan_count + 1
        WHERE qr.id = v_row.id;

        RETURN QUERY SELECT true, v_row.qr_type, v_row.title, v_row.content_data;
    ELSE
        RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::jsonb;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_qr_password(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_qr_password(text, text, text) TO anon, authenticated;

-- 10. Seed partner resmi: Nara Institute (*.narainstitute.net)
-- PENTING: Ganti nilai signing_secret di bawah agar SAMA PERSIS dengan VCARD_PARTNER_SECRET di .env Laravel!
INSERT INTO public.qr_partner_domains (
    domain,
    org_slug,
    org_name,
    signing_secret,
    allowed_email_domain,
    waive_custom_domain_credit,
    is_active
)
VALUES (
    'narainstitute.net',
    'narainstitute',
    'Nara Institute',
    'GANTI_DENGAN_VCARD_PARTNER_SECRET_YANG_SAMA_DENGAN_LARAVEL',
    'narainstitute.net',
    true,
    true
)
ON CONFLICT (domain) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    allowed_email_domain = EXCLUDED.allowed_email_domain,
    waive_custom_domain_credit = EXCLUDED.waive_custom_domain_credit,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Jika ingin memperbarui signing_secret setelah baris sudah dibuat, jalankan perintah ini di SQL Editor:
-- UPDATE public.qr_partner_domains
-- SET signing_secret = 'MASUKKAN_SECRET_SAMA_DENGAN_LARAVEL_ENV', updated_at = now()
-- WHERE domain = 'narainstitute.net';
