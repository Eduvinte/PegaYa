type CandidateProfileShape = {
  full_name?: string | null;
  bio?: string | null;
  phone?: string | null;
  city?: string | null;
  region?: string | null;
  nationality?: string | null;
  headline?: string | null;
  education_level?: string | null;
  years_experience?: number | null;
  skills?: string[] | null;
  linkedin_url?: string | null;
  cv_url?: string | null;
};

const isFilled = (value: string | null | undefined) => Boolean(value && value.trim().length > 0);

export const getCandidateProfileCompletion = (profile: CandidateProfileShape | null) => {
  if (!profile) {
    return 0;
  }

  const checks = [
    isFilled(profile.full_name),
    isFilled(profile.bio),
    isFilled(profile.phone),
    isFilled(profile.city),
    isFilled(profile.region),
    isFilled(profile.nationality),
    isFilled(profile.headline),
    isFilled(profile.education_level),
    (profile.years_experience ?? 0) > 0,
    (profile.skills?.length ?? 0) > 0,
    isFilled(profile.linkedin_url),
    isFilled(profile.cv_url),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};
