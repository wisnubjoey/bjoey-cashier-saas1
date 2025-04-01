import Link from "next/link";
import "./dashboard.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/organizations" className="font-bold text-xl text-gray-900">
            SaaS Cashier
          </Link>
          
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}