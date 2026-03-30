"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { resendConfirmation, signIn } from "@/features/auth/login/services/auth";
import { LoginForm } from "@/features/auth/login/components/LoginForm";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordReset = searchParams.get("passwordReset");
  const hasShownPasswordResetToast = useRef(false);

  useEffect(() => {
    if (passwordReset !== "success") return;
    if (hasShownPasswordResetToast.current) return;
    hasShownPasswordResetToast.current = true;
    toast.success("Contrasena cambiada con exito. Inicia sesion.");
    router.replace("/login");
  }, [passwordReset, router]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await signIn(email, password);
      toast.success(`Bienvenido ${user?.email ?? ""}`.trim());
      const redirectedFrom = searchParams.get("redirectedFrom");
      const target =
        redirectedFrom && redirectedFrom.startsWith("/")
          ? redirectedFrom
          : "/jobs";
      router.push(target);
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === "email_not_confirmed") {
        toast.warn("Debes confirmar tu correo. Te enviamos un nuevo email.");
        try {
          await resendConfirmation(email);
        } catch (resendError) {
          console.error("Error resending confirmation:", resendError);
          toast.error("No pudimos reenviar el correo de confirmación.");
        }
        return;
      }

      console.error("Error logging in:", error);
      toast.error("Error al iniciar sesión. Revisa tus credenciales.");
    }
  };

  return <LoginForm handleLogin={handleLogin} />;
};

export default LoginPage;
