import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TeamPerformanceChartProps {
  data: Array<{
    name: string;
    completed: number;
    timeLogged: number;
    total: number;
  }>;
  chartConfig: Record<string, { label: string; color: string }>;
}

export function TeamPerformanceChart({ data, chartConfig }: TeamPerformanceChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="var(--muted-foreground)"
            fontSize={12}
            width={60}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="completed"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
