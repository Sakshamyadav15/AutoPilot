"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "@/services/auth-service"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem("autopilot_token")
    const storedUser = localStorage.getItem("autopilot_user")
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password)
    localStorage.setItem("autopilot_token", result.token)
    localStorage.setItem("autopilot_user", JSON.stringify(result.user))
    setUser(result.user)
  }

  const signup = async (name: string, email: string, password: string) => {
    const result = await authService.signup(name, email, password)
    localStorage.setItem("autopilot_token", result.token)
    localStorage.setItem("autopilot_user", JSON.stringify(result.user))
    setUser(result.user)
  }

  const logout = () => {
    void authService.logout()
    localStorage.removeItem("autopilot_token")
    localStorage.removeItem("autopilot_user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
