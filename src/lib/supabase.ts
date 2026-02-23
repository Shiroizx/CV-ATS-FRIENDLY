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
 * Upload a base64 data URL to Supabase Storage and return the public URL.
 */
export async function uploadDataUrl(dataUrl: string): Promise<string> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] || "png";
    const file = new File([blob], `image.${ext}`, { type: blob.type });
    return uploadImage(file);
}
