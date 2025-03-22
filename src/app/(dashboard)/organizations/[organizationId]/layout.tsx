import { SessionNavBar } from "@/components/dashboard/sidebar/sidebar";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const resolvedParams = await params;
  const organizationId = resolvedParams.organizationId;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch organization details
  const org = await db.query.organizations.findFirst({
    where: and(
      eq(organizations.id, organizationId),
      eq(organizations.userId, userId)
    ),
  });

  if (!org) {
    redirect("/organizations");
  }

  return (
    <div className="h-full">
      <div className="h-full flex">
        <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0">
          <SessionNavBar 
            organizationId={organizationId} 
            organizationName={org.name} 
          />
        </div>
        <div className="md:pl-56 flex-1">
          <main className="h-full">{children}</main>
        </div>
      </div>
      <Toaster />
    </div>
  );
} 