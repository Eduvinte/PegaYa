import { supabase } from "@/lib/supabase/client";

type UpdateJobInput = {
  jobId: string;
  title: string;
  description: string;
  location: string;
  region: string;
  comuna: string;
  durationValue: number | null;
  durationUnit: "days" | "weeks" | "months" | "years" | null;
  extensionPossible: boolean;
  salary: number | null;
  status: "open" | "closed";
};

export const updateJob = async ({
  jobId,
  title,
  description,
  location,
  region,
  comuna,
  durationValue,
  durationUnit,
  extensionPossible,
  salary,
  status,
}: UpdateJobInput) => {
  const { error } = await supabase
    .from("jobs")
    .update({
      title,
      description,
      location,
      region,
      comuna,
      duration_value: durationValue,
      duration_unit: durationUnit,
      extension_possible: extensionPossible,
      salary,
      status,
    })
    .eq("id", jobId);

  if (error) throw error;
};
