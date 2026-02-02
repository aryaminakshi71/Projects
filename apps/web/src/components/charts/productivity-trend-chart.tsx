import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ProductivityTrendChartProps {
  data: Array<{
    day: string;
    tasks: number;
    hours: number;
  }>;
  chartConfig: Record<string, { label: string; color: string }>;
}

export function ProductivityTrendChart({ data, chartConfig }: ProductivityTrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--chart-1)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--chart-1)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--chart-2)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--chart-2)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="tasks"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTasks)"
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHours)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
