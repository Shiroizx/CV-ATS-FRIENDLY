import { supabase } from "./supabase";
import type { CVData, Experience, Education, Bootcamp, Award } from "../types";
import type { CreativeManagementData } from "../types/creativeManagement";
import type { PortfolioData } from "../types/portfolio";

export interface SavedResume {
    id: string;
    user_id: string;
    template_type: string;
    resume_name: string;
    hobbies: string;
    created_at: string;
    updated_at: string;
}

// ─── Photo Upload ────────────────────────────────────────────

async function uploadProfilePhoto(
    userId: string,
    resumeId: string,
    base64Data: string
): Promise<string> {
    // base64Data format: "data:image/png;base64,iVBOR..."
    if (!base64Data || !base64Data.startsWith("data:image")) return "";

    const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return "";

    const ext = match[1];
    const raw = match[2];

    // Convert base64 to Uint8Array
    const byteString = atob(raw);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
    }

    const filePath = `${userId}/${resumeId}.${ext}`;

    const { error } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, bytes, {
            contentType: `image/${ext}`,
            upsert: true,
        });

    if (error) {
        console.error("Photo upload error:", error);
        return "";
    }

    const { data: publicData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

    return publicData.publicUrl;
}

async function deleteProfilePhoto(userId: string, resumeId: string): Promise<void> {
    // Try common extensions
    const exts = ["png", "jpg", "jpeg", "webp", "gif"];
    const paths = exts.map((ext) => `${userId}/${resumeId}.${ext}`);
    await supabase.storage.from("profile-photos").remove(paths);
}

// ─── Save Resume ─────────────────────────────────────────────

