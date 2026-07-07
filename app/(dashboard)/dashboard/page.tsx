import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect based on user role
  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (session.user.role === "OWNER") {
    redirect("/dashboard/owner");
  } else if ((session.user as any).isManager) {
    redirect("/dashboard/manager");
  } else {
    // Default to tenant dashboard
    redirect("/dashboard/tenant");
  }
}
