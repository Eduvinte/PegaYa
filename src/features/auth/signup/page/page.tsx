"use client"

import { useRouter } from "next/navigation";
import { signUp } from "@/features/auth/signup/services/auth";
import { SignUpForm } from "@/features/auth/signup/components/signUpForm";
import { toast } from "react-toastify";

const SignUpPage = () => {
    const router = useRouter();

    const handleSignUp = async (
        email: string,
        password: string,
        role: string,
        fullName: string,
        bio: string
    ) => {
        try {
            await signUp(email, password, role, fullName, bio);
            toast.success("Cuenta creada. Revisa tu correo para confirmar.");
            router.push("/login");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unknown error occurred during sign up.");
        }
    };

    return (
        <SignUpForm handleSignUp={handleSignUp} />
    );
}

export default SignUpPage;
