const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const ACCESS_KEY = "educonnect_admin_access";
const REFRESH_KEY = "educonnect_admin_refresh";

export type CourseStatus = "draft" | "published" | "archived";
export type LessonType = "video" | "article" | "quiz" | "assignment";

export interface AdminSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AdminApiError extends Error {
  issues?: string[];
  detail?: string;
}

export interface AdminCourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration_hours: number;
  skills: string[];
  status: CourseStatus;
  thumbnail_url?: string | null;
  instructor_name?: string | null;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  archived_at?: string | null;
  enrollment_count: number;
  section_count: number;
  lesson_count: number;
}

export interface AdminLesson {
  id: string;
  section_id: string;
  title: string;
  lesson_type: LessonType;
  duration_minutes: number;
  sequence: number;
  youtube_id?: string | null;
  article_content?: string | null;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSection {
  id: string;
  course_id: string;
  title: string;
  sequence: number;
  created_at: string;
  updated_at: string;
  lessons: AdminLesson[];
}

export interface PublicationReadiness {
  is_ready: boolean;
  issues: string[];
}

export interface AdminCourseDetail extends AdminCourseListItem {
  publication_readiness: PublicationReadiness;
  sections: AdminSection[];
}

export interface PaginatedCourses {
  items: AdminCourseListItem[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

export interface CourseInput {
  title: string;
  slug?: string;
  description: string;
  level: string;
  duration_hours: number;
  skills: string[];
  status?: CourseStatus;
  thumbnail_url?: string | null;
  instructor_name?: string | null;
}

export interface CourseUpdateInput {
  title?: string;
  slug?: string;
  description?: string;
  level?: string;
  duration_hours?: number;
  skills?: string[];
  status?: CourseStatus;
  thumbnail_url?: string | null;
  instructor_name?: string | null;
}

export interface SectionInput {
  title: string;
  sequence?: number | null;
}

export interface LessonInput {
  title: string;
  lesson_type: LessonType;
  duration_minutes: number;
  sequence?: number | null;
  youtube_id?: string | null;
  article_content?: string | null;
  is_preview: boolean;
}

export interface ReorderInput {
  ids: string[];
}

export interface AdminQuizOption { id?:string; option_text:string; is_correct:boolean; sequence?:number }
export interface AdminQuizQuestion { id?:string; question_text:string; question_type:"single_choice"|"multiple_choice"|"true_false"; marks:number; explanation?:string|null; sequence?:number; options:AdminQuizOption[] }
export interface AdminQuiz { id:string; lesson_id:string; instructions:string; passing_percentage:number; maximum_attempts:number; time_limit_minutes?:number|null; show_explanations:boolean; status:"draft"|"published"; questions:AdminQuizQuestion[] }
export type AdminQuizInput = Omit<AdminQuiz,"id"|"lesson_id"|"status">;
export interface AdminAssignment { id:string;lesson_id:string;instructions:string;maximum_marks:number;passing_marks:number;maximum_attempts:number;allowed_submission_types:("file"|"text"|"link")[];allowed_file_extensions:("pdf"|"docx"|"zip")[];maximum_file_size_mb:number;due_at?:string|null;allow_late_submission:boolean;allow_resubmission:boolean;status:"draft"|"published" }
export type AdminAssignmentInput = Omit<AdminAssignment,"id"|"lesson_id"|"status">;
export interface AssignmentEvaluation {id:string;marks_awarded:number;decision:"passed"|"failed"|"resubmission_required";feedback?:string|null;evaluated_at:string}
export interface AdminAssignmentSubmission {id:string;assignment_id:string;enrollment_id:string;attempt_number:number;status:string;text_content?:string|null;link_url?:string|null;original_file_name?:string|null;has_file:boolean;is_late:boolean;submitted_at:string;evaluation?:AssignmentEvaluation|null;student:{id:string;full_name:string;email:string};assignment_title:string;course_title:string}
export interface AdminAnalyticsOverview {summary:{total_students:number;active_learners:number;total_courses:number;published_courses:number;draft_courses:number;archived_courses:number;total_enrollments:number;course_completion_rate:number;average_quiz_score:number;pending_assignment_evaluations:number;video_learning_minutes:number};course_performance:{course_id:string;title:string;status:string;enrollment_count:number;completion_rate:number;average_progress:number}[];recent_activity:{type:string;user_id:string;seconds_delta:number;occurred_at:string;data?:Record<string,unknown>|null}[]}
export interface AdminCertificate {id:string;certificate_number:string;verification_token:string;student_name:string;course_title:string;status:"issued"|"revoked"|"superseded";issued_at:string;revoked_at?:string|null;revocation_reason?:string|null;events:{type:string;details:Record<string,unknown>;created_at:string}[]}

function saveSession(session: AdminSession) {
  sessionStorage.setItem(ACCESS_KEY, session.access_token);
  localStorage.setItem(REFRESH_KEY, session.refresh_token);
}

export function hasAdminSession() {
  return Boolean(sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(REFRESH_KEY));
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const validationDetail = Array.isArray(body?.detail) ? body.detail.map((item: { msg?: string }) => item?.msg).filter(Boolean).join("; ") : "";
    const message = typeof body?.detail === "string" ? body.detail : validationDetail || "Request failed. Please try again.";
    const err = new Error(message) as AdminApiError;
    if (Array.isArray(body?.issues)) err.issues = body.issues;
    if (typeof body?.detail === "string") err.detail = body.detail;
    throw err;
  }
  return body as T;
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const session = await parseResponse<AdminSession>(response);
  saveSession(session);
  return session;
}

async function refreshAdminAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error("Your admin session has expired. Please sign in again.");
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const session = await parseResponse<AdminSession>(response);
  saveSession(session);
  return session.access_token;
}

async function authorized<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  let access = sessionStorage.getItem(ACCESS_KEY);
  if (!access) access = await refreshAdminAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${access}`,
      ...init?.headers,
    },
  });
  if (response.status === 401 && retry) {
    await refreshAdminAccessToken();
    return authorized<T>(path, init, false);
  }
  return parseResponse<T>(response);
}

export const adminApiRequest = authorized;

export async function logoutAdmin() {
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

export interface LoadCoursesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CourseStatus | "all";
  level?: string;
}

export const loadCourses = (params: LoadCoursesParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("page_size", String(params.pageSize));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.level?.trim()) query.set("level", params.level.trim());
  return adminApiRequest<PaginatedCourses>(`/api/v1/admin/courses${query.toString() ? `?${query.toString()}` : ""}`);
};

export const loadCourse = (courseId: string) => adminApiRequest<AdminCourseDetail>(`/api/v1/admin/courses/${courseId}`);
export const loadPublicationReadiness = (courseId: string) => adminApiRequest<PublicationReadiness>(`/api/v1/admin/courses/${courseId}/publication-readiness`);
export const createCourse = (payload: CourseInput) => adminApiRequest<AdminCourseDetail>("/api/v1/admin/courses", { method: "POST", body: JSON.stringify(payload) });
export const updateCourse = (courseId: string, payload: CourseUpdateInput) => adminApiRequest<AdminCourseDetail>(`/api/v1/admin/courses/${courseId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteCourse = (courseId: string) => adminApiRequest<{ detail: string }>(`/api/v1/admin/courses/${courseId}`, { method: "DELETE" });
export const publishCourse = (courseId: string) => adminApiRequest<AdminCourseDetail>(`/api/v1/admin/courses/${courseId}/publish`, { method: "POST" });
export const archiveCourse = (courseId: string) => adminApiRequest<AdminCourseDetail>(`/api/v1/admin/courses/${courseId}/archive`, { method: "POST" });
export const restoreCourse = (courseId: string) => adminApiRequest<AdminCourseDetail>(`/api/v1/admin/courses/${courseId}/restore`, { method: "POST" });
export const createSection = (courseId: string, payload: SectionInput) => adminApiRequest<AdminSection>(`/api/v1/admin/courses/${courseId}/sections`, { method: "POST", body: JSON.stringify(payload) });
export const updateSection = (sectionId: string, payload: SectionInput) => adminApiRequest<AdminSection>(`/api/v1/admin/sections/${sectionId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteSection = (sectionId: string) => adminApiRequest<{ detail: string }>(`/api/v1/admin/sections/${sectionId}`, { method: "DELETE" });
export const reorderSections = (courseId: string, payload: ReorderInput) => adminApiRequest<AdminCourseDetail>(`/api/v1/admin/courses/${courseId}/sections/reorder`, { method: "PUT", body: JSON.stringify(payload) });
export const createLesson = (sectionId: string, payload: LessonInput) => adminApiRequest<AdminLesson>(`/api/v1/admin/sections/${sectionId}/lessons`, { method: "POST", body: JSON.stringify(payload) });
export const updateLesson = (lessonId: string, payload: LessonInput) => adminApiRequest<AdminLesson>(`/api/v1/admin/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteLesson = (lessonId: string) => adminApiRequest<{ detail: string }>(`/api/v1/admin/lessons/${lessonId}`, { method: "DELETE" });
export const reorderLessons = (sectionId: string, payload: ReorderInput) => adminApiRequest<AdminSection>(`/api/v1/admin/sections/${sectionId}/lessons/reorder`, { method: "PUT", body: JSON.stringify(payload) });
export const loadAdminQuiz = (lessonId:string) => adminApiRequest<AdminQuiz|null>(`/api/v1/admin/lessons/${lessonId}/quiz`);
export const saveAdminQuiz = (lessonId:string,payload:AdminQuizInput) => adminApiRequest<AdminQuiz>(`/api/v1/admin/lessons/${lessonId}/quiz`,{method:"PUT",body:JSON.stringify(payload)});
export const publishAdminQuiz = (quizId:string) => adminApiRequest<AdminQuiz>(`/api/v1/admin/quizzes/${quizId}/publish`,{method:"POST"});
export const loadAdminAssignment = (lessonId:string) => adminApiRequest<AdminAssignment|null>(`/api/v1/admin/lessons/${lessonId}/assignment`);
export const saveAdminAssignment = (lessonId:string,payload:AdminAssignmentInput) => adminApiRequest<AdminAssignment>(`/api/v1/admin/lessons/${lessonId}/assignment`,{method:"PUT",body:JSON.stringify(payload)});
export const publishAdminAssignment = (assignmentId:string) => adminApiRequest<AdminAssignment>(`/api/v1/admin/assignments/${assignmentId}/publish`,{method:"POST"});
export const loadAssignmentSubmissions = () => adminApiRequest<AdminAssignmentSubmission[]>("/api/v1/admin/assignment-submissions");
export const evaluateAssignmentSubmission = (submissionId:string,payload:{marks_awarded:number;decision:"passed"|"failed"|"resubmission_required";feedback?:string}) => adminApiRequest<AdminAssignmentSubmission>(`/api/v1/admin/assignment-submissions/${submissionId}/evaluate`,{method:"POST",body:JSON.stringify(payload)});
export const loadAdminAnalytics = (days=30) => adminApiRequest<AdminAnalyticsOverview>(`/api/v1/admin/analytics/overview?days=${days}`);
export const loadAdminCertificates = (search="",status="") => {const query=new URLSearchParams();if(search.trim())query.set("search",search.trim());if(status)query.set("status",status);return adminApiRequest<AdminCertificate[]>(`/api/v1/admin/certificates${query.toString()?`?${query}`:""}`);};
export const revokeCertificate = (id:string,reason:string) => adminApiRequest<AdminCertificate>(`/api/v1/admin/certificates/${id}/revoke`,{method:"POST",body:JSON.stringify({reason})});
export const reissueCertificate = (id:string) => adminApiRequest<AdminCertificate>(`/api/v1/admin/certificates/${id}/reissue`,{method:"POST"});
export async function downloadAssignmentSubmissionFile(submissionId:string,fileName:string){let access=sessionStorage.getItem(ACCESS_KEY);if(!access)access=await refreshAdminAccessToken();let response=await fetch(`${API_URL}/api/v1/admin/assignment-submissions/${submissionId}/file`,{headers:{Authorization:`Bearer ${access}`}});if(response.status===401){access=await refreshAdminAccessToken();response=await fetch(`${API_URL}/api/v1/admin/assignment-submissions/${submissionId}/file`,{headers:{Authorization:`Bearer ${access}`}});}if(!response.ok)throw new Error("Unable to download submission file.");const url=URL.createObjectURL(await response.blob());const anchor=document.createElement("a");anchor.href=url;anchor.download=fileName;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
