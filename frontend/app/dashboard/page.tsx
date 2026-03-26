"use client"

import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { CalendarDays, CheckCircle, Clock, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { meetings, notifications } = useApp()
  const { user } = useAuth()

  // Calculate stats
  const totalMeetings = meetings.length
  const totalTasks = meetings.reduce((acc, m) => acc + m.tasks.length, 0)
  const completedTasks = meetings.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.status === "completed").length,
    0
  )
  const overdueTasks = meetings.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.status === "overdue").length,
    0
  )
  const unreadNotifications = notifications.filter((n) => !n.read).length

  const stats = [
    {
      label: "Total Meetings",
      value: totalMeetings,
      icon: CalendarDays,
      color: "bg-secondary",
    },
    {
      label: "Tasks Completed",
      value: `${completedTasks}/${totalTasks}`,
      icon: CheckCircle,
      color: "bg-[#a3e635]",
    },
    {
      label: "In Progress",
      value: meetings.reduce(
        (acc, m) => acc + m.tasks.filter((t) => t.status === "in-progress").length,
        0
      ),
      icon: Clock,
      color: "bg-accent",
    },
    {
      label: "Overdue Tasks",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "bg-destructive text-white",
    },
  ]

  // Get recent meetings
  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div
          className="border-4 border-border bg-card p-6"
          style={{ boxShadow: "var(--brutal-shadow)" }}
        >
          <h2 className="text-2xl font-black">Welcome back, {user?.name}!</h2>
          <p className="mt-1 text-muted-foreground font-medium">
            {"Here's what's happening with your meetings and tasks."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-4 border-border bg-card p-4"
              style={{ boxShadow: "var(--brutal-shadow)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center border-2 border-border ${stat.color}`}
                  style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Meetings & Notifications */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Meetings */}
          <div
            className="border-4 border-border bg-card"
            style={{ boxShadow: "var(--brutal-shadow)" }}
          >
            <div className="flex items-center justify-between border-b-4 border-border p-4">
              <h3 className="text-lg font-black">Recent Meetings</h3>
              <Link
                href="/meetings"
                className="font-bold underline underline-offset-4 hover:text-accent"
              >
                View all
              </Link>
            </div>
            <div className="divide-y-4 divide-border">
              {recentMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="block p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">{meeting.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {meeting.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 border-2 border-border bg-muted px-2 py-1">
                      <Users className="h-4 w-4" />
                      <span className="font-bold">
                        {meeting.participants.length}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {recentMeetings.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No meetings yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div
            className="border-4 border-border bg-card"
            style={{ boxShadow: "var(--brutal-shadow)" }}
          >
            <div className="flex items-center justify-between border-b-4 border-border p-4">
              <h3 className="text-lg font-black">
                Notifications
                {unreadNotifications > 0 && (
                  <span className="ml-2 inline-flex h-6 w-6 items-center justify-center border-2 border-border bg-accent text-sm font-bold text-accent-foreground">
                    {unreadNotifications}
                  </span>
                )}
              </h3>
              <Link
                href="/notifications"
                className="font-bold underline underline-offset-4 hover:text-accent"
              >
                View all
              </Link>
            </div>
            <div className="divide-y-4 divide-border">
              {notifications.slice(0, 4).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${!notification.read ? "bg-muted" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <div className="mt-1.5 h-2 w-2 bg-accent" />
                    )}
                    <div className={!notification.read ? "" : "ml-5"}>
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
