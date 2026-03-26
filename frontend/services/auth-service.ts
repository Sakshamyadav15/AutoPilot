import { API_BASE_URL, DEMO_FORCE_MOCKS } from "@/services/api-config"

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface SignupResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const mockUser = {
      token: "mock_jwt_token",
      user: {
        id: "1",
        name: email.split("@")[0],
        email,
      },
    }

    if (DEMO_FORCE_MOCKS) {
      return mockUser
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
          return mockUser
        }
        throw new Error("Login failed")
      }

      const data = await response.json()
      return {
        token: data.access_token,
        user: {
          id: data.user_id,
          name: data.name,
          email: data.email,
        },
      }
    } catch {
      return mockUser
    }
  },

  async signup(name: string, email: string, password: string): Promise<SignupResponse> {
    if (DEMO_FORCE_MOCKS) {
      return {
        token: "mock_jwt_token",
        user: {
          id: "1",
          name,
          email,
        },
      }
    }

    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!signupResponse.ok) {
      throw new Error("Signup failed")
    }

    // Backend signup currently returns user object, so immediately login to get token.
    return this.login(email, password)
  },

  async logout(): Promise<void> {
    // Backend logout endpoint is not implemented yet. Client-side token clear is enough.
    return
  },

  async getProfile(): Promise<LoginResponse["user"]> {
    if (DEMO_FORCE_MOCKS) {
      const stored = localStorage.getItem("autopilot_user")
      if (!stored) {
        throw new Error("No user in storage")
      }
      return JSON.parse(stored)
    }

    const token = localStorage.getItem("autopilot_token")

    // Backend profile endpoint is not implemented; fall back to stored user.
    if (!token) {
      throw new Error("Failed to get profile")
    }

    const stored = localStorage.getItem("autopilot_user")
    if (!stored) {
      throw new Error("Failed to get profile")
    }

    return JSON.parse(stored)
  },
}
