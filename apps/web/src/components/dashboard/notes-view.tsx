"use client"

import React from "react"

import { useState } from "react"
import { useStore, store, type Note, type Folder } from "@/lib/productivity-store"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Folder as FolderIcon,
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Tag,
  Edit3,
  Trash2,
  ChevronRight,
  Hash,
  Lightbulb,
} from "lucide-react"
import { Label } from "@/components/ui/label"
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

const folderIcons: Record<string, React.ReactNode> = {
  calendar: <Calendar className="h-4 w-4" />,
  lightbulb: <Lightbulb className="h-4 w-4" />,
  "file-text": <FileText className="h-4 w-4" />,
}

export function NotesView() {
  const folders = useStore((s) => s.folders)
  const activeNoteId = useStore((s) => s.activeNoteId)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    folders[0]?.id || null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false)

  const allNotes = folders.flatMap((f) => f.notes)
  const selectedFolder = folders.find((f) => f.id === selectedFolderId)
  const activeNote = allNotes.find((n) => n.id === activeNoteId)

  const filteredNotes = selectedFolderId
    ? selectedFolder?.notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : allNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )

  return (
    <div className="flex h-full">
      {/* Folders Sidebar */}
      <div className="w-56 border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-medium text-foreground">Folders</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100%-49px)]">
          <div className="p-2">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                selectedFolderId === null
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>All Notes</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {allNotes.length}
              </Badge>
            </button>

            <div className="mt-4">
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Folders
              </span>
              <div className="mt-2 space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      selectedFolderId === folder.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {folderIcons[folder.icon] || (
                      <FolderIcon className="h-4 w-4" />
                    )}
                    <span className="flex-1 text-left">{folder.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {folder.notes.length}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Notes List */}
      <div className="w-72 border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              {selectedFolder?.name || "All Notes"}
            </h2>
            <Dialog open={isNewNoteOpen} onOpenChange={setIsNewNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <Plus className="h-3 w-3" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <NewNoteForm
                  folders={folders}
                  defaultFolderId={selectedFolderId || folders[0]?.id}
                  onSubmit={() => setIsNewNoteOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="h-9 pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-97px)]">
          <div className="space-y-2 p-3">
            {filteredNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onClick={() => store.setActiveNote(note.id)}
              />
            ))}
            {filteredNotes.length === 0 && (
              <div className="py-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No notes found
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Note Editor */}
      <div className="flex-1 bg-background">
        {activeNote ? (
          <NoteEditor note={activeNote} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Select a note to view
            </p>
            <p className="text-sm text-muted-foreground">
              Or create a new one to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function NoteListItem({
  note,
  isActive,
  onClick,
}: {
  note: Note
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-all",
        isActive
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <h3 className="font-medium text-foreground line-clamp-1">{note.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {note.content.slice(0, 100)}...
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {new Date(note.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        {note.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs font-normal">
            {tag}
          </Badge>
        ))}
      </div>
    </button>
  )
}

function NoteEditor({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    store.updateNote(note.id, {
      title,
      content,
      updatedAt: new Date().toISOString(),
    })
    setIsEditing(false)
  }

  // Sync state when note changes
  if (note.id && title !== note.title && !isEditing) {
    setTitle(note.title)
    setContent(note.content)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-auto border-0 p-0 text-xl font-semibold focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-border px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Updated {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 font-normal">
              <Hash className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] resize-none border-0 p-0 text-foreground focus-visible:ring-0"
            placeholder="Write your note..."
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            {content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="mb-4 mt-6 text-lg font-semibold text-foreground"
                  >
                    {line.slice(3)}
                  </h2>
                )
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-4 text-muted-foreground">
                    {line.slice(2)}
                  </li>
                )
              }
              if (line.match(/^\d+\./)) {
                return (
                  <li key={i} className="ml-4 list-decimal text-muted-foreground">
                    {line.slice(line.indexOf(".") + 2)}
                  </li>
                )
              }
              if (line.trim() === "") {
                return <br key={i} />
              }
              return (
                <p key={i} className="text-muted-foreground">
                  {line}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function NewNoteForm({
  folders,
  defaultFolderId,
  onSubmit,
}: {
  folders: Folder[]
  defaultFolderId: string
  onSubmit: () => void
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [folderId, setFolderId] = useState(defaultFolderId)
  const [tags, setTags] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !folderId) return

    const newNote: Note = {
      id: `n${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      folderId,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    store.addNote(newNote)
    store.setActiveNote(newNote.id)
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="noteTitle">Title</Label>
        <Input
          id="noteTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="noteFolder">Folder</Label>
        <Select value={folderId} onValueChange={setFolderId}>
          <SelectTrigger>
            <SelectValue placeholder="Select folder" />
          </SelectTrigger>
          <SelectContent>
            {folders.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="noteContent">Content</Label>
        <Textarea
          id="noteContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="noteTags">Tags (comma-separated)</Label>
        <Input
          id="noteTags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., meeting, ideas, important"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">Create Note</Button>
      </div>
    </form>
  )
}
