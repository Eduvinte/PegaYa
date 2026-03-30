import { createClient } from "@/lib/supabase/server";

export type AppRole = "candidate" | "company";

export type AppShellUser = {
  id: string;
  email: string;
  role: AppRole;
  fullName: string | null;
  avatarUrl: string | null;
  companyId: string | null;
  companyName: string | null;
};

export const getCurrentAppUser = async (): Promise<AppShellUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: userRow }, { data: profileRow }, { data: companyRow }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
    supabase.from("companies").select("id, name").eq("owner_id", user.id).maybeSingle(),
  ]);

  const role: AppRole = userRow?.role === "company" ? "company" : "candidate";

  return {
    id: user.id,
    email: user.email ?? "",
    role,
    fullName: profileRow?.full_name ?? null,
    avatarUrl: profileRow?.avatar_url ?? null,
    companyId: companyRow?.id ?? null,
    companyName: companyRow?.name ?? null,
  };
};
