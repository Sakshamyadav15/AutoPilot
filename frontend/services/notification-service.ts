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

export const notificationService = {
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
    if (!found) {
      throw new Error("Notification not found")
    }
    return found
  },

  async markAllAsRead(): Promise<void> {
    const notifications = getLocalNotifications()
    setLocalNotifications(notifications.map((n) => ({ ...n, read: true })))
  },

  async deleteNotification(id: string): Promise<void> {
    const notifications = getLocalNotifications().filter((n) => n.id !== id)
    setLocalNotifications(notifications)
  },

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications()
    return notifications.filter((n) => !n.read).length
  },
}
