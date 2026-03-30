import { supabase } from "@/lib/supabase/client";

export const applyToJob = async (jobId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesion activa.");
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    user_id: user.id,
  });

  if (error) {
    throw error;
  }
};
