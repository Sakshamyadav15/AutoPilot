"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  CalendarDays,
  Zap,
  CheckCircle,
  Users,
  ArrowRight,
  FileText,
} from "lucide-react"

const features = [
  {
    icon: CalendarDays,
    title: "Meeting Management",
    description: "Create and organize meetings with participants in one place",
    color: "bg-secondary",
  },
  {
    icon: Zap,
    title: "AI Task Extraction",
    description: "Automatically extract action items from meeting recordings",
    color: "bg-accent",
  },
  {
    icon: CheckCircle,
    title: "Task Tracking",
    description: "Monitor task progress with status updates and deadlines",
    color: "bg-[#a3e635]",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Assign tasks to participants and track completion",
    color: "bg-[#38bdf8]",
  },
]

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-4 border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground font-bold text-xl"
              style={{ boxShadow: "var(--brutal-shadow-sm)" }}
            >
              AP
            </div>
            <span className="text-xl font-black tracking-tight">AutoPilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-2 border-border font-bold"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                className="border-2 border-border font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                style={{ boxShadow: "var(--brutal-shadow-sm)" }}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl text-balance">
              Turn Meetings Into
              <span className="block text-accent">Action Items</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground font-medium leading-relaxed">
              AutoPilot uses AI to automatically extract tasks from your meeting
              recordings and helps you track them to completion. No more missed
              follow-ups.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="border-2 border-border py-6 text-lg font-black transition-all hover:translate-x-1 hover:translate-y-1"
                  style={{ boxShadow: "var(--brutal-shadow)" }}
                >
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-border py-6 text-lg font-bold"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div
            className="border-4 border-border bg-card p-6"
            style={{ boxShadow: "var(--brutal-shadow-lg)" }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b-4 border-border pb-4">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-border bg-secondary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Q1 Planning Meeting</h3>
                  <p className="text-sm text-muted-foreground">
                    3 tasks extracted
                  </p>
                </div>
              </div>
              {["Prepare budget proposal", "Review competitor analysis", "Update team OKRs"].map(
                (task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-2 border-border bg-muted p-3"
                    style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                  >
                    <div
                      className={`h-4 w-4 border-2 border-border ${
                        i === 0 ? "bg-[#a3e635]" : ""
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        i === 0 ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t-4 border-border bg-card py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-black md:text-4xl text-balance">
            Everything You Need to Execute
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground font-medium">
            From meeting to completion, AutoPilot handles the entire workflow
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border-4 border-border bg-background transition-all hover:-translate-y-1"
                style={{ boxShadow: "var(--brutal-shadow)" }}
              >
                <div className={`border-b-4 border-border ${feature.color} p-4`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div
          className="border-4 border-border bg-primary p-8 text-center text-primary-foreground md:p-12"
          style={{ boxShadow: "var(--brutal-shadow-lg)" }}
        >
          <h2 className="text-3xl font-black md:text-4xl text-balance">
            Ready to Supercharge Your Meetings?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-medium opacity-90">
            Join thousands of teams using AutoPilot to turn their meetings into
            results.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="mt-8 border-2 border-primary-foreground bg-primary-foreground py-6 text-lg font-black text-primary transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-primary-foreground/90"
              style={{ boxShadow: "4px 4px 0px var(--primary-foreground)" }}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground text-sm font-bold">
              AP
            </div>
            <span className="font-bold">AutoPilot</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Built with Neo Brutalism design. Transform meetings into action.
          </p>
        </div>
      </footer>
    </div>
  )
}
