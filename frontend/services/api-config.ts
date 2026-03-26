export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"

export const DEMO_FORCE_MOCKS = process.env.NEXT_PUBLIC_DEMO_FORCE_MOCKS === "true"

export function getAuthToken() {
  if (typeof window === "undefined") {
    return ""
  }
  return localStorage.getItem("autopilot_token") || ""
}

export function getAuthHeaders() {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}