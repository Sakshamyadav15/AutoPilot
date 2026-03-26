"use client"

import { CheckCircle, Clock, AlertTriangle, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/context/app-context"

interface TaskCardProps {
  task: Task
  showAssignee?: boolean
  showOwner?: boolean
  onMarkComplete?: () => void
  canComplete?: boolean
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-muted text-muted-foreground",
    icon: Clock,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-accent text-accent-foreground",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-[#a3e635] text-black",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue",
    color: "bg-destructive text-white",
    icon: AlertTriangle,
  },
}

export function TaskCard({
  task,
  showAssignee = true,
  showOwner = false,
  onMarkComplete,
  canComplete = false,
}: TaskCardProps) {
  const status = statusConfig[task.status]
  const StatusIcon = status.icon

  return (
    <div
      className="border-4 border-border bg-card"
      style={{ boxShadow: "var(--brutal-shadow)" }}
    >
      {/* Header with status */}
      <div className={`flex items-center justify-between border-b-4 border-border p-3 ${status.color}`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-bold">{status.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold">{task.title}</h4>

        <div className="mt-3 space-y-2">
          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Deadline: {task.deadline}</span>
          </div>

          {/* Assignee */}
          {showAssignee && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Assigned to: {task.assigneeName}</span>
            </div>
          )}

          {/* Owner */}
          {showOwner && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Assigned by: {task.ownerName}</span>
            </div>
          )}
        </div>

        {/* Mark Complete Button */}
        {canComplete && task.status !== "completed" && (
          <Button
            onClick={onMarkComplete}
            className="mt-4 w-full border-2 border-border bg-[#a3e635] font-bold text-black transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#84cc16]"
            style={{ boxShadow: "var(--brutal-shadow-sm)" }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  )
}
