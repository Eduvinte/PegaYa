import { supabase } from "@/lib/supabase/client";

type AcceptSelectionInput = {
  applicationId: string;
  companyOwnerId: string;
  jobId: string;
  jobTitle: string;
};

export const acceptSelection = async ({
  applicationId,
  companyOwnerId,
  jobId,
  jobTitle,
}: AcceptSelectionInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesion activa.");

  const { error: updateError } = await supabase
    .from("applications")
    .update({ status: "accepted_by_candidate" })
    .eq("id", applicationId);
  if (updateError) throw updateError;

  const { error: notificationError } = await supabase.from("notifications").insert({
    recipient_id: companyOwnerId,
    actor_id: user.id,
    type: "application_accepted",
    title: "El postulante aceptó la selección",
    body: `El postulante aceptó continuar con la vacante: ${jobTitle}.`,
    entity_type: "job",
    entity_id: jobId,
  });
  if (notificationError) throw notificationError;
};
