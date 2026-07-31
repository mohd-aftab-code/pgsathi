"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const KEY = "pgsathi_partner_theme";

/**
 * Light/dark switch for the Partner Portal.
 *
 * Toggles a `.dark` class on <html>, which globals.css maps the `dark:` variant
 * to. The choice is stored in localStorage; with no stored choice we follow the
 * OS setting. The initial class is applied by an inline script in the portal
 * layout so there is no flash of the wrong theme before hydration.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // private mode — the toggle still works for this session
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 grid place-items-center rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {/* Render a stable icon until mounted so SSR and client markup match */}
      {!mounted ? <Sun size={16} /> : isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

/**
 * Applies the stored partner theme to <html>.
 *
 * Only the Partner Portal is themed — the rest of the site is light-only — so
 * this is a no-op anywhere else. Without that check, a visitor whose OS is in
 * dark mode would get a half-styled dark public site.
 */
export function applyStoredPartnerTheme(): void {
  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/partner")) return;
  try {
    const stored = localStorage.getItem(KEY);
    const dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    // private mode — fall back to light
  }
}

/**
 * The same logic as an inline string, for the root layout's <head>.
 *
 * It has to live in <head> rather than in the portal layout: React 19 refuses to
 * execute a <script> created during a client render, so an inline script inside
 * a route layout runs on first load but silently does nothing on client-side
 * navigation — and logs a console error every time. In <head> it runs once,
 * before paint, which is exactly what preventing the flash needs.
 * `applyStoredPartnerTheme()` covers the client-navigation case.
 */
export const themeInitScript = `
(function(){try{
  if(location.pathname.indexOf('/partner')!==0)return;
  var s=localStorage.getItem(${JSON.stringify(KEY)});
  var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark',d);
}catch(e){}})();
`;
