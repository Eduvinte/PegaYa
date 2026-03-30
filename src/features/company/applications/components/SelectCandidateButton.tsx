"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { selectCandidate } from "@/features/company/applications/services/selectCandidate";
import { Button } from "@/shared/ui";

type SelectCandidateButtonProps = {
  applicationId: string;
  recipientUserId: string;
  jobId: string;
  jobTitle: string;
};

export const SelectCandidateButton = ({
  applicationId,
  recipientUserId,
  jobId,
  jobTitle,
}: SelectCandidateButtonProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSelect = async () => {
    setLoading(true);
    try {
      await selectCandidate({ applicationId, recipientUserId, jobId, jobTitle });
      toast.success("Postulante seleccionado y notificado.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo seleccionar al postulante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" size="sm" loading={loading} onClick={onSelect}>
      Seleccionar postulante
    </Button>
  );
};
