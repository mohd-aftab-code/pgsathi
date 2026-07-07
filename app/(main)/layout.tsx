import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { auth } from "@/lib/auth";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar user={session?.user} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
