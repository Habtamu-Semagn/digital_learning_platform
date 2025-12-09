import { z } from "zod";
import { storage } from "./storage";

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

export interface Institution {
  _id: string;
  name: string;
  emailDomain: string;
  type: string;
  isActive: boolean;
  contactEmail: string;
  website: string;
  logo?: string;
}

export interface InstitutionListResponse {
  institutions: Institution[];
  count: number;
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

export interface AuditLog {
  _id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  performedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  page: number;
  pages: number;
  total: number;
}

export interface SystemConfig {
  _id: string;
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  updatedAt: string;
  updatedBy: string;
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
  const token = typeof window !== 'undefined' ? storage.getToken() : null;

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
    return fetchClient<{ token: string; data: { user: User } }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (data: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: 'student' | 'instructor';
    institution?: string;
  }) => {
    return fetchClient<{ token: string; data: { user: User } }>(`/auth/signup`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return fetchClient<{ status: string; data: { user: User } }>(`/auth/me`, {
      method: "GET",
    }).then(res => res.data.user);
  },

  updatePassword: async (data: any) => {
    return fetchClient<{ status: string; message: string }>(`/auth/update-password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// --- Super Admin API ---

export const SuperAdminAPI = {
  // User Management
  getAllUsers: async (page = 1, limit = 10) => {
    return fetchClient<UserListResponse>(`/users?page=${page}&limit=${limit}`, {
      method: "GET",
    });
  },

  getAdmins: async (page = 1, limit = 10) => {
    return fetchClient<UserListResponse>(`/users?role=admin&page=${page}&limit=${limit}`, {
      method: "GET",
    });
  },

  createAdmin: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    institution?: string;
  }) => {
    return fetchClient<{ status: string; data: { user: User } }>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.data.user);
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
      email: string;
      institution: string;
      avatar: string;
      isActive: boolean;
      role: string;
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
      // HARDCODED TOKEN FOR DEVELOPMENT (Bypassing Frontend Auth)
      const token = storage.getToken();
      const response = await fetch(`${API_BASE}/analytics/export?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Export failed:", errorText);
        throw new Error("Export failed");
      }
      return response.blob();
    }

    return fetchClient<any>(`/analytics/export?${query.toString()}`, {
      method: "GET",
    });
  },

  // Audit Logs
  getAuditLogs: async (
    page = 1,
    limit = 10,
    filters?: {
      action?: string;
      resourceType?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());

    if (filters) {
      if (filters.action) query.append("action", filters.action);
      if (filters.resourceType) query.append("resourceType", filters.resourceType);
      if (filters.userId) query.append("userId", filters.userId);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);
    }

    return fetchClient<AuditLogListResponse>(`/audit-logs?${query.toString()}`, {
      method: "GET",
    });
  },

  // System Config
  getSystemConfig: async () => {
    return fetchClient<{ status: string; data: { config: SystemConfig } }>(
      "/system-config",
      {
        method: "GET",
      }
    ).then((res) => res.data.config);
  },

  updateSystemConfig: async (data: Partial<SystemConfig>) => {
    return fetchClient<{ status: string; data: { config: SystemConfig } }>(
      "/system-config",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    ).then((res) => res.data.config);
  },
};

