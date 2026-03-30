import { supabase } from "@/lib/supabase/client";

// Sign up a new user with email and password
export const signUp = async (
  email: string,
  password: string,
  role: string,
  fullName: string,
  bio: string
) => {
  const emailRedirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        role,
        full_name: fullName,
        bio,
      },
    },
  });
  if (error) {
    throw error;
  }
  return data.user;
}
