"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function LeadsChart({ data }: { data: { date: string; leads: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center text-neutral-400 bg-neutral-50 rounded-xl border border-neutral-100">
        No recent data available to display chart.
      </div>
    );
  }

  return (
    <div className="w-full h-[250px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#888' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#888' }} 
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: '#f9f9f9' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
          />
          <Bar 
            dataKey="leads" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
