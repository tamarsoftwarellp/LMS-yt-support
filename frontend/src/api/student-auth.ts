export interface StudentSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface CurrentStudent {
  id: string;
  email: string;
  mobile: string;
  role: string;
  full_name: string;
  college_id: string;
  college_name: string;
  program_id: string;
  program_name: string;
  current_year: string;
  roll_number?: string;
}

export interface StepRecord {
  step_key: string;
  step_number: number;
  status: "in_progress" | "completed";
  data: Record<string, unknown>;
  updated_at: string;
}

export interface OnboardingProgress {
  current_step: number;
  completed_steps: string[];
  overall_percentage: number;
  steps: StepRecord[];
}

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const ACCESS_KEY = "educonnect_student_access";
const REFRESH_KEY = "educonnect_student_refresh";

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : "Request failed. Please try again.");
  }
  return body as T;
}

function saveSession(session: StudentSession) {
  sessionStorage.setItem(ACCESS_KEY, session.access_token);
  localStorage.setItem(REFRESH_KEY, session.refresh_token);
}

export function hasStudentSession() {
  return Boolean(sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(REFRESH_KEY));
}

export async function loginStudent(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const session = await parse<StudentSession>(response);
  saveSession(session);
  return session;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error("Your session has expired. Please sign in again.");
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const session = await parse<StudentSession>(response);
  saveSession(session);
  return session.access_token;
}

async function authorized<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  let access = sessionStorage.getItem(ACCESS_KEY);
  if (!access) access = await refreshAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${access}`,
      ...init?.headers,
    },
  });
  if (response.status === 401 && retry) {
    await refreshAccessToken();
    return authorized<T>(path, init, false);
  }
  return parse<T>(response);
}

export const studentApiRequest = authorized;

export const getCurrentStudent = () => authorized<CurrentStudent>("/api/v1/auth/me");
export const getOnboarding = () => authorized<OnboardingProgress>("/api/v1/students/me/onboarding");
export const saveOnboardingStep = (stepKey: string, data: Record<string, unknown>, status: "in_progress" | "completed") =>
  authorized<StepRecord>(`/api/v1/students/me/onboarding/${stepKey}`, {
    method: "PUT",
    body: JSON.stringify({ data, status }),
  });

export async function logoutStudent() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (refreshToken) {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => undefined);
  }
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
