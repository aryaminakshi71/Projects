"use client"

import React, { lazy, Suspense } from "react"

import { useStore } from "@/lib/productivity-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ComponentLoadingSkeleton } from "@/components/lazy-loading"

// Lazy load chart components
const ProductivityTrendChart = lazy(() => import("@/components/charts/productivity-trend-chart").then(m => ({ default: m.ProductivityTrendChart })));
const TaskDistributionChart = lazy(() => import("@/components/charts/task-distribution-chart").then(m => ({ default: m.TaskDistributionChart })));
const TeamPerformanceChart = lazy(() => import("@/components/charts/team-performance-chart").then(m => ({ default: m.TeamPerformanceChart })));
const FocusTimeChart = lazy(() => import("@/components/charts/focus-time-chart").then(m => ({ default: m.FocusTimeChart })));
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Target,
  Users,
  Calendar,
  ArrowUpRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

const chartConfig = {
  hours: { label: "Hours", color: "var(--chart-1)" },
  tasks: { label: "Tasks", color: "var(--chart-2)" },
  focus: { label: "Focus", color: "var(--chart-3)" },
  completed: { label: "Completed", color: "var(--chart-1)" },
  inProgress: { label: "In Progress", color: "var(--chart-2)" },
  todo: { label: "To Do", color: "var(--chart-4)" },
}

export function AnalyticsView() {
  const projects = useStore((s) => s.projects)
  const timeEntries = useStore((s) => s.timeEntries)
  const focusSessions = useStore((s) => s.focusSessions)
  const teamMembers = useStore((s) => s.teamMembers)
  const [dateRange, setDateRange] = useState("7d")

  const allTasks = projects.flatMap((p) => p.tasks)
  const completedTasks = allTasks.filter((t) => t.status === "done")
  const inProgressTasks = allTasks.filter((t) => t.status === "in-progress")
  const todoTasks = allTasks.filter((t) => t.status === "todo")

  const totalTimeLogged = timeEntries.reduce((acc, e) => acc + e.duration, 0)
  const totalFocusTime = focusSessions
    .filter((s) => s.type === "work")
    .reduce((acc, s) => acc + s.duration, 0)

  // Generate weekly data
  const weeklyData = generateWeeklyData(timeEntries, focusSessions, allTasks)

  // Task status distribution
  const statusData = [
    { name: "Completed", value: completedTasks.length, color: "var(--chart-1)" },
    { name: "In Progress", value: inProgressTasks.length, color: "var(--chart-2)" },
    { name: "To Do", value: todoTasks.length, color: "var(--chart-4)" },
  ]

  // Team productivity data
  const teamProductivity = teamMembers.map((member) => {
    const memberTasks = allTasks.filter((t) => t.assignee?.id === member.id)
    const completed = memberTasks.filter((t) => t.status === "done").length
    const timeLogged = memberTasks.reduce((acc, t) => acc + t.timeLogged, 0)
    return {
      name: member.name.split(" ")[0],
      avatar: member.avatar,
      completed,
      timeLogged: Math.round(timeLogged / 60),
      total: memberTasks.length,
    }
  })

  // Project progress data
  const projectProgress = projects.map((p) => {
    const completed = p.tasks.filter((t) => t.status === "done").length
    const total = p.tasks.length
    return {
      name: p.name,
      color: p.color,
      completed,
      total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">
            Track your team's productivity and performance
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={allTasks.length}
          change={12}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard
          title="Completion Rate"
          value={`${Math.round((completedTasks.length / allTasks.length) * 100)}%`}
          change={8}
          icon={<Target className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard
          title="Hours Logged"
          value={`${Math.round(totalTimeLogged / 60)}h`}
          change={-3}
          icon={<Clock className="h-5 w-5" />}
          trend="down"
        />
        <MetricCard
          title="Focus Sessions"
          value={focusSessions.filter((s) => s.type === "work").length}
          change={24}
          icon={<Target className="h-5 w-5" />}
          trend="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Productivity Trend */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ComponentLoadingSkeleton />}>
              <ProductivityTrendChart data={weeklyData} chartConfig={chartConfig} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ComponentLoadingSkeleton />}>
              <TaskDistributionChart data={statusData} chartConfig={chartConfig} />
            </Suspense>
            <div className="mt-4 space-y-2">
              {statusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Performance */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ComponentLoadingSkeleton />}>
              <TeamPerformanceChart data={teamProductivity} chartConfig={chartConfig} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projectProgress.map((project) => (
              <div key={project.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {project.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {project.completed} of {project.total} tasks
                  </span>
                  <span>
                    {project.total - project.completed} remaining
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Focus Time Analysis */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Focus Time Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Focus Stats */}
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Total Focus Time</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Avg Daily Focus</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(totalFocusTime / 7)}m
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-sm text-muted-foreground">Sessions/Day</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    focusSessions.filter((s) => s.type === "work").length / 7
                  )}
                </p>
              </div>
            </div>

            {/* Focus Chart */}
            <div className="lg:col-span-3">
              <Suspense fallback={<ComponentLoadingSkeleton />}>
                <FocusTimeChart data={weeklyData} chartConfig={chartConfig} />
              </Suspense>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  trend: "up" | "down"
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm">
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={trend === "up" ? "text-success" : "text-destructive"}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">from last period</span>
        </div>
      </CardContent>
    </Card>
  )
}

function generateWeeklyData(
  timeEntries: { duration: number; startTime: string }[],
  focusSessions: { type: string; completedAt: string; duration: number }[],
  tasks: { createdAt: string; status: string }[]
) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return days.map((day, index) => {
    // Simulated data based on the index
    const baseTasks = Math.floor(Math.random() * 8) + 4
    const baseHours = Math.random() * 4 + 3
    const baseFocus = Math.floor(Math.random() * 120) + 60

    return {
      day,
      tasks: baseTasks,
      hours: parseFloat(baseHours.toFixed(1)),
      focus: baseFocus,
    }
  })
}
