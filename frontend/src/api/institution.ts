export interface InstitutionRegisterPayload {
  college_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  admin_full_name: string;
  admin_email: string;
  admin_mobile: string;
  admin_password: string;
}

export interface InstitutionRegisterResult {
  college_id: string;
  status: string;
  message: string;
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
        ? detail.map((item: { msg: string }) => item.msg).join(", ")
        : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return body as T;
}

export const registerInstitution = (payload: InstitutionRegisterPayload) =>
  request<InstitutionRegisterResult>("/api/v1/institutions/register", { method: "POST", body: JSON.stringify(payload) });
