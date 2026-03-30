import CandidateDetailPage from "@/features/company/candidates/page/page";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { userId } = await params;
  return <CandidateDetailPage userId={userId} />;
}
