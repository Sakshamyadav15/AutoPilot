"use client"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Plus, X, UserPlus } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function CreateMeetingModal() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [participantEmail, setParticipantEmail] = useState("")
  const [participants, setParticipants] = useState<{ id: string; name: string; email: string }[]>([])
  const [loading, setLoading] = useState(false)
  const { addMeeting } = useApp()
  const { user } = useAuth()

  const handleAddParticipant = () => {
    if (participantEmail && !participants.find((p) => p.email === participantEmail)) {
      setParticipants([
        ...participants,
        {
          id: Date.now().toString(),
          name: participantEmail.split("@")[0],
          email: participantEmail,
        },
      ])
      setParticipantEmail("")
    }
  }

  const handleRemoveParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p.email !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    addMeeting({
      title,
      ownerId: user?.id || "1",
      ownerName: user?.name || "User",
      participants,
    })

    setTitle("")
    setParticipants([])
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="border-2 border-border font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          style={{ boxShadow: "var(--brutal-shadow)" }}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Meeting
        </Button>
      </DialogTrigger>
      <DialogContent
        className="border-4 border-border sm:max-w-md"
        style={{ boxShadow: "var(--brutal-shadow-lg)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Create New Meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title" className="font-bold">
                Meeting Title
              </FieldLabel>
              <Input
                id="title"
                placeholder="e.g., Weekly Standup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border-2 border-border bg-background font-medium"
                style={{ boxShadow: "var(--brutal-shadow-sm)" }}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="participant" className="font-bold">
                Add Participants
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="participant"
                  type="email"
                  placeholder="participant@example.com"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  className="flex-1 border-2 border-border bg-background font-medium"
                  style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddParticipant()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddParticipant}
                  className="border-2 border-border"
                  style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                >
                  <UserPlus className="h-5 w-5" />
                </Button>
              </div>
            </Field>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground">
                  Participants ({participants.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {participants.map((p) => (
                    <div
                      key={p.email}
                      className="flex items-center gap-2 border-2 border-border bg-muted px-2 py-1"
                    >
                      <span className="text-sm font-medium">{p.email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(p.email)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </FieldGroup>

          <div className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-2 border-border font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title}
              className="flex-1 border-2 border-border font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              style={{ boxShadow: "var(--brutal-shadow)" }}
            >
              {loading ? <Spinner className="mr-2" /> : null}
              {loading ? "Creating..." : "Create Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
