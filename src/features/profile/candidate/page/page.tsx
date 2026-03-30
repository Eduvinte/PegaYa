import { redirect } from "next/navigation";
import { CandidateProfileForm } from "@/features/profile/candidate/components/CandidateProfileForm";
import { getCandidateProfileCompletion } from "@/features/profile/candidate/lib/profileCompletion";
import { getCurrentAppUser } from "@/features/app-shell/services/getCurrentAppUser";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/ui";

export default async function CandidateProfilePage() {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "candidate") {
    redirect("/jobs");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, bio, avatar_url, rating, verified, phone, city, region, nationality, headline, education_level, years_experience, skills, linkedin_url, cv_url"
    )
    .eq("id", currentUser.id)
    .maybeSingle();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_id, rating, comment, created_at")
    .eq("reviewed_user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const reviewerIds = [...new Set((reviews ?? []).map((review) => review.reviewer_id))];
  const { data: reviewerProfiles } = reviewerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", reviewerIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const reviewerNameMap = new Map<string, string>();
  (reviewerProfiles ?? []).forEach((row) => reviewerNameMap.set(row.id, row.full_name ?? "Usuario"));

  const completion = getCandidateProfileCompletion(profile);

  return (
    <section className="space-y-5">
      <header className="liquid-glass-strong rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-soft">Perfil candidato</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Mi perfil</h1>
        <p className="mt-2 text-sm text-muted">
          Completa tus datos para mejorar visibilidad frente a empresas y acelerar postulaciones.
        </p>
      </header>

      <Card variant="glass" padding="lg">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Completitud de perfil</p>
          <p className="text-sm font-semibold text-brand-soft">{completion}%</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-brand transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 ? (
          <p className="mt-3 text-sm text-warning">
            Te faltan campos por completar. Un perfil completo aumenta tu confianza frente a empresas.
          </p>
        ) : (
          <p className="mt-3 text-sm text-success">Perfil completo. Muy bien.</p>
        )}
      </Card>

      <Card variant="glass" padding="lg">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetaBlock label="Nombre" value={profile?.full_name ?? "Sin definir"} />
          <MetaBlock label="Correo" value={currentUser.email} />
          <MetaBlock label="Verificado" value={profile?.verified ? "Si" : "No"} />
          <MetaBlock
            label="Rating"
            value={profile?.rating != null ? `${Number(profile.rating).toFixed(1)}` : "0.0"}
          />
          <MetaBlock label="Bio" value={profile?.bio ?? "Sin biografia"} />
          <MetaBlock
            label="Avatar"
            value={profile?.avatar_url ? "Configurado" : "Sin avatar"}
          />
        </div>
      </Card>

      <Card variant="glass" padding="lg" title="Editar perfil">
        <CandidateProfileForm
          initialValues={{
            fullName: profile?.full_name ?? "",
            headline: profile?.headline ?? "",
            bio: profile?.bio ?? "",
            phone: profile?.phone ?? "",
            city: profile?.city ?? "",
            region: profile?.region ?? "",
            nationality: profile?.nationality ?? "",
            educationLevel: profile?.education_level ?? "",
            yearsExperience: profile?.years_experience ?? 0,
            skillsText: (profile?.skills ?? []).join(", "),
            linkedinUrl: profile?.linkedin_url ?? "",
            cvUrl: profile?.cv_url ?? "",
            avatarUrl: profile?.avatar_url ?? "",
          }}
        />
      </Card>

      <Card variant="glass" padding="lg" title="Reviews recibidos">
        {reviews?.length ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {reviewerNameMap.get(review.reviewer_id) ?? "Usuario"} · {review.rating}/5
                </p>
                <p className="mt-1 text-sm text-muted">{review.comment ?? "Sin comentario"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Aun no tienes reviews.</p>
        )}
      </Card>
    </section>
  );
}

const MetaBlock = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};
