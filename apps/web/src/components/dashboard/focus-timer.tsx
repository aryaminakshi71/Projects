"use client"

import { useEffect, useState, useCallback } from "react"
import { useStore, store, type Task } from "@/lib/productivity-store"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Calendar,
} from "lucide-react"

export function FocusTimer() {
  const currentTimer = useStore((s) => s.currentTimer)
  const focusSessions = useStore((s) => s.focusSessions)
  const projects = useStore((s) => s.projects)
  const timeEntries = useStore((s) => s.timeEntries)
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")

  const allTasks = projects.flatMap((p) =>
    p.tasks.filter((t) => t.status !== "done")
  )

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (currentTimer.isRunning && currentTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        store.tickTimer()
      }, 1000)
    } else if (currentTimer.isRunning && currentTimer.remainingSeconds === 0) {
      // Timer completed
      store.completeFocusSession()
      // Play notification sound (browser API)
      if (typeof window !== "undefined" && "Notification" in window) {
        new Notification("Focus session completed!", {
          body: currentTimer.type === "work" ? "Time for a break!" : "Ready to focus again?",
        })
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentTimer.isRunning, currentTimer.remainingSeconds, currentTimer.type])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const totalDuration = currentTimer.type === "work" ? 25 * 60 : 5 * 60
  const progress =
    ((totalDuration - currentTimer.remainingSeconds) / totalDuration) * 100

  const todaysSessions = focusSessions.filter((s) => {
    const today = new Date().toDateString()
    return new Date(s.completedAt).toDateString() === today && s.type === "work"
  })

  const todaysFocusMinutes = todaysSessions.reduce((acc, s) => acc + s.duration, 0)
  const weeklyFocusMinutes = focusSessions
    .filter((s) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(s.completedAt) > weekAgo && s.type === "work"
    })
    .reduce((acc, s) => acc + s.duration, 0)

  const streak = calculateStreak(focusSessions)

  return (
    <div className="p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Timer */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-8">
            <div className="flex flex-col items-center">
              {/* Timer Type Toggle */}
              <div className="mb-8 flex rounded-lg bg-secondary p-1">
                <button
                  onClick={() => {
                    if (!currentTimer.isRunning) {
                      store.startTimer("work", selectedTaskId || undefined)
                      store.stopTimer()
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    currentTimer.type === "work"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Target className="h-4 w-4" />
                  Focus
                </button>
                <button
                  onClick={() => {
                    if (!currentTimer.isRunning) {
                      store.startTimer("break")
                      store.stopTimer()
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    currentTimer.type === "break"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Coffee className="h-4 w-4" />
                  Break
                </button>
              </div>

              {/* Timer Display */}
              <div className="relative mb-8">
                <div className="relative flex h-64 w-64 items-center justify-center">
                  {/* Progress Ring */}
                  <svg
                    className="absolute h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="var(--secondary)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={
                        currentTimer.type === "work"
                          ? "var(--primary)"
                          : "var(--chart-3)"
                      }
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-6xl font-bold tabular-nums text-foreground">
                      {formatTime(currentTimer.remainingSeconds)}
                    </span>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {currentTimer.type === "work"
                        ? "Focus Time"
                        : "Break Time"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Task Selection */}
              {currentTimer.type === "work" && (
                <div className="mb-6 w-full max-w-sm">
                  <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link to a task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: projects.find(
                                  (p) => p.id === task.projectId
                                )?.color,
                              }}
                            />
                            {task.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    store.startTimer(currentTimer.type, selectedTaskId || undefined)
                    store.stopTimer()
                  }}
                  disabled={currentTimer.isRunning}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full"
                  onClick={() => {
                    if (currentTimer.isRunning) {
                      store.stopTimer()
                    } else {
                      store.startTimer(
                        currentTimer.type,
                        selectedTaskId || undefined
                      )
                    }
                  }}
                >
                  {currentTimer.isRunning ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="ml-1 h-6 w-6" />
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => store.completeFocusSession()}
                  disabled={!currentTimer.isRunning}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          {/* Today's Stats */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {todaysSessions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sessions completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
                    <Clock className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.floor(todaysFocusMinutes / 60)}h{" "}
                      {todaysFocusMinutes % 60}m
                    </p>
                    <p className="text-xs text-muted-foreground">Focus time</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-5/10">
                    <Flame className="h-5 w-5 text-chart-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {streak} day{streak !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current streak
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Overview */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.floor(weeklyFocusMinutes / 60)}h{" "}
                    {weeklyFocusMinutes % 60}m
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total focus time
                  </p>
                </div>
              </div>

              {/* Daily progress bar */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Daily Goal</span>
                  <span className="text-foreground">
                    {Math.round((todaysFocusMinutes / 120) * 100)}%
                  </span>
                </div>
                <Progress
                  value={Math.min((todaysFocusMinutes / 120) * 100, 100)}
                  className="h-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Goal: 2 hours daily
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {focusSessions
                  .filter((s) => s.type === "work")
                  .slice(-5)
                  .reverse()
                  .map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">
                          {session.duration} min session
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatSessionTime(session.completedAt)}
                      </span>
                    </div>
                  ))}
                {focusSessions.filter((s) => s.type === "work").length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No sessions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function calculateStreak(
  sessions: { type: string; completedAt: string }[]
): number {
  const workSessions = sessions.filter((s) => s.type === "work")
  if (workSessions.length === 0) return 0

  const uniqueDays = new Set(
    workSessions.map((s) => new Date(s.completedAt).toDateString())
  )
  const sortedDays = Array.from(uniqueDays).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (sortedDays[i] === expectedDate.toDateString()) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function formatSessionTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}
