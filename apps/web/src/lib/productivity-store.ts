"use client"

import { useSyncExternalStore, useCallback } from "react"

// Types
export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assignee?: TeamMember
  dueDate?: string
  tags: string[]
  projectId: string
  createdAt: string
  timeLogged: number // minutes
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  tasks: Task[]
  members: TeamMember[]
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  folderId: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  icon: string
  notes: Note[]
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "member" | "viewer"
  status: "online" | "away" | "offline"
}

export interface TimeEntry {
  id: string
  taskId?: string
  description: string
  startTime: string
  endTime?: string
  duration: number // minutes
}

export interface FocusSession {
  id: string
  type: "work" | "break"
  duration: number // minutes
  completedAt: string
}

export interface AppState {
  activeView: "dashboard" | "tasks" | "notes" | "timer" | "analytics" | "team"
  projects: Project[]
  folders: Folder[]
  teamMembers: TeamMember[]
  timeEntries: TimeEntry[]
  focusSessions: FocusSession[]
  currentTimer: {
    isRunning: boolean
    type: "work" | "break"
    remainingSeconds: number
    taskId?: string
  }
  activeProjectId: string | null
  activeNoteId: string | null
}

// Initial data
const initialTeamMembers: TeamMember[] = [
  { id: "1", name: "Alex Morgan", email: "alex@flowspace.io", avatar: "AM", role: "admin", status: "online" },
  { id: "2", name: "Sarah Chen", email: "sarah@flowspace.io", avatar: "SC", role: "member", status: "online" },
  { id: "3", name: "James Wilson", email: "james@flowspace.io", avatar: "JW", role: "member", status: "away" },
  { id: "4", name: "Emily Davis", email: "emily@flowspace.io", avatar: "ED", role: "member", status: "offline" },
  { id: "5", name: "Michael Brown", email: "michael@flowspace.io", avatar: "MB", role: "viewer", status: "online" },
]

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    color: "#3ECFB2",
    members: [initialTeamMembers[0], initialTeamMembers[1], initialTeamMembers[2]],
    createdAt: "2025-01-15",
    tasks: [
      { id: "t1", title: "Design homepage mockup", description: "Create high-fidelity mockup for the new homepage", status: "done", priority: "high", assignee: initialTeamMembers[1], dueDate: "2025-01-20", tags: ["design", "ui"], projectId: "1", createdAt: "2025-01-15", timeLogged: 240 },
      { id: "t2", title: "Implement navigation component", description: "Build responsive navigation with mobile menu", status: "in-progress", priority: "high", assignee: initialTeamMembers[0], dueDate: "2025-01-25", tags: ["frontend", "react"], projectId: "1", createdAt: "2025-01-16", timeLogged: 120 },
      { id: "t3", title: "Set up CI/CD pipeline", description: "Configure automated deployment workflow", status: "review", priority: "medium", assignee: initialTeamMembers[2], dueDate: "2025-01-22", tags: ["devops"], projectId: "1", createdAt: "2025-01-17", timeLogged: 90 },
      { id: "t4", title: "Write API documentation", description: "Document all REST endpoints", status: "todo", priority: "low", dueDate: "2025-01-30", tags: ["docs"], projectId: "1", createdAt: "2025-01-18", timeLogged: 0 },
      { id: "t5", title: "Performance optimization", description: "Improve page load times", status: "todo", priority: "medium", assignee: initialTeamMembers[0], dueDate: "2025-02-01", tags: ["performance"], projectId: "1", createdAt: "2025-01-19", timeLogged: 0 },
    ],
  },
  {
    id: "2",
    name: "Mobile App v2.0",
    description: "Major update for mobile application",
    color: "#6366F1",
    members: [initialTeamMembers[0], initialTeamMembers[3]],
    createdAt: "2025-01-10",
    tasks: [
      { id: "t6", title: "User authentication flow", description: "Implement OAuth and biometric login", status: "in-progress", priority: "urgent", assignee: initialTeamMembers[0], dueDate: "2025-01-23", tags: ["auth", "security"], projectId: "2", createdAt: "2025-01-10", timeLogged: 180 },
      { id: "t7", title: "Push notifications", description: "Set up Firebase Cloud Messaging", status: "todo", priority: "high", assignee: initialTeamMembers[3], dueDate: "2025-01-28", tags: ["mobile", "firebase"], projectId: "2", createdAt: "2025-01-11", timeLogged: 0 },
      { id: "t8", title: "Offline mode support", description: "Enable app functionality without internet", status: "todo", priority: "medium", dueDate: "2025-02-05", tags: ["mobile", "offline"], projectId: "2", createdAt: "2025-01-12", timeLogged: 0 },
    ],
  },
  {
    id: "3",
    name: "Q1 Marketing Campaign",
    description: "First quarter marketing initiatives",
    color: "#F59E0B",
    members: [initialTeamMembers[1], initialTeamMembers[4]],
    createdAt: "2025-01-08",
    tasks: [
      { id: "t9", title: "Social media calendar", description: "Plan content for Jan-Mar", status: "done", priority: "high", assignee: initialTeamMembers[1], dueDate: "2025-01-15", tags: ["marketing", "social"], projectId: "3", createdAt: "2025-01-08", timeLogged: 120 },
      { id: "t10", title: "Email newsletter template", description: "Design new email template", status: "in-progress", priority: "medium", assignee: initialTeamMembers[4], dueDate: "2025-01-26", tags: ["marketing", "email"], projectId: "3", createdAt: "2025-01-09", timeLogged: 60 },
    ],
  },
]

