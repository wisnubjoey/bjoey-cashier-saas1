import { UserButton } from "@/components/auth/user-button";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/organizations" className="font-bold text-xl">
            SaaS Cashier
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}