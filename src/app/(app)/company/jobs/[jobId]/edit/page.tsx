import CompanyEditJobPage from "@/features/company/jobs/edit/page/page";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <CompanyEditJobPage jobId={jobId} />;
}
