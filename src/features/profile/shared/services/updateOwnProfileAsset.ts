import { supabase } from "@/lib/supabase/client";

const getCurrentUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesion activa.");
  }

  return user.id;
};

export const updateOwnAvatarUrl = async (avatarUrl: string) => {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
  if (error) throw error;
};

export const updateOwnCvUrl = async (cvUrl: string) => {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from("profiles").update({ cv_url: cvUrl }).eq("id", userId);
  if (error) throw error;
};
