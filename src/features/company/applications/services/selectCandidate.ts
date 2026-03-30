import { supabase } from "@/lib/supabase/client";

type SelectCandidateInput = {
  applicationId: string;
  recipientUserId: string;
  jobId: string;
  jobTitle: string;
};

export const selectCandidate = async ({
  applicationId,
  recipientUserId,
  jobId,
  jobTitle,
}: SelectCandidateInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesion activa.");

  const { error: updateError } = await supabase
    .from("applications")
    .update({ status: "selected_by_company" })
    .eq("id", applicationId);

  if (updateError) throw updateError;

  const { error: notificationError } = await supabase.from("notifications").insert({
    recipient_id: recipientUserId,
    actor_id: user.id,
    type: "application_selected",
    title: "Fuiste seleccionado por una empresa",
    body: `La empresa te seleccionó para la vacante: ${jobTitle}.`,
    entity_type: "job",
    entity_id: jobId,
  });

  if (notificationError) throw notificationError;
};
