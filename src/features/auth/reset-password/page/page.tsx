"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { updatePassword } from "@/features/auth/reset-password/services/auth";
import { ResetPasswordForm } from "@/features/auth/reset-password/components/ResetPasswordForm";
import { supabase } from "@/lib/supabase/client";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  // In dev (React Strict Mode), effects can run twice and consume one-time
  // auth tokens. Guarding this avoids false "token expired" redirects.
  const hasProcessedRecovery = useRef(false);

  useEffect(() => {
    if (hasProcessedRecovery.current) return;
    hasProcessedRecovery.current = true;

    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    const prepareRecoverySession = async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            toast.error("El enlace de recuperacion no es valido o expiro.");
            router.replace("/forgot-password");
            return;
          }
        } else if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/reset-password");
        }
        setIsRecoveryReady(true);
        return;
      }

      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (error) {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            toast.error("El enlace de recuperacion no es valido o expiro.");
            router.replace("/forgot-password");
            return;
          }
        } else if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/reset-password");
        }
        setIsRecoveryReady(true);
        return;
      }

      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashType = hashParams.get("type");

        if (accessToken && refreshToken && hashType === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            toast.error("El enlace de recuperacion no es valido o expiro.");
            router.replace("/forgot-password");
            return;
          }
          window.history.replaceState({}, "", "/reset-password");
          setIsRecoveryReady(true);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsRecoveryReady(true);
        return;
      }

      toast.error("Abre el enlace que llega por correo para cambiar tu clave.");
      router.replace("/forgot-password");
    };

    prepareRecoverySession();
  }, [searchParams, router]);

  const handleSubmit = async (password: string) => {
    if (!isRecoveryReady) {
      toast.error("La sesion de recuperacion aun no esta lista.");
      return;
    }

    try {
      await updatePassword(password);
      router.push("/login?passwordReset=success");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("No pudimos actualizar tu contraseña.");
    }
  };

  return <ResetPasswordForm handleSubmit={handleSubmit} />;
};

export default ResetPasswordPage;
