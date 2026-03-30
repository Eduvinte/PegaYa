import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/features/app-shell/components/AppShell";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <AppShell user={currentUser}>{children}</AppShell>;
}
