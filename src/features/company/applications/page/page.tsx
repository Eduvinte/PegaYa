import Link from "next/link";
import { redirect } from "next/navigation";
import { SelectCandidateButton } from "@/features/company/applications/components/SelectCandidateButton";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { CreateReviewForm } from "@/features/reviews/components/CreateReviewForm";
import { createClient } from "@/lib/supabase/server";
import { Button, Card } from "@/shared/ui";

type CompanyJobApplicationsPageProps = {
  jobId: string;
};

type ApplicationRow = {
  id: string;
  user_id: string;
  status: string;
  created_at: string | null;
  jobs: { id: string; title: string } | { id: string; title: string }[] | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean | null;
};

type ReviewRow = {
  reviewer_id?: string;
  reviewed_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
};

export default async function CompanyJobApplicationsPage({ jobId }: CompanyJobApplicationsPageProps) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "company") redirect("/jobs");
  if (!currentUser.companyId) redirect("/company/onboarding");

  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select("id, user_id, status, created_at, jobs!inner(id, title, companies!inner(owner_id))")
    .eq("job_id", jobId)
    .eq("jobs.companies.owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  const typedApplications = (applications ?? []) as unknown as ApplicationRow[];
  const jobTitle = extractJobTitle(typedApplications[0]?.jobs) ?? "Vacante";

  const uniqueUserIds = [...new Set(typedApplications.map((row) => row.user_id))];
  const { data: profiles } = uniqueUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, verified")
        .in("id", uniqueUserIds)
    : { data: [] as ProfileRow[] };

  const { data: reviews } = uniqueUserIds.length
    ? await supabase
        .from("reviews")
        .select("reviewer_id, reviewed_user_id, rating, comment, created_at")
        .in("reviewed_user_id", uniqueUserIds)
        .order("created_at", { ascending: false })
    : { data: [] as ReviewRow[] };

  const { data: myReviews } = uniqueUserIds.length
    ? await supabase
        .from("reviews")
        .select("reviewed_user_id, rating, comment, created_at")
        .eq("reviewer_id", currentUser.id)
        .in("reviewed_user_id", uniqueUserIds)
        .order("created_at", { ascending: false })
    : { data: [] as ReviewRow[] };

  const reviewerIds = [...new Set((reviews ?? []).map((review) => review.reviewer_id).filter(Boolean))] as string[];
  const { data: reviewerProfiles } = reviewerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", reviewerIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const { data: reviewerCompanies } = reviewerIds.length
    ? await supabase.from("companies").select("owner_id, name").in("owner_id", reviewerIds)
    : { data: [] as { owner_id: string; name: string | null }[] };

  const reviewerProfileMap = new Map<string, string>();
  (reviewerProfiles ?? []).forEach((row) => reviewerProfileMap.set(row.id, row.full_name ?? "Usuario"));
  const reviewerCompanyMap = new Map<string, string>();
  (reviewerCompanies ?? []).forEach((row) => reviewerCompanyMap.set(row.owner_id, row.name ?? ""));

  const profilesMap = new Map<string, ProfileRow>();
  (profiles ?? []).forEach((profile) => profilesMap.set(profile.id, profile));

  const reviewSummaryMap = new Map<
    string,
    { avgRating: number; count: number; latestComment: string | null; reviewerName: string }
  >();
  const groupedReviews = new Map<string, ReviewRow[]>();
  (reviews ?? []).forEach((review) => {
    const existing = groupedReviews.get(review.reviewed_user_id) ?? [];
    existing.push(review);
    groupedReviews.set(review.reviewed_user_id, existing);
  });

  const myLatestReviewMap = new Map<string, ReviewRow>();
  (myReviews ?? []).forEach((review) => {
    if (!myLatestReviewMap.has(review.reviewed_user_id)) {
      myLatestReviewMap.set(review.reviewed_user_id, review);
    }
  });
  groupedReviews.forEach((candidateReviews, userId) => {
    const count = candidateReviews.length;
    const avgRating =
      count > 0
        ? candidateReviews.reduce((acc, current) => acc + Number(current.rating ?? 0), 0) / count
        : 0;
    const latestWithComment = candidateReviews.find(
      (review) => review.comment && review.comment.trim().length > 0
    );
    const latestComment = latestWithComment?.comment ?? null;
    const latestReviewerId = latestWithComment?.reviewer_id ?? candidateReviews[0]?.reviewer_id;
    const reviewerName =
      (latestReviewerId ? reviewerCompanyMap.get(latestReviewerId) : null) ||
      (latestReviewerId ? reviewerProfileMap.get(latestReviewerId) : null) ||
      "Usuario";
    reviewSummaryMap.set(userId, { avgRating, count, latestComment, reviewerName });
  });

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <Link href={`/jobs/${jobId}`} className="text-sm text-brand-soft hover:text-brand">
          ← Volver al detalle
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Postulaciones visibles</h1>
        <p className="mt-2 text-sm text-muted">
          Vacante: <span className="text-foreground">{jobTitle}</span>
        </p>
      </header>

      {typedApplications.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {typedApplications.map((application) => {
            const profile = profilesMap.get(application.user_id);
            const reviewSummary = reviewSummaryMap.get(application.user_id);
            const myLatestReview = myLatestReviewMap.get(application.user_id);
            return (
              <Card
                key={application.id}
                variant="glass"
                title={
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={`Avatar de ${profile?.full_name ?? "postulante"}`}
                        className="h-11 w-11 rounded-full border border-white/20 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-brand/20 text-sm font-semibold text-brand-soft">
                        {getInitials(profile?.full_name)}
                      </div>
                    )}
                    <span>{profile?.full_name ?? "Postulante"}</span>
                  </div>
                }
                description={profile?.bio ?? "Sin biografia"}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <MetaBlock label="Estado" value={formatApplicationStatus(application.status)} />
                  <MetaBlock label="Verificado" value={profile?.verified ? "Si" : "No"} />
                  <MetaBlock
                    label="Rating"
                    value={
                      reviewSummary?.count
                        ? `${reviewSummary.avgRating.toFixed(1)} (${reviewSummary.count})`
                        : "Sin reviews"
                    }
                  />
                </div>

                {reviewSummary?.latestComment ? (
                  <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Ultimo review</p>
                    <p className="mt-1 text-sm text-foreground">{reviewSummary.latestComment}</p>
                    <p className="mt-1 text-xs text-muted">Por: {reviewSummary.reviewerName}</p>
                  </div>
                ) : null}

                <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.03] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">Tu review rapido</p>
                  {myLatestReview ? (
                    <p className="mt-1 text-sm text-muted">
                      Ultimo enviado: {myLatestReview.rating}/5
                      {myLatestReview.comment ? ` · ${myLatestReview.comment}` : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Aun no envias review a este postulante.</p>
                  )}
                  <div className="mt-2">
                    <CreateReviewForm
                      reviewedUserId={application.user_id}
                      hasExistingReview={Boolean(myLatestReview)}
                      defaultRating={myLatestReview?.rating ?? 5}
                      defaultComment={myLatestReview?.comment ?? ""}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <div className="flex gap-2">
                    {application.status === "pending" ? (
                      <SelectCandidateButton
                        applicationId={application.id}
                        recipientUserId={application.user_id}
                        jobId={jobId}
                        jobTitle={jobTitle}
                      />
                    ) : null}
                    <Link href={`/company/candidates/${application.user_id}?jobId=${jobId}`}>
                      <Button size="sm" variant="glass">
                        Ver perfil postulante
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card
          variant="glass"
          title="Sin postulaciones visibles"
          description="Cuando candidatos postulen a esta vacante, apareceran aqui."
        />
      )}
    </section>
  );
}

const extractJobTitle = (jobs: ApplicationRow["jobs"]) => {
  if (!jobs) return null;
  if (Array.isArray(jobs)) return jobs[0]?.title ?? null;
  return jobs.title ?? null;
};

const formatApplicationStatus = (status: string) => {
  if (status === "selected_by_company") return "Seleccionado por empresa";
  if (status === "accepted_by_candidate") return "Aceptado por postulante";
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
