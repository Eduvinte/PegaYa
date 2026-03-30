import { supabase } from "@/lib/supabase/client";

type CreateJobInput = {
  companyId: string;
  title: string;
  description: string;
  location: string;
  region: string;
  comuna: string;
  durationValue: number | null;
  durationUnit: "days" | "weeks" | "months" | "years" | null;
  extensionPossible: boolean;
  salary?: number | null;
};

export const createJob = async ({
  companyId,
  title,
  description,
  location,
  region,
  comuna,
  durationValue,
  durationUnit,
  extensionPossible,
  salary,
}: CreateJobInput) => {
  const { error } = await supabase.from("jobs").insert({
    company_id: companyId,
    title,
    description,
    location,
    region,
    comuna,
    duration_value: durationValue,
    duration_unit: durationUnit,
    extension_possible: extensionPossible,
    salary: salary ?? null,
    status: "open",
  });

  if (error) {
    throw error;
  }
};
