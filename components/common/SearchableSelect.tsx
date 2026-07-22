"use client";

/**
 * components/common/SearchableSelect.tsx
 * A type-to-filter combobox for long lists (35 states, 722 districts, area lists).
 *
 * A plain <select> makes the owner scroll hundreds of options; here they type a
 * few letters and the closest match rises to the top. `allowCustom` lets them
 * keep whatever they typed when it isn't in the list, so the field can never
 * become a dead end.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Chunein…",
  disabledText,
  disabled = false,
  allowCustom = true,
  customHint = "list mein nahi hai — yahi likha rahega",
  className = "",
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Shown instead of the input when the field is locked by an earlier step. */
  disabledText?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  customHint?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close when clicking away; committing the typed text is handled on blur below
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    // Prefix matches rank above substring matches, so what you typed comes first.
    const starts: string[] = [];
    const contains: string[] = [];
    for (const o of options) {
      const l = o.toLowerCase();
      if (l.startsWith(q)) starts.push(o);
      else if (l.includes(q)) contains.push(o);
    }
    return [...starts, ...contains];
  }, [options, query]);

  useEffect(() => setActive(0), [query, open]);

  // Keep the highlighted row in view while arrowing through a long list
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const commit = (v: string) => {
    onChange(v);
    setQuery("");
    setOpen(false);
  };

  const isCustom = !!value && options.length > 0 && !options.includes(value);

  if (disabled) {
    return (
      <div className={`h-11 px-3 rounded-lg border-2 border-neutral-200 bg-neutral-50 flex items-center text-sm text-neutral-400 cursor-not-allowed ${className}`}>
        {disabledText || placeholder}
      </div>
    );
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={open ? query : value}
          placeholder={value || placeholder}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onBlur={() => {
            // Give a click on an option time to land before committing free text
            setTimeout(() => {
              const typed = query.trim();
              if (!typed) return;
              const exact = options.find((o) => o.toLowerCase() === typed.toLowerCase());
              if (exact) commit(exact);
              else if (allowCustom) commit(typed);
              else setQuery("");
            }, 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") {
              e.preventDefault();
              if (filtered[active]) commit(filtered[active]);
              else if (allowCustom && query.trim()) commit(query.trim());
            } else if (e.key === "Escape") { setOpen(false); setQuery(""); }
          }}
          className="w-full h-11 pl-3 pr-9 rounded-lg border-2 border-neutral-200 bg-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all shadow-sm placeholder:text-neutral-400"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          {open ? <Search size={15} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isCustom && !open && (
        <p className="text-[11px] text-primary-600 mt-1">✎ {customHint}</p>
      )}

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg py-1"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-neutral-500">
              {allowCustom
                ? <>Koi match nahi — <strong>&ldquo;{query.trim()}&rdquo;</strong> hi save hoga</>
                : "Koi match nahi mila"}
            </li>
          )}
          {filtered.map((o, i) => (
            <li key={o}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(o)}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                  i === active ? "bg-primary-50 text-primary-800" : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span className="truncate">{o}</span>
                {o === value && <Check size={14} className="text-primary-600 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
