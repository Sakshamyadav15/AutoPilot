"use client"

import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { useApp } from "@/context/app-context"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { CreateMeetingModal } from "@/components/meetings/create-meeting-modal"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { CalendarDays } from "lucide-react"

export default function MeetingsPage() {
  const { meetings } = useApp()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Your Meetings</h2>
            <p className="text-muted-foreground font-medium">
              {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <CreateMeetingModal />
        </div>

        {/* Meetings Grid */}
        {meetings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        ) : (
          <Empty
            className="border-4 border-border bg-card py-16"
            style={{ boxShadow: "var(--brutal-shadow)" }}
          >
            <EmptyHeader>
              <EmptyMedia>
                <CalendarDays className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle>No meetings yet</EmptyTitle>
              <EmptyDescription>Create your first meeting to get started</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateMeetingModal />
            </EmptyContent>
          </Empty>
        )}
      </div>
    </DashboardLayout>
  )
}
