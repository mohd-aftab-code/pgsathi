"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Point = { month: string; income: number; expense: number };

function inr(v: number) {
  return `₹${v.toLocaleString("en-IN")}`;
}

function yTick(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${Math.round(v / 1000)}k`;
  return `₹${v}`;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg text-xs">
      <div className="font-bold text-neutral-800 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-neutral-500">{p.name}:</span>
          <span className="font-semibold text-neutral-900">{inr(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-expense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="#9ca3af"
          dy={6}
        />
        <YAxis
          tickFormatter={yTick}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="#9ca3af"
          width={52}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="income"
          name="Collected"
          stroke="#16a34a"
          strokeWidth={2.5}
          fill="url(#grad-income)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Expenses"
          stroke="#ea580c"
          strokeWidth={2.5}
          fill="url(#grad-expense)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
