import { useEffect, useState } from "react";
import { CoursePlayer } from "./course-player";
import type { CourseData } from "./course-player";
import { LiveAssignment, LiveQuiz, Notice } from "./learning-shared";
import {
  BookOpen, LayoutDashboard, GraduationCap, ClipboardList,
  BarChart2, Award, ArrowLeft, Search, Play, CheckCircle2,
  Clock, ChevronRight, ChevronDown, Flame,
  Download, RefreshCw,
  Trophy, Activity, ArrowRight, Users, LogOut, UserRound,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { getCurrentStudent, studentDownload } from "../api/student-auth";
import type { CurrentStudent } from "../api/student-auth";
import {
  enrollCourse, loadCertificates, loadCourseCatalog, loadEnrolledCourse, loadEnrollments,
  loadMyAssignments, loadSkills, loadStudentDashboard, generateCertificate, saveLessonProgress,
} from "../api/student-career";
import type {
  CatalogCourse, Certificate, EnrolledCourse, Enrollment, MyAssignment, StudentDashboard, StudentSkill,
} from "../api/student-career";

type LMSSection = "dashboard" | "my-courses" | "catalog" | "assignments" | "progress" | "certificates";
const LMS_SECTION_PATH: Record<LMSSection, string> = {
  dashboard: "/lms/dashboard", "my-courses": "/lms/my-courses", catalog: "/lms/catalog",
  assignments: "/lms/assignments", progress: "/lms/progress", certificates: "/lms/certificates",
};
function lmsSectionFromPath(pathname: string): LMSSection {
  return (Object.entries(LMS_SECTION_PATH) as [LMSSection, string][]).find(([, path]) => pathname === path)?.[0] || "dashboard";
}
const LMS_NAV: { key: LMSSection; icon: React.ElementType; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "my-courses", icon: BookOpen, label: "My Courses" },
  { key: "catalog", icon: GraduationCap, label: "Catalog" },
  { key: "assignments", icon: ClipboardList, label: "Assignments" },
  { key: "progress", icon: BarChart2, label: "Progress" },
  { key: "certificates", icon: Award, label: "Certificates" },
];
const levelColor: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-red-50 text-red-600 border-red-200",
};
const PROFICIENCY_SCORE: Record<string, number> = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function LMSDashboard({ onOpenCourse, onSection }: { onOpenCourse: (courseId: string) => void; onSection: (s: LMSSection) => void }) {
  const [student, setStudent] = useState<CurrentStudent | null>(null);
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [assignments, setAssignments] = useState<MyAssignment[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getCurrentStudent(), loadStudentDashboard(), loadMyAssignments()])
      .then(([s, d, a]) => { setStudent(s); setData(d); setAssignments(a); })
      .catch(e => setError(e instanceof Error ? e.message : "Unable to load dashboard"));
  }, []);
  if (error) return <Notice error={error} />;
  if (!data) return <div className="py-16 flex items-center justify-center gap-2 text-[13px] text-[#5A6A8A]"><RefreshCw size={15} className="animate-spin" />Loading dashboard…</div>;
  const s = data.summary;
  const pendingDeadlines = assignments.filter(a => a.status === "not_submitted" || a.status === "resubmission_required").slice(0, 3);
  const totalMins = data.weekly_activity.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0A1629] to-[#1B3A6B] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/60 text-[12.5px] mb-1">Welcome back, {student?.full_name?.split(" ")[0] || "Student"} 👋</p>
            <h2 className="text-[22px] font-bold" style={{ fontFamily: "var(--font-serif)" }}>Continue your learning streak</h2>
            <p className="text-white/60 text-[13px] mt-1">You've learned <span className="text-amber-400 font-bold">{Math.floor(totalMins / 60)}h {totalMins % 60}m</span> this week. Keep it up!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-4 py-2.5 rounded-xl">
              <Flame size={18} className="text-amber-400" />
              <div><p className="text-[20px] font-bold text-amber-400" style={{ fontFamily: "var(--font-serif)" }}>{s.learning_streak_days}</p><p className="text-[10px] text-amber-300/70 leading-none">day streak</p></div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2.5 rounded-xl">
              <Trophy size={18} className="text-emerald-400" />
              <div><p className="text-[20px] font-bold text-emerald-400" style={{ fontFamily: "var(--font-serif)" }}>{s.quiz_average_percentage}%</p><p className="text-[10px] text-white/50 leading-none">quiz average</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Courses Enrolled", value: s.enrolled_courses, icon: BookOpen, color: "#1B3A6B" },
          { label: "Lessons Completed", value: `${s.completed_lessons}/${s.total_lessons}`, icon: CheckCircle2, color: "#059669" },
          { label: "Hours Learned", value: `${Math.round(s.learning_minutes / 60)}h`, icon: Clock, color: "#D97706" },
          { label: "Pending Assignments", value: s.pending_assignments, icon: ClipboardList, color: "#7C3AED" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.color + "18" }}><k.icon size={18} style={{ color: k.color }} /></div>
            <div><p className="text-[22px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{k.value}</p><p className="text-[11.5px] text-[#5A6A8A]">{k.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-bold text-[#0F1C3F]">Continue Learning</p>
            <button onClick={() => onSection("my-courses")} className="text-[12px] text-[#1B3A6B] font-medium hover:underline flex items-center gap-1">All Courses <ArrowRight size={12} /></button>
          </div>
          {data.next_action ? (
            <button onClick={() => onOpenCourse(data.next_action!.course_id)} className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-[#F4F7FC] transition-colors border border-[rgba(27,58,107,0.07)] text-left">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EBF1FA] shrink-0"><BookOpen size={20} className="text-[#1B3A6B]" /></div>
              <div className="flex-1 min-w-0"><p className="text-[13.5px] font-semibold text-[#0F1C3F] truncate">{data.next_action.course_title}</p><p className="text-[11.5px] text-[#5A6A8A] truncate">Next: {data.next_action.title}</p></div>
              <ChevronRight size={16} className="text-[#9AA5BE] shrink-0" />
            </button>
          ) : <p className="text-[13px] text-[#5A6A8A] py-6 text-center">Enroll in a course to begin your learning journey.</p>}
        </div>
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <p className="text-[14px] font-bold text-[#0F1C3F] mb-1">This Week</p>
          <p className="text-[12px] text-[#5A6A8A] mb-3">Minutes learned per day</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.weekly_activity.map(d => ({ day: new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }), minutes: d.minutes }))} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9AA5BE" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9AA5BE" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E8ECF5" }} formatter={(v: number) => [`${v}m`, "Time"]} />
              <Bar dataKey="minutes" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-[rgba(27,58,107,0.06)] flex items-center justify-between">
            <span className="text-[12px] text-[#5A6A8A]">Total</span>
            <span className="text-[14px] font-bold text-[#1B3A6B]" style={{ fontFamily: "var(--font-mono)" }}>{Math.floor(totalMins / 60)}h {totalMins % 60}m</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-bold text-[#0F1C3F]">Upcoming Assignments</p>
          <button onClick={() => onSection("assignments")} className="text-[12px] text-[#1B3A6B] font-medium hover:underline">View All</button>
        </div>
        {pendingDeadlines.length ? pendingDeadlines.map((a, i) => (
          <div key={a.assignment_id} className={`flex items-start gap-3 py-3 ${i < pendingDeadlines.length - 1 ? "border-b border-[rgba(27,58,107,0.06)]" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5"><ClipboardList size={14} className="text-red-500" /></div>
            <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold text-[#0F1C3F] truncate">{a.lesson_title}</p><p className="text-[11.5px] text-[#5A6A8A] truncate">{a.course_title}</p></div>
            <div className="text-right shrink-0"><p className="text-[12px] font-semibold text-red-500">{a.due_at ? new Date(a.due_at).toLocaleDateString() : "No due date"}</p><p className="text-[11px] text-[#9AA5BE]">{a.maximum_marks} marks</p></div>
          </div>
        )) : <p className="text-[13px] text-[#5A6A8A] py-4 text-center">No pending assignments — you're all caught up.</p>}
      </div>
    </div>
  );
}

// ─── MY COURSES ───────────────────────────────────────────────────────────────
function MyCourses({ onOpenCourse, onCatalog }: { onOpenCourse: (courseId: string) => void; onCatalog: () => void }) {
  const [items, setItems] = useState<Enrollment[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { loadEnrollments().then(setItems).catch(e => setError(e instanceof Error ? e.message : "Unable to load courses")).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="py-16 flex items-center justify-center gap-2 text-[13px] text-[#5A6A8A]"><RefreshCw size={15} className="animate-spin" />Loading your courses…</div>;
  if (error) return <Notice error={error} />;
  if (!items.length) return <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl"><BookOpen size={28} className="mx-auto text-[#9AA5BE]" /><p className="mt-3 text-[13px] text-[#5A6A8A]">You haven't enrolled in any course yet.</p><button onClick={onCatalog} className="mt-4 px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[12.5px] font-semibold">Browse Catalog</button></div>;
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map(c => (
      <button key={c.id} onClick={() => onOpenCourse(c.course_id)} className="p-5 border border-[rgba(27,58,107,0.1)] rounded-2xl bg-white text-left hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF1FA] flex items-center justify-center shrink-0"><BookOpen size={17} className="text-[#1B3A6B]" /></div>
          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border shrink-0 ${levelColor[c.level] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{c.level}</span>
        </div>
        <h3 className="text-[14.5px] font-semibold text-[#0F1C3F] mt-3">{c.title}</h3>
        <p className="text-[11.5px] text-[#5A6A8A] mt-1">{c.completed_lessons}/{c.lesson_count} lessons · {c.duration_hours}h</p>
        <div className="h-1.5 bg-[#E8ECF5] rounded-full mt-3"><div className="h-full bg-[#1B3A6B] rounded-full" style={{ width: `${c.progress_percentage}%` }} /></div>
        <div className="flex items-center justify-between mt-2"><span className="text-[11px] text-[#5A6A8A]">{c.status === "completed" ? "Completed" : "In progress"}</span><span className="text-[11px] font-semibold text-[#1B3A6B]">{c.progress_percentage}%</span></div>
      </button>
    ))}
  </div>;
}

// ─── CATALOG ────────────────────────────────────────────────────────────────
function Catalog({ onEnrolled, onOpenCourse }: { onEnrolled: () => void; onOpenCourse: (courseId: string) => void }) {
  const [search, setSearch] = useState(""); const [level, setLevel] = useState("");
  const [data, setData] = useState<{ items: CatalogCourse[]; levels: string[] } | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [enrolling, setEnrolling] = useState("");
  const load = () => { setLoading(true); setError(""); loadCourseCatalog({ search, level }).then(setData).catch(e => setError(e instanceof Error ? e.message : "Unable to load catalog")).finally(() => setLoading(false)); };
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [search, level]);
  const enroll = async (course: CatalogCourse) => {
    setEnrolling(course.id); setError("");
    try { await enrollCourse(course.id); onEnrolled(); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Enrollment failed"); }
    finally { setEnrolling(""); }
  };
  return <div className="space-y-5">
    <div className="flex items-center justify-between mb-1"><div><h2 className="text-[20px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>Course Catalog</h2><p className="text-[13px] text-[#5A6A8A]">{data ? `${data.items.length} course${data.items.length === 1 ? "" : "s"} available` : ""}</p></div></div>
    <Notice error={error} />
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-xs"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" className="w-full pl-9 pr-3 py-2 bg-white border border-[rgba(27,58,107,0.15)] rounded-xl text-[13px] text-[#0F1C3F] outline-none focus:border-[#1B3A6B]" /></div>
      {data && data.levels.length > 0 && <div className="flex gap-2 flex-wrap">
        <button onClick={() => setLevel("")} className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border ${!level ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "bg-white text-[#5A6A8A] border-[rgba(27,58,107,0.15)]"}`}>All Levels</button>
        {data.levels.map(l => <button key={l} onClick={() => setLevel(l)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border ${level === l ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "bg-white text-[#5A6A8A] border-[rgba(27,58,107,0.15)]"}`}>{l}</button>)}
      </div>}
    </div>
    {loading ? <div className="py-16 flex items-center justify-center gap-2 text-[13px] text-[#5A6A8A]"><RefreshCw size={15} className="animate-spin" />Loading courses…</div>
    : data && data.items.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{data.items.map(c => (
      <div key={c.id} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start"><div className="w-10 h-10 rounded-xl bg-[#EBF1FA] flex items-center justify-center"><BookOpen size={17} className="text-[#1B3A6B]" /></div><span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${levelColor[c.level] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{c.level}</span></div>
          <p className="text-[13.5px] font-bold text-[#0F1C3F] mt-3 mb-0.5 line-clamp-2 leading-snug">{c.title}</p>
          {c.instructor_name && <p className="text-[11.5px] text-[#5A6A8A] mb-2">by {c.instructor_name}</p>}
          <div className="flex items-center gap-2 mb-2 flex-wrap text-[11.5px] text-[#5A6A8A]"><span className="flex items-center gap-1"><Users size={10} />{c.enrollment_count} enrolled</span><span className="text-[#CBD5E1]">·</span><span className="flex items-center gap-1"><Clock size={10} />{c.duration_hours}h</span></div>
          <div className="flex gap-1.5 flex-wrap mb-3">{c.skills.slice(0, 3).map(s => <span key={s} className="px-2 py-0.5 bg-[#EBF1FA] text-[#1B3A6B] text-[10.5px] rounded-full font-medium">{s}</span>)}{c.skills.length > 3 && <span className="text-[10.5px] text-[#9AA5BE]">+{c.skills.length - 3}</span>}</div>
          {c.is_enrolled
            ? <button onClick={() => onOpenCourse(c.id)} className="w-full py-2 text-[12.5px] font-semibold rounded-xl bg-[#1B3A6B] text-white flex items-center justify-center gap-1.5"><Play size={12} />Continue</button>
            : <div className="flex gap-2">
                <button disabled={enrolling === c.id} onClick={() => enroll(c)} className="flex-1 py-2 text-[12.5px] font-semibold rounded-xl border-2 text-[#1B3A6B] border-[#1B3A6B] hover:bg-[#EBF1FA] disabled:opacity-50">{enrolling === c.id ? "Enrolling…" : "Enroll"}</button>
                <button onClick={() => onOpenCourse(c.id)} className="px-3 py-2 text-[12.5px] font-semibold rounded-xl text-[#5A6A8A] hover:bg-[#F4F7FC]" title="Preview free lessons">Preview</button>
              </div>}
        </div>
      </div>
    ))}</div> : !error ? <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl"><BookOpen size={28} className="mx-auto text-[#9AA5BE]" /><p className="mt-3 text-[13px] text-[#5A6A8A]">No courses match your filters.</p></div> : null}
  </div>;
}

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────
function AssignmentsSection({ onOpenCourse }: { onOpenCourse: (courseId: string) => void }) {
  const [items, setItems] = useState<MyAssignment[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { loadMyAssignments().then(setItems).catch(e => setError(e instanceof Error ? e.message : "Unable to load assignments")).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="py-16 flex items-center justify-center gap-2 text-[13px] text-[#5A6A8A]"><RefreshCw size={15} className="animate-spin" />Loading assignments…</div>;
  if (error) return <Notice error={error} />;
  if (!items.length) return <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl"><ClipboardList size={28} className="mx-auto text-[#9AA5BE]" /><p className="mt-3 text-[13px] text-[#5A6A8A]">No assignments yet — enroll in a course to see them here.</p></div>;
  const statusStyle: Record<string, string> = { not_submitted: "bg-red-50 text-red-600", submitted: "bg-blue-50 text-blue-600", evaluated: "bg-emerald-50 text-emerald-700", resubmission_required: "bg-amber-50 text-amber-700" };
  const statusLabel: Record<string, string> = { not_submitted: "Pending", submitted: "Submitted", evaluated: "Evaluated", resubmission_required: "Resubmit" };
  return <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] shadow-sm overflow-hidden divide-y divide-[rgba(27,58,107,0.06)]">
    {items.map(a => (
      <button key={a.assignment_id} onClick={() => onOpenCourse(a.course_id)} className="w-full flex items-center gap-4 p-4 hover:bg-[#F8FAFB] text-left">
        <div className="w-9 h-9 rounded-lg bg-[#EBF1FA] flex items-center justify-center shrink-0"><ClipboardList size={15} className="text-[#1B3A6B]" /></div>
        <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold text-[#0F1C3F] truncate">{a.lesson_title}</p><p className="text-[11.5px] text-[#5A6A8A] truncate">{a.course_title}</p></div>
        <div className="text-right shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold ${statusStyle[a.status]}`}>{statusLabel[a.status]}</span>
          <p className="text-[11px] text-[#9AA5BE] mt-1">{a.evaluation ? `${a.evaluation.marks_awarded}/${a.maximum_marks} marks` : a.due_at ? `Due ${new Date(a.due_at).toLocaleDateString()}` : `${a.maximum_marks} marks`}</p>
        </div>
      </button>
    ))}
  </div>;
}

// ─── PROGRESS ────────────────────────────────────────────────────────────────
function ProgressSection() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([loadStudentDashboard(), loadSkills()]).then(([d, s]) => { setData(d); setSkills(s); }).catch(e => setError(e instanceof Error ? e.message : "Unable to load progress")); }, []);
  if (error) return <Notice error={error} />;
  if (!data) return <div className="py-16 flex items-center justify-center gap-2 text-[13px] text-[#5A6A8A]"><RefreshCw size={15} className="animate-spin" />Loading progress…</div>;
  const s = data.summary;
  const radarData = skills.slice(0, 8).map(item => ({ skill: item.name, level: PROFICIENCY_SCORE[item.proficiency_level] || 25 }));
  return <div className="space-y-5">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: "Overall Progress", value: `${s.overall_progress_percentage}%`, icon: Activity },
        { label: "Quiz Average", value: `${s.quiz_average_percentage}%`, icon: Award },
        { label: "Learning Streak", value: `${s.learning_streak_days}d`, icon: Flame },
        { label: "Assignments Passed", value: s.assignments_passed, icon: CheckCircle2 },
      ].map(k => <div key={k.label} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-[11.5px] text-[#5A6A8A]">{k.label}</span><k.icon size={16} className="text-[#1B3A6B]" /></div><p className="text-[21px] font-bold text-[#0F1C3F] mt-2">{k.value}</p></div>)}
    </div>
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
        <p className="text-[14px] font-bold text-[#0F1C3F] mb-4">Weekly Activity</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.weekly_activity.map(d => ({ day: new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }), minutes: d.minutes }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9AA5BE" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9AA5BE" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E8ECF5" }} />
            <Bar dataKey="minutes" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
        <p className="text-[14px] font-bold text-[#0F1C3F] mb-1">Skill Confidence</p>
        <p className="text-[12px] text-[#5A6A8A] mb-3">Based on your self-reported skill levels</p>
        {radarData.length ? <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E8ECF5" /><PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "#5A6A8A" }} />
            <Radar dataKey="level" stroke="#1B3A6B" fill="#1B3A6B" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer> : <p className="text-[13px] text-[#5A6A8A] py-10 text-center">Add your skills in the career portal to see this chart.</p>}
      </div>
    </div>
  </div>;
}

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────
function CertificatesSection() {
  const [items, setItems] = useState<Certificate[]>([]); const [eligible, setEligible] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(""); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const load = () => Promise.all([loadCertificates(), loadEnrollments()]).then(([certs, enrollments]) => {
    setItems(certs);
    setEligible(enrollments.filter(e => e.status === "completed" && e.progress_percentage === 100 && !certs.some(c => c.enrollment_id === e.id && c.status === "issued")));
  });
  useEffect(() => { load().catch(e => setError(e instanceof Error ? e.message : "Unable to load certificates")).finally(() => setLoading(false)); }, []);
  const generate = async (enrollmentId: string) => { setBusy(enrollmentId); setError(""); try { await generateCertificate(enrollmentId); setMessage("Certificate generated successfully."); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to generate certificate"); } finally { setBusy(""); } };
  if (loading) return <div className="py-16 flex items-center justify-center gap-2 text-[13px] text-[#5A6A8A]"><RefreshCw size={15} className="animate-spin" />Loading certificates…</div>;
  return <div className="space-y-5">
    <Notice error={error} success={message} />
    {eligible.map(course => (
      <div key={course.id} className="p-5 bg-[#EBF1FA] border border-[rgba(27,58,107,0.12)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="w-11 h-11 bg-[#1B3A6B] text-white rounded-xl flex items-center justify-center"><Award size={19} /></span><div><p className="text-[13.5px] font-semibold text-[#0F1C3F]">{course.title}</p><p className="text-[11.5px] text-[#5A6A8A]">Course completed · Certificate ready</p></div></div>
        <button disabled={busy === course.id} onClick={() => generate(course.id)} className="px-4 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[12px] font-semibold disabled:opacity-50">{busy === course.id ? "Generating…" : "Generate Certificate"}</button>
      </div>
    ))}
    {items.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(item => (
      <div key={item.id} className="p-5 bg-white border border-[rgba(27,58,107,0.1)] rounded-2xl shadow-sm">
        <div className="flex justify-between gap-3"><span className="w-11 h-11 rounded-xl bg-[#EBF1FA] flex items-center justify-center"><Award size={19} className="text-[#1B3A6B]" /></span><span className={`h-fit px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${item.status === "issued" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{item.status}</span></div>
        <h3 className="text-[15px] font-semibold text-[#0F1C3F] mt-4">{item.course_title}</h3>
        <p className="text-[10.5px] text-[#9AA5BE] mt-1">{item.certificate_number}</p>
        <p className="text-[11px] text-[#5A6A8A] mt-3">Issued {new Date(item.issued_at).toLocaleDateString()}</p>
        {item.status === "issued" ? <button onClick={() => studentDownload(`/api/v1/students/me/certificates/${item.id}/download`, `${item.certificate_number}.pdf`).catch(e => setError(e.message))} className="w-full mt-4 py-2.5 border border-[rgba(27,58,107,0.16)] text-[#1B3A6B] rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2"><Download size={14} />Download PDF</button> : <p className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-[11px]">{item.revocation_reason || "This certificate is no longer valid."}</p>}
      </div>
    ))}</div> : !eligible.length ? <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl"><Award size={28} className="mx-auto text-[#9AA5BE]" /><p className="mt-3 text-[13px] text-[#5A6A8A]">Complete a course to unlock your first certificate.</p></div> : null}
  </div>;
}

// ─── COURSE PLAYER WRAPPER ─────────────────────────────────────────────────
function LMSCoursePlayer({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const [enrolled, setEnrolled] = useState<EnrolledCourse | null>(null); const [error, setError] = useState(""); const [enrolling, setEnrolling] = useState(false);
  const load = () => loadEnrolledCourse(courseId).then(setEnrolled).catch(e => setError(e instanceof Error ? e.message : "Unable to open course"));
  useEffect(() => { load(); }, [courseId]);
  const enrollNow = async () => { setEnrolling(true); setError(""); try { await enrollCourse(courseId); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Enrollment failed"); } finally { setEnrolling(false); } };
  if (error) return <div className="p-8"><Notice error={error} /><button onClick={onBack} className="mt-4 flex items-center gap-2 text-[13px] text-[#1B3A6B] font-semibold"><ArrowLeft size={14} />Back</button></div>;
  if (!enrolled) return <div className="py-16 flex items-center justify-center gap-2 text-[13px] text-[#5A6A8A]"><RefreshCw size={15} className="animate-spin" />Loading course…</div>;
  const course: CourseData = {
    id: enrolled.id, title: enrolled.title, instructor: "EduConnect Learning Team", color: "#1B3A6B", emoji: "🎓",
    totalHours: String(enrolled.duration_hours), rating: 0, enrolled: 0, description: enrolled.description,
    skills: enrolled.skills, progress: enrolled.progress_percentage,
    sections: enrolled.sections.map(section => ({
      id: section.id, title: section.title,
      lessons: section.lessons.map(lesson => ({
        id: lesson.id, title: lesson.title, type: lesson.lesson_type, duration: String(lesson.duration_minutes),
        completed: lesson.status === "completed", isPreview: lesson.is_preview, locked: lesson.locked,
        youtubeId: lesson.youtube_id || undefined, articleContent: lesson.article_content || undefined,
        resumePosition: lesson.last_position_seconds, watchedPercentage: lesson.watched_percentage,
      })),
    })),
  };
  return <div>
    {!enrolled.is_enrolled && <div className="sticky top-[57px] z-30 bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-[12.5px] text-amber-800">You're previewing this course. Enroll to unlock every lesson and track your progress.</p>
      <button disabled={enrolling} onClick={enrollNow} className="px-4 py-1.5 bg-[#1B3A6B] text-white rounded-lg text-[12px] font-semibold disabled:opacity-50">{enrolling ? "Enrolling…" : "Enroll Now"}</button>
    </div>}
    <CoursePlayer course={course} onBack={onBack}
      onLessonComplete={enrolled.is_enrolled ? async lessonId => { await saveLessonProgress(enrolled.enrollment_id!, lessonId, "completed"); } : undefined}
      onVideoProgress={enrolled.is_enrolled ? async (lessonId, previous, current, duration) => saveLessonProgress(enrolled.enrollment_id!, lessonId, "in_progress", 0, current, previous, duration) : undefined}
      renderQuiz={(lesson, onPassed) => <LiveQuiz lesson={lesson} onPassed={onPassed} />}
      renderAssignment={(lesson, onPassed) => <LiveAssignment lesson={lesson} onPassed={onPassed} />} />
  </div>;
}

// ─── MODULE SHELL ─────────────────────────────────────────────────────────────
export function LMSModule({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const [section, setSection] = useState<LMSSection>(() => lmsSectionFromPath(window.location.pathname));
  const [playingCourseId, setPlayingCourseId] = useState<string | null>(() => window.location.pathname.match(/^\/lms\/courses\/([^/]+)$/)?.[1] || null);
  const [student, setStudent] = useState<CurrentStudent | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => { getCurrentStudent().then(setStudent).catch(() => undefined); }, []);
  useEffect(() => {
    const restore = () => {
      const match = window.location.pathname.match(/^\/lms\/courses\/([^/]+)$/);
      if (match) { setPlayingCourseId(match[1]); return; }
      setPlayingCourseId(null); setSection(lmsSectionFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  useEffect(() => { document.title = `${LMS_NAV.find(x => x.key === section)?.label || "LMS"} | EduConnect`; }, [section]);

  const navigate = (next: LMSSection) => { setPlayingCourseId(null); if (window.location.pathname !== LMS_SECTION_PATH[next]) window.history.pushState({}, "", LMS_SECTION_PATH[next]); setSection(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openCourse = (courseId: string) => { const path = `/lms/courses/${courseId}`; if (window.location.pathname !== path) window.history.pushState({}, "", path); setPlayingCourseId(courseId); };
  const closeCourse = () => { setRefresh(x => x + 1); navigate(section === "catalog" ? "catalog" : "my-courses"); };

  if (playingCourseId) return <LMSCoursePlayer courseId={playingCourseId} onBack={closeCourse} />;

  const active = LMS_NAV.find(x => x.key === section)!;
  return (
    <div className="min-h-screen bg-[#F2F5FC]" style={{ fontFamily: "var(--font-sans)" }}>
      <header className="bg-white border-b border-[rgba(27,58,107,0.08)] sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#1B3A6B] flex items-center justify-center"><GraduationCap size={17} className="text-white" /></div>
            <div><p className="font-semibold text-[14px] leading-none text-[#0F1C3F]">EduConnect</p><span className="inline-block mt-0.5 px-2 py-0.5 bg-[#EBF1FA] text-[#1B3A6B] text-[9.5px] font-bold rounded-full">LMS</span></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="hidden sm:flex items-center gap-1.5 text-[12px] text-[#5A6A8A] hover:text-[#1B3A6B] font-medium"><ArrowLeft size={13} />Career Portal</button>
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#F4F7FC]"><span className="w-7 h-7 rounded-lg bg-[#1B3A6B] flex items-center justify-center text-white"><UserRound size={13} /></span><span className="text-[11.5px] font-semibold text-[#0F1C3F] max-w-28 truncate hidden sm:block">{student?.full_name || "Student"}</span></div>
            <button onClick={onLogout} className="p-2 text-[#9AA5BE] hover:text-red-500"><LogOut size={15} /></button>
          </div>
        </div>
      </header>
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <div className="lg:hidden mb-3 relative">
          <select aria-label="LMS section" value={section} onChange={e => navigate(e.target.value as LMSSection)} className="w-full appearance-none px-4 py-3 bg-white border border-[--border] rounded-xl text-[13px] font-semibold text-[#0F1C3F] shadow-sm">
            {LMS_NAV.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block sticky top-[76px] self-start bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-2.5 shadow-sm">
            {LMS_NAV.map(item => { const Icon = item.icon; const selected = section === item.key; return (
              <button key={item.key} onClick={() => navigate(item.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left mb-1 transition-all ${selected ? "bg-[#EBF1FA] text-[#1B3A6B]" : "text-[#5A6A8A] hover:bg-[#F4F7FC]"}`}>
                <Icon size={15} /><span className="text-[12.5px] font-semibold">{item.label}</span>
              </button>
            ); })}
          </aside>
          <main className="min-w-0">
            <div className="flex items-center gap-3 mb-5"><active.icon size={22} className="text-[#1B3A6B]" /><h1 className="text-[19px] text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{active.label}</h1></div>
            {section === "dashboard" ? <LMSDashboard onOpenCourse={openCourse} onSection={navigate} />
              : section === "my-courses" ? <MyCourses key={refresh} onOpenCourse={openCourse} onCatalog={() => navigate("catalog")} />
              : section === "catalog" ? <Catalog onEnrolled={() => setRefresh(x => x + 1)} onOpenCourse={openCourse} />
              : section === "assignments" ? <AssignmentsSection onOpenCourse={openCourse} />
              : section === "progress" ? <ProgressSection />
              : <CertificatesSection />}
          </main>
        </div>
      </div>
    </div>
  );
}