const initialFolders: Folder[] = [
  {
    id: "f1",
    name: "Meeting Notes",
    icon: "calendar",
    notes: [
      { id: "n1", title: "Weekly Standup - Jan 20", content: "## Attendees\n- Alex, Sarah, James\n\n## Discussion Points\n- Sprint progress review\n- Blockers identified\n- Next week priorities", folderId: "f1", tags: ["meeting", "weekly"], createdAt: "2025-01-20", updatedAt: "2025-01-20" },
      { id: "n2", title: "Product Roadmap Review", content: "## Q1 Goals\n1. Launch v2.0\n2. Improve user onboarding\n3. Expand to EU market", folderId: "f1", tags: ["meeting", "roadmap"], createdAt: "2025-01-18", updatedAt: "2025-01-19" },
    ],
  },
  {
    id: "f2",
    name: "Project Ideas",
    icon: "lightbulb",
    notes: [
      { id: "n3", title: "AI Integration Concepts", content: "## Potential AI Features\n- Smart task prioritization\n- Automated time tracking\n- Intelligent search", folderId: "f2", tags: ["ideas", "ai"], createdAt: "2025-01-15", updatedAt: "2025-01-17" },
    ],
  },
  {
    id: "f3",
    name: "Documentation",
    icon: "file-text",
    notes: [
      { id: "n4", title: "API Guidelines", content: "## REST API Standards\n- Use proper HTTP methods\n- Implement pagination\n- Version all endpoints", folderId: "f3", tags: ["docs", "api"], createdAt: "2025-01-10", updatedAt: "2025-01-12" },
    ],
  },
]

const initialTimeEntries: TimeEntry[] = [
  { id: "te1", taskId: "t1", description: "Homepage design work", startTime: "2025-01-20T09:00:00", endTime: "2025-01-20T13:00:00", duration: 240 },
  { id: "te2", taskId: "t2", description: "Navigation implementation", startTime: "2025-01-20T14:00:00", endTime: "2025-01-20T16:00:00", duration: 120 },
  { id: "te3", taskId: "t6", description: "Auth flow development", startTime: "2025-01-21T10:00:00", endTime: "2025-01-21T13:00:00", duration: 180 },
  { id: "te4", description: "Code review", startTime: "2025-01-21T14:00:00", endTime: "2025-01-21T15:30:00", duration: 90 },
  { id: "te5", taskId: "t9", description: "Social content planning", startTime: "2025-01-19T09:00:00", endTime: "2025-01-19T11:00:00", duration: 120 },
]

const initialFocusSessions: FocusSession[] = [
  { id: "fs1", type: "work", duration: 25, completedAt: "2025-01-20T09:30:00" },
  { id: "fs2", type: "break", duration: 5, completedAt: "2025-01-20T09:35:00" },
  { id: "fs3", type: "work", duration: 25, completedAt: "2025-01-20T10:05:00" },
  { id: "fs4", type: "work", duration: 25, completedAt: "2025-01-20T11:00:00" },
  { id: "fs5", type: "work", duration: 25, completedAt: "2025-01-20T14:30:00" },
  { id: "fs6", type: "work", duration: 25, completedAt: "2025-01-21T09:30:00" },
  { id: "fs7", type: "work", duration: 25, completedAt: "2025-01-21T10:30:00" },
  { id: "fs8", type: "work", duration: 25, completedAt: "2025-01-21T11:30:00" },
]

