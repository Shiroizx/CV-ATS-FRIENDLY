-- ============================================================
-- SQL Setup for SPK Analytics (Admin Only)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================
-- Aggregates multi-criteria data per user for SPK/DSS analysis.
-- Returns: user info + 5 criteria values for MCDM ranking.

CREATE OR REPLACE FUNCTION get_spk_user_analytics()
RETURNS TABLE (
    user_id uuid,
    email text,
    full_name text,
    download_count int,
    resume_count bigint,
    profile_completeness bigint,
    days_since_last_activity int,
    template_variety bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
    END IF;

    RETURN QUERY
    SELECT
        u.id AS user_id,
        u.email::text,
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'username', '')::text AS full_name,
        COALESCE((u.raw_user_meta_data->>'download_count')::int, 0) AS download_count,

        -- C2: Resume count
        COALESCE(rc.cnt, 0)::bigint AS resume_count,

        -- C3: Profile completeness (0-5 score based on filled sections)
        COALESCE(pc.score, 0)::bigint AS profile_completeness,

        -- C4: Days since last activity (0 = today, higher = less active)
        COALESCE(
            EXTRACT(DAY FROM (now() - la.last_active))::int,
            9999
        ) AS days_since_last_activity,

        -- C5: Template variety (distinct template types used)
        COALESCE(tv.cnt, 0)::bigint AS template_variety

    FROM auth.users u

    -- C2: Count resumes per user
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::bigint AS cnt
        FROM public.user_resumes r
        WHERE r.user_id = u.id
    ) rc ON true

    -- C3: Profile completeness (count of filled sections per user's resumes)
    LEFT JOIN LATERAL (
        SELECT (
            CASE WHEN EXISTS (
                SELECT 1 FROM public.resume_personal_info pi
                JOIN public.user_resumes r ON r.id = pi.resume_id
                WHERE r.user_id = u.id AND (pi.full_name != '' OR pi.email != '')
            ) THEN 1 ELSE 0 END
            +
            CASE WHEN EXISTS (
                SELECT 1 FROM public.resume_education ed
                JOIN public.user_resumes r ON r.id = ed.resume_id
                WHERE r.user_id = u.id
            ) THEN 1 ELSE 0 END
            +
            CASE WHEN EXISTS (
                SELECT 1 FROM public.resume_experiences ex
                JOIN public.user_resumes r ON r.id = ex.resume_id
                WHERE r.user_id = u.id
            ) THEN 1 ELSE 0 END
            +
            CASE WHEN EXISTS (
                SELECT 1 FROM public.resume_skills sk
                JOIN public.user_resumes r ON r.id = sk.resume_id
                WHERE r.user_id = u.id AND (sk.hard_skills != '' OR sk.soft_skills != '')
            ) THEN 1 ELSE 0 END
            +
            CASE WHEN EXISTS (
                SELECT 1 FROM public.resume_awards aw
                JOIN public.user_resumes r ON r.id = aw.resume_id
                WHERE r.user_id = u.id
            ) THEN 1 ELSE 0 END
        )::bigint AS score
    ) pc ON true

    -- C4: Last activity (most recent resume update)
    LEFT JOIN LATERAL (
        SELECT MAX(r.updated_at) AS last_active
        FROM public.user_resumes r
        WHERE r.user_id = u.id
    ) la ON true

    -- C5: Template variety from download history
    LEFT JOIN LATERAL (
        SELECT COUNT(DISTINCT dh.template_type)::bigint AS cnt
        FROM public.download_history dh
        WHERE dh.user_id = u.id
    ) tv ON true

    ORDER BY download_count DESC;
END;
$$;
