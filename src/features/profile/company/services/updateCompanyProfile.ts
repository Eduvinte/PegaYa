import { supabase } from "@/lib/supabase/client";

type UpdateCompanyProfileInput = {
  companyId: string;
  name: string;
  description: string;
  website: string;
  industry: string;
  companySize: string;
  foundedYear: number | null;
  hqCity: string;
  hqRegion: string;
  avatarUrl: string;
};

export const updateCompanyProfile = async (input: UpdateCompanyProfileInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesion activa.");

  const { error: companyError } = await supabase
    .from("companies")
    .update({
      name: input.name || null,
      description: input.description || null,
      website: input.website || null,
      industry: input.industry || null,
      company_size: input.companySize || null,
      founded_year: input.foundedYear,
      hq_city: input.hqCity || null,
      hq_region: input.hqRegion || null,
    })
    .eq("id", input.companyId);

  if (companyError) throw companyError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: input.avatarUrl || null,
    })
    .eq("id", user.id);

  if (profileError) throw profileError;
};
