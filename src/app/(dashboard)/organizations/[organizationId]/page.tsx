import { redirect } from "next/navigation";

export default function OrganizationPage({ 
  params 
}: { 
  params: { organizationId: string } 
}) {
  // Redirect ke dashboard
  redirect(`/organizations/${params.organizationId}/dashboard`);
} 