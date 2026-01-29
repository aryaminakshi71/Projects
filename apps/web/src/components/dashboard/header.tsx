"use client"

import { useStore } from "@/lib/productivity-store"
import { Bell, Calendar, MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back, Alex" },
  tasks: { title: "Tasks", subtitle: "Manage your project tasks" },
  notes: { title: "Notes", subtitle: "Your knowledge base" },
  timer: { title: "Focus Timer", subtitle: "Stay productive with Pomodoro" },
  analytics: { title: "Analytics", subtitle: "Insights and reports" },
  team: { title: "Team", subtitle: "Manage your team members" },
}

export function DashboardHeader() {
  const activeView = useStore((s) => s.activeView)
  const teamMembers = useStore((s) => s.teamMembers)
  const { title, subtitle } = viewTitles[activeView]

  const onlineMembers = teamMembers.filter((m) => m.status === "online")

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Online Team Members */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {onlineMembers.slice(0, 4).map((member) => (
              <Avatar
                key={member.id}
                className="h-8 w-8 border-2 border-card"
              >
                <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
            ))}
            {onlineMembers.length > 4 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs text-secondary-foreground">
                +{onlineMembers.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">
              {onlineMembers.length} online
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Calendar className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              5
            </span>
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>
    </header>
  )
}
