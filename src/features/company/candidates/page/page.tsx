import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { CreateReviewForm } from "@/features/reviews/components/CreateReviewForm";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/ui";

type CandidateDetailPageProps = {
  userId: string;
  jobId?: string;
};

type CandidateApplicationRow = {
  id: string;
  status: string;
  jobs: { id: string; title: string; status: string } | { id: string; title: string; status: string }[] | null;
};

export default async function CandidateDetailPage({ userId, jobId }: CandidateDetailPageProps) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "company") redirect("/jobs");
  if (!currentUser.companyId) redirect("/company/onboarding");

  const supabase = await createClient();

  const { data: relation } = await supabase
    .from("applications")
    .select("id, jobs!inner(id, companies!inner(owner_id))")
    .eq("user_id", userId)
    .eq("jobs.companies.owner_id", currentUser.id)
    .limit(1)
    .maybeSingle();

  if (!relation) {
    return (
      <Card
        variant="glass"
        title="Postulante no disponible"
        description="No tienes permisos para ver este perfil o no ha postulado a tus vacantes."
      />
    );
  }

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, bio, avatar_url, rating, verified, headline, phone, city, region, nationality, education_level, years_experience, skills, linkedin_url, portfolio_url, cv_url, availability"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("id, status, jobs!inner(id, title, status, companies!inner(owner_id))")
      .eq("user_id", userId)
      .eq("jobs.companies.owner_id", currentUser.id)
      .order("created_at", { ascending: false }),
  ]);

  const cvViewUrl = await resolveFileUrl(supabase, profile?.cv_url ?? null);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_id, rating, comment, created_at")
    .eq("reviewed_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: myReviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("reviewer_id", currentUser.id)
    .eq("reviewed_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  const reviewerIds = [...new Set((reviews ?? []).map((review) => review.reviewer_id))];
  const { data: reviewerProfiles } = reviewerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", reviewerIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const reviewerNameMap = new Map<string, string>();
  (reviewerProfiles ?? []).forEach((row) => reviewerNameMap.set(row.id, row.full_name ?? "Usuario"));

  const typedApplications = (applications ?? []) as unknown as CandidateApplicationRow[];
  const contextJob = typedApplications
    .map((application) => extractJob(application.jobs))
    .find((job) => (jobId ? job?.id === jobId : Boolean(job?.id)));

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/company/jobs" className="text-sm text-brand-soft hover:text-brand">
            ← Volver a mis vacantes
          </Link>
          <Link
            href={`/messages?candidateId=${userId}${contextJob?.id ? `&jobId=${contextJob.id}` : ""}`}
            className="rounded-xl border border-brand-soft/40 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-brand-soft hover:border-brand/60 hover:text-brand"
          >
            Iniciar chat con postulante
          </Link>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {profile?.full_name ?? "Perfil postulante"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Aqui puedes revisar la informacion visible y el historial de postulaciones a tus vacantes.
        </p>
        {contextJob?.title ? (
          <p className="mt-1 text-xs text-muted">
            Contexto de chat: <span className="text-foreground">{contextJob.title}</span>
          </p>
        ) : null}
      </header>

      <Card variant="glass" title="Informacion personal visible">
        <div className="mb-4 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={`Avatar de ${profile.full_name ?? "postulante"}`}
              className="h-16 w-16 rounded-full border border-white/20 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-brand/20 text-lg font-semibold text-brand-soft">
              {getInitials(profile?.full_name)}
            </div>
          )}

          <div>
            <p className="text-lg font-semibold text-foreground">{profile?.full_name ?? "Postulante"}</p>
            <p className="text-sm text-muted">{profile?.headline ?? "Sin titular profesional"}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetaBlock label="Nombre" value={profile?.full_name ?? "Sin nombre"} />
          <MetaBlock label="ID postulante" value={userId} />
          <MetaBlock label="Verificado" value={profile?.verified ? "Si" : "No"} />
          <MetaBlock
            label="Rating"
            value={profile?.rating != null ? `${Number(profile.rating).toFixed(1)}` : "0.0"}
          />
          <MetaBlock label="Telefono" value={profile?.phone ?? "No informado"} />
          <MetaBlock label="Ciudad" value={profile?.city ?? "No informada"} />
          <MetaBlock label="Region" value={profile?.region ?? "No informada"} />
          <MetaBlock label="Nacionalidad" value={profile?.nationality ?? "No informada"} />
          <MetaBlock label="Estudios" value={profile?.education_level ?? "No informado"} />
          <MetaBlock
            label="Anos experiencia"
            value={profile?.years_experience != null ? `${profile.years_experience}` : "0"}
          />
          <MetaBlock label="Disponibilidad" value={profile?.availability ?? "No informada"} />
        </div>

        <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Bio</p>
          <p className="mt-2 text-sm text-foreground">{profile?.bio ?? "Sin biografia registrada."}</p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <LinkBlock label="LinkedIn" href={profile?.linkedin_url ?? null} />
          <LinkBlock label="Portfolio" href={profile?.portfolio_url ?? null} />
          <LinkBlock label="CV" href={cvViewUrl} />
        </div>

        <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Skills</p>
          {profile?.skills?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/20 bg-white/[0.05] px-2.5 py-1 text-xs text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Sin skills registradas.</p>
          )}
        </div>
      </Card>

      <Card variant="glass" title="Postulaciones en tus vacantes">
        {typedApplications.length ? (
          <div className="space-y-2.5">
            {typedApplications.map((application) => {
              const job = extractJob(application.jobs);
              return (
                <div
                  key={application.id}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-foreground">{job?.title ?? "Vacante"}</p>
                  <p className="mt-1 text-xs text-muted">
                    Estado vacante: {job?.status === "open" ? "Abierta" : "Cerrada"} | Estado postulacion:{" "}
                    {formatApplicationStatus(application.status)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">Sin historial visible.</p>
        )}
      </Card>

      <Card variant="glass" title="Reviews del postulante">
        {reviews?.length ? (
          <div className="space-y-2.5">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">
                  {reviewerNameMap.get(review.reviewer_id) ?? "Usuario"} · {review.rating}/5
                </p>
                <p className="mt-1 text-sm text-muted">{review.comment ?? "Sin comentario"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Este postulante aun no tiene reviews.</p>
        )}
      </Card>

      <Card variant="glass" title="Asignar review a postulante">
        {myReviews?.length ? (
          <div className="mb-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Tus reviews recientes</p>
            {myReviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
                <p className="text-sm font-medium text-foreground">{review.rating}/5</p>
                <p className="mt-1 text-sm text-muted">{review.comment ?? "Sin comentario"}</p>
              </div>
            ))}
          </div>
        ) : null}
        <CreateReviewForm reviewedUserId={userId} />
      </Card>
    </section>
  );
}

const extractJob = (jobs: CandidateApplicationRow["jobs"]) => {
  if (!jobs) return null;
  if (Array.isArray(jobs)) return jobs[0] ?? null;
  return jobs;
};

const formatApplicationStatus = (status: string) => {
  if (status === "selected_by_company") return "Seleccionada por empresa";
  if (status === "accepted_by_candidate") return "Aceptada por postulante";
  if (status === "accepted") return "Aceptada";
  if (status === "rejected") return "Rechazada";
  return "Pendiente";
};

const MetaBlock = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};

const LinkBlock = ({ label, href }: { label: string; href: string | null }) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex text-sm font-medium text-brand-soft hover:text-brand"
        >
          Abrir enlace
        </a>
      ) : (
        <p className="mt-1 text-sm text-muted">No informado</p>
      )}
    </div>
  );
};

const getInitials = (fullName: string | null | undefined) => {
  if (!fullName) return "US";
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
  return initials.toUpperCase() || "US";
};

const resolveFileUrl = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePathOrUrl: string | null
) => {
  if (!storagePathOrUrl) return null;
  const raw = storagePathOrUrl.trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const normalizedPath = raw.replace(/^\/+/, "").replace(/^file\/+/, "");

  const { data: signedData, error: signedError } = await supabase.storage
    .from("file")
    .createSignedUrl(normalizedPath, 3600);

  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  const { data: publicData } = supabase.storage.from("file").getPublicUrl(normalizedPath);
  return publicData?.publicUrl ?? null;
};
