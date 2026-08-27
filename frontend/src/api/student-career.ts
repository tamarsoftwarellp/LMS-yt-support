import { studentApiRequest } from "./student-auth";

export type Level = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export interface StudentSkill { id?: string; name: string; category: string; proficiency_level: Level; experience_months?: number | null; source?: string }
export interface CareerGoal { id?: string; target_role: string; preferred_domain: string; current_level: "Beginner" | "Intermediate" | "Advanced"; target_duration_months: number; weekly_learning_hours: number; goal_description?: string; updated_at?: string }
export interface ResumeInfo { id: string; file_name: string; file_size: number; parsing_status: string; parsed_data: { detected_skills?: string[] }; processing_error?: string; uploaded_at: string }
export interface Recommendation { course_id: string; phase_sequence: number; title: string; description: string; level: string; duration_hours: number; matched_skills: string[]; match_score: number; reason: string; is_enrolled?: boolean; enrollment_id?: string | null; progress_percentage?: number }
export interface Roadmap { id: string; title: string; summary: string; duration_weeks: number; skill_gaps: { skill: string; priority: string; reason: string }[]; phases: { sequence: number; title: string; duration_weeks: number; objective: string; skills: string[]; milestones: string[]; projects: { title: string; description: string }[] }[]; recommendations: Recommendation[]; version: number; generated_at: string }
export interface Enrollment { id: string; course_id: string; title: string; description: string; level: string; duration_hours: number; status: string; progress_percentage: number; lesson_count: number; completed_lessons: number; enrolled_at: string }
export interface CourseLesson { id:string; title:string; lesson_type:"video"|"article"|"quiz"|"assignment"; duration_minutes:number; sequence:number; youtube_id?:string|null; article_content?:string|null; is_preview:boolean; status:string; last_position_seconds:number }
export interface EnrolledCourse { id:string; title:string; description:string; level:string; duration_hours:number; skills:string[]; enrollment_id:string; progress_percentage:number; sections:{id:string;title:string;sequence:number;lessons:CourseLesson[]}[] }
export interface StudentQuiz { id:string;lesson_id:string;instructions:string;passing_percentage:number;maximum_attempts:number;attempts_used:number;remaining_attempts:number;time_limit_minutes?:number|null;best_percentage:number;passed:boolean;questions:{id:string;question_text:string;question_type:"single_choice"|"multiple_choice"|"true_false";marks:number;sequence:number;options:{id:string;option_text:string;sequence:number}[]}[] }
export interface QuizResult {attempt_id:string;earned_marks:number;total_marks:number;percentage:number;passed:boolean;attempt_number:number}

export const loadSkills = () => studentApiRequest<StudentSkill[]>("/api/v1/students/me/skills");
export const saveSkills = (skills: StudentSkill[]) => studentApiRequest<StudentSkill[]>("/api/v1/students/me/skills", { method: "PUT", body: JSON.stringify(skills) });
export const loadGoal = () => studentApiRequest<CareerGoal | null>("/api/v1/students/me/career-goal");
export const saveGoal = (goal: CareerGoal) => studentApiRequest<CareerGoal>("/api/v1/students/me/career-goal", { method: "PUT", body: JSON.stringify(goal) });
export const loadResume = () => studentApiRequest<ResumeInfo | null>("/api/v1/students/me/resume");
export const uploadResume = (file: File) => {
  const form = new FormData(); form.append("file", file);
  return studentApiRequest<ResumeInfo>("/api/v1/students/me/resume", { method: "POST", body: form, headers: {} });
};
export const loadRoadmap = () => studentApiRequest<Roadmap | null>("/api/v1/students/me/roadmaps/current");
export const generateRoadmap = () => studentApiRequest<Roadmap>("/api/v1/students/me/roadmaps/generate", { method: "POST" });
export const enrollCourse = (courseId: string, roadmapId: string) => studentApiRequest(`/api/v1/students/me/courses/${courseId}/enroll?roadmap_id=${roadmapId}`, { method: "POST" });
export const loadEnrollments = () => studentApiRequest<Enrollment[]>("/api/v1/students/me/enrollments");
export const loadEnrolledCourse = (courseId:string) => studentApiRequest<EnrolledCourse>(`/api/v1/students/me/courses/${courseId}`);
export const saveLessonProgress = (enrollmentId:string, lessonId:string, status:"in_progress"|"completed", watchedSeconds=0, lastPositionSeconds=0) =>
  studentApiRequest<{progress_percentage:number}>(`/api/v1/students/me/enrollments/${enrollmentId}/lessons/${lessonId}/progress`, {method:"PUT", body:JSON.stringify({status,watched_seconds:watchedSeconds,last_position_seconds:lastPositionSeconds})});
export const loadStudentQuiz = (lessonId:string) => studentApiRequest<StudentQuiz>(`/api/v1/students/me/lessons/${lessonId}/quiz`);
export const startQuizAttempt = (quizId:string) => studentApiRequest<{id:string;attempt_number:number}>(`/api/v1/students/me/quizzes/${quizId}/attempts`,{method:"POST"});
export const submitQuizAttempt = (attemptId:string,answers:{question_id:string;selected_option_ids:string[]}[]) => studentApiRequest<QuizResult>(`/api/v1/students/me/quiz-attempts/${attemptId}/submit`,{method:"POST",body:JSON.stringify({answers})});
