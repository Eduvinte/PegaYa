"use client";

import { toast } from "react-toastify";
import { requestPasswordReset } from "@/features/auth/forgot-password/services/auth";
import { ForgotPasswordForm } from "@/features/auth/forgot-password/components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  const handleSubmit = async (email: string) => {
    try {
      await requestPasswordReset(email);
      toast.success("Revisa tu correo para restablecer tu contraseña.");
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("No pudimos enviar el enlace. Intenta nuevamente.");
    }
  };

  return <ForgotPasswordForm handleSubmit={handleSubmit} />;
};

export default ForgotPasswordPage;
