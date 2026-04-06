// Task Service - API integration layer
// In production, replace base URL with your actual API endpoint


function toUiStatus(s: string): Task["status"] {
  return s === "in_progress" ? "in-progress" : ((s as Task["status"]) || "pending")
}

function toApiStatus(s: Task["status"]): string {
  return s === "in-progress" ? "in_progress" : s
}

import type { Task } from "@/context/app-context"
import { API_BASE_URL, DEMO_FORCE_MOCKS, getAuthHeaders } from "@/services/api-config"

function mapTask(raw: any): Task {
  return {
    id: raw.id,
    title: raw.task,
    ownerId: raw.owner_id || "1",
    ownerName: raw.owner_name || "Owner",
    assigneeId: raw.assigned_to || "1",
    assigneeName: raw.assignee_name || "Unassigned",
    deadline: raw.deadline || new Date().toISOString().slice(0, 10),
    status: toUiStatus(raw.status),
    meetingId: raw.meeting_id,
  }
}

export const taskService = {
  async getTasksByMeeting(meetingId: string): Promise<Task[]> {
    if (DEMO_FORCE_MOCKS) {
      return []
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${meetingId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tasks")
    }

    const data = await response.json()
    return Array.isArray(data) ? data.map(mapTask) : []
  },

  async getMyTasks(): Promise<Task[]> {
    const userRaw = localStorage.getItem("autopilot_user")
    const userId = userRaw ? JSON.parse(userRaw).id : ""
    if (!userId) return []

    // Backend currently exposes meeting-scoped tasks only.
    const meetingsRaw = localStorage.getItem("autopilot_cached_meetings")
    const meetings = meetingsRaw ? JSON.parse(meetingsRaw) : []
    const meetingIds: string[] = meetings.map((m: { id: string }) => m.id)

    const all = await Promise.all(
      meetingIds.map((meetingId) =>
        this.getTasksByMeeting(meetingId).catch(() => [])
      )
    )
    return all.flat().filter((task) => task.assigneeId === userId)
  },

  async createTask(
    meetingId: string,
    data: Omit<Task, "id" | "meetingId">
  ): Promise<Task> {
    if (DEMO_FORCE_MOCKS) {
      return {
        ...data,
        id: Date.now().toString(),
        meetingId,
      }
    }

    const response = await fetch(`${API_BASE_URL}/tasks/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        meeting_id: meetingId,
        assigned_to: data.assigneeId,
        task: data.title,
        deadline: data.deadline,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create task")
    }

    return mapTask(await response.json())
  },

  async updateTask(
    meetingId: string,
    taskId: string,
    data: Partial<Task>
  ): Promise<Task> {
    if (data.status) {
      const response = await fetch(`${API_BASE_URL}/tasks/update-status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ task_id: taskId, status: toApiStatus(data.status as Task["status"]) }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      return mapTask(await response.json())
    }

    return {
      id: taskId,
      title: data.title || "Untitled task",
      ownerId: data.ownerId || "1",
      ownerName: data.ownerName || "Owner",
      assigneeId: data.assigneeId || "1",
      assigneeName: data.assigneeName || "Unassigned",
      deadline: data.deadline || new Date().toISOString().slice(0, 10),
      status: data.status || "pending",
      meetingId,
    }
  },

  async updateTaskStatus(
    meetingId: string,
    taskId: string,
    status: Task["status"]
  ): Promise<Task> {
    return this.updateTask(meetingId, taskId, { status })
  },

  async deleteTask(meetingId: string, taskId: string): Promise<void> {
    // Backend delete endpoint is not implemented yet.
    return
  },
}
