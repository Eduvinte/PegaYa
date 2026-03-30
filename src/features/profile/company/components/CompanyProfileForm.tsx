"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { updateCompanyProfile } from "@/features/profile/company/services/updateCompanyProfile";
import { updateOwnAvatarUrl } from "@/features/profile/shared/services/updateOwnProfileAsset";
import { uploadToFileBucket } from "@/shared/lib/uploadToFileBucket";
import { Button, Input } from "@/shared/ui";

type CompanyProfileFormProps = {
  initialValues: {
    companyId: string;
    name: string;
    description: string;
    website: string;
    industry: string;
    companySize: string;
    foundedYear: number | null;
    hqCity: string;
    hqRegion: string;
    avatarUrl: string;
  };
};

export const CompanyProfileForm = ({ initialValues }: CompanyProfileFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const foundedYearRaw = String(formData.get("foundedYear") ?? "").trim();
    const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : null;
    try {
      await updateCompanyProfile({
        companyId: initialValues.companyId,
        name: String(formData.get("name") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        website: String(formData.get("website") ?? "").trim(),
        industry: String(formData.get("industry") ?? "").trim(),
        companySize: String(formData.get("companySize") ?? "").trim(),
        foundedYear: Number.isNaN(foundedYear) ? null : foundedYear,
        hqCity: String(formData.get("hqCity") ?? "").trim(),
        hqRegion: String(formData.get("hqRegion") ?? "").trim(),
        avatarUrl,
      });
      toast.success("Perfil empresa actualizado.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el perfil empresa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
        <p className="text-sm font-semibold text-foreground">Foto de perfil empresa</p>
        <div className="mt-3 flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar empresa" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-sm text-muted">
              Sin foto
            </div>
          )}
          <label className="cursor-pointer text-sm text-brand-soft hover:text-brand">
            {uploadingAvatar ? "Subiendo..." : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingAvatar}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploadingAvatar(true);
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
                  setUploadingAvatar(false);
                  event.currentTarget.value = "";
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="name" label="Nombre empresa" required defaultValue={initialValues.name} />
        <Input name="website" label="Sitio web" defaultValue={initialValues.website} />
        <Input name="industry" label="Industria" defaultValue={initialValues.industry} />
        <Input name="companySize" label="Tamano empresa" defaultValue={initialValues.companySize} />
        <Input
          name="foundedYear"
          label="Ano fundacion"
          type="number"
          defaultValue={initialValues.foundedYear ? String(initialValues.foundedYear) : ""}
        />
        <Input name="hqCity" label="Ciudad casa matriz" defaultValue={initialValues.hqCity} />
        <Input name="hqRegion" label="Region casa matriz" defaultValue={initialValues.hqRegion} />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Descripcion
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialValues.description}
          className="liquid-focus-ring liquid-glass w-full rounded-2xl px-3 py-2.5 text-sm text-foreground outline-none"
        />
      </div>

      <Button type="submit" loading={loading}>
        Guardar perfil empresa
      </Button>
    </form>
  );
};
