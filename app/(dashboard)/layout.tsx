import Sidebar from '@/components/layout/sidebar/Sidebar';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = await getServerSession(authOptions);

  // if (!session || !session.user) redirect('/auth?page=sign-in');

  return (
    <div className="relative flex h-full w-full items-center justify-start">
      <Sidebar />
      {children}
    </div>
  );
}
