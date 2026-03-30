import { supabase } from "@/lib/supabase/client";

type UpdateCandidateProfileInput = {
  fullName: string;
  headline: string;
  bio: string;
  phone: string;
  city: string;
  region: string;
  nationality: string;
  educationLevel: string;
  yearsExperience: number;
  skills: string[];
  linkedinUrl: string;
  cvUrl: string;
  avatarUrl: string;
};

export const updateCandidateProfile = async (input: UpdateCandidateProfileInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesion activa.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName || null,
      headline: input.headline || null,
      bio: input.bio || null,
      phone: input.phone || null,
      city: input.city || null,
      region: input.region || null,
      nationality: input.nationality || null,
      education_level: input.educationLevel || null,
      years_experience: input.yearsExperience || 0,
      skills: input.skills,
      linkedin_url: input.linkedinUrl || null,
      cv_url: input.cvUrl || null,
      avatar_url: input.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    throw error;
  }
};
