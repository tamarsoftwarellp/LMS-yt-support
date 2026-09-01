import { adminApiRequest } from "./admin-lms";

export interface InstitutionProfile {
  id: string; name: string; status: string;
  contact_name: string | null; contact_email: string | null; contact_phone: string | null; address: string | null;
  student_count: number; program_count: number;
}

export interface InstitutionProfileUpdate {
  contact_name: string; contact_email: string; contact_phone: string; address?: string | null;
}

export interface InstitutionProgram { id: string; name: string; offered: boolean; student_count: number }

export interface InstitutionStudent {
  full_name: string; email: string; mobile: string; program_name: string;
  current_year: string; roll_number: string | null; created_at: string;
}

export const getInstitutionProfile = () => adminApiRequest<InstitutionProfile>("/api/v1/admin/institution");
export const updateInstitutionProfile = (payload: InstitutionProfileUpdate) =>
  adminApiRequest<InstitutionProfile>("/api/v1/admin/institution", { method: "PUT", body: JSON.stringify(payload) });
export const listInstitutionPrograms = () => adminApiRequest<InstitutionProgram[]>("/api/v1/admin/institution/programs");
export const addInstitutionProgram = (programId: string) => adminApiRequest<InstitutionProgram>(`/api/v1/admin/institution/programs/${programId}`, { method: "POST" });
export const removeInstitutionProgram = (programId: string) => adminApiRequest<void>(`/api/v1/admin/institution/programs/${programId}`, { method: "DELETE" });
export const listInstitutionStudents = (search?: string) => {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return adminApiRequest<InstitutionStudent[]>(`/api/v1/admin/institution/students${query}`);
};
