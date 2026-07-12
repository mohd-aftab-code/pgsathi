import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { auth } from "@/lib/auth";
import { getPlanTier, isTrialActive } from "@/lib/manage-auth";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Owners who already have free-trial or paid access shouldn't be nagged
  // with a "Pricing" link everywhere — only show it once that access lapses.
  let showPricing = true;
  if (session?.user?.role === "OWNER") {
    const userId = parseInt(session.user.id);
    const [tier, trial] = await Promise.all([getPlanTier(userId), isTrialActive(userId)]);
    const hasPaidPlan = tier === "GROWTH" || tier === "PRO";
    showPricing = !(hasPaidPlan || trial.active);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar user={session?.user} showPricing={showPricing} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
