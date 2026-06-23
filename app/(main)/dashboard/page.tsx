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
  } else {
    // Default fallback to owner dashboard for now, 
    // we can change this later if there's a specific tenant dashboard
    redirect("/dashboard/owner");
  }
}
