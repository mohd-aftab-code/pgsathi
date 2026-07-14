"use client";

import { useState, useEffect } from "react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // If the user dismissed it this session, don't show it again.
    if (isDismissed) return;

    const handler = (e: any) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show our custom persistent UI
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If the app is successfully installed, hide the banner
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowInstall(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [isDismissed]);

  if (!showInstall) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-3 flex items-center gap-3 w-[92%] max-w-sm animate-in slide-in-from-bottom-5">
      <img src="/mobileaapicon.png" alt="PGSathi App" className="w-12 h-12 rounded-xl object-cover border border-neutral-100" />
      <div className="flex-1">
        <h4 className="font-bold text-neutral-900 text-sm leading-tight">Install PGSathi App</h4>
        <p className="text-xs text-neutral-500 mt-0.5">Faster booking & zero brokerage</p>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
      >
        Install
      </button>
      <button 
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors shadow-sm"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
