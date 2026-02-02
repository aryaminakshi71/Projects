import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FocusTimeChartProps {
  data: Array<{
    day: string;
    focus: number;
  }>;
  chartConfig: Record<string, { label: string; color: string }>;
}

export function FocusTimeChart({ data, chartConfig }: FocusTimeChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="day"
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="focus"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dot={{ fill: "var(--chart-3)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
