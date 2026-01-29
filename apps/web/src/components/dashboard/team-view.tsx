"use client"

import React from "react"

import { useState } from "react"
import { useStore, type TeamMember } from "@/lib/productivity-store"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  UserPlus,
  Settings,
  MessageSquare,
  Video,
  Users,
  Activity,
} from "lucide-react"

export function TeamView() {
  const teamMembers = useStore((s) => s.teamMembers)
  const projects = useStore((s) => s.projects)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineCount = teamMembers.filter((m) => m.status === "online").length
  const awayCount = teamMembers.filter((m) => m.status === "away").length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
          <p className="text-muted-foreground">
            Manage your team and collaborations
          </p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <InviteForm onSubmit={() => setIsInviteOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {teamMembers.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Activity className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{onlineCount}</p>
              <p className="text-xs text-muted-foreground">Online Now</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{awayCount}</p>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {projects.flatMap((p) => p.tasks).filter((t) => t.status === "done")
                  .length}
              </p>
              <p className="text-xs text-muted-foreground">Tasks Done This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {/* Team Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} projects={projects} />
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks Assigned</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  projects={projects}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            No members found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  )
}

function MemberCard({
  member,
  projects,
}: {
  member: TeamMember
  projects: typeof import("@/lib/productivity-store").store extends {
    getState: () => infer S
  }
    ? S extends { projects: infer P }
      ? P
      : never
    : never
}) {
  const memberProjects = projects.filter((p) =>
    p.members.some((m) => m.id === member.id)
  )
  const assignedTasks = projects
    .flatMap((p) => p.tasks)
    .filter((t) => t.assignee?.id === member.id)
  const completedTasks = assignedTasks.filter((t) => t.status === "done")

  const statusColors = {
    online: "bg-success",
    away: "bg-warning",
    offline: "bg-muted-foreground",
  }

  const roleColors = {
    admin: "bg-primary/20 text-primary",
    member: "bg-chart-2/20 text-chart-2",
    viewer: "bg-muted text-muted-foreground",
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/20 text-lg text-primary">
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card",
                  statusColors[member.status]
                )}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <Badge className={cn("mt-2", roleColors[member.role])}>
                {member.role}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Video className="mr-2 h-4 w-4" />
                Start Call
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Manage Access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-lg font-bold text-foreground">
              {assignedTasks.length}
            </p>
            <p className="text-xs text-muted-foreground">Tasks Assigned</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-lg font-bold text-foreground">
              {completedTasks.length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Active Projects
          </p>
          <div className="flex flex-wrap gap-1">
            {memberProjects.slice(0, 3).map((project) => (
              <Badge
                key={project.id}
                variant="secondary"
                className="font-normal"
              >
                <div
                  className="mr-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </Badge>
            ))}
            {memberProjects.length > 3 && (
              <Badge variant="secondary" className="font-normal">
                +{memberProjects.length - 3}
              </Badge>
            )}
            {memberProjects.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No active projects
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
            <MessageSquare className="h-3 w-3" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
            <Video className="h-3 w-3" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function MemberRow({
  member,
  projects,
}: {
  member: TeamMember
  projects: typeof import("@/lib/productivity-store").store extends {
    getState: () => infer S
  }
    ? S extends { projects: infer P }
      ? P
      : never
    : never
}) {
  const memberProjects = projects.filter((p) =>
    p.members.some((m) => m.id === member.id)
  )
  const assignedTasks = projects
    .flatMap((p) => p.tasks)
    .filter((t) => t.assignee?.id === member.id)

  const statusColors = {
    online: "bg-success",
    away: "bg-warning",
    offline: "bg-muted-foreground",
  }

  const roleColors = {
    admin: "bg-primary/20 text-primary",
    member: "bg-chart-2/20 text-chart-2",
    viewer: "bg-muted text-muted-foreground",
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/20 text-sm text-primary">
                {member.avatar}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                statusColors[member.status]
              )}
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={roleColors[member.role]}>{member.role}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className={cn("h-2 w-2 rounded-full", statusColors[member.status])}
          />
          <span className="capitalize text-muted-foreground">
            {member.status}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-foreground">{assignedTasks.length}</span>
      </TableCell>
      <TableCell>
        <div className="flex -space-x-1">
          {memberProjects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="h-6 w-6 rounded-full border-2 border-card"
              style={{ backgroundColor: project.color }}
              title={project.name}
            />
          ))}
          {memberProjects.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs">
              +{memberProjects.length - 3}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Video className="mr-2 h-4 w-4" />
              Start Call
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Manage Access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function InviteForm({ onSubmit }: { onSubmit: () => void }) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<TeamMember["role"]>("member")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send an invite
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inviteEmail">Email Address</Label>
        <Input
          id="inviteEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inviteRole">Role</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as TeamMember["role"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin - Full access
              </div>
            </SelectItem>
            <SelectItem value="member">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Member - Can edit
              </div>
            </SelectItem>
            <SelectItem value="viewer">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Viewer - Read only
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">Send Invite</Button>
      </div>
    </form>
  )
}
