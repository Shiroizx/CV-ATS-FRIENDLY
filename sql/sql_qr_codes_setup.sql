-- ============================================================
-- SQL Setup for QR Code Generator (Phase 1: URL Situs Web + Auth)
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabel utama qr_codes (wajib login untuk membuat & menyimpan)
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code text UNIQUE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    qr_type text NOT NULL CHECK (qr_type IN ('url', 'vcard', 'pdf', 'image', 'social', 'video', 'business', 'menu')),
    title text NOT NULL DEFAULT 'Kode QR Situs Web',
    content_data jsonb NOT NULL CHECK (octet_length(content_data::text) <= 65536),
    style_options jsonb NOT NULL CHECK (octet_length(style_options::text) <= 524288),
    password_hash text DEFAULT NULL,
    requires_password boolean GENERATED ALWAYS AS (password_hash IS NOT NULL) STORED,
    scan_count int NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pastikan constraint tabel lama ikut diperbarui menjadi maks 512 KB
ALTER TABLE public.qr_codes DROP CONSTRAINT IF EXISTS qr_codes_style_options_check;
ALTER TABLE public.qr_codes ADD CONSTRAINT qr_codes_style_options_check CHECK (octet_length(style_options::text) <= 524288);

CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON public.qr_codes (short_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code_lower ON public.qr_codes (lower(short_code));
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes (user_id);

-- 2. RLS — hanya pemilik yang login yang dapat mengelola miliknya
-- Catatan keamanan: TIDAK ADA policy SELECT terbuka untuk anon agar data & password_hash tidak bocor
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own qr codes" ON public.qr_codes;
CREATE POLICY "Users manage own qr codes"
ON public.qr_codes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. RPC untuk menyimpan atau memperbarui QR user (hashing kata sandi aman di server)
CREATE OR REPLACE FUNCTION public.save_user_qr(
    p_id uuid DEFAULT NULL,
    p_short_code text DEFAULT NULL,
    p_qr_type text DEFAULT 'url',
    p_title text DEFAULT 'Kode QR Situs Web',
    p_content_data jsonb DEFAULT '{}'::jsonb,
    p_style_options jsonb DEFAULT '{}'::jsonb,
    p_password_enabled boolean DEFAULT false,
    p_new_password text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    short_code text,
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
AS $$
DECLARE
    v_user_id uuid;
    v_existing_hash text;
    v_new_hash text;
    v_saved_id uuid;
    v_clean_title text;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Autentikasi diperlukan. Silakan login terlebih dahulu.';
    END IF;

    IF p_qr_type NOT IN ('url', 'vcard', 'pdf', 'image', 'social', 'video', 'business', 'menu') THEN
        RAISE EXCEPTION 'Jenis QR tidak didukung.';
    END IF;

    v_clean_title := COALESCE(NULLIF(trim(p_title), ''), 'Kode QR Situs Web');

    IF p_id IS NOT NULL THEN
        SELECT qr.password_hash INTO v_existing_hash
        FROM public.qr_codes qr
        WHERE qr.id = p_id AND qr.user_id = v_user_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Data QR tidak ditemukan atau Anda tidak memiliki akses.';
        END IF;

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
                  AND qr2.id <> p_id
            ) THEN
                RAISE EXCEPTION 'Nama domain / kode pendek tersebut sudah digunakan oleh QR lain.';
            END IF;
        END IF;

        UPDATE public.qr_codes qr
        SET
            short_code = COALESCE(NULLIF(trim(p_short_code), ''), qr.short_code),
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
        ) THEN
            RAISE EXCEPTION 'Nama domain / kode pendek tersebut sudah digunakan oleh QR lain.';
        END IF;

        IF p_password_enabled AND p_new_password IS NOT NULL AND length(trim(p_new_password)) > 0 THEN
            v_new_hash := crypt(p_new_password, gen_salt('bf'));
        ELSE
            v_new_hash := NULL;
        END IF;

        INSERT INTO public.qr_codes (
            short_code,
            user_id,
            qr_type,
            title,
            content_data,
            style_options,
            password_hash
        )
        VALUES (
            trim(p_short_code),
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

REVOKE ALL ON FUNCTION public.save_user_qr(uuid, text, text, text, jsonb, jsonb, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_user_qr(uuid, text, text, text, jsonb, jsonb, boolean, text) TO authenticated;

-- 3b. RPC untuk mengecek ketersediaan slug/subdomain sebelum disimpan
CREATE OR REPLACE FUNCTION public.check_qr_slug_available(
    p_slug text,
    p_exclude_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean text;
BEGIN
    v_clean := lower(trim(COALESCE(p_slug, '')));
    IF length(v_clean) < 3 THEN
        RETURN false;
    END IF;

    RETURN NOT EXISTS (
        SELECT 1
        FROM public.qr_codes qr
        WHERE lower(qr.short_code) = v_clean
          AND (p_exclude_id IS NULL OR qr.id <> p_exclude_id)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.check_qr_slug_available(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_qr_slug_available(text, uuid) TO authenticated;

-- 4. RPC untuk membaca QR publik saat dipindai kamera HP (tidak membocorkan URL jika terkunci sandi)
CREATE OR REPLACE FUNCTION public.get_public_qr(p_short_code text)
RETURNS TABLE (
    id uuid,
    short_code text,
    qr_type text,
    title text,
    requires_password boolean,
    content_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_row public.qr_codes%ROWTYPE;
BEGIN
    SELECT * INTO v_row
    FROM public.qr_codes qr
    WHERE lower(qr.short_code) = lower(trim(COALESCE(p_short_code, '')))
      AND qr.is_active = true
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
        v_row.qr_type,
        v_row.title,
        v_row.requires_password,
        CASE WHEN v_row.requires_password THEN NULL ELSE v_row.content_data END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_qr(text) TO anon, authenticated;

-- 5. RPC untuk memverifikasi kata sandi QR publik sebelum mengembalikan URL tujuan
CREATE OR REPLACE FUNCTION public.verify_qr_password(p_short_code text, p_password text)
RETURNS TABLE (
    valid boolean,
    qr_type text,
    title text,
    content_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_row public.qr_codes%ROWTYPE;
BEGIN
    SELECT * INTO v_row
    FROM public.qr_codes qr
    WHERE lower(qr.short_code) = lower(trim(COALESCE(p_short_code, '')))
      AND qr.is_active = true
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

GRANT EXECUTE ON FUNCTION public.verify_qr_password(text, text) TO anon, authenticated;
