"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { createJob } from "@/features/company/jobs/new/services/createJob";
import { Button, Input } from "@/shared/ui";

type CreateJobFormProps = {
  companyId: string;
};

export const CreateJobForm = ({ companyId }: CreateJobFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const region = String(formData.get("region") ?? "").trim();
    const comuna = String(formData.get("comuna") ?? "").trim();
    const workStartDate = String(formData.get("workStartDate") ?? "").trim();
    const salaryRaw = String(formData.get("salary") ?? "").trim();
    const salary = salaryRaw ? Number(salaryRaw) : null;
    const durationValueRaw = String(formData.get("durationValue") ?? "").trim();
    const durationValue = durationValueRaw ? Number(durationValueRaw) : null;
    const durationUnitRaw = String(formData.get("durationUnit") ?? "").trim();
    const durationUnit =
      durationUnitRaw === "days" ||
      durationUnitRaw === "weeks" ||
      durationUnitRaw === "months" ||
      durationUnitRaw === "years"
        ? durationUnitRaw
        : null;
    const extensionPossible = formData.get("extensionPossible") === "on";

    if (!title || !description || !location || !region || !comuna || !workStartDate) {
      setError("Completa titulo, descripcion, ubicacion, region, comuna y dia de trabajo.");
      setIsSubmitting(false);
      return;
    }

    if (salaryRaw && Number.isNaN(salary)) {
      setError("El sueldo debe ser numerico.");
      setIsSubmitting(false);
      return;
    }

    if (durationValueRaw && (Number.isNaN(durationValue) || (durationValue ?? 0) <= 0)) {
      setError("La duracion debe ser un numero mayor a 0.");
      setIsSubmitting(false);
      return;
    }

    if ((durationValue && !durationUnit) || (!durationValue && durationUnit)) {
      setError("Define duracion completa: numero y unidad.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createJob({
        companyId,
        title,
        description,
        location,
        region,
        comuna,
        workStartDate,
        durationValue,
        durationUnit,
        extensionPossible,
        salary,
      });
      toast.success("Vacante publicada.");
      router.push("/company/jobs");
      router.refresh();
    } catch (submitError) {
      console.error("Error creating job:", submitError);
      setError("No se pudo publicar la vacante.");
      toast.error("No se pudo publicar la vacante.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input id="job-title" name="title" label="Titulo" required />
      <Input id="job-location" name="location" label="Ubicacion" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input id="job-region" name="region" label="Region" required />
        <Input id="job-comuna" name="comuna" label="Comuna" required />
      </div>
      <Input
        id="job-work-start-date"
        name="workStartDate"
        label="Dia de trabajo / comparecencia"
        type="date"
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          id="job-duration-value"
          name="durationValue"
          label="Duracion (numero)"
          type="number"
          min="1"
        />
        <div className="space-y-2">
          <label htmlFor="job-duration-unit" className="block text-sm font-medium text-foreground">
            Unidad duracion
          </label>
          <select
            id="job-duration-unit"
            name="durationUnit"
            defaultValue=""
            className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
          >
            <option value="" className="bg-[#08212a]">
              Sin definir
            </option>
            <option value="days" className="bg-[#08212a]">
              Dias
            </option>
            <option value="weeks" className="bg-[#08212a]">
              Semanas
            </option>
            <option value="months" className="bg-[#08212a]">
              Meses
            </option>
            <option value="years" className="bg-[#08212a]">
              Anos
            </option>
          </select>
        </div>
      </div>
      <Input id="job-salary" name="salary" label="Sueldo (CLP, opcional)" type="number" min="0" />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="extensionPossible" className="h-4 w-4 accent-[#18b9c7]" />
        Oportunidad de extensión
      </label>

      <div className="space-y-2">
        <label htmlFor="job-description" className="block text-sm font-medium text-foreground">
          Descripcion
        </label>
        <textarea
          id="job-description"
          name="description"
          required
          rows={6}
          className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" fullWidth loading={isSubmitting}>
        Publicar vacante
      </Button>
    </form>
  );
};
