import { X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl: string;
}


export default function AuthModal({ isOpen, onClose, callbackUrl }: AuthModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
          </div>
          <h3 className="text-xl font-black text-neutral-900 mb-1.5">Sign In to Continue</h3>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            Direct owner contact &amp; full property details are free for verified users.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-primary-600/20 transition-all active:scale-[0.98]"
            >
              Login to Continue
            </Link>
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-3 px-4 rounded-xl transition-colors"
            >
              New here? Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
