import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getAudioUrl(folder: string, surahNumber: number): string {
  const paddedNumber = String(surahNumber).padStart(3, "0");
  return `${supabaseUrl}/storage/v1/object/public/quran-audio/reciters/${folder}/${paddedNumber}.mp3`;
}
