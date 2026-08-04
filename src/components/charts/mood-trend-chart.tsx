"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SCORE_TO_EMOJI } from "@/lib/mood";

type MoodPoint = {
  date: string;
  score: number;
  moodLabel: string;
  note: string | null;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: MoodPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-sm">
      <p className="font-medium">
        {new Date(point.date).toLocaleDateString()} · {SCORE_TO_EMOJI[point.score]} {point.moodLabel}
      </p>
      {point.note && <p className="mt-1 max-w-56 text-xs text-muted-foreground">{point.note}</p>}
    </div>
  );
}

export function MoodTrendChart({ data }: { data: MoodPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(value: number) => SCORE_TO_EMOJI[value] ?? ""}
            tick={{ fontSize: 16 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--chart-1)"
            strokeWidth={2}
            strokeLinecap="round"
            dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
