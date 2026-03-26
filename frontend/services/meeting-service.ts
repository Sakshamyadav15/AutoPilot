// Meeting Service - API integration layer
// In production, replace base URL with your actual API endpoint

import type { Meeting, Participant } from "@/context/app-context"
import { API_BASE_URL, DEMO_FORCE_MOCKS, getAuthHeaders } from "@/services/api-config"

function mapMeeting(raw: any): Meeting {
  const participants = Array.isArray(raw.participants)
    ? raw.participants.map((p: string) => ({
        id: p,
        name: `User ${p.slice(0, 5)}`,
        email: `${p}@example.com`,
      }))
    : []

  return {
    id: raw.id,
    title: raw.title,
    ownerId: raw.owner_id || "1",
    ownerName: raw.owner_name || "Owner",
    participants,
    tasks: [],
    createdAt: raw.created_at || new Date().toISOString().split("T")[0],
  }
}

export const meetingService = {
  async getMeetings(): Promise<Meeting[]> {
    if (DEMO_FORCE_MOCKS) {
      throw new Error("Mock mode forced")
    }

    const response = await fetch(`${API_BASE_URL}/meetings`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch meetings")
    }

    const data = await response.json()
    return Array.isArray(data) ? data.map(mapMeeting) : []
  },

  async getMeeting(id: string): Promise<Meeting> {
    if (DEMO_FORCE_MOCKS) {
      throw new Error("Mock mode forced")
    }

    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch meeting")
    }

    return mapMeeting(await response.json())
  },

  async createMeeting(data: {
    title: string
    participants: Participant[]
  }): Promise<Meeting> {
    if (DEMO_FORCE_MOCKS) {
      return {
        id: Date.now().toString(),
        title: data.title,
        ownerId: "1",
        ownerName: "Owner",
        participants: data.participants,
        tasks: [],
        createdAt: new Date().toISOString().split("T")[0],
      }
    }

    const response = await fetch(`${API_BASE_URL}/meetings/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: data.title }),
    })

    if (!response.ok) {
      throw new Error("Failed to create meeting")
    }

    const meeting = mapMeeting(await response.json())

    // Backend supports adding participants by user IDs only.
    const participantIds = data.participants
      .map((p) => p.id)
      .filter((id) => /^[a-f\d]{24}$/i.test(id))

    if (participantIds.length > 0) {
      await fetch(`${API_BASE_URL}/meetings/add-participants`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          meeting_id: meeting.id,
          participant_ids: participantIds,
        }),
      })
    }

    return {
      ...meeting,
      participants: data.participants,
    }
  },

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    // Backend update endpoint is not implemented yet.
    return {
      id,
      title: data.title || "Untitled",
      ownerId: data.ownerId || "1",
      ownerName: data.ownerName || "Owner",
      participants: data.participants || [],
      tasks: data.tasks || [],
      createdAt: data.createdAt || new Date().toISOString().split("T")[0],
    }
  },

  async deleteMeeting(id: string): Promise<void> {
    // Backend delete endpoint is not implemented yet.
    return
  },

  async processRecording(
    meetingId: string,
    file: File,
    hasScreenShare: boolean
  ): Promise<{ tasks: Array<{ title: string; assigneeId: string; deadline: string }> }> {
    if (DEMO_FORCE_MOCKS) {
      return {
        tasks: [
          {
            title: "Review meeting notes and finalize action items",
            assigneeId: "1",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          },
        ],
      }
    }

    const token = localStorage.getItem("autopilot_token")
    const response = await fetch(`${API_BASE_URL}/meetings/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meeting_id: meetingId,
        text: `Uploaded ${file.name} | screen_share=${hasScreenShare}`,
      }),
    })

    if (!response.ok) {
      return {
        tasks: [
          {
            title: "Extracted task preview (mock fallback)",
            assigneeId: "1",
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          },
        ],
      }
    }

    return {
      tasks: [
        {
          title: "Meeting data uploaded successfully",
          assigneeId: "1",
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
        },
      ],
    }
  },
}
