"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { applyToJob } from "@/features/jobs/detail/services/applyToJob";
import { Button } from "@/shared/ui";

type ApplyButtonProps = {
  jobId: string;
};

export const ApplyButton = ({ jobId }: ApplyButtonProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async () => {
    setIsSubmitting(true);

    try {
      await applyToJob(jobId);
      toast.success("Postulacion enviada.");
      router.refresh();
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === "23505") {
        toast.warn("Ya postulaste a esta vacante.");
      } else {
        console.error("Error applying to job:", error);
        toast.error("No se pudo completar la postulacion.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button type="button" onClick={handleApply} loading={isSubmitting}>
      Postular
    </Button>
  );
};
