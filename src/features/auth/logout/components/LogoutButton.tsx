"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signOut } from "@/features/auth/logout/services/auth";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui";

type LogoutButtonProps = {
  fullWidth?: boolean;
  compact?: boolean;
  className?: string;
};

export const LogoutButton = ({ fullWidth = false, compact = false, className }: LogoutButtonProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesion cerrada.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("No se pudo cerrar sesion.");
    }
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      variant="outline"
      size={compact ? "sm" : "md"}
      fullWidth={fullWidth}
      className={cn("border-danger/40 text-danger hover:bg-danger/10", className)}
    >
      {compact ? "Salir" : "Cerrar sesion"}
    </Button>
  );
};
