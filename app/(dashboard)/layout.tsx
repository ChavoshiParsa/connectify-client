import Sidebar from '@/components/layout/sidebar/Sidebar';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-full w-full items-center justify-start">
      <Sidebar />
      {children}
    </div>
  );
}
