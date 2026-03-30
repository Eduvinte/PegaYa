"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { acceptSelection } from "@/features/applications/list/services/acceptSelection";
import { Button } from "@/shared/ui";

type AcceptSelectionButtonProps = {
  applicationId: string;
  companyOwnerId: string;
  jobId: string;
  jobTitle: string;
};

export const AcceptSelectionButton = ({
  applicationId,
  companyOwnerId,
  jobId,
  jobTitle,
}: AcceptSelectionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onAccept = async () => {
    setLoading(true);
    try {
      await acceptSelection({ applicationId, companyOwnerId, jobId, jobTitle });
      toast.success("Aceptaste la selección. Empresa notificada.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo confirmar la selección.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" size="sm" onClick={onAccept} loading={loading}>
      Aceptar selección
    </Button>
  );
};
