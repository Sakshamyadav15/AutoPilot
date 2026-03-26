"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signup(name, email, password)
      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div
        className="w-full max-w-md border-4 border-border bg-card p-8"
        style={{ boxShadow: "var(--brutal-shadow-lg)" }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-primary text-primary-foreground text-2xl font-black"
            style={{ boxShadow: "var(--brutal-shadow)" }}
          >
            AP
          </div>
          <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
          <p className="mt-2 text-muted-foreground font-medium">
            Join AutoPilot today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name" className="font-bold">
                Full Name
              </FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-2 border-border bg-background font-medium"
                style={{ boxShadow: "var(--brutal-shadow-sm)" }}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email" className="font-bold">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-border bg-background font-medium"
                style={{ boxShadow: "var(--brutal-shadow-sm)" }}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="font-bold">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-2 border-border bg-background font-medium"
                style={{ boxShadow: "var(--brutal-shadow-sm)" }}
              />
            </Field>
          </FieldGroup>

          {error && (
            <div className="mt-4 border-2 border-border bg-destructive p-3 text-center font-bold text-destructive-foreground">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 w-full border-2 border-border py-6 text-lg font-black transition-all hover:translate-x-1 hover:translate-y-1"
            style={{ boxShadow: "var(--brutal-shadow)" }}
          >
            {loading ? <Spinner className="mr-2" /> : null}
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold underline underline-offset-4 hover:text-accent"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
