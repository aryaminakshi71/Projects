export type Priority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "member" | "viewer"
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assignee?: User
  dueDate?: string
  tags: string[]
  projectId: string
  createdAt: string
  updatedAt: string
  timeSpent: number // in minutes
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  members: User[]
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  projectId?: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  taskId?: string
  projectId: string
  description: string
  startTime: string
  endTime?: string
  duration: number // in minutes
}

export interface FocusSession {
  id: string
  type: "work" | "break"
  duration: number // in minutes
  completedAt: string
}
