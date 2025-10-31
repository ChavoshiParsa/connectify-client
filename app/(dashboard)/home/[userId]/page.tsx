import Home from '@/components/layout/home/Home';

export default async function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const userId = (await params).userId;

  return <Home userId={userId} />;
}
