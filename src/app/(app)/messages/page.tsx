import ChatPage from "@/features/chat/page/page";

type MessagesRouteProps = {
  searchParams: Promise<{
    conversationId?: string;
    candidateId?: string;
    jobId?: string;
  }>;
};

export default async function Page({ searchParams }: MessagesRouteProps) {
  const params = await searchParams;
  return (
    <ChatPage
      conversationId={params.conversationId}
      candidateId={params.candidateId}
      jobId={params.jobId}
    />
  );
}
