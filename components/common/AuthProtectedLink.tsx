"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import AuthModal from "./AuthModal";

export default function AuthProtectedLink({ 
  href, 
  children, 
  className 
}: { 
  href: string, 
  children: React.ReactNode, 
  className?: string 
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    try {
      const session = await getSession();
      if (!session?.user) {
        setShowModal(true);
      } else {
        router.push(href);
      }
    } catch (err) {
      router.push(href);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} callbackUrl={href} />
    </>
  );
}
