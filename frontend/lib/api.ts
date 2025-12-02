import { z } from "zod";

// --- Types ---

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "instructor" | "writer";
  institution?: {
    _id: string;
    name: string;
    emailDomain: string;
  };
  isActive: boolean;
  createdAt: string;
  statistics?: {
    booksUploaded: number;
    videosUploaded: number;
    recentActivity: any[];
  };
}

export interface UserListResponse {
  users: User[];
  page: number;
  pages: number;
  total: number;
}

export interface AnalyticsOverview {
  overview: {
    totalUsers: number;
    totalActions: number;
    totalWatchTime: number;
    videoViews: number;
    bookViews: number;
    totalVideos: number;
    totalBooks: number;
    totalInstitutions: number;
  };
  popularVideos: any[];
  popularBooks: any[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface InstitutionAnalytics {
  institution: any;
  analytics: {
    userCount: number;
    videoCount: number;
    bookCount: number;
    engagement: any[];
  };
  dateRange: { start: string; end: string };
}

export interface UserAnalytics {
  userEngagement: any[];
  recentActivity: any[];
  dateRange: { start: string; end: string };
}

// --- Configuration ---

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

// --- Fetch Client ---

async function fetchClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Dynamic Token Retrieval
  // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // HARDCODED TOKEN FOR DEVELOPMENT (Bypassing Frontend Auth)
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmQ3ZDI5MzdmODE2OTU0Y2Q5MGIxOCIsImlhdCI6MTc2NDU4ODg0MSwiZXhwIjoxNzY1MTkzNjQxfQ.wcrE1Pesjuz0gihdIGPdeSz7JmAHMkqLFZEwyhmMyww";

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Always send this token
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Global Error Handling
    if (!response.ok) {
      // if (response.status === 401) {
      //   console.error("Unauthorized! Redirecting to login...");
      //   // Optional: window.location.href = "/login";
      // }
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.message || `Request failed with status ${response.status}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// --- Auth API ---

export const AuthAPI = {
  login: async (email: string, password: string) => {
    return fetchClient<{ token: string; user: User }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

// --- Super Admin API ---

export const SuperAdminAPI = {
  // User Management
  getUsers: async (page = 1, limit = 10) => {
    return fetchClient<UserListResponse>(`/users?page=${page}&limit=${limit}`, {
      method: "GET",
    });
  },

  getUser: async (id: string) => {
    return fetchClient<{ status: string; data: { user: User } }>(
      `/users/${id}`,
      {
        method: "GET",
      }
    ).then((res) => res.data.user);
  },

  updateUser: async (
    id: string,
    data: Partial<{
      name: string;
      institution: string;
      avatar: string;
      isActive: boolean;
    }>
  ) => {
    return fetchClient<{ status: string; data: { user: User } }>(
      `/users/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    ).then((res) => res.data.user);
  },

  updateUserRole: async (id: string, role: string) => {
    return fetchClient<{ status: string; data: { user: User } }>(
      `/users/${id}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }
    ).then((res) => res.data.user);
  },

  deleteUser: async (id: string) => {
    return fetchClient<{ status: string; message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  },

  // Analytics
  getAnalyticsOverview: async (startDate?: string, endDate?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    return fetchClient<AnalyticsOverview>(`/analytics/overview?${query.toString()}`, {
      method: "GET",
    });
  },

  getInstitutionAnalytics: async (
    institutionId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    return fetchClient<InstitutionAnalytics>(
      `/analytics/institution/${institutionId}?${query.toString()}`,
      {
        method: "GET",
      }
    );
  },

  getUserAnalytics: async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    return fetchClient<UserAnalytics>(
      `/analytics/user/${userId}?${query.toString()}`,
      {
        method: "GET",
      }
    );
  },

  exportAnalytics: async (
    format: "csv" | "json" = "csv",
    startDate?: string,
    endDate?: string
  ) => {
    // For CSV export, we might need to handle it differently if we want to trigger a download
    // But for now, let's just return the raw response or handle it in the component
    const query = new URLSearchParams();
    query.append("format", format);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    if (format === "csv") {
      // Special handling for CSV download
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${API_BASE}/analytics/export?${query.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    }

    return fetchClient<any>(`/analytics/export?${query.toString()}`, {
      method: "GET",
    });
  },
};
