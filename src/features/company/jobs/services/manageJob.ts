import { supabase } from "@/lib/supabase/client";

export const closeJob = async (jobId: string, jobTitle: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesion activa.");

  const { error: updateError } = await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId);
  if (updateError) throw updateError;

  const { error: applicationUpdateError } = await supabase
    .from("applications")
    .update({ status: "accepted" })
    .eq("job_id", jobId)
    .eq("status", "accepted_by_candidate");
  if (applicationUpdateError) throw applicationUpdateError;

  const { data: selectedApplications } = await supabase
    .from("applications")
    .select("user_id")
    .eq("job_id", jobId)
    .in("status", ["selected_by_company", "accepted_by_candidate"]);

  const recipients = [...new Set((selectedApplications ?? []).map((row) => row.user_id))];
  if (!recipients.length) return;

  const payload = recipients.map((recipientId) => ({
    recipient_id: recipientId,
    actor_id: user.id,
    type: "job_closed",
    title: "La vacante fue cerrada",
    body: `La empresa cerró la vacante: ${jobTitle}.`,
    entity_type: "job",
    entity_id: jobId,
  }));

  const { error: notifyError } = await supabase.from("notifications").insert(payload);
  if (notifyError) throw notifyError;
};

export const deleteJob = async (jobId: string) => {
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw error;
};
