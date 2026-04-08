type JobExpiryInput = {
  workStartDate: string | null | undefined;
};

const CHILE_TIMEZONE = "America/Santiago";

const toChileDateKey = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: CHILE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const isJobExpired = ({ workStartDate }: JobExpiryInput, now: Date = new Date()) => {
  if (!workStartDate) {
    return false;
  }

  // `work_start_date` comes as YYYY-MM-DD from Postgres date.
  const normalizedWorkDate = workStartDate.slice(0, 10);
  const todayInChile = toChileDateKey(now);

  // Expired only when today's date is after work date (not equal).
  return todayInChile > normalizedWorkDate;
};
