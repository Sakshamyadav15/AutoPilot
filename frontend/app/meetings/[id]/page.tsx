"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { TaskCard } from "@/components/tasks/task-card"
import { FileUpload } from "@/components/meetings/file-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Users, Plus, ClipboardList, User } from "lucide-react"
import Link from "next/link"

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { getMeeting, updateTaskStatus, addTask } = useApp()
  const { user } = useAuth()
  const router = useRouter()
  const meeting = getMeeting(id)

  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [taskDeadline, setTaskDeadline] = useState("")
  const [loading, setLoading] = useState(false)

  if (!meeting) {
    return (
      <DashboardLayout>
        <div
          className="flex flex-col items-center justify-center py-16 border-4 border-border bg-card"
          style={{ boxShadow: "var(--brutal-shadow)" }}
        >
          <h2 className="text-xl font-black">Meeting not found</h2>
          <p className="mt-2 text-muted-foreground">
            The meeting you are looking for does not exist.
          </p>
          <Button
            onClick={() => router.push("/meetings")}
            className="mt-4 border-2 border-border font-bold"
            style={{ boxShadow: "var(--brutal-shadow-sm)" }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meetings
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const isOwner = meeting.ownerId === user?.id || meeting.ownerId === "1"

  const handleMarkComplete = (taskId: string) => {
    updateTaskStatus(meeting.id, taskId, "completed")
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const assignee = meeting.participants.find((p) => p.id === taskAssignee)
    if (assignee) {
      addTask(meeting.id, {
        title: taskTitle,
        ownerId: user?.id || "1",
        ownerName: user?.name || "Owner",
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        deadline: taskDeadline,
        status: "pending",
      })
    }

    setTaskTitle("")
    setTaskAssignee("")
    setTaskDeadline("")
    setLoading(false)
    setAddTaskOpen(false)
  }

  // Group tasks by participant for owner view
  const tasksByParticipant = meeting.participants.map((participant) => ({
    participant,
    tasks: meeting.tasks.filter((t) => t.assigneeId === participant.id),
  }))

  // Get current user's tasks for participant view
  const myTasks = meeting.tasks.filter(
    (t) => t.assigneeId === user?.id || t.assigneeName === user?.name
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/meetings"
              className="inline-flex items-center font-bold underline underline-offset-4 hover:text-accent"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Meetings
            </Link>
            <h2 className="mt-2 text-2xl font-black">{meeting.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 border-2 border-border bg-muted px-3 py-1">
                <Users className="h-4 w-4" />
                <span className="font-bold">
                  {meeting.participants.length} participants
                </span>
              </div>
              <span className="text-muted-foreground font-medium">
                Created {meeting.createdAt}
              </span>
            </div>
          </div>

          {isOwner && (
            <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
              <DialogTrigger asChild>
                <Button
                  className="border-2 border-border font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  style={{ boxShadow: "var(--brutal-shadow)" }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent
                className="border-4 border-border sm:max-w-md"
                style={{ boxShadow: "var(--brutal-shadow-lg)" }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">
                    Add New Task
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="mt-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="taskTitle" className="font-bold">
                        Task Title
                      </FieldLabel>
                      <Input
                        id="taskTitle"
                        placeholder="e.g., Prepare presentation"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        required
                        className="border-2 border-border bg-background font-medium"
                        style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="assignee" className="font-bold">
                        Assign To
                      </FieldLabel>
                      <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                        <SelectTrigger
                          className="border-2 border-border bg-background font-medium"
                          style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                        >
                          <SelectValue placeholder="Select participant" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-border">
                          {meeting.participants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="deadline" className="font-bold">
                        Deadline
                      </FieldLabel>
                      <Input
                        id="deadline"
                        type="date"
                        value={taskDeadline}
                        onChange={(e) => setTaskDeadline(e.target.value)}
                        required
                        className="border-2 border-border bg-background font-medium"
                        style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                      />
                    </Field>
                  </FieldGroup>

                  <div className="mt-6 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddTaskOpen(false)}
                      className="flex-1 border-2 border-border font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !taskTitle || !taskAssignee || !taskDeadline}
                      className="flex-1 border-2 border-border font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                      style={{ boxShadow: "var(--brutal-shadow)" }}
                    >
                      {loading ? <Spinner className="mr-2" /> : null}
                      {loading ? "Adding..." : "Add Task"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Owner View - Tasks by Participant */}
            {isOwner && (
              <div className="space-y-6">
                <h3 className="text-lg font-black">Tasks by Participant</h3>
                {tasksByParticipant.length > 0 ? (
                  tasksByParticipant.map(({ participant, tasks }) => (
                    <div
                      key={participant.id}
                      className="border-4 border-border bg-card"
                      style={{ boxShadow: "var(--brutal-shadow)" }}
                    >
                      <div className="flex items-center gap-3 border-b-4 border-border bg-muted p-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center border-2 border-border bg-secondary font-bold"
                          style={{ boxShadow: "var(--brutal-shadow-sm)" }}
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold">{participant.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {participant.email}
                          </p>
                        </div>
                        <span className="ml-auto border-2 border-border bg-background px-2 py-1 text-sm font-bold">
                          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="p-4">
                        {tasks.length > 0 ? (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {tasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                showAssignee={false}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-4">
                            No tasks assigned yet
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty
                    className="border-4 border-border bg-card py-12"
                    style={{ boxShadow: "var(--brutal-shadow)" }}
                  >
                    <EmptyHeader>
                      <EmptyMedia>
                        <Users className="h-12 w-12" />
                      </EmptyMedia>
                      <EmptyTitle>No participants</EmptyTitle>
                      <EmptyDescription>Add participants to the meeting to assign tasks</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            )}

            {/* Participant View - My Tasks */}
            {!isOwner && (
              <div className="space-y-6">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Tasks
                </h3>
                {myTasks.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {myTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        showOwner
                        showAssignee={false}
                        canComplete
                        onMarkComplete={() => handleMarkComplete(task.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    className="border-4 border-border bg-card py-12"
                    style={{ boxShadow: "var(--brutal-shadow)" }}
                  >
                    <EmptyHeader>
                      <EmptyMedia>
                        <ClipboardList className="h-12 w-12" />
                      </EmptyMedia>
                      <EmptyTitle>No tasks assigned</EmptyTitle>
                      <EmptyDescription>{"You don't have any tasks in this meeting yet"}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - File Upload (Owner only) */}
          {isOwner && (
            <div className="lg:col-span-1">
              <FileUpload
                onProcess={(file, hasScreenShare) => {
                  console.log("[v0] Processing file:", file?.name, "Screen share:", hasScreenShare)
                  // In production, this would send to AI for processing
                }}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
