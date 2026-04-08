"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { declineSelection } from "@/features/applications/list/services/declineSelection";
import { Button } from "@/shared/ui";

type DeclineSelectionButtonProps = {
  applicationId: string;
  companyOwnerId: string;
  jobId: string;
  jobTitle: string;
};

export const DeclineSelectionButton = ({
  applicationId,
  companyOwnerId,
  jobId,
  jobTitle,
}: DeclineSelectionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDecline = async () => {
    const confirmed = window.confirm(
      "Si desistes, tu seleccion sera liberada y la vacante se volvera a abrir."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await declineSelection({ applicationId, companyOwnerId, jobId, jobTitle });
      toast.success("Desististe de la vacante. La empresa fue notificada.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo desistir de la seleccion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" size="sm" variant="glass" onClick={onDecline} loading={loading}>
      Desistir de vacante
    </Button>
  );
};
