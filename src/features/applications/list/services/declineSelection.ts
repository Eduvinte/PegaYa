import { supabase } from "@/lib/supabase/client";

type DeclineSelectionInput = {
  applicationId: string;
  companyOwnerId: string;
  jobId: string;
  jobTitle: string;
};

export const declineSelection = async ({
  applicationId,
  companyOwnerId,
  jobId,
  jobTitle,
}: DeclineSelectionInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesion activa.");

  const { data: updatedApplication, error: updateError } = await supabase
    .from("applications")
    .update({ status: "rejected" })
    .eq("id", applicationId)
    .in("status", ["selected_by_company", "accepted_by_candidate"])
    .select("id")
    .maybeSingle();

  if (updateError) throw updateError;
  if (!updatedApplication) {
    throw new Error("La postulacion ya no esta en estado seleccionable.");
  }

  const { error: notificationError } = await supabase.from("notifications").insert({
    recipient_id: companyOwnerId,
    actor_id: user.id,
    type: "system",
    title: "El postulante desistio de la vacante",
    body: `El postulante desistio de la vacante: ${jobTitle}.`,
    entity_type: "job",
    entity_id: jobId,
  });
  if (notificationError) throw notificationError;
};
