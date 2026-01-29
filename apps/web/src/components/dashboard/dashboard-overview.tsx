"use client"

import { useStore, type Task } from "@/lib/productivity-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const productivityData = [
  { day: "Mon", hours: 6.5, tasks: 8 },
  { day: "Tue", hours: 7.2, tasks: 12 },
  { day: "Wed", hours: 5.8, tasks: 7 },
  { day: "Thu", hours: 8.1, tasks: 15 },
  { day: "Fri", hours: 6.9, tasks: 10 },
  { day: "Sat", hours: 3.2, tasks: 4 },
  { day: "Sun", hours: 2.1, tasks: 2 },
]

const chartConfig = {
  hours: { label: "Hours", color: "var(--chart-1)" },
  tasks: { label: "Tasks", color: "var(--chart-2)" },
}

export function DashboardOverview() {
  const projects = useStore((s) => s.projects)
  const focusSessions = useStore((s) => s.focusSessions)
  const timeEntries = useStore((s) => s.timeEntries)

  const allTasks = projects.flatMap((p) => p.tasks)
  const completedTasks = allTasks.filter((t) => t.status === "done")
  const inProgressTasks = allTasks.filter((t) => t.status === "in-progress")
  const overdueTasks = allTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  )

  const totalTimeLogged = timeEntries.reduce((acc, e) => acc + e.duration, 0)
  const totalFocusTime = focusSessions
    .filter((s) => s.type === "work")
    .reduce((acc, s) => acc + s.duration, 0)

  const completionRate = Math.round(
    (completedTasks.length / allTasks.length) * 100
  )

  const upcomingTasks = allTasks
    .filter((t) => t.dueDate && t.status !== "done")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {completedTasks.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-success" />
              <span className="text-success">12%</span>
              <span className="text-muted-foreground">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {inProgressTasks.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                <Clock className="h-6 w-6 text-chart-2" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-success" />
              <span className="text-success">8%</span>
              <span className="text-muted-foreground">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hours Logged</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {Math.round(totalTimeLogged / 60)}h
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <ArrowDownRight className="h-4 w-4 text-destructive" />
              <span className="text-destructive">3%</span>
              <span className="text-muted-foreground">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Focus Sessions</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {focusSessions.filter((s) => s.type === "work").length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/10">
                <Target className="h-6 w-6 text-chart-4" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-success" />
              <span className="text-success">24%</span>
              <span className="text-muted-foreground">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Productivity Chart */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Weekly Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
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
                  </defs>
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((project) => {
              const projectCompleted = project.tasks.filter(
                (t) => t.status === "done"
              ).length
              const projectTotal = project.tasks.length
              const progress = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0

              return (
                <div key={project.id} className="space-y-2">
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
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {projectCompleted} of {projectTotal} tasks completed
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Tasks */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Upcoming Deadlines</CardTitle>
            <Badge variant="secondary">{upcomingTasks.length} tasks</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No upcoming deadlines
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Needs Attention</CardTitle>
            {overdueTasks.length > 0 && (
              <Badge variant="destructive">{overdueTasks.length} overdue</Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueTasks.length > 0 ? (
                overdueTasks.slice(0, 5).map((task) => (
                  <TaskItem key={task.id} task={task} isOverdue />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-success" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TaskItem({ task, isOverdue }: { task: Task; isOverdue?: boolean }) {
  const project = useStore((s) =>
    s.projects.find((p) => p.id === task.projectId)
  )

  const priorityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-chart-3/20 text-chart-3",
    high: "bg-chart-5/20 text-chart-5",
    urgent: "bg-destructive/20 text-destructive",
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/50 p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{task.title}</span>
          <Badge className={priorityColors[task.priority]} variant="secondary">
            {task.priority}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {project && (
            <span className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              {isOverdue ? (
                <AlertCircle className="h-3 w-3 text-destructive" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
      {task.assignee && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-xs text-primary">
            {task.assignee.avatar}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
