import Sidebar from '@/components/layout/sidebar/Sidebar';

export default async function DashboardLayout(props: LayoutProps<'/'>) {
  return (
    <div className="relative flex h-full w-full items-center justify-start">
      <Sidebar />
      {props.children}
    </div>
  );
}
