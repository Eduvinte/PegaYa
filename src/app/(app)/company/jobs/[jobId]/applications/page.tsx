import CompanyJobApplicationsPage from "@/features/company/applications/page/page";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <CompanyJobApplicationsPage jobId={jobId} />;
}
