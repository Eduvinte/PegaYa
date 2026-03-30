import { supabase } from "@/lib/supabase/client";

type CreateCompanyInput = {
  name: string;
  description: string;
};

export const createCompany = async ({ name, description }: CreateCompanyInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesion activa.");
  }

  const { error } = await supabase.from("companies").insert({
    owner_id: user.id,
    name,
    description,
  });

  if (error) {
    throw error;
  }
};
