"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useApp } from "@/context/app-context"
import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/notifications", label: "Notifications", icon: Bell },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const { notifications } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r-4 border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ boxShadow: "var(--brutal-shadow)" }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b-4 border-border p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground font-bold text-xl"
                style={{ boxShadow: "var(--brutal-shadow-sm)" }}
              >
                AP
              </div>
              <span className="text-xl font-black tracking-tight">
                AutoPilot
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 border-2 border-transparent px-4 py-3 font-bold transition-all",
                        isActive
                          ? "border-border bg-secondary text-secondary-foreground"
                          : "hover:border-border hover:bg-muted"
                      )}
                      style={isActive ? { boxShadow: "var(--brutal-shadow-sm)" } : undefined}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {item.label === "Notifications" && unreadCount > 0 && (
                        <Badge
                          className="ml-auto border-2 border-border bg-accent text-accent-foreground"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t-4 border-border p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 border-2 border-border bg-destructive px-4 py-3 font-bold text-destructive-foreground transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              style={{ boxShadow: "var(--brutal-shadow-sm)" }}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b-4 border-border bg-card px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="border-2 border-border lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-black lg:text-xl">
              {pathname === "/dashboard" && "Dashboard"}
              {pathname === "/meetings" && "Meetings"}
              {pathname.startsWith("/meetings/") && "Meeting Details"}
              {pathname === "/notifications" && "Notifications"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="border-2 border-border"
              >
                <Bell className="h-5 w-5" />
              </Button>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center border-2 border-border bg-accent text-xs font-bold text-accent-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div
              className="flex items-center gap-2 border-2 border-border bg-muted px-3 py-2"
              style={{ boxShadow: "var(--brutal-shadow-sm)" }}
            >
              <div className="flex h-8 w-8 items-center justify-center bg-primary font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden font-bold sm:block">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
