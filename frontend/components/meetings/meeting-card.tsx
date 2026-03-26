"use client"

import Link from "next/link"
import { Users, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import type { Meeting } from "@/context/app-context"

interface MeetingCardProps {
  meeting: Meeting
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const completedTasks = meeting.tasks.filter((t) => t.status === "completed").length
  const inProgressTasks = meeting.tasks.filter((t) => t.status === "in-progress").length
  const overdueTasks = meeting.tasks.filter((t) => t.status === "overdue").length
  const totalTasks = meeting.tasks.length

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="group block border-4 border-border bg-card transition-all hover:-translate-y-1"
      style={{ boxShadow: "var(--brutal-shadow)" }}
    >
      {/* Header */}
      <div className="border-b-4 border-border bg-secondary p-4">
        <h3 className="text-lg font-black text-secondary-foreground line-clamp-1">
          {meeting.title}
        </h3>
        <p className="mt-1 text-sm font-medium text-secondary-foreground/70">
          Created {meeting.createdAt}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Participants */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center border-2 border-border bg-muted"
            style={{ boxShadow: "var(--brutal-shadow-sm)" }}
          >
            <Users className="h-4 w-4" />
          </div>
          <span className="font-bold">
            {meeting.participants.length} participant
            {meeting.participants.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Task Stats */}
        {totalTasks > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {completedTasks > 0 && (
              <div className="flex items-center gap-1 border-2 border-border bg-[#a3e635] px-2 py-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-bold">{completedTasks}</span>
              </div>
            )}
            {inProgressTasks > 0 && (
              <div className="flex items-center gap-1 border-2 border-border bg-accent px-2 py-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-bold">{inProgressTasks}</span>
              </div>
            )}
            {overdueTasks > 0 && (
              <div className="flex items-center gap-1 border-2 border-border bg-destructive px-2 py-1 text-white">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-bold">{overdueTasks}</span>
              </div>
            )}
          </div>
        )}

        {totalTasks === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No tasks yet</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-4 border-border bg-muted p-3 text-center font-bold transition-colors group-hover:bg-secondary">
        View Details
      </div>
    </Link>
  )
}
