-- SQL Setup for Dynamic App Settings (Download Limits)

-- 1. Create the settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    setting_key text PRIMARY KEY,
    setting_value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (needed for frontend UI)
CREATE POLICY "Allow public read access to app_settings"
ON public.app_settings FOR SELECT
TO public, anon, authenticated
USING (true);

-- 2. Insert default values if they don't exist
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES 
    ('guest_download_limit', '3'::jsonb),
    ('user_download_limit', '6'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- 3. Function to update settings (Admin Only)
CREATE OR REPLACE FUNCTION admin_update_setting(p_key text, p_value jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
    END IF;

    INSERT INTO public.app_settings (setting_key, setting_value, updated_at)
    VALUES (p_key, p_value, now())
    ON CONFLICT (setting_key) DO UPDATE 
    SET setting_value = EXCLUDED.setting_value,
        updated_at = EXCLUDED.updated_at;
        
    RETURN true;
END;
$$;
