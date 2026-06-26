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
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
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
            border: "none",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            fontWeight: 600,
          }}
          itemStyle={{ color: "#2563EB" }}
        />
        <Area
          type="monotone"
          dataKey="pendapatan"
          stroke="#2563EB"
          strokeWidth={3}
          fill="url(#gradPendapatan)"
          activeDot={{ r: 6, strokeWidth: 0, fill: "#2563EB" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
