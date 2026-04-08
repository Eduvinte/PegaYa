"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { updateJob } from "@/features/company/jobs/edit/services/updateJob";
import { Button, Input } from "@/shared/ui";

type EditJobFormProps = {
  job: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    region: string | null;
    comuna: string | null;
    workStartDate: string | null;
    durationValue: number | null;
    durationUnit: "days" | "weeks" | "months" | "years" | null;
    extensionPossible: boolean;
    salary: number | null;
    status: "open" | "closed";
  };
};

export const EditJobForm = ({ job }: EditJobFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const salaryRaw = String(formData.get("salary") ?? "").trim();
    const salaryValue = salaryRaw ? Number(salaryRaw) : null;
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
    const workStartDate = String(formData.get("workStartDate") ?? "").trim();

    if (!workStartDate) {
      toast.error("Define el dia de trabajo / comparecencia.");
      setLoading(false);
      return;
    }

    if ((durationValue && !durationUnit) || (!durationValue && durationUnit)) {
      toast.error("Define duracion completa: numero y unidad.");
      setLoading(false);
      return;
    }

    try {
      await updateJob({
        jobId: job.id,
        title: String(formData.get("title") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        location: String(formData.get("location") ?? "").trim(),
        region: String(formData.get("region") ?? "").trim(),
        comuna: String(formData.get("comuna") ?? "").trim(),
        workStartDate,
        durationValue: Number.isNaN(durationValue) ? null : durationValue,
        durationUnit,
        extensionPossible,
        salary: Number.isNaN(salaryValue) ? null : salaryValue,
        status: (String(formData.get("status") ?? "open") === "closed" ? "closed" : "open"),
      });
      toast.success("Vacante actualizada.");
      router.push("/company/jobs");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar la vacante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input name="title" label="Titulo" defaultValue={job.title} required />
      <Input name="location" label="Ubicacion" defaultValue={job.location ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="region" label="Region" defaultValue={job.region ?? ""} />
        <Input name="comuna" label="Comuna" defaultValue={job.comuna ?? ""} />
      </div>
      <Input
        name="workStartDate"
        label="Dia de trabajo / comparecencia"
        type="date"
        defaultValue={job.workStartDate ?? ""}
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name="durationValue"
          label="Duracion (numero)"
          type="number"
          min="1"
          defaultValue={job.durationValue != null ? String(job.durationValue) : ""}
        />
        <div className="space-y-2">
          <label htmlFor="durationUnit" className="block text-sm font-medium text-foreground">
            Unidad duracion
          </label>
          <select
            id="durationUnit"
            name="durationUnit"
            defaultValue={job.durationUnit ?? ""}
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
      <Input name="salary" label="Sueldo" type="number" min="0" defaultValue={String(job.salary ?? "")} />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="extensionPossible"
          defaultChecked={job.extensionPossible}
          className="h-4 w-4 accent-[#18b9c7]"
        />
        Oportunidad de extensión
      </label>
      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium text-foreground">
          Estado
        </label>
        <select
          id="status"
          name="status"
          defaultValue={job.status}
          className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
        >
          <option value="open" className="bg-[#08212a]">
            Abierta
          </option>
          <option value="closed" className="bg-[#08212a]">
            Cerrada
          </option>
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Descripcion
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={job.description ?? ""}
          className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
        />
      </div>

      <Button type="submit" loading={loading}>
        Guardar cambios
      </Button>
    </form>
  );
};
