-- Add cm_data and portfolio_data JSONB columns to user_resumes
-- Run this in your Supabase SQL Editor

ALTER TABLE public.user_resumes
ADD COLUMN IF NOT EXISTS cm_data JSONB DEFAULT NULL;

ALTER TABLE public.user_resumes
ADD COLUMN IF NOT EXISTS portfolio_data JSONB DEFAULT NULL;
