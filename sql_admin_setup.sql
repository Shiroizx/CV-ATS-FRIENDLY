-- SQL Script for Setting Up Admin Dashboard in Supabase
-- WARNING: Run this carefully in your Supabase SQL Editor
-- This enables direct management of auth.users via RPC

-- 1. Helper to Check if Caller is Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cek jsonb raw_user_meta_data pengguna saat ini, cari key 'is_admin'
  RETURN (
    SELECT COALESCE((raw_user_meta_data->>'is_admin')::boolean, false)
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- 2. Function: Get Users List
CREATE OR REPLACE FUNCTION get_users_list()
RETURNS TABLE (
    id uuid,
    email text,
    created_at timestamptz,
    raw_user_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
  END IF;

  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at, u.raw_user_meta_data
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- 3. Function: Admin Create User
CREATE OR REPLACE FUNCTION admin_create_user(
    p_email text,
    p_password text,
    p_name text DEFAULT '',
    p_is_admin boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    encrypted_pw text;
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
    END IF;

    -- encrypt password using pgcrypto
    encrypted_pw := crypt(p_password, gen_salt('bf'));
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        p_email,
        encrypted_pw,
        now(),
        NULL,
        NULL,
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', p_name, 'is_admin', p_is_admin, 'download_count', 0),
        now(),
        now(),
        '',
        '',
        '',
        ''
    );

    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        new_user_id,
        new_user_id,
        new_user_id::text,
        jsonb_build_object('sub', new_user_id::text, 'email', p_email),
        'email',
        now(),
        now(),
        now()
    );

    RETURN new_user_id;
END;
$$;

-- 4. Function: Admin Update User
CREATE OR REPLACE FUNCTION admin_update_user(
    p_user_id uuid,
    p_email text,
    p_password text DEFAULT NULL,
    p_name text DEFAULT NULL,
    p_is_admin boolean DEFAULT NULL,
    p_download_count int DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_meta jsonb;
    new_meta jsonb;
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
    END IF;

    -- Dapatkan metadata lama
    SELECT raw_user_meta_data INTO current_meta FROM auth.users WHERE id = p_user_id;
    new_meta := current_meta;

    -- Update nama bila tidak null
    IF p_name IS NOT NULL THEN
        new_meta := jsonb_set(new_meta, '{full_name}', to_jsonb(p_name));
    END IF;

    -- Update status admin bila tidak null
    IF p_is_admin IS NOT NULL THEN
        new_meta := jsonb_set(new_meta, '{is_admin}', to_jsonb(p_is_admin));
    END IF;

    -- Update download_count bila tidak null
    IF p_download_count IS NOT NULL THEN
        new_meta := jsonb_set(new_meta, '{download_count}', to_jsonb(p_download_count));
    END IF;

    -- Eksekusi update email & metadata
    UPDATE auth.users 
    SET 
        email = COALESCE(p_email, email),
        raw_user_meta_data = new_meta,
        updated_at = now()
    WHERE id = p_user_id;

    -- Update Email di identity text
    IF p_email IS NOT NULL THEN
        UPDATE auth.identities 
        SET identity_data = jsonb_set(identity_data, '{email}', to_jsonb(p_email)) 
        WHERE user_id = p_user_id;
    END IF;

    -- Jika password baru diberikan, encyrpt dan update
    IF p_password IS NOT NULL AND p_password <> '' THEN
        UPDATE auth.users 
        SET encrypted_password = crypt(p_password, gen_salt('bf'))
        WHERE id = p_user_id;
    END IF;

    RETURN true;
END;
$$;

-- 5. Function: Admin Delete User
CREATE OR REPLACE FUNCTION admin_delete_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
    END IF;

    -- Blok jika user mencoba hapus akun sendiri (opsional tapi disarankan)
    IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Admin cannot delete their own account.';
    END IF;

    -- Supabase trigger akan menangani penghapusan identitas dll jika menghapus dari auth.users
    DELETE FROM auth.users WHERE id = p_user_id;
    
    RETURN true;
END;
$$;

-- UNTUK MENJADIKAN AKUN ANDA SEBAGAI ADMIN PERTAMA (Jalankan manual 1x di SQL Editor):
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb WHERE email = 'EMAIL_ANDA_DISINI';
