"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/shared/ui";

type JobOption = {
  id: string;
  title: string;
};

type AssignJobContextFormProps = {
  conversationId: string;
  currentJobId: string | null;
  jobOptions: JobOption[];
};

export const AssignJobContextForm = ({
  conversationId,
  currentJobId,
  jobOptions,
}: AssignJobContextFormProps) => {
  const router = useRouter();
  const defaultValue = useMemo(() => currentJobId ?? "", [currentJobId]);
  const [selectedJobId, setSelectedJobId] = useState(defaultValue);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ job_id: selectedJobId || null })
        .eq("id", conversationId);

      if (error) throw error;
      toast.success("Contexto de vacante actualizado.");
      router.refresh();
    } catch (error) {
      console.error("Error actualizando contexto del chat:", error);
      toast.error("No se pudo actualizar el contexto de vacante.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">Contexto de vacante</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={selectedJobId}
          onChange={(event) => setSelectedJobId(event.target.value)}
          className="liquid-focus-ring liquid-glass min-w-[260px] rounded-xl px-3 py-2 text-sm text-foreground outline-none"
        >
          <option value="" className="bg-[#08212a]">
            Sin contexto
          </option>
          {jobOptions.map((job) => (
            <option key={job.id} value={job.id} className="bg-[#08212a]">
              {job.title}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          variant="glass"
          disabled={isSaving || selectedJobId === defaultValue}
          onClick={onSave}
        >
          {isSaving ? "Guardando..." : "Guardar contexto"}
        </Button>
      </div>
    </div>
  );
};
