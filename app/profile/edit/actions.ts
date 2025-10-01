'use server';

import { createClient } from "@/lib/supabase/server";

export async function loadProfileFromServer(userId: string) {
  const supabase = await createClient();
  const { data: profileData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return profileData;
}

export async function saveProfileToServer(profile: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .upsert({
      id: profile.id,
      full_name: profile.full_name,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
    });
  if (error) throw error;
  return true;
}