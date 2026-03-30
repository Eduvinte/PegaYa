"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { closeJob, deleteJob } from "@/features/company/jobs/services/manageJob";
import { Button } from "@/shared/ui";

type JobActionsProps = {
  jobId: string;
  jobTitle: string;
  status: "open" | "closed";
};

export const JobActions = ({ jobId, jobTitle, status }: JobActionsProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState<"close" | "delete" | null>(null);

  const onClose = async () => {
    setLoading("close");
    try {
      await closeJob(jobId, jobTitle);
      toast.success("Vacante cerrada.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cerrar la vacante.");
    } finally {
      setLoading(null);
    }
  };

  const onDelete = async () => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar esta vacante?");
    if (!confirmed) return;
    setLoading("delete");
    try {
      await deleteJob(jobId);
      toast.success("Vacante eliminada.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar la vacante.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/company/jobs/${jobId}/edit`}>
        <Button size="sm" variant="glass">
          Editar
        </Button>
      </Link>
      {status === "open" ? (
        <Button size="sm" variant="outline" loading={loading === "close"} onClick={onClose}>
          Cerrar vacante
        </Button>
      ) : null}
      <Button size="sm" variant="danger" loading={loading === "delete"} onClick={onDelete}>
        Eliminar
      </Button>
    </div>
  );
};
