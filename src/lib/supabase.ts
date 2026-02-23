import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an image file to Supabase Storage and return the public URL.
 * Images are stored in the "portfolio-images" bucket.
 */
export async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Delete an image file from Supabase Storage using its public URL.
 */
export async function deleteImage(publicUrl: string): Promise<void> {
    try {
        if (!publicUrl.includes("supabase.co/storage/v1/object/public/portfolio-images/")) {
            return; // Not a supabase url, ignore
        }

        const urlParts = publicUrl.split("/portfolio-images/");
        if (urlParts.length !== 2) return;

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from("portfolio-images")
            .remove([filePath]);

        if (error) {
            console.error("Failed to delete old image:", error.message);
        }
    } catch (err) {
        console.error("Error deleting image:", err);
    }
}

/**
 * Upload a base64 data URL to Supabase Storage and return the public URL.
 */
export async function uploadDataUrl(dataUrl: string): Promise<string> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] || "png";
    const file = new File([blob], `image.${ext}`, { type: blob.type });
    return uploadImage(file);
}
