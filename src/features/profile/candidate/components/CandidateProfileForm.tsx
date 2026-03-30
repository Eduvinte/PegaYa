"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { updateCandidateProfile } from "@/features/profile/candidate/services/updateCandidateProfile";
import {
  updateOwnAvatarUrl,
  updateOwnCvUrl,
} from "@/features/profile/shared/services/updateOwnProfileAsset";
import { getSignedFileUrl, uploadToFileBucket } from "@/shared/lib/uploadToFileBucket";
import { Button, Input } from "@/shared/ui";

type CandidateProfileFormProps = {
  initialValues: {
    fullName: string;
    headline: string;
    bio: string;
    phone: string;
    city: string;
    region: string;
    nationality: string;
    educationLevel: string;
    yearsExperience: number;
    skillsText: string;
    linkedinUrl: string;
    cvUrl: string;
    avatarUrl: string;
  };
};

export const CandidateProfileForm = ({ initialValues }: CandidateProfileFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl);
  const [cvUrl, setCvUrl] = useState(initialValues.cvUrl);
  const [cvViewUrl, setCvViewUrl] = useState(
    initialValues.cvUrl.startsWith("http") ? initialValues.cvUrl : ""
  );

  useEffect(() => {
    const resolveCvUrl = async () => {
      if (!cvUrl) {
        setCvViewUrl("");
        return;
      }
      if (cvUrl.startsWith("http")) {
        setCvViewUrl(cvUrl);
        return;
      }
      try {
        const signedUrl = await getSignedFileUrl(cvUrl);
        setCvViewUrl(signedUrl);
      } catch (error) {
        console.error(error);
        setCvViewUrl("");
      }
    };

    void resolveCvUrl();
  }, [cvUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const yearsExperienceRaw = String(formData.get("yearsExperience") ?? "0").trim();
    const yearsExperience = Number(yearsExperienceRaw || "0");

    try {
      await updateCandidateProfile({
        fullName: String(formData.get("fullName") ?? "").trim(),
        headline: String(formData.get("headline") ?? "").trim(),
        bio: String(formData.get("bio") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        region: String(formData.get("region") ?? "").trim(),
        nationality: String(formData.get("nationality") ?? "").trim(),
        educationLevel: String(formData.get("educationLevel") ?? "").trim(),
        yearsExperience: Number.isNaN(yearsExperience) ? 0 : Math.max(0, yearsExperience),
        skills: String(formData.get("skills") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim(),
        cvUrl,
        avatarUrl,
      });

      toast.success("Perfil actualizado.");
      router.refresh();
    } catch (error) {
      console.error("Error updating candidate profile:", error);
      toast.error("No se pudo actualizar el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
        <p className="text-sm font-semibold text-foreground">Foto de perfil</p>
        <div className="mt-3 flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar candidato" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-sm text-muted">
              Sin foto
            </div>
          )}
          <label className="cursor-pointer text-sm text-brand-soft hover:text-brand">
            {isUploadingAvatar ? "Subiendo..." : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploadingAvatar}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setIsUploadingAvatar(true);
                try {
                  const uploaded = await uploadToFileBucket({ file, folder: "avatars" });
                  const finalAvatarUrl = uploaded.publicUrl ?? "";
                  await updateOwnAvatarUrl(finalAvatarUrl);
                  setAvatarUrl(finalAvatarUrl);
                  toast.success("Foto subida.");
                  router.refresh();
                } catch (error) {
                  console.error(error);
                  toast.error("No se pudo subir la foto.");
                } finally {
                  setIsUploadingAvatar(false);
                  event.currentTarget.value = "";
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="fullName" label="Nombre completo" defaultValue={initialValues.fullName} required />
        <Input name="headline" label="Titular profesional" defaultValue={initialValues.headline} />
        <Input name="phone" label="Telefono" defaultValue={initialValues.phone} />
        <Input name="nationality" label="Nacionalidad" defaultValue={initialValues.nationality} />
        <Input name="city" label="Ciudad" defaultValue={initialValues.city} />
        <Input name="region" label="Region" defaultValue={initialValues.region} />
        <Input name="educationLevel" label="Nivel de estudios" defaultValue={initialValues.educationLevel} />
        <Input
          name="yearsExperience"
          label="Anos de experiencia"
          type="number"
          min="0"
          defaultValue={String(initialValues.yearsExperience)}
        />
      </div>

      <Input
        name="skills"
        label="Skills (separadas por coma)"
        defaultValue={initialValues.skillsText}
      />
      <Input name="linkedinUrl" label="LinkedIn URL" defaultValue={initialValues.linkedinUrl} />

      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
        <p className="text-sm font-semibold text-foreground">Curriculum (PDF)</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer text-sm text-brand-soft hover:text-brand">
            {isUploadingCv ? "Subiendo..." : "Subir CV PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={isUploadingCv}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setIsUploadingCv(true);
                try {
                  const uploaded = await uploadToFileBucket({ file, folder: "cv" });
                  await updateOwnCvUrl(uploaded.storagePath);
                  setCvUrl(uploaded.storagePath);
                  toast.success("CV subido.");
                  router.refresh();
                } catch (error) {
                  console.error(error);
                  toast.error("No se pudo subir el CV.");
                } finally {
                  setIsUploadingCv(false);
                  event.currentTarget.value = "";
                }
              }}
            />
          </label>
          {cvViewUrl ? (
            <a href={cvViewUrl} target="_blank" rel="noreferrer">
              <Button type="button" size="sm" variant="glass">
                Ver CV actual
              </Button>
            </a>
          ) : (
            <Button type="button" size="sm" variant="ghost" disabled>
              Sin CV cargado
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium text-foreground">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={initialValues.bio}
          className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
        />
      </div>

      <Button type="submit" loading={isSubmitting}>
        Guardar perfil
      </Button>
    </form>
  );
};
