import { adminApiRequest } from "./admin-lms";

export interface InstitutionProfile {
  id: string;
  name: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  student_count: number;
  program_count: number;
  website_url?: string | null;
  logo_url?: string | null;
}

export interface InstitutionProfileUpdate {
  contact_name: string;
  contact_phone: string;
  address?: string | null;
}

export interface InstitutionProgram {
  id: string;
  name: string;
  offered: boolean;
  student_count: number;
}

export interface InstitutionStudent {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  mobile: string;
  program_id: string;
  program_name: string;
  current_year: string;
  roll_number: string | null;
  created_at: string;
  is_active: boolean;
  progress_percentage: number;
  enrollment_count: number;
  batch_id?: string | null;
  batch_name?: string | null;
  section_id?: string | null;
  section_name?: string | null;
}
export interface CollegeDashboard {
  student_count: number;
  active_students: number;
  program_count: number;
  faculty_count: number;
  batch_count: number;
  course_allocations: number;
  average_progress: number;
  pending_evaluations: number;
  certificates_issued: number;
}
export interface CollegeFaculty {
  id: string;
  full_name: string;
  email: string;
  mobile?: string | null;
  designation?: string | null;
  department?: string | null;
  is_active: boolean;
  invited_at: string;
  section_count: number;
  course_count: number;
  evaluations_completed: number;
}
export interface CollegeBatch {
  id: string;
  name: string;
  academic_year: string;
  capacity: number;
  is_active: boolean;
  program_id: string;
  program_name: string;
  student_count: number;
  sections: {
    id: string;
    name: string;
    capacity: number;
    is_active: boolean;
    coordinator?: string | null;
  }[];
}
export interface CourseAllocationData {
  catalog: { id: string; title: string; level: string }[];
  allocations: {
    id: string;
    course_id: string;
    course_title: string;
    program_id: string;
    program_name: string;
    batch_name?: string | null;
    faculty_name?: string | null;
    is_active: boolean;
  }[];
}
export interface CollegeProgress {
  student_id: string;
  student_name: string;
  student_email: string;
  roll_number?: string | null;
  current_year: string;
  is_active: boolean;
  program_id: string;
  program_name: string;
  batch_id?: string | null;
  batch_name?: string | null;
  section_id?: string | null;
  section_name?: string | null;
  enrollments: number;
  completed: number;
  average_progress: number;
  at_risk: boolean;
  evaluations_completed: number;
}
export interface CollegeProgressData {
  students: CollegeProgress[];
  groups: {
    type: string;
    id: string;
    name: string;
    students: number;
    at_risk_students: number;
    average_progress: number;
  }[];
  at_risk_count: number;
  summary: {
    total_students: number;
    students_with_enrollments: number;
    completed_students: number;
    average_progress: number;
    at_risk_count: number;
  };
}
export interface StudentProgressLesson {
  lesson_id: string;
  title: string;
  lesson_type: "video" | "article" | "quiz" | "assignment" | "coding_test";
  section_title: string;
  status: string;
  quiz_best_percentage?: number;
  quiz_passed?: boolean;
  assignment_status?: string;
  assignment_marks_awarded?: number;
  coding_passed?: boolean;
  coding_attempts_used?: number;
}
export interface StudentProgressCourse {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  access_type: "college_allocated" | "open_elective";
  college_managed: boolean;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  lessons: StudentProgressLesson[];
}
export interface StudentProgressDetail {
  student_id: string;
  student_name: string;
  courses: StudentProgressCourse[];
}
export interface CollegeCertificates {
  issued: {
    id: string;
    student_name: string;
    course_title: string;
    status: string;
    issued_at: string;
  }[];
  eligible: {
    enrollment_id: string;
    student_name: string;
    course_title: string;
    request_status?: string | null;
  }[];
}

export const getInstitutionProfile = () =>
  adminApiRequest<InstitutionProfile>("/api/v1/admin/institution");