const initialState: AppState = {
  activeView: "dashboard",
  projects: initialProjects,
  folders: initialFolders,
  teamMembers: initialTeamMembers,
  timeEntries: initialTimeEntries,
  focusSessions: initialFocusSessions,
  currentTimer: {
    isRunning: false,
    type: "work",
    remainingSeconds: 25 * 60,
    taskId: undefined,
  },
  activeProjectId: "1",
  activeNoteId: null,
}

// Store implementation
let state = initialState
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export const store = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setActiveView: (view: AppState["activeView"]) => {
    state = { ...state, activeView: view }
    emitChange()
  },
  setActiveProject: (projectId: string | null) => {
    state = { ...state, activeProjectId: projectId }
    emitChange()
  },
  setActiveNote: (noteId: string | null) => {
    state = { ...state, activeNoteId: noteId }
    emitChange()
  },
  addTask: (task: Task) => {
    const project = state.projects.find(p => p.id === task.projectId)
    if (project) {
      const updatedProjects = state.projects.map(p =>
        p.id === task.projectId ? { ...p, tasks: [...p.tasks, task] } : p
      )
      state = { ...state, projects: updatedProjects }
      emitChange()
    }
  },
  updateTask: (taskId: string, updates: Partial<Task>) => {
    const updatedProjects = state.projects.map(p => ({
      ...p,
      tasks: p.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)),
    }))
    state = { ...state, projects: updatedProjects }
    emitChange()
  },
  deleteTask: (taskId: string) => {
    const updatedProjects = state.projects.map(p => ({
      ...p,
      tasks: p.tasks.filter(t => t.id !== taskId),
    }))
    state = { ...state, projects: updatedProjects }
    emitChange()
  },
  addNote: (note: Note) => {
    const folder = state.folders.find(f => f.id === note.folderId)
    if (folder) {
      const updatedFolders = state.folders.map(f =>
        f.id === note.folderId ? { ...f, notes: [...f.notes, note] } : f
      )
      state = { ...state, folders: updatedFolders }
      emitChange()
    }
  },
  updateNote: (noteId: string, updates: Partial<Note>) => {
    const updatedFolders = state.folders.map(f => ({
      ...f,
      notes: f.notes.map(n => (n.id === noteId ? { ...n, ...updates } : n)),
    }))
    state = { ...state, folders: updatedFolders }
    emitChange()
  },
  startTimer: (type: "work" | "break", taskId?: string) => {
    const duration = type === "work" ? 25 * 60 : 5 * 60
    state = {
      ...state,
      currentTimer: { isRunning: true, type, remainingSeconds: duration, taskId },
    }
    emitChange()
  },
  stopTimer: () => {
    state = { ...state, currentTimer: { ...state.currentTimer, isRunning: false } }
    emitChange()
  },
  tickTimer: () => {
    if (state.currentTimer.isRunning && state.currentTimer.remainingSeconds > 0) {
      state = {
        ...state,
        currentTimer: {
          ...state.currentTimer,
          remainingSeconds: state.currentTimer.remainingSeconds - 1,
        },
      }
      emitChange()
    }
  },
  completeFocusSession: () => {
    const session: FocusSession = {
      id: `fs${Date.now()}`,
      type: state.currentTimer.type,
      duration: state.currentTimer.type === "work" ? 25 : 5,
      completedAt: new Date().toISOString(),
    }
    state = {
      ...state,
      focusSessions: [...state.focusSessions, session],
      currentTimer: { isRunning: false, type: "work", remainingSeconds: 25 * 60 },
    }
    emitChange()
  },
  addTimeEntry: (entry: TimeEntry) => {
    state = { ...state, timeEntries: [...state.timeEntries, entry] }
    emitChange()
  },
}

// Custom hook
export function useStore<T>(selector: (state: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [selector]),
    useCallback(() => selector(store.getState()), [selector])
  )
}
