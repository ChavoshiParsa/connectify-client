import Home from '@/components/layout/home/Home';

export default async function ChatPage({ params }: { params: Promise<{ dmKey: string }> }) {
  const dmKey = (await params).dmKey;

  return <Home dmKey={dmKey} />;
}
