import { supabase } from "@/lib/supabase/client";

type UploadAssetOptions = {
  file: File;
  folder: "avatars" | "cv";
};

export const uploadToFileBucket = async ({ file, folder }: UploadAssetOptions) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesion activa.");
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const path = `${folder}/${user.id}/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage.from("file").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw uploadError;
  }

  const publicUrl =
    folder === "avatars" ? supabase.storage.from("file").getPublicUrl(path).data.publicUrl : null;

  return {
    storagePath: path,
    publicUrl,
  };
};

export const getSignedFileUrl = async (storagePath: string, expiresInSeconds = 3600) => {
  const { data, error } = await supabase.storage.from("file").createSignedUrl(storagePath, expiresInSeconds);
  if (error) {
    throw error;
  }
  return data.signedUrl;
};
