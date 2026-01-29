import { createFileRoute } from '@tanstack/react-router'
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { TaskBoard } from "@/components/dashboard/task-board"
import { NotesView } from "@/components/dashboard/notes-view"
import { FocusTimer } from "@/components/dashboard/focus-timer"
import { AnalyticsView } from "@/components/dashboard/analytics-view"
import { TeamView } from "@/components/dashboard/team-view"
import { useStore } from "@/lib/productivity-store"

export const Route = createFileRoute('/productivity')({
    component: ProductivityPage,
})

function ProductivityPage() {
    const activeView = useStore((s) => s.activeView)

    const renderView = () => {
        switch (activeView) {
            case "dashboard":
                return <DashboardOverview />
            case "tasks":
                return <TaskBoard />
            case "notes":
                return <NotesView />
            case "timer":
                return <FocusTimer />
            case "analytics":
                return <AnalyticsView />
            case "team":
                return <TeamView />
            default:
                return <DashboardOverview />
        }
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-auto">{renderView()}</main>
            </div>
        </div>
    )
}
