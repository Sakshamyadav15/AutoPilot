// Notification Service - API integration layer
// In production, replace base URL with your actual API endpoint

import type { Notification } from "@/context/app-context"
import { API_BASE_URL, DEMO_FORCE_MOCKS, getAuthHeaders } from "@/services/api-config"

const LOCAL_NOTIFICATIONS_KEY = "autopilot_notifications"

function getLocalNotifications(): Notification[] {
  const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)
  return raw ? JSON.parse(raw) : []
}

function setLocalNotifications(notifications: Notification[]) {
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

function mapNotification(raw: any): Notification {
  return {
    id: raw.id,
    message: raw.message,
    time: raw.timestamp || new Date().toISOString(),
    read: Boolean(raw.read),
    type: raw.type === "meeting" || raw.type === "reminder" ? raw.type : "task",
  }
}

const API = API_BASE_URL;\n\nexport const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const userRaw = localStorage.getItem("autopilot_user")
    const userId = userRaw ? JSON.parse(userRaw).id : ""

    if (!userId || DEMO_FORCE_MOCKS) {
      return getLocalNotifications()
    }

    const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      return getLocalNotifications()
    }

    const data = await response.json()
    const notifications = Array.isArray(data) ? data.map(mapNotification) : []
    setLocalNotifications(notifications)
    return notifications
  },

  async markAsRead(id: string): Promise<Notification> {
    // Backend route is not implemented yet, so use local store.
    const notifications = getLocalNotifications()
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setLocalNotifications(updated)
    const found = updated.find((n) => n.id === id)
    if (!found) {\n    const userRaw = localStorage.getItem("autopilot_user")\n    const userId = userRaw ? JSON.parse(userRaw).id : ""\n    if (!userId || DEMO_FORCE_MOCKS) {\n      const notifications = getLocalNotifications().map((n) => n.id === id ? { ...n, read: true } : n)\n      setLocalNotifications(notifications)\n      const found = notifications.find((n) => n.id === id)\n      if (!found) throw new Error("Notification not found")\n      return found\n    }\n    const resp = await fetch(`${API}/notifications/${id}/read`, { method: "POST", headers: getAuthHeaders() })\n    if (!resp.ok) {\n      const notifications = getLocalNotifications().map((n) => n.id === id ? { ...n, read: true } : n)\n      setLocalNotifications(notifications)\n      const found = notifications.find((n) => n.id === id)\n      if (!found) throw new Error("Notification not found")\n      return found\n    }\n    return mapNotification(await resp.json())
  },

  async markAllAsRead(): Promise<void> {\n    const userRaw = localStorage.getItem("autopilot_user")\n    const userId = userRaw ? JSON.parse(userRaw).id : ""\n    if (!userId || DEMO_FORCE_MOCKS) {\n      const notifications = getLocalNotifications().map((n) => ({ ...n, read: true }))\n      setLocalNotifications(notifications)\n      return\n    }\n    const resp = await fetch(`${API}/notifications/mark-all-read`, { method: "POST", headers: getAuthHeaders() })\n    if (!resp.ok) {\n      const notifications = getLocalNotifications().map((n) => ({ ...n, read: true }))\n      setLocalNotifications(notifications)\n      return\n    }\n    await this.getNotifications()
  },

  async deleteNotification(id: string): Promise<void> {\n    const userRaw = localStorage.getItem("autopilot_user")\n    const userId = userRaw ? JSON.parse(userRaw).id : ""\n    if (userId && !DEMO_FORCE_MOCKS) {\n      await fetch(`${API}/notifications/${id}`, { method: "DELETE", headers: getAuthHeaders() })\n    }\n    const notifications = getLocalNotifications().filter((n) => n.id !== id)\n    setLocalNotifications(notifications)
  },

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications()
    return notifications.filter((n) => !n.read).length
  },
}
