import { redirect } from "next/navigation";
import { requireManagerAccess } from "@/lib/manager-auth";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  const { isOwner } = await requireManagerAccess();
  
  if (!isOwner) {
    redirect("/dashboard/manager");
  }

  return <>{children}</>;
}
