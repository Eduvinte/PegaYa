"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { createCompany } from "@/features/company/onboarding/services/createCompany";
import { Button, Input } from "@/shared/ui";

export const CompanyOnboardingForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name) {
      setError("El nombre de la empresa es obligatorio.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createCompany({ name, description });
      toast.success("Empresa creada correctamente.");
      router.push("/company/jobs/new");
      router.refresh();
    } catch (submitError) {
      console.error("Error creating company:", submitError);
      toast.error("No se pudo crear la empresa.");
      setError("No se pudo crear la empresa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input id="company-name" name="name" label="Nombre empresa" required />

      <div className="space-y-2">
        <label htmlFor="company-description" className="block text-sm font-medium text-foreground">
          Descripcion
        </label>
        <textarea
          id="company-description"
          name="description"
          rows={5}
          className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
          placeholder="Describe brevemente a tu empresa."
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={isSubmitting}>
          Crear empresa
        </Button>
        <Link href="/jobs">
          <Button type="button" variant="glass">
            Volver al feed
          </Button>
        </Link>
      </div>
    </form>
  );
};
