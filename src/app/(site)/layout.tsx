import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#051222]">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-[264px]">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}