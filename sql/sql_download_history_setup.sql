-- ============================================================
-- SQL Setup for Download History
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Download history table — logs every individual download
CREATE TABLE IF NOT EXISTS public.download_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_type text NOT NULL,
    resume_name text DEFAULT '',
    downloaded_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history
CREATE POLICY "Users can view own download history"
ON public.download_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Insert via SECURITY DEFINER function so it always works
CREATE OR REPLACE FUNCTION public.log_download(
    p_template_type text,
    p_resume_name text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.download_history (user_id, template_type, resume_name)
    VALUES (auth.uid(), p_template_type, p_resume_name);
END;
$$;

-- Admins can view all history (using JWT metadata — does NOT query auth.users)
CREATE POLICY "Admins can view all download history"
ON public.download_history FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
);
