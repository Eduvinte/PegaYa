import { supabase } from "@/lib/supabase/client";

type CreateJobInput = {
  companyId: string;
  title: string;
  description: string;
  location: string;
  region: string;
  comuna: string;
  workStartDate: string;
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
  workStartDate,
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
    work_start_date: workStartDate,
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
