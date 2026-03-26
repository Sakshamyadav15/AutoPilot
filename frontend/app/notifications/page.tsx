"use client"

import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Bell, CalendarDays, ClipboardList, Clock, Check } from "lucide-react"

const typeIcons = {
  task: ClipboardList,
  meeting: CalendarDays,
  reminder: Clock,
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useApp()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        markNotificationRead(n.id)
      }
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Notifications</h2>
            <p className="text-muted-foreground font-medium">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              className="border-2 border-border font-bold"
              style={{ boxShadow: "var(--brutal-shadow-sm)" }}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div
            className="border-4 border-border bg-card"
            style={{ boxShadow: "var(--brutal-shadow)" }}
          >
            <div className="divide-y-4 divide-border">
              {notifications.map((notification) => {
                const TypeIcon = typeIcons[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 transition-colors ${
                      !notification.read ? "bg-muted" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border ${
                        notification.type === "task"
                          ? "bg-secondary"
                          : notification.type === "meeting"
                          ? "bg-accent"
                          : "bg-[#fb923c]"
                      }`}
                      style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`font-medium ${
                            !notification.read ? "font-bold" : ""
                          }`}
                        >
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <span className="shrink-0 h-2 w-2 bg-accent mt-2" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>

                    {/* Mark as Read Button */}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationRead(notification.id)}
                        className="shrink-0 border-2 border-transparent hover:border-border"
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <Empty
            className="border-4 border-border bg-card py-16"
            style={{ boxShadow: "var(--brutal-shadow)" }}
          >
            <EmptyHeader>
              <EmptyMedia>
                <Bell className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle>No notifications</EmptyTitle>
              <EmptyDescription>{"You're all caught up! New notifications will appear here."}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </DashboardLayout>
  )
}