export const updateInstitutionProfile = (payload: InstitutionProfileUpdate) =>
  adminApiRequest<InstitutionProfile>("/api/v1/admin/institution", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const listInstitutionPrograms = () =>
  adminApiRequest<InstitutionProgram[]>("/api/v1/admin/institution/programs");
export const addInstitutionProgram = (programId: string) =>
  adminApiRequest<InstitutionProgram>(
    `/api/v1/admin/institution/programs/${programId}`,
    { method: "POST" },
  );
export const removeInstitutionProgram = (programId: string) =>
  adminApiRequest<void>(`/api/v1/admin/institution/programs/${programId}`, {
    method: "DELETE",
  });
export const listInstitutionStudents = (search?: string) => {
  const query = search?.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";
  return adminApiRequest<InstitutionStudent[]>(
    `/api/v1/admin/institution/students${query}`,
  );
};
export const getCollegeDashboard = () =>
  adminApiRequest<CollegeDashboard>("/api/v1/admin/institution/dashboard");
export const updateCollegeStudent = (
  id: string,
  payload: Record<string, unknown>,
) =>
  adminApiRequest(`/api/v1/admin/institution/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
export const importCollegeStudents = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return adminApiRequest<{
    created: number;
    failed: number;
    errors: { row: number; error: string }[];
  }>("/api/v1/admin/institution/students/import", {
    method: "POST",
    body: form,
    headers: {},
  });
};
export const initiateStudentPasswordReset = (id: string) =>
  adminApiRequest<{ reset_token: string; expires_in_minutes: number }>(
    `/api/v1/admin/institution/students/${id}/password-reset`,
    { method: "POST" },
  );
export interface ManagedEnrollment {
  course_id: string;
  course_title: string;
  enrollment_id?: string | null;
  status: string;
  progress_percentage: number;
}
export const listManagedStudentEnrollments = (studentId: string) =>
  adminApiRequest<ManagedEnrollment[]>(
    `/api/v1/admin/institution/students/${studentId}/enrollments`,
  );
export const enrollManagedStudent = (studentId: string, courseId: string) =>
  adminApiRequest(
    `/api/v1/admin/institution/students/${studentId}/enrollments/${courseId}`,
    { method: "POST" },
  );
export const setManagedEnrollmentStatus = (
  studentId: string,
  enrollmentId: string,
  active: boolean,
) =>
  adminApiRequest(
    `/api/v1/admin/institution/students/${studentId}/enrollments/${enrollmentId}?active=${active}`,
    { method: "PATCH" },
  );
export const uploadCollegeLogo = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return adminApiRequest<{ logo_url: string }>(
    "/api/v1/admin/institution/logo",
    { method: "POST", body: form, headers: {} },
  );
};
export const requestCollegeProfileChange = (payload: Record<string, unknown>) =>
  adminApiRequest("/api/v1/admin/institution/profile-change-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const listCollegeFaculty = () =>
  adminApiRequest<CollegeFaculty[]>("/api/v1/admin/institution/faculty");
export const addCollegeFaculty = (payload: Record<string, unknown>) =>
  adminApiRequest("/api/v1/admin/institution/faculty", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const setCollegeFacultyStatus = (id: string, value: boolean) =>
  adminApiRequest(
    `/api/v1/admin/institution/faculty/${id}/status?is_active=${value}`,
    { method: "PATCH" },
  );
export const listCollegeBatches = () =>
  adminApiRequest<CollegeBatch[]>("/api/v1/admin/institution/batches");
export const addCollegeBatch = (payload: Record<string, unknown>) =>
  adminApiRequest("/api/v1/admin/institution/batches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const addCollegeSection = (
  batchId: string,
  payload: Record<string, unknown>,
) =>
  adminApiRequest(`/api/v1/admin/institution/batches/${batchId}/sections`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const loadCourseAllocations = () =>
  adminApiRequest<CourseAllocationData>(
    "/api/v1/admin/institution/course-allocations",
  );
export const addCourseAllocation = (payload: Record<string, unknown>) =>
  adminApiRequest("/api/v1/admin/institution/course-allocations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const removeCourseAllocation = (id: string) =>
  adminApiRequest(`/api/v1/admin/institution/course-allocations/${id}`, {
    method: "DELETE",
  });
export const restoreCourseAllocation = (id: string) =>
  adminApiRequest(
    `/api/v1/admin/institution/course-allocations/${id}/restore`,
    { method: "PATCH" },
  );
export const loadCollegeProgress = () =>
  adminApiRequest<CollegeProgressData>("/api/v1/admin/institution/progress");
export const loadStudentProgressDetail = (studentId: string) =>
  adminApiRequest<StudentProgressDetail>(`/api/v1/admin/institution/students/${studentId}/progress`);
export const loadCollegeCertificates = () =>
  adminApiRequest<CollegeCertificates>(
    "/api/v1/admin/institution/certificates",
  );
export const requestCollegeCertificate = (id: string) =>
  adminApiRequest(`/api/v1/admin/institution/certificates/request/${id}`, {
    method: "POST",
  });
export const loadCollegeReports = () =>
  adminApiRequest<{
    dashboard: CollegeDashboard;
    programs: { name: string; students: number }[];
    generated_for: string;
  }>("/api/v1/admin/institution/reports");
