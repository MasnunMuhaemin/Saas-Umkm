"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { label: string; pendapatan: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradPendapatan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="strokePendapatan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000000
              ? `${(v / 1000000).toFixed(1)}jt`
              : v >= 1000
                ? `${(v / 1000).toFixed(0)}rb`
                : `${v}`
          }
        />
        <Tooltip
          formatter={(value) => "Rp " + Number(value).toLocaleString("id-ID")}
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 20px 40px -12px rgba(79,70,229,0.18)",
            fontWeight: 600,
          }}
          itemStyle={{ color: "#7c3aed" }}
        />
        <Area
          type="monotone"
          dataKey="pendapatan"
          stroke="url(#strokePendapatan)"
          strokeWidth={3}
          fill="url(#gradPendapatan)"
          activeDot={{ r: 6, strokeWidth: 0, fill: "#7c3aed" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
