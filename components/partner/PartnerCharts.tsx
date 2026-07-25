"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Point = { month: string; registrations: number; earnings: number };

/**
 * Recharts draws SVG with colours passed as props, so `dark:` utilities cannot
 * restyle it. This watches the `.dark` class on <html> and re-renders with the
 * right palette whenever the theme toggle flips.
 */
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const read = () => setIsDark(document.documentElement.classList.contains("dark"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function useChartTheme() {
  const isDark = useIsDark();
  return {
    grid: isDark ? "#262626" : "#f0f0f0",
    axis: isDark ? "#737373" : "#a3a3a3",
    tooltip: {
      borderRadius: "12px",
      border: isDark ? "1px solid #404040" : "1px solid #e5e5e5",
      background: isDark ? "#171717" : "#ffffff",
      color: isDark ? "#f5f5f5" : "#171717",
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      fontSize: "12px",
    } as React.CSSProperties,
  };
}

const EmptyState = ({ text }: { text: string }) => (
  <div className="h-[220px] grid place-items-center text-sm text-neutral-400 dark:text-neutral-500">
    {text}
  </div>
);

export function RegistrationsChart({ data }: { data: Point[] }) {
  const t = useChartTheme();
  if (!data.some((d) => d.registrations > 0)) return <EmptyState text="Abhi koi PG register nahi hua" />;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: t.axis }} dy={6} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: t.axis }} allowDecimals={false} />
          <Tooltip cursor={{ fill: "rgba(139,92,246,0.08)" }} contentStyle={t.tooltip} />
          <Bar dataKey="registrations" name="PGs" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EarningsChart({ data }: { data: Point[] }) {
  const t = useChartTheme();
  if (!data.some((d) => d.earnings > 0)) return <EmptyState text="Abhi koi earning nahi bani" />;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="partnerEarnFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: t.axis }} dy={6} />
          <YAxis
            axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: t.axis }}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          />
          <Tooltip contentStyle={t.tooltip} formatter={(v: any) => [`₹${v}`, "Earnings"]} />
          <Area
            type="monotone" dataKey="earnings" name="Earnings"
            stroke="#22c55e" strokeWidth={2} fill="url(#partnerEarnFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
