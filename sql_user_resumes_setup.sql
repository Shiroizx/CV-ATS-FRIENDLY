-- ============================================================
-- SQL Setup for User Resumes — Relational Design
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Parent table
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_type text NOT NULL DEFAULT 'ats_builder',
    resume_name text NOT NULL DEFAULT 'Untitled Resume',
    hobbies text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Personal Info (1:1 with user_resumes)
CREATE TABLE IF NOT EXISTS public.resume_personal_info (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid REFERENCES public.user_resumes(id) ON DELETE CASCADE NOT NULL UNIQUE,
    profile_photo_url text DEFAULT '',
    full_name text DEFAULT '',
    phone text DEFAULT '',
    email text DEFAULT '',
    linkedin text DEFAULT '',
    show_linkedin_underline boolean DEFAULT true,
    portfolio text DEFAULT '',
    show_portfolio_underline boolean DEFAULT true,
    address text DEFAULT '',
    summary text DEFAULT ''
);

-- 3. Education (1:N)
CREATE TABLE IF NOT EXISTS public.resume_education (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid REFERENCES public.user_resumes(id) ON DELETE CASCADE NOT NULL,
    level text DEFAULT '',
    field text DEFAULT '',
    institution text DEFAULT '',
    city text DEFAULT '',
    start_date text DEFAULT '',
    end_date text DEFAULT '',
    is_current_study boolean DEFAULT false,
    gpa text DEFAULT '',
    max_gpa text DEFAULT '',
    description text DEFAULT '',
    sort_order int DEFAULT 0
);

-- 4. Experiences (1:N)
CREATE TABLE IF NOT EXISTS public.resume_experiences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid REFERENCES public.user_resumes(id) ON DELETE CASCADE NOT NULL,
    company text DEFAULT '',
    position text DEFAULT '',
    employment_type text DEFAULT '',
    location text DEFAULT '',
    start_date text DEFAULT '',
    end_date text DEFAULT '',
    is_current_job boolean DEFAULT false,
    description text DEFAULT '',
    sort_order int DEFAULT 0
);

-- 5. Bootcamps (1:N)
CREATE TABLE IF NOT EXISTS public.resume_bootcamps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid REFERENCES public.user_resumes(id) ON DELETE CASCADE NOT NULL,
    name text DEFAULT '',
    institution text DEFAULT '',
    location text DEFAULT '',
    start_date text DEFAULT '',
    end_date text DEFAULT '',
    description text DEFAULT '',
    sort_order int DEFAULT 0
);

-- 6. Skills (1:1)
CREATE TABLE IF NOT EXISTS public.resume_skills (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid REFERENCES public.user_resumes(id) ON DELETE CASCADE NOT NULL UNIQUE,
    soft_skills text DEFAULT '',
    hard_skills text DEFAULT '',
    software_skills text DEFAULT ''
);

-- 7. Awards (1:N)
CREATE TABLE IF NOT EXISTS public.resume_awards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id uuid REFERENCES public.user_resumes(id) ON DELETE CASCADE NOT NULL,
    title text DEFAULT '',
    institution text DEFAULT '',
    year text DEFAULT '',
    sort_order int DEFAULT 0
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper: check resume ownership
CREATE OR REPLACE FUNCTION public.owns_resume(p_resume_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_resumes
        WHERE id = p_resume_id AND user_id = auth.uid()
    );
$$;

-- user_resumes
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own resumes" ON public.user_resumes FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- resume_personal_info
ALTER TABLE public.resume_personal_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own personal info" ON public.resume_personal_info FOR ALL TO authenticated
    USING (public.owns_resume(resume_id)) WITH CHECK (public.owns_resume(resume_id));

-- resume_education
ALTER TABLE public.resume_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own education" ON public.resume_education FOR ALL TO authenticated
    USING (public.owns_resume(resume_id)) WITH CHECK (public.owns_resume(resume_id));

-- resume_experiences
ALTER TABLE public.resume_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experiences" ON public.resume_experiences FOR ALL TO authenticated
    USING (public.owns_resume(resume_id)) WITH CHECK (public.owns_resume(resume_id));

-- resume_bootcamps
ALTER TABLE public.resume_bootcamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bootcamps" ON public.resume_bootcamps FOR ALL TO authenticated
    USING (public.owns_resume(resume_id)) WITH CHECK (public.owns_resume(resume_id));

-- resume_skills
ALTER TABLE public.resume_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own skills" ON public.resume_skills FOR ALL TO authenticated
    USING (public.owns_resume(resume_id)) WITH CHECK (public.owns_resume(resume_id));

-- resume_awards
ALTER TABLE public.resume_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own awards" ON public.resume_awards FOR ALL TO authenticated
    USING (public.owns_resume(resume_id)) WITH CHECK (public.owns_resume(resume_id));

-- ============================================================
-- STORAGE BUCKET (run this separately or create via Dashboard)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own photos" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view photos" ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
