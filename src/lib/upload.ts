import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Upload an image to the private content bucket and return a long-lived signed URL. */
export async function uploadContentImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("শুধু ছবি আপলোড করা যাবে");
  if (file.size > 5 * 1024 * 1024) throw new Error("ছবির সাইজ ৫ MB-এর কম হতে হবে");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("content-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("content-images").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("ছবির লিংক তৈরি হয়নি");
  return data.signedUrl;
}
