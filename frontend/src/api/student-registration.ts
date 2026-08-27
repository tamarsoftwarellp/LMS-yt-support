export interface MasterOption {
  id: string;
  name: string;
}

export interface StudentRegistrationPayload {
  full_name: string;
  email: string;
  mobile: string;
  password: string;
  college_id: string;
  program_id: string;
  current_year: string;
  roll_number?: string;
  accept_terms: boolean;
}

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    const message = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => item.msg).join(", ")
        : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return body as T;
}

export const getColleges = () => request<MasterOption[]>("/api/v1/masters/colleges");

export const getPrograms = (collegeId: string) =>
  request<MasterOption[]>(`/api/v1/masters/colleges/${collegeId}/programs`);

export const registerStudent = (payload: StudentRegistrationPayload) =>
  request<{ user_id: string; student_profile_id: string; full_name: string; email: string; created_at: string; message: string }>(
    "/api/v1/auth/student/register",
    { method: "POST", body: JSON.stringify(payload) },
  );

