import Link from "next/link";
import { redirect } from "next/navigation";
import { AssignJobContextForm } from "@/features/chat/components/AssignJobContextForm";
import { SendMessageForm } from "@/features/chat/components/SendMessageForm";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/ui";

type ChatPageProps = {
  conversationId?: string;
  candidateId?: string;
  jobId?: string;
};

type ConversationParticipantRow = {
  conversation_id: string;
  user_id: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
};

type ConversationMetaRow = {
  id: string;
  job_id: string | null;
  jobs: { title: string | null } | { title: string | null }[] | null;
};

type CandidateApplicationForContext = {
  job_id: string;
  jobs: { id: string; title: string } | { id: string; title: string }[] | null;
};

type ConversationWithParticipantsRow = {
  id: string;
  conversation_participants: { user_id: string }[];
};

export default async function ChatPage({ conversationId, candidateId, jobId }: ChatPageProps) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) redirect("/login");

  const supabase = await createClient();

  const ensuredConversationId =
    currentUser.role === "company" && candidateId
      ? await ensureConversationWithCandidate(supabase, currentUser.id, candidateId, jobId)
      : null;

  const { data: myParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .eq("user_id", currentUser.id);

  const conversationIds = [...new Set((myParticipants ?? []).map((row) => row.conversation_id))];

  if (!conversationIds.length) {
    return (
      <Card
        variant="glass"
        title={candidateId && currentUser.role === "company" ? "No se pudo iniciar el chat" : "Sin conversaciones"}
        description={
          candidateId && currentUser.role === "company"
            ? "Verifica que el postulante tenga una postulacion a una vacante de tu empresa e intenta de nuevo desde el perfil del postulante."
            : currentUser.role === "company"
              ? "Desde una postulacion visible puedes iniciar chat con el postulante."
            : "Aun no tienes conversaciones activas con empresas."
        }
      />
    );
  }

  const activeConversationId =
    (conversationId && conversationIds.includes(conversationId) ? conversationId : null) ??
    (ensuredConversationId && conversationIds.includes(ensuredConversationId) ? ensuredConversationId : null) ??
    conversationIds[0];

  const [{ data: participants }, { data: allMessages }, { data: conversationMeta }] = await Promise.all([
    supabase.from("conversation_participants").select("conversation_id, user_id").in("conversation_id", conversationIds),
    supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("conversations")
      .select("id, job_id, jobs(title)")
      .in("id", conversationIds),
  ]);

  const typedParticipants = (participants ?? []) as ConversationParticipantRow[];
  const typedMessages = (allMessages ?? []) as MessageRow[];
  const conversationMetaMap = new Map<string, ConversationMetaRow>();
  ((conversationMeta ?? []) as ConversationMetaRow[]).forEach((row) => {
    conversationMetaMap.set(row.id, row);
  });

  const allUserIds = [...new Set(typedParticipants.map((row) => row.user_id))];
  const [profileResult, companyResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").in("id", allUserIds),
    supabase.from("companies").select("owner_id, name").in("owner_id", allUserIds),
  ]);

  const profileMap = new Map<string, { fullName: string | null; avatarUrl: string | null }>();
  (profileResult.data ?? []).forEach((row) => {
    profileMap.set(row.id, { fullName: row.full_name, avatarUrl: row.avatar_url });
  });

  const companyMap = new Map<string, string>();
  (companyResult.data ?? []).forEach((row) => {
    if (row.owner_id) companyMap.set(row.owner_id, row.name);
  });
  const companyUserIds = new Set(
    (companyResult.data ?? []).map((row) => row.owner_id).filter((ownerId): ownerId is string => Boolean(ownerId))
  );

  const conversationSummaries = conversationIds.map((id) => {
    const rows = typedParticipants.filter((row) => row.conversation_id === id);
    const other = rows.find((row) => row.user_id !== currentUser.id);
    const lastMessage = [...typedMessages].reverse().find((msg) => msg.conversation_id === id) ?? null;

    const otherProfile = other ? profileMap.get(other.user_id) : null;
    const title =
      (other && companyMap.get(other.user_id)) ??
      otherProfile?.fullName ??
      (other ? "Usuario" : "Conversacion");

    return {
      id,
      otherUserId: other?.user_id ?? null,
      title,
      jobTitle: extractJobTitle(conversationMetaMap.get(id)?.jobs ?? null),
      avatarUrl: otherProfile?.avatarUrl ?? null,
      lastMessage: lastMessage?.content ?? "Sin mensajes",
      lastAt: lastMessage?.created_at ?? null,
    };
  });

  const activeMessages = typedMessages.filter((msg) => msg.conversation_id === activeConversationId);
  const activeSummary = conversationSummaries.find((item) => item.id === activeConversationId) ?? null;
  const companyHasSentInActiveConversation = activeMessages.some((message) =>
    companyUserIds.has(message.sender_id)
  );
  const canSendMessage =
    currentUser.role === "company" || companyHasSentInActiveConversation;

  const canEditConversationContext = currentUser.role === "company" && Boolean(activeSummary?.otherUserId);

  const contextJobOptions = canEditConversationContext
    ? await getConversationJobOptions(supabase, currentUser.id, activeSummary?.otherUserId ?? "")
    : [];

  return (
    <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card
        variant="glassStrong"
        title="Conversaciones"
        description="Chat entre empresa y postulante."
        className="xl:max-h-[calc(100vh-11rem)] xl:overflow-hidden"
      >
        <div className="space-y-2 xl:max-h-[calc(100vh-18rem)] xl:overflow-y-auto xl:pr-1">
          {conversationSummaries.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            return (
              <Link
                key={conversation.id}
                href={`/messages?conversationId=${conversation.id}`}
                className={`block rounded-xl border px-3 py-2 transition ${
                  isActive
                    ? "border-brand/55 bg-brand/15"
                    : "border-white/15 bg-white/[0.03] hover:border-white/30"
                }`}
              >
                <p className="truncate text-sm font-semibold text-foreground">{conversation.title}</p>
                {conversation.jobTitle ? (
                  <p className="mt-1 truncate text-[11px] text-brand-soft">Vacante: {conversation.jobTitle}</p>
                ) : null}
                <p className="mt-1 truncate text-xs text-muted">{conversation.lastMessage}</p>
              </Link>
            );
          })}
        </div>
      </Card>

      <Card
        variant="glass"
        title={activeSummary ? activeSummary.title : "Conversacion"}
        description={
          activeSummary?.jobTitle
            ? `Vacante: ${activeSummary.jobTitle}${
                activeSummary.lastAt ? ` · Ultimo movimiento: ${formatDate(activeSummary.lastAt)}` : ""
              }`
            : activeSummary?.lastAt
              ? `Ultimo movimiento: ${formatDate(activeSummary.lastAt)}`
              : "Sin actividad"
        }
      >
        {canEditConversationContext ? (
          <AssignJobContextForm
            conversationId={activeConversationId}
            currentJobId={conversationMetaMap.get(activeConversationId)?.job_id ?? null}
            jobOptions={contextJobOptions}
          />
        ) : null}

        <div className="space-y-2 sm:max-h-[50vh] sm:overflow-y-auto sm:pr-1">
          {activeMessages.length ? (
            activeMessages.map((message) => {
              const mine = message.sender_id === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={`max-w-[95%] sm:max-w-[85%] rounded-2xl border px-3 py-2 ${
                    mine
                      ? "ml-auto border-brand/55 bg-brand/20 text-foreground"
                      : "border-white/15 bg-white/[0.04] text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content ?? ""}</p>
                  <p className="mt-1 text-[11px] text-muted">{formatDate(message.created_at)}</p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted">Aun no hay mensajes en esta conversacion.</p>
          )}
        </div>

        {canSendMessage ? (
          <SendMessageForm
            conversationId={activeConversationId}
            senderId={currentUser.id}
            placeholder={
              currentUser.role === "company"
                ? "Escribe un mensaje para el postulante..."
                : "Escribe tu respuesta para la empresa..."
            }
          />
        ) : (
          <p className="mt-4 text-xs text-muted">
            Aun no puedes responder. La empresa debe enviar el primer mensaje.
          </p>
        )}
      </Card>
    </section>
  );
}

const ensureConversationWithCandidate = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyOwnerId: string,
  candidateId: string,
  jobId?: string
) => {
  if (candidateId === companyOwnerId) return null;

  let relationQuery = supabase
    .from("applications")
    .select("id, jobs!inner(id, companies!inner(owner_id))")
    .eq("user_id", candidateId)
    .eq("jobs.companies.owner_id", companyOwnerId);

  if (jobId) {
    relationQuery = relationQuery.eq("job_id", jobId);
  }

  const { data: relation } = await relationQuery.limit(1).maybeSingle();

  if (!relation) return null;

  if (jobId) {
    const { data: existingByJobRaw } = await supabase
      .from("conversations")
      .select("id, conversation_participants!inner(user_id)")
      .eq("job_id", jobId);
    const existingByJob = (existingByJobRaw ?? []) as unknown as ConversationWithParticipantsRow[];

    const match = existingByJob.find((conversation) => {
      const users = conversation.conversation_participants.map((row) => row.user_id);
      return users.includes(companyOwnerId) && users.includes(candidateId);
    });

    if (match?.id) return match.id;

    const { data: existingWithoutContextRaw } = await supabase
      .from("conversations")
      .select("id, conversation_participants!inner(user_id)")
      .is("job_id", null);
    const existingWithoutContext = (existingWithoutContextRaw ?? []) as unknown as ConversationWithParticipantsRow[];

    const contextlessMatch = existingWithoutContext.find((conversation) => {
      const users = conversation.conversation_participants.map((row) => row.user_id);
      return users.includes(companyOwnerId) && users.includes(candidateId);
    });

    if (contextlessMatch?.id) {
      await supabase.from("conversations").update({ job_id: jobId }).eq("id", contextlessMatch.id);
      return contextlessMatch.id;
    }
  } else {
    const [{ data: mine }, { data: candidate }] = await Promise.all([
      supabase.from("conversation_participants").select("conversation_id").eq("user_id", companyOwnerId),
      supabase.from("conversation_participants").select("conversation_id").eq("user_id", candidateId),
    ]);

    const mineIds = new Set((mine ?? []).map((row) => row.conversation_id));
    const existing = (candidate ?? []).find((row) => mineIds.has(row.conversation_id));
    if (existing) return existing.conversation_id;
  }

  const newConversationId = crypto.randomUUID();
  const { error: conversationError } = await supabase
    .from("conversations")
    .insert({ id: newConversationId, job_id: jobId ?? null });
  if (conversationError) {
    console.error("Error creando conversacion:", conversationError);
    return null;
  }

  const { error: companyParticipantError } = await supabase.from("conversation_participants").insert({
    conversation_id: newConversationId,
    user_id: companyOwnerId,
  });

  if (companyParticipantError) {
    console.error("Error agregando participante empresa:", companyParticipantError);
    return null;
  }

  const { error: candidateParticipantError } = await supabase.from("conversation_participants").insert({
    conversation_id: newConversationId,
    user_id: candidateId,
  });
  if (candidateParticipantError) {
    console.error("Error agregando participante postulante:", candidateParticipantError);
    return null;
  }

  return newConversationId;
};

const extractJobTitle = (jobs: ConversationMetaRow["jobs"]) => {
  if (!jobs) return null;
  if (Array.isArray(jobs)) return jobs[0]?.title ?? null;
  return jobs.title ?? null;
};

const getConversationJobOptions = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyOwnerId: string,
  candidateId: string
) => {
  if (!candidateId) return [];

  const { data } = await supabase
    .from("applications")
    .select("job_id, jobs!inner(id, title, companies!inner(owner_id))")
    .eq("user_id", candidateId)
    .eq("jobs.companies.owner_id", companyOwnerId)
    .order("created_at", { ascending: false });

  const typedRows = (data ?? []) as unknown as CandidateApplicationForContext[];
  const jobMap = new Map<string, string>();

  typedRows.forEach((row) => {
    const job = extractJobContext(row.jobs);
    if (row.job_id && job?.title && !jobMap.has(row.job_id)) {
      jobMap.set(row.job_id, job.title);
    }
  });

  return [...jobMap.entries()].map(([id, title]) => ({ id, title }));
};

const extractJobContext = (jobs: CandidateApplicationForContext["jobs"]) => {
  if (!jobs) return null;
  if (Array.isArray(jobs)) return jobs[0] ?? null;
  return jobs;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};
