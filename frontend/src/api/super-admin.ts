import { adminApiRequest } from "./admin-lms";

export interface Institution {
  id: string;
  name: string;
  status: "pending" | "active" | "suspended" | "rejected";
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  student_count: number;
  admin_count: number;
  created_at: string;
  approved_at: string | null;
  rejected_reason: string | null;
}

export interface InstitutionHistoryEntry {
  action: string;
  reason: string | null;
  performed_by_name: string | null;
  created_at: string;
}

export interface InstitutionDetail extends Institution {
  history: InstitutionHistoryEntry[];
}

export const getStaffRole = () => adminApiRequest<{ role: "admin" | "super_admin" }>("/api/v1/auth/staff/role");
export const getCurrentSuperAdmin = () => adminApiRequest<{ id: string; email: string; mobile: string; role: string }>("/api/v1/auth/super-admin/me");

export const listInstitutions = (status?: string, search?: string) => {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (search?.trim()) query.set("search", search.trim());
  return adminApiRequest<Institution[]>(`/api/v1/super-admin/institutions${query.toString() ? `?${query}` : ""}`);
};

export const getInstitution = (id: string) => adminApiRequest<InstitutionDetail>(`/api/v1/super-admin/institutions/${id}`);
export const approveInstitution = (id: string) => adminApiRequest<Institution>(`/api/v1/super-admin/institutions/${id}/approve`, { method: "POST" });
export const rejectInstitution = (id: string, reason: string) => adminApiRequest<Institution>(`/api/v1/super-admin/institutions/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
export const suspendInstitution = (id: string, reason: string) => adminApiRequest<Institution>(`/api/v1/super-admin/institutions/${id}/suspend`, { method: "POST", body: JSON.stringify({ reason }) });
export const reactivateInstitution = (id: string) => adminApiRequest<Institution>(`/api/v1/super-admin/institutions/${id}/reactivate`, { method: "POST" });
