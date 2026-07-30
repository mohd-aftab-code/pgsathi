import { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Tenant Login / PG Owner Login | PGSathi",
  description: "Login to your PGSathi account. Access your PG dashboard as an owner, tenant, or PGSathi Partner.",
};

export default function LoginPage() {
  return <LoginClient />;
}
