"use client"

import React from "react"

import { useState } from "react"
import { useStore, store, type Task } from "@/lib/productivity-store"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  Tag,
  User,
  GripVertical,
  Filter,
  SortAsc,
} from "lucide-react"
import { Label } from "@/components/ui/label"

const statusColumns = [
  { id: "todo" as const, label: "To Do", color: "bg-muted" },
  { id: "in-progress" as const, label: "In Progress", color: "bg-chart-2" },
  { id: "review" as const, label: "Review", color: "bg-warning" },
  { id: "done" as const, label: "Done", color: "bg-success" },
]

export function TaskBoard() {
  const projects = useStore((s) => s.projects)
  const activeProjectId = useStore((s) => s.activeProjectId)
  const teamMembers = useStore((s) => s.teamMembers)
  const [selectedProject, setSelectedProject] = useState(activeProjectId || "all")
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)

  const allTasks = projects.flatMap((p) => p.tasks)
  const filteredTasks =
    selectedProject === "all"
      ? allTasks
      : allTasks.filter((t) => t.projectId === selectedProject)

  const getTasksByStatus = (status: Task["status"]) =>
    filteredTasks.filter((t) => t.status === status)

  return (
    <div className="flex h-full flex-col p-6">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <SortAsc className="h-4 w-4" />
            Sort
          </Button>
        </div>

        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <NewTaskForm
              onSubmit={() => setIsNewTaskOpen(false)}
              projects={projects}
              teamMembers={teamMembers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid flex-1 grid-cols-4 gap-4 overflow-hidden">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col overflow-hidden rounded-lg bg-secondary/30"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", column.color)} />
                <span className="text-sm font-medium text-foreground">
                  {column.label}
                </span>
                <Badge variant="secondary" className="ml-1">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-auto p-3">
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  const projects = useStore((s) => s.projects)
  const project = projects.find((p) => p.id === task.projectId)

  const priorityColors = {
    low: "border-l-muted-foreground",
    medium: "border-l-chart-3",
    high: "border-l-chart-5",
    urgent: "border-l-destructive",
  }

  const handleStatusChange = (newStatus: Task["status"]) => {
    store.updateTask(task.id, { status: newStatus })
  }

  return (
    <Card
      className={cn(
        "cursor-pointer border-l-4 bg-card transition-all hover:shadow-lg",
        priorityColors[task.priority]
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-foreground">{task.title}</p>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {task.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("todo")}>
                Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("in-progress")}>
                Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("review")}>
                Move to Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("done")}>
                Move to Done
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => store.deleteTask(task.id)}
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {task.timeLogged > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(task.timeLogged / 60)}h {task.timeLogged % 60}m
              </span>
            )}
          </div>
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/20 text-[10px] text-primary">
                {task.assignee.avatar}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Project indicator */}
        {project && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs text-muted-foreground">{project.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NewTaskForm({
  onSubmit,
  projects,
  teamMembers,
}: {
  onSubmit: () => void
  projects: typeof import("@/lib/productivity-store").store extends { getState: () => infer S } ? S extends { projects: infer P } ? P : never : never
  teamMembers: typeof import("@/lib/productivity-store").store extends { getState: () => infer S } ? S extends { teamMembers: infer T } ? T : never : never
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState(projects[0]?.id || "")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [tags, setTags] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId) return

    const newTask: Task = {
      id: `t${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status: "todo",
      priority,
      projectId,
      assignee: teamMembers.find((m) => m.id === assigneeId),
      dueDate: dueDate || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
      timeLogged: 0,
    }

    store.addTask(newTask)
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as Task["priority"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assignee">Assignee</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">
                        {m.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {m.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., frontend, urgent, bug"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">Create Task</Button>
      </div>
    </form>
  )
}