export async function saveResume(
    templateType: string,
    resumeName: string,
    cvData: CVData,
    existingId?: string
): Promise<{ data: SavedResume | null; error: Error | null }> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user)
        return { data: null, error: new Error("User must be logged in to save.") };

    try {
        let resumeId = existingId;

        // ── Parent row ──────────────────────────────────────
        if (existingId) {
            const { error } = await supabase
                .from("user_resumes")
                .update({
                    resume_name: resumeName,
                    hobbies: cvData.hobbies,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingId)
                .eq("user_id", user.id);
            if (error) throw error;
        } else {
            const { data: inserted, error } = await supabase
                .from("user_resumes")
                .insert({
                    user_id: user.id,
                    template_type: templateType,
                    resume_name: resumeName,
                    hobbies: cvData.hobbies,
                })
                .select()
                .single();
            if (error) throw error;
            resumeId = inserted.id;
        }

        if (!resumeId) throw new Error("Failed to get resume ID");

        // ── Photo ───────────────────────────────────────────
        let profilePhotoUrl = cvData.profilePhoto;
        if (cvData.profilePhoto && cvData.profilePhoto.startsWith("data:image")) {
            profilePhotoUrl = await uploadProfilePhoto(user.id, resumeId, cvData.profilePhoto);
        }

        // ── Personal Info (upsert) ──────────────────────────
        const { error: piErr } = await supabase
            .from("resume_personal_info")
            .upsert(
                {
                    resume_id: resumeId,
                    profile_photo_url: profilePhotoUrl,
                    full_name: cvData.fullName,
                    phone: cvData.phone,
                    email: cvData.email,
                    linkedin: cvData.linkedin,
                    show_linkedin_underline: cvData.showLinkedinUnderline,
                    portfolio: cvData.portfolio,
                    show_portfolio_underline: cvData.showPortfolioUnderline,
                    address: cvData.address,
                    summary: cvData.summary,
                },
                { onConflict: "resume_id" }
            );
        if (piErr) throw piErr;

        // ── Skills (upsert) ─────────────────────────────────
        const { error: skErr } = await supabase
            .from("resume_skills")
            .upsert(
                {
                    resume_id: resumeId,
                    soft_skills: cvData.skills.softSkills,
                    hard_skills: cvData.skills.hardSkills,
                    software_skills: cvData.skills.softwareSkills,
                },
                { onConflict: "resume_id" }
            );
        if (skErr) throw skErr;

        // ── Education (delete + re-insert) ──────────────────
        await supabase.from("resume_education").delete().eq("resume_id", resumeId);
        if (cvData.education.length > 0) {
            const rows = cvData.education.map((e, i) => ({
                resume_id: resumeId,
                level: e.level,
                field: e.field,
                institution: e.institution,
                city: e.city,
                start_date: e.startDate,
                end_date: e.endDate,
                is_current_study: e.isCurrentStudy,
                gpa: e.gpa || "",
                max_gpa: e.maxGpa || "",
                description: e.description || "",
                sort_order: i,
            }));
            const { error } = await supabase.from("resume_education").insert(rows);
            if (error) throw error;
        }

        // ── Experiences (delete + re-insert) ─────────────────
        await supabase.from("resume_experiences").delete().eq("resume_id", resumeId);
        if (cvData.experiences.length > 0) {
            const rows = cvData.experiences.map((e, i) => ({
                resume_id: resumeId,
                company: e.company,
                position: e.position,
                employment_type: e.employmentType,
                location: e.location,
                start_date: e.startDate,
                end_date: e.endDate,
                is_current_job: e.isCurrentJob,
                description: e.description,
                sort_order: i,
            }));
            const { error } = await supabase.from("resume_experiences").insert(rows);
            if (error) throw error;
        }

        // ── Bootcamps (delete + re-insert) ───────────────────
        await supabase.from("resume_bootcamps").delete().eq("resume_id", resumeId);
        if (cvData.bootcamps.length > 0) {
            const rows = cvData.bootcamps.map((e, i) => ({
                resume_id: resumeId,
                name: e.name,
                institution: e.institution,
                location: e.location,
                start_date: e.startDate,
                end_date: e.endDate,
                description: e.description || "",
                sort_order: i,
            }));
            const { error } = await supabase.from("resume_bootcamps").insert(rows);
            if (error) throw error;
        }

        // ── Awards (delete + re-insert) ──────────────────────
        await supabase.from("resume_awards").delete().eq("resume_id", resumeId);
        if (cvData.awards.length > 0) {
            const rows = cvData.awards.map((a, i) => ({
                resume_id: resumeId,
                title: a.title,
                institution: a.institution,
                year: a.year,
                sort_order: i,
            }));
            const { error } = await supabase.from("resume_awards").insert(rows);
            if (error) throw error;
        }

        // Return the parent resume row
        const { data: result, error: fetchErr } = await supabase
            .from("user_resumes")
            .select("*")
            .eq("id", resumeId)
            .single();

        if (fetchErr) throw fetchErr;
        return { data: result, error: null };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

// ─── Get All Resumes (list) ──────────────────────────────────

export async function getUserResumes(): Promise<{
    data: SavedResume[] | null;
    error: Error | null;
}> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not logged in.") };

    const { data, error } = await supabase
        .from("user_resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    return { data, error };
}

// ─── Get Resume By ID → reconstruct CVData ───────────────────

export async function getResumeById(
    id: string
): Promise<{ data: (SavedResume & { cv_data: CVData }) | null; error: Error | null }> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not logged in.") };

    try {
        // Fetch parent
        const { data: resume, error: rErr } = await supabase
            .from("user_resumes")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();
        if (rErr || !resume) throw rErr || new Error("Resume not found");

        // Fetch all children in parallel
        const [piRes, eduRes, expRes, bootRes, skRes, awRes] = await Promise.all([
            supabase.from("resume_personal_info").select("*").eq("resume_id", id).single(),
            supabase.from("resume_education").select("*").eq("resume_id", id).order("sort_order"),
            supabase.from("resume_experiences").select("*").eq("resume_id", id).order("sort_order"),
            supabase.from("resume_bootcamps").select("*").eq("resume_id", id).order("sort_order"),
            supabase.from("resume_skills").select("*").eq("resume_id", id).single(),
            supabase.from("resume_awards").select("*").eq("resume_id", id).order("sort_order"),
        ]);

        const pi = piRes.data;
        const skills = skRes.data;

        const cvData: CVData = {
            profilePhoto: pi?.profile_photo_url || "",
            fullName: pi?.full_name || "",
            phone: pi?.phone || "",
            email: pi?.email || "",
            linkedin: pi?.linkedin || "",
            showLinkedinUnderline: pi?.show_linkedin_underline ?? true,
            portfolio: pi?.portfolio || "",
            showPortfolioUnderline: pi?.show_portfolio_underline ?? true,
            address: pi?.address || "",
            summary: pi?.summary || "",
            education: (eduRes.data || []).map((e: any): Education => ({
                id: e.id,
                level: e.level,
                field: e.field,
                institution: e.institution,
                city: e.city,
                startDate: e.start_date,
                endDate: e.end_date,
                isCurrentStudy: e.is_current_study,
                gpa: e.gpa,
                maxGpa: e.max_gpa,
                description: e.description,
            })),
            experiences: (expRes.data || []).map((e: any): Experience => ({
                id: e.id,
                company: e.company,
                position: e.position,
                employmentType: e.employment_type,
                location: e.location,
                startDate: e.start_date,
                endDate: e.end_date,
                isCurrentJob: e.is_current_job,
                description: e.description,
            })),
            bootcamps: (bootRes.data || []).map((e: any): Bootcamp => ({
                id: e.id,
                name: e.name,
                institution: e.institution,
                location: e.location,
                startDate: e.start_date,
                endDate: e.end_date,
                description: e.description,
            })),
            skills: {
                softSkills: skills?.soft_skills || "",
                hardSkills: skills?.hard_skills || "",
                softwareSkills: skills?.software_skills || "",
            },
            awards: (awRes.data || []).map((a: any): Award => ({
                id: a.id,
                title: a.title,
                institution: a.institution,
                year: a.year,
            })),
            hobbies: resume.hobbies || "",
        };

        return { data: { ...resume, cv_data: cvData }, error: null };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

// ─── Delete Resume ───────────────────────────────────────────

export async function deleteResume(id: string): Promise<{ error: Error | null }> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: new Error("User not logged in.") };

    // Delete photo from storage
    await deleteProfilePhoto(user.id, id);

    // Delete parent — cascade deletes all children
    const { error } = await supabase
        .from("user_resumes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    return { error };
}

// ─── Creative Management: Save Resume ────────────────────────

export async function saveCreativeManagementResume(
    resumeName: string,
    cmData: CreativeManagementData,
    existingId?: string
): Promise<{ data: SavedResume | null; error: Error | null }> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user)
        return { data: null, error: new Error("User must be logged in to save.") };

    try {
        let resumeId = existingId;

        // ── Parent row ──────────────────────────────────────
        if (existingId) {
            const { error } = await supabase
                .from("user_resumes")
                .update({
                    resume_name: resumeName,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingId)
                .eq("user_id", user.id);
            if (error) throw error;
        } else {
            const { data: inserted, error } = await supabase
                .from("user_resumes")
                .insert({
                    user_id: user.id,
                    template_type: "creative_management",
                    resume_name: resumeName,
                })
                .select()
                .single();
            if (error) throw error;
            resumeId = inserted.id;
        }

        if (!resumeId) throw new Error("Failed to get resume ID");

        // ── Photo ───────────────────────────────────────────
        let profilePhotoUrl = cmData.profilePhoto;
        if (cmData.profilePhoto && cmData.profilePhoto.startsWith("data:image")) {
            profilePhotoUrl = await uploadProfilePhoto(user.id, resumeId, cmData.profilePhoto);
        }

        // ── Store entire CM data as JSON ─────────────────────
        const dataToStore: CreativeManagementData = {
            ...cmData,
            profilePhoto: profilePhotoUrl,
        };

        const { error: cmErr } = await supabase
            .from("user_resumes")
            .update({ cm_data: dataToStore })
            .eq("id", resumeId)
            .eq("user_id", user.id);
        if (cmErr) throw cmErr;

        // Return the parent resume row
        const { data: result, error: fetchErr } = await supabase
            .from("user_resumes")
            .select("*")
            .eq("id", resumeId)
            .single();

        if (fetchErr) throw fetchErr;
        return { data: result, error: null };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

// ─── Creative Management: Get Resume By ID ───────────────────

export async function getCreativeManagementResumeById(
    id: string
): Promise<{ data: (SavedResume & { cm_data: CreativeManagementData }) | null; error: Error | null }> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not logged in.") };

    try {
        const { data: resume, error } = await supabase
            .from("user_resumes")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (error || !resume) throw error || new Error("Resume not found");
        if (resume.template_type !== "creative_management") {
            throw new Error("Resume is not a Creative Management template");
        }

        return {
            data: {
                ...resume,
                cm_data: resume.cm_data as CreativeManagementData,
            },
            error: null,
        };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

// ─── Portfolio: Image Upload Helper ──────────────────────────

async function uploadPortfolioImage(
    userId: string,
    resumeId: string,
    imageKey: string,
    base64Data: string
): Promise<string> {
    if (!base64Data || !base64Data.startsWith("data:image")) return "";

    const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return "";

    const ext = match[1];
    const raw = match[2];

    const byteString = atob(raw);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
    }

    const filePath = `${userId}/${resumeId}/${imageKey}.${ext}`;

    const { error } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, bytes, {
            contentType: `image/${ext}`,
            upsert: true,
        });

    if (error) {
        console.error("Portfolio image upload error:", error);
        return "";
    }

    const { data: publicData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

    return publicData.publicUrl;
}

// ─── Portfolio: Save Resume ──────────────────────────────────

export async function savePortfolioResume(
    resumeName: string,
    portfolioData: PortfolioData,
    existingId?: string
): Promise<{ data: SavedResume | null; error: Error | null }> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user)
        return { data: null, error: new Error("User must be logged in to save.") };

    try {
        let resumeId = existingId;

        // ── Parent row ──────────────────────────────────────
        if (existingId) {
            const { error } = await supabase
                .from("user_resumes")
                .update({
                    resume_name: resumeName,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingId)
                .eq("user_id", user.id);
            if (error) throw error;
        } else {
            const { data: inserted, error } = await supabase
                .from("user_resumes")
                .insert({
                    user_id: user.id,
                    template_type: "portfolio",
                    resume_name: resumeName,
                })
                .select()
                .single();
            if (error) throw error;
            resumeId = inserted.id;
        }

        if (!resumeId) throw new Error("Failed to get resume ID");

        // ── Upload profile photo ────────────────────────────
        let profilePhotoUrl = portfolioData.profilePhoto;
        if (portfolioData.profilePhoto && portfolioData.profilePhoto.startsWith("data:image")) {
            profilePhotoUrl = await uploadPortfolioImage(user.id, resumeId, "profile", portfolioData.profilePhoto);
        }

        // ── Upload project images ───────────────────────────
        const processedProjects = await Promise.all(
            portfolioData.projects.map(async (project, index) => {
                let imageUrl = project.imageUrl || "";
                if (imageUrl && imageUrl.startsWith("data:image")) {
                    imageUrl = await uploadPortfolioImage(user.id, resumeId, `project_${index}`, imageUrl);
                }
                return { ...project, imageUrl };
            })
        );

        // ── Store entire portfolio data as JSON ──────────────
        const dataToStore: PortfolioData = {
            ...portfolioData,
            profilePhoto: profilePhotoUrl,
            projects: processedProjects,
        };

        const { error: pdErr } = await supabase
            .from("user_resumes")
            .update({ portfolio_data: dataToStore })
            .eq("id", resumeId)
            .eq("user_id", user.id);
        if (pdErr) throw pdErr;

        // Return the parent resume row
        const { data: result, error: fetchErr } = await supabase
            .from("user_resumes")
            .select("*")
            .eq("id", resumeId)
            .single();

        if (fetchErr) throw fetchErr;
        return { data: result, error: null };
    } catch (err: any) {
        return { data: null, error: err };
    }
}

// ─── Portfolio: Get Resume By ID ─────────────────────────────

export async function getPortfolioResumeById(
    id: string
): Promise<{ data: (SavedResume & { portfolio_data: PortfolioData }) | null; error: Error | null }> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not logged in.") };

    try {
        const { data: resume, error } = await supabase
            .from("user_resumes")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (error || !resume) throw error || new Error("Resume not found");
        if (resume.template_type !== "portfolio") {
            throw new Error("Resume is not a Portfolio template");
        }

        return {
            data: {
                ...resume,
                portfolio_data: resume.portfolio_data as PortfolioData,
            },
            error: null,
        };
    } catch (err: any) {
        return { data: null, error: err };
    }
}
