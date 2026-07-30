import { Metadata } from "next";
import RegisterClient from "./register-client";

export const metadata: Metadata = {
  title: "Tenant & PG Owner Registration | PGSathi",
  description: "Create an account on PGSathi. Join as a tenant to find PGs, as an owner to list your PG for free, or as a Partner.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
