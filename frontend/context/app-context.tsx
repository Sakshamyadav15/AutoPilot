"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { meetingService } from "@/services/meeting-service"
import { taskService } from "@/services/task-service"
import { notificationService } from "@/services/notification-service"

export interface Task {
  id: string
  title: string
  ownerId: string
  ownerName: string
  assigneeId: string
  assigneeName: string
  deadline: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  meetingId: string
}

export interface Participant {
  id: string
  name: string
  email: string
}

export interface Meeting {
  id: string
  title: string
  ownerId: string
  ownerName: string
  participants: Participant[]
  tasks: Task[]
  createdAt: string
}

export interface Notification {
  id: string
  message: string
  time: string
  read: boolean
  type: "task" | "meeting" | "reminder"
}

interface AppContextType {
  meetings: Meeting[]
  notifications: Notification[]
  addMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "tasks">) => void
  getMeeting: (id: string) => Meeting | undefined
  addTask: (meetingId: string, task: Omit<Task, "id" | "meetingId">) => void
  updateTaskStatus: (meetingId: string, taskId: string, status: Task["status"]) => void
  markNotificationRead: (id: string) => void
  addNotification: (notification: Omit<Notification, "id">) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Sample data
const initialMeetings: Meeting[] = [
  {
    id: "1",
    title: "Q1 Planning Session",
    ownerId: "1",
    ownerName: "John Doe",
    participants: [
      { id: "2", name: "Alice Smith", email: "alice@example.com" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com" },
      { id: "4", name: "Carol Williams", email: "carol@example.com" },
    ],
    tasks: [
      {
        id: "t1",
        title: "Prepare Q1 budget proposal",
        ownerId: "1",
        ownerName: "John Doe",
        assigneeId: "2",
        assigneeName: "Alice Smith",
        deadline: "2026-04-01",
        status: "in-progress",
        meetingId: "1",
      },
      {
        id: "t2",
        title: "Review competitor analysis",
        ownerId: "1",
        ownerName: "John Doe",
        assigneeId: "3",
        assigneeName: "Bob Johnson",
        deadline: "2026-03-28",
        status: "pending",
        meetingId: "1",
      },
      {
        id: "t3",
        title: "Update team OKRs",
        ownerId: "1",
        ownerName: "John Doe",
        assigneeId: "4",
        assigneeName: "Carol Williams",
        deadline: "2026-03-20",
        status: "overdue",
        meetingId: "1",
      },
    ],
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    title: "Product Roadmap Review",
    ownerId: "1",
    ownerName: "John Doe",
    participants: [
      { id: "5", name: "David Brown", email: "david@example.com" },
      { id: "6", name: "Eva Martinez", email: "eva@example.com" },
    ],
    tasks: [
      {
        id: "t4",
        title: "Document feature requirements",
        ownerId: "1",
        ownerName: "John Doe",
        assigneeId: "5",
        assigneeName: "David Brown",
        deadline: "2026-04-05",
        status: "pending",
        meetingId: "2",
      },
      {
        id: "t5",
        title: "Create wireframes for new dashboard",
        ownerId: "1",
        ownerName: "John Doe",
        assigneeId: "6",
        assigneeName: "Eva Martinez",
        deadline: "2026-03-25",
        status: "completed",
        meetingId: "2",
      },
    ],
    createdAt: "2026-03-18",
  },
  {
    id: "3",
    title: "Sprint Retrospective",
    ownerId: "1",
    ownerName: "John Doe",
    participants: [
      { id: "7", name: "Frank Lee", email: "frank@example.com" },
      { id: "8", name: "Grace Kim", email: "grace@example.com" },
      { id: "9", name: "Henry Chen", email: "henry@example.com" },
      { id: "10", name: "Ivy Patel", email: "ivy@example.com" },
    ],
    tasks: [],
    createdAt: "2026-03-20",
  },
]

const initialNotifications: Notification[] = [
  {
    id: "n1",
    message: "New task assigned: Prepare Q1 budget proposal",
    time: "2 hours ago",
    read: false,
    type: "task",
  },
  {
    id: "n2",
    message: "Meeting 'Q1 Planning Session' has been created",
    time: "5 hours ago",
    read: false,
    type: "meeting",
  },
  {
    id: "n3",
    message: "Reminder: Task 'Update team OKRs' is overdue",
    time: "1 day ago",
    read: true,
    type: "reminder",
  },
  {
    id: "n4",
    message: "Task 'Create wireframes' marked as completed",
    time: "2 days ago",
    read: true,
    type: "task",
  },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  useEffect(() => {
    const hydrateFromBackend = async () => {
      const token = localStorage.getItem("autopilot_token")
      if (!token) {
        return
      }

      try {
        const apiMeetings = await meetingService.getMeetings()
        const withTasks = await Promise.all(
          apiMeetings.map(async (meeting) => {
            const tasks = await taskService.getTasksByMeeting(meeting.id).catch(() => [])
            return {
              ...meeting,
              tasks,
            }
          })
        )

        setMeetings(withTasks)
      } catch {
        const cached = localStorage.getItem("autopilot_cached_meetings")
        if (cached) {
          setMeetings(JSON.parse(cached))
        }
      }

      try {
        const apiNotifications = await notificationService.getNotifications()
        if (apiNotifications.length > 0) {
          setNotifications(apiNotifications)
        }
      } catch {
        // Keep local seeded notifications for demo reliability.
      }
    }

    void hydrateFromBackend()
  }, [])

  useEffect(() => {
    localStorage.setItem("autopilot_cached_meetings", JSON.stringify(meetings))
  }, [meetings])

  const addMeeting = (meeting: Omit<Meeting, "id" | "createdAt" | "tasks">) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
      tasks: [],
      createdAt: new Date().toISOString().split("T")[0],
    }
    setMeetings((prev) => [...prev, newMeeting])

    void meetingService
      .createMeeting({
        title: meeting.title,
        participants: meeting.participants,
      })
      .then((created) => {
        setMeetings((prev) =>
          prev.map((m) => (m.id === newMeeting.id ? { ...created, tasks: m.tasks } : m))
        )
      })
      .catch(() => {
        // Keep optimistic UI state when backend endpoints are not fully implemented.
      })

    addNotification({
      message: `Meeting '${meeting.title}' has been created`,
      time: "Just now",
      read: false,
      type: "meeting",
    })
  }

  const getMeeting = (id: string) => {
    return meetings.find((m) => m.id === id)
  }

  const addTask = (meetingId: string, task: Omit<Task, "id" | "meetingId">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      meetingId,
    }
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId ? { ...m, tasks: [...m.tasks, newTask] } : m
      )
    )

    void taskService
      .createTask(meetingId, task)
      .then((created) => {
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meetingId
              ? {
                  ...m,
                  tasks: m.tasks.map((t) => (t.id === newTask.id ? created : t)),
                }
              : m
          )
        )
      })
      .catch(() => {
        // Keep optimistic UI state when backend write is unavailable.
      })

    addNotification({
      message: `New task assigned: ${task.title}`,
      time: "Just now",
      read: false,
      type: "task",
    })
  }

  const updateTaskStatus = (meetingId: string, taskId: string, status: Task["status"]) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
            }
          : m
      )
    )

    void taskService.updateTaskStatus(meetingId, taskId, status).catch(() => {
      // Keep optimistic UI state when backend update route fails.
    })
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

    void notificationService.markAsRead(id).catch(() => {
      // Keep optimistic UI state when backend route is unavailable.
    })
  }

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  return (
    <AppContext.Provider
      value={{
        meetings,
        notifications,
        addMeeting,
        getMeeting,
        addTask,
        updateTaskStatus,
        markNotificationRead,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