export const AdminAPI = {
  getUsers: async (page = 1, limit = 10) => {
    return fetchClient<UserListResponse>(`/users?role=user&page=${page}&limit=${limit}`, {
      method: "GET",
    });
  },
  updateUser: async (
    id: string,
    data: Partial<{
      name: string;
      email: string;
      institution: string;
      avatar: string;
      isActive: boolean;
      role: string;
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
  getInstructors: async (page = 1, limit = 10) => {
    return fetchClient<UserListResponse>(`/users?role=instructor&page=${page}&limit=${limit}`, {
      method: "GET",
    });
  },
  getInstitutions: async (page = 1, limit = 10) => {
    return fetchClient<InstitutionListResponse>(`/institutions?page=${page}&limit=${limit}`, {
      method: "GET",
    })
  },
  updateInstitution: async (institutionId: string, data: Partial<{
    name: string;
    emailDomain: string;
    type: string;
    isActive: boolean;
    contactEmail: string;
    website: string;
  }>) => {
    return fetchClient<{ status: string, data: { institution: Institution } }>(`/institutions/${institutionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  deleteInstitution: async (institutionId: string) => {
    return fetchClient<{ status: string; message: string }>(`/institutions/${institutionId}`, {
      method: "DELETE",
    });
  },

  // Course Management
  getCourses: async () => {
    return fetchClient<{ status: string; results: number; data: { courses: any[] } }>("/courses", {
      method: "GET",
    }).then((res) => res.data.courses);
  },

  getCourse: async (id: string) => {
    return fetchClient<{ status: string; data: { course: any } }>(`/courses/${id}`, {
      method: "GET",
    }).then((res) => res.data.course);
  },

  createCourse: async (data: any) => {
    return fetchClient<{ status: string; data: { course: any } }>("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCourse: async (id: string, data: any) => {
    return fetchClient<{ status: string; data: { course: any } }>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteCourse: async (id: string) => {
    return fetchClient<{ status: string; message: string }>(`/courses/${id}`, {
      method: "DELETE",
    });
  },
}

// --- Instructor API ---

export const InstructorAPI = {
  // Course Management
  getMyCourses: async () => {
    // Note: Filtering by instructor happens on backend based on authenticated user
    return fetchClient<{ status: string; results: number; data: { courses: any[] } }>("/courses", {
      method: "GET",
    }).then((res) => res.data.courses);
  },

  getCourse: async (id: string) => {
    return fetchClient<{ status: string; data: { course: any } }>(`/courses/${id}`, {
      method: "GET",
    }).then((res) => res.data.course);
  },

  createCourse: async (data: any) => {
    // Add instructor ID from the authenticated user
    // In production, this should come from the JWT token
    const courseData = {
      ...data,
      instructor: "692d7d2937f816954cd90b18", // Hardcoded for development (fixed typo)
      price: data.price || 0, // Ensure price is a number, default to 0
    };

    return fetchClient<{ status: string; data: { course: any } }>("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  },

  updateCourse: async (id: string, data: any) => {
    return fetchClient<{ status: string; data: { course: any } }>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteCourse: async (id: string) => {
    return fetchClient<{ status: string; message: string }>(`/courses/${id}`, {
      method: "DELETE",
    });
  },

  // Video Management
  getMyVideos: async () => {
    return fetchClient<{ videos: any[] }>("/videos?uploadedBy=me", {
      method: "GET",
    }).then((res) => res.videos || []);
  },

  getVideo: async (id: string) => {
    return fetchClient<{ video: any }>(`/videos/${id}`, {
      method: "GET",
    }).then((res) => res.video);
  },

  uploadVideo: async (formData: FormData) => {
    const token = storage.getToken();

    const response = await fetch(`${API_BASE}/videos/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Video upload failed");
    }

    return response.json();
  },

  updateVideo: async (id: string, data: any) => {
    return fetchClient<{ message: string; video: any }>(`/videos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteVideo: async (id: string) => {
    return fetchClient<{ message: string }>(`/videos/${id}`, {
      method: "DELETE",
    });
  },

  // Book Management
  getMyBooks: async () => {
    return fetchClient<{ books: any[] }>("/books?uploadedBy=me", {
      method: "GET",
    }).then((res) => res.books || []);
  },

  getBook: async (id: string) => {
    return fetchClient<{ book: any }>(`/books/${id}`, {
      method: "GET",
    }).then((res) => res.book);
  },

  uploadBook: async (formData: FormData) => {
    const token = storage.getToken();

    const response = await fetch(`${API_BASE}/books/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Book upload failed");
    }

    return response.json();
  },

  deleteBook: async (id: string) => {
    return fetchClient<{ message: string }>(`/books/${id}`, {
      method: "DELETE",
    });
  },

  // Analytics
  getMyAnalytics: async (startDate?: string, endDate?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    // For now, use the general analytics endpoint
    // In production, this should be instructor-specific
    return fetchClient<any>(`/analytics/overview?${query.toString()}`, {
      method: "GET",
    });
  },

  getInstructorStats: async () => {
    return fetchClient<{ totalStudents: number; totalVideoViews: number; totalBookViews: number; totalWatchTime: number; averageCourseRating: number }>("/analytics/instructor", {
      method: "GET",
    });
  },

  // Student Management
  createStudent: async (data: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    institution?: string;
  }) => {
    return fetchClient<{ status: string; token: string; data: { user: any } }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        role: "user", // Students have role 'user'
        isActive: true,
      }),
    });
  },

  // Assignments
  getAssignments: async (courseId?: string, status?: string) => {
    const query = new URLSearchParams();
    if (courseId) query.append("course", courseId);
    if (status) query.append("status", status);
    return fetchClient<{ status: string; results: number; data: { assignments: any[] } }>(
      `/assignments?${query.toString()}`,
      { method: "GET" }
    ).then((res) => res.data.assignments);
  },

  getAssignment: async (id: string) => {
    return fetchClient<{ status: string; data: { assignment: any } }>(`/assignments/${id}`, {
      method: "GET",
    }).then((res) => res.data.assignment);
  },

  createAssignment: async (data: any) => {
    return fetchClient<{ status: string; data: { assignment: any } }>("/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAssignment: async (id: string, data: any) => {
    return fetchClient<{ status: string; data: { assignment: any } }>(`/assignments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteAssignment: async (id: string) => {
    return fetchClient<{ status: string; data: null }>(`/assignments/${id}`, {
      method: "DELETE",
    });
  },

  publishAssignment: async (id: string) => {
    return fetchClient<{ status: string; data: { assignment: any } }>(`/assignments/${id}/publish`, {
      method: "PATCH",
    });
  },

  getSubmissions: async (assignmentId: string) => {
    return fetchClient<{ status: string; results: number; data: { submissions: any[] } }>(
      `/assignments/${assignmentId}/submissions`,
      { method: "GET" }
    ).then((res) => res.data.submissions);
  },

  gradeSubmission: async (assignmentId: string, submissionId: string, data: { grade: number; feedback: string }) => {
    return fetchClient<{ status: string; data: { submission: any } }>(
      `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  // Announcements
  getAnnouncements: async (courseId?: string) => {
    const query = new URLSearchParams();
    if (courseId) query.append("course", courseId);
    return fetchClient<{ status: string; results: number; data: { announcements: any[] } }>(
      `/announcements?${query.toString()}`,
      { method: "GET" }
    ).then((res) => res.data.announcements);
  },

  getAnnouncement: async (id: string) => {
    return fetchClient<{ status: string; data: { announcement: any } }>(`/announcements/${id}`, {
      method: "GET",
    }).then((res) => res.data.announcement);
  },

  createAnnouncement: async (data: any) => {
    return fetchClient<{ status: string; data: { announcement: any } }>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAnnouncement: async (id: string, data: any) => {
    return fetchClient<{ status: string; data: { announcement: any } }>(`/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteAnnouncement: async (id: string) => {
    return fetchClient<{ status: string; data: null }>(`/announcements/${id}`, {
      method: "DELETE",
    });
  },

  togglePinAnnouncement: async (id: string) => {
    return fetchClient<{ status: string; data: { announcement: any } }>(`/announcements/${id}/pin`, {
      method: "PATCH",
    });
  },

  // Q&A (Questions)
  getQuestions: async (courseId?: string, status?: string, search?: string) => {
    const query = new URLSearchParams();
    if (courseId) query.append("course", courseId);
    if (status) query.append("status", status);
    if (search) query.append("search", search);
    return fetchClient<{ status: string; results: number; data: { questions: any[] } }>(
      `/questions?${query.toString()}`,
      { method: "GET" }
    ).then((res) => res.data.questions);
  },

  getQuestion: async (id: string) => {
    return fetchClient<{ status: string; data: { question: any } }>(`/questions/${id}`, {
      method: "GET",
    }).then((res) => res.data.question);
  },

  createQuestion: async (data: any) => {
    return fetchClient<{ status: string; data: { question: any } }>("/questions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateQuestion: async (id: string, data: any) => {
    return fetchClient<{ status: string; data: { question: any } }>(`/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteQuestion: async (id: string) => {
    return fetchClient<{ status: string; data: null }>(`/questions/${id}`, {
      method: "DELETE",
    });
  },

  addAnswer: async (questionId: string, content: string) => {
    return fetchClient<{ status: string; data: { answer: any } }>(`/questions/${questionId}/answers`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  acceptAnswer: async (questionId: string, answerId: string) => {
    return fetchClient<{ status: string; data: { answer: any } }>(
      `/questions/${questionId}/answers/${answerId}/accept`,
      { method: "PATCH" }
    );
  },

  toggleResolveQuestion: async (id: string) => {
    return fetchClient<{ status: string; data: { question: any } }>(`/questions/${id}/resolve`, {
      method: "PATCH",
    });
  },

  upvoteQuestion: async (id: string) => {
    return fetchClient<{ status: string; data: { upvoteCount: number } }>(`/questions/${id}/upvote`, {
      method: "POST",
    });
  },

  upvoteAnswer: async (questionId: string, answerId: string) => {
    return fetchClient<{ status: string; data: { upvoteCount: number } }>(
      `/questions/${questionId}/answers/${answerId}/upvote`,
      { method: "POST" }
    );
  },

  // Settings
  getMySettings: async () => {
    return fetchClient<{ status: string; data: { user: any } }>('/users/settings', {
      method: 'GET',
    }).then(res => res.data.user);
  },

  updateProfile: async (data: any) => {
    return fetchClient<{ status: string; data: { user: any } }>('/users/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateNotificationPreferences: async (data: any) => {
    return fetchClient<{ status: string; data: { notifications: any } }>('/users/settings/notifications', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updatePrivacySettings: async (data: any) => {
    return fetchClient<{ status: string; data: { privacy: any } }>('/users/settings/privacy', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateCourseDefaults: async (data: any) => {
    return fetchClient<{ status: string; data: { courseDefaults: any } }>('/users/settings/course-defaults', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
  }) => {
    return fetchClient<{ status: string; message: string }>('/users/settings/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getStudents: async (courseId?: string) => {
    const query = courseId ? `?courseId=${courseId}` : '';
    return fetchClient<{ status: string; results: number; users: any[] }>(`/courses/my-students${query}`, {
      method: "GET",
    }).then(res => res.users || []); // Returning users array directly
  },
}

// Student API
export const StudentAPI = {
  // Courses
  getEnrolledCourses: async () => {
    return fetchClient<{ status: string; data: { courses: any[] } }>('/students/courses/enrolled')
      .then(res => res.data.courses);
  },

  getAvailableCourses: async () => {
    return fetchClient<{ status: string; data: { courses: any[] } }>('/students/courses/available')
      .then(res => res.data.courses);
  },

  enrollInCourse: async (courseId: string) => {
    return fetchClient<{ status: string; message: string }>(`/students/courses/${courseId}/enroll`, {
      method: 'POST'
    });
  },

  unenrollFromCourse: async (courseId: string) => {
    return fetchClient<{ status: string; message: string }>(`/students/courses/${courseId}/unenroll`, {
      method: 'DELETE'
    });
  },

  getCourseDetail: async (courseId: string) => {
    return fetchClient<{ status: string; data: { course: any } }>(`/students/courses/${courseId}`)
      .then(res => res.data.course);
  },

  // Progress
  getMyProgress: async (courseId?: string) => {
    const url = courseId ? `/students/progress?courseId=${courseId}` : '/students/progress';
    return fetchClient<{ status: string; data: { progress: any[] } }>(url)
      .then(res => res.data.progress);
  },

  updateProgress: async (data: {
    contentType: string;
    contentId: string;
    course?: string;
    progress: number;
    watchTime?: number;
    lastPosition?: number;
  }) => {
    return fetchClient<{ status: string; data: { progress: any } }>('/students/progress', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Assignments
  getMyAssignments: async (filters?: { status?: string; courseId?: string }) => {
    const params = new URLSearchParams(filters as any);
    return fetchClient<{ status: string; data: { assignments: any[] } }>(`/students/assignments?${params}`)
      .then(res => res.data.assignments);
  },

  getAssignment: async (assignmentId: string) => {
    return fetchClient<{ status: string; data: { assignment: any } }>(`/students/assignments/${assignmentId}`)
      .then(res => res.data.assignment);
  },

  getAnnouncements: async () => {
    return fetchClient<{ status: string; data: { announcements: any[] } }>('/announcements', {
      method: 'GET',
    }).then(res => res.data.announcements);
  },

  rateCourse: async (courseId: string, data: { rating: number; comment: string }) => {
    return fetchClient<{ status: string; data: { course: any } }>(`/courses/${courseId}/rate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  submitAssignment: async (assignmentId: string, data: { content: string; attachments: string[] }) => {
    return fetchClient<{ status: string; message: string }>(`/students/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMySubmission: async (assignmentId: string) => {
    return fetchClient<{ status: string; data: { submission: any } }>(`/students/assignments/${assignmentId}/submission`)
      .then(res => res.data.submission);
  },

  // Books/Library
  getAllBooks: async (page = 1, limit = 50) => {
    return fetchClient<{ books: any[]; total: number; pages: number }>(`/books?page=${page}&limit=${limit}`)
      .then(res => ({ books: res.books || [], total: res.total || 0, pages: res.pages || 1 }));
  },

  searchBooks: async (query: string, page = 1, limit = 50) => {
    return fetchClient<any[]>(`/books/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
      .then(res => Array.isArray(res) ? res : []);
  },

  getBook: async (bookId: string) => {
    return fetchClient<any>(`/books/${bookId}`);
  },
};
