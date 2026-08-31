import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Archive,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Layers,
  Loader2,
  Lock,
  Plus,
  Save,
  Search,
  Trash2,
  Video,
  AlignLeft,
  HelpCircle,
  Paperclip,
  Eye,
  Users,
  Activity,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  ClipboardCheck,
  Menu,
  LogOut,
  ChevronDown,
  Mail,
  Smartphone,
} from "lucide-react";
import {
  archiveCourse,
  createCourse,
  createLesson,
  createSection,
  deleteCourse,
  deleteLesson,
  deleteSection,
  loadCourse,
  loadCourses,
  publishCourse,
  reorderLessons,
  reorderSections,
  restoreCourse,
  updateCourse,
  updateLesson,
  updateSection,
  loadAdminQuiz,
  saveAdminQuiz,
  publishAdminQuiz,
  loadAdminAssignment,
  saveAdminAssignment,
  publishAdminAssignment,
  loadAssignmentSubmissions,
  evaluateAssignmentSubmission,
  downloadAssignmentSubmissionFile,
  loadAdminAnalytics,
  loadAdminCertificates,
  revokeCertificate,
  reissueCertificate,
  getCurrentAdmin,
  type AdminApiError,
  type AdminCourseDetail,
  type AdminCourseListItem,
  type CourseInput,
  type CourseStatus,
  type LessonInput,
  type LessonType,
  type AdminQuizInput,
  type AdminAssignmentInput,
  type AdminAssignmentSubmission,
  type AdminAnalyticsOverview,
  type AdminCertificate,
  type AdminProfile,
} from "../api/admin-lms";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const LESSON_META: Record<LessonType, { label: string; icon: React.ElementType }> = {
  video: { label: "Video", icon: Video },
  article: { label: "Article", icon: AlignLeft },
  quiz: { label: "Quiz", icon: HelpCircle },
  assignment: { label: "Assignment", icon: Paperclip },
};
const STATUS_BADGE: Record<CourseStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-100",
  archived: "bg-amber-50 text-amber-700 border-amber-100",
};

const blankCourse: CourseInput = { title: "", description: "", level: "Beginner", duration_hours: 1, skills: [], status: "draft", thumbnail_url: "", instructor_name: "" };
const blankLesson: LessonInput = { title: "", lesson_type: "article", duration_minutes: 10, is_preview: false, youtube_id: "", article_content: "" };
type AdminPage = "dashboard" | "courses" | "add-course";

function splitSkills(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function joinSkills(value: string[]) {
  return value.join(", ");
}

function errText(err: unknown) {
  if (err instanceof Error) {
    const apiErr = err as AdminApiError;
    return apiErr.issues?.length ? `${apiErr.message}: ${apiErr.issues.join(" • ")}` : apiErr.message;
  }
  return "Request failed.";
}

const blankQuestion=()=>({question_text:"",question_type:"single_choice" as const,marks:1,explanation:"",options:[{option_text:"",is_correct:true},{option_text:"",is_correct:false}]});
function QuizBuilder({lessonId,onClose}:{lessonId:string;onClose:()=>void}){
  const [quizId,setQuizId]=useState("");const [status,setStatus]=useState("draft");const [form,setForm]=useState<AdminQuizInput>({instructions:"Answer all questions and submit your attempt.",passing_percentage:60,maximum_attempts:3,time_limit_minutes:null,show_explanations:true,questions:[blankQuestion()]});const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  useEffect(()=>{loadAdminQuiz(lessonId).then(q=>{if(q){setQuizId(q.id);setStatus(q.status);setForm({instructions:q.instructions,passing_percentage:q.passing_percentage,maximum_attempts:q.maximum_attempts,time_limit_minutes:q.time_limit_minutes,show_explanations:q.show_explanations,questions:q.questions});}}).catch(e=>setError(errText(e)));},[lessonId]);
  const save=async()=>{setBusy(true);setError("");try{const q=await saveAdminQuiz(lessonId,form);setQuizId(q.id);setStatus(q.status);toast.success("Quiz draft saved");}catch(e){const message=errText(e);setError(message);toast.error("Unable to save quiz",{description:message});}finally{setBusy(false);}};
  const publish=async()=>{if(!quizId)return;setBusy(true);setError("");try{const q=await publishAdminQuiz(quizId);setStatus(q.status);toast.success("Quiz published");}catch(e){const message=errText(e);setError(message);toast.error("Unable to publish quiz",{description:message});}finally{setBusy(false);}};
  return <div className="fixed inset-0 z-50 bg-[#071326]/70 p-5 overflow-y-auto"><div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 space-y-5"><div className="flex justify-between"><div><p className="text-[11px] uppercase text-[#9AA5BE]">Quiz Builder · {status}</p><h2 className="text-[20px] font-bold">Configure assessment</h2></div><button onClick={onClose} className="text-[13px]">Close</button></div>{error&&<div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12px]">{error}</div>}<textarea value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} rows={3} className="w-full p-3 border rounded-xl" placeholder="Instructions"/><div className="grid grid-cols-3 gap-3"><label className="text-[12px]">Passing %<input type="number" min={1} max={100} value={form.passing_percentage} onChange={e=>setForm({...form,passing_percentage:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label><label className="text-[12px]">Maximum attempts<input type="number" min={1} value={form.maximum_attempts} onChange={e=>setForm({...form,maximum_attempts:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label><label className="text-[12px]">Time limit (optional)<input type="number" min={1} value={form.time_limit_minutes||""} onChange={e=>setForm({...form,time_limit_minutes:e.target.value?Number(e.target.value):null})} className="w-full p-2 border rounded-lg mt-1"/></label></div>{form.questions.map((q,qi)=><div key={qi} className="p-4 border rounded-2xl space-y-3"><div className="flex gap-2"><input value={q.question_text} onChange={e=>setForm({...form,questions:form.questions.map((x,i)=>i===qi?{...x,question_text:e.target.value}:x)})} placeholder={`Question ${qi+1}`} className="flex-1 p-2.5 border rounded-xl"/><select value={q.question_type} onChange={e=>setForm({...form,questions:form.questions.map((x,i)=>i===qi?{...x,question_type:e.target.value as typeof q.question_type}:x)})} className="p-2 border rounded-xl"><option value="single_choice">Single choice</option><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option></select><button onClick={()=>setForm({...form,questions:form.questions.filter((_,i)=>i!==qi)})} className="p-2 text-red-600"><Trash2 size={15}/></button></div>{q.options.map((o,oi)=><div key={oi} className="flex gap-2"><input type={q.question_type==="multiple_choice"?"checkbox":"radio"} name={`correct-${qi}`} checked={o.is_correct} onChange={()=>setForm({...form,questions:form.questions.map((x,i)=>i!==qi?x:{...x,options:x.options.map((option,j)=>({...option,is_correct:j===oi?true:(q.question_type==="multiple_choice"?option.is_correct:false)}))})})}/><input value={o.option_text} onChange={e=>setForm({...form,questions:form.questions.map((x,i)=>i!==qi?x:{...x,options:x.options.map((option,j)=>j===oi?{...option,option_text:e.target.value}:option)})})} placeholder={`Option ${oi+1}`} className="flex-1 p-2 border rounded-lg"/></div>)}<button onClick={()=>setForm({...form,questions:form.questions.map((x,i)=>i===qi?{...x,options:[...x.options,{option_text:"",is_correct:false}]}:x)})} className="text-[12px] text-[#1B3A6B]">+ Add option</button></div>)}<button onClick={()=>setForm({...form,questions:[...form.questions,blankQuestion()]})} className="px-4 py-2 border rounded-xl text-[12px]">+ Add question</button><div className="flex justify-end gap-2"><button disabled={busy} onClick={save} className="px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[13px]">Save Draft</button><button disabled={busy||!quizId} onClick={publish} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] disabled:opacity-40">Publish Quiz</button></div></div></div>;
}

const blankAssignment:AdminAssignmentInput={instructions:"Complete the assignment using the concepts covered in this module.",maximum_marks:100,passing_marks:40,maximum_attempts:2,allowed_submission_types:["file","text","link"],allowed_file_extensions:["pdf","docx","zip"],maximum_file_size_mb:50,due_at:null,allow_late_submission:false,allow_resubmission:true};
function AssignmentBuilder({lessonId,onClose}:{lessonId:string;onClose:()=>void}){
  const [id,setId]=useState("");const [status,setStatus]=useState("draft");const [form,setForm]=useState<AdminAssignmentInput>(blankAssignment);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  useEffect(()=>{loadAdminAssignment(lessonId).then(a=>{if(a){setId(a.id);setStatus(a.status);setForm({instructions:a.instructions,maximum_marks:a.maximum_marks,passing_marks:a.passing_marks,maximum_attempts:a.maximum_attempts,allowed_submission_types:a.allowed_submission_types,allowed_file_extensions:a.allowed_file_extensions,maximum_file_size_mb:a.maximum_file_size_mb,due_at:a.due_at,allow_late_submission:a.allow_late_submission,allow_resubmission:a.allow_resubmission});}}).catch(e=>setError(errText(e)));},[lessonId]);
  const save=async()=>{setBusy(true);setError("");try{const a=await saveAdminAssignment(lessonId,form);setId(a.id);setStatus(a.status);toast.success("Assignment draft saved");}catch(e){const message=errText(e);setError(message);toast.error("Unable to save assignment",{description:message});}finally{setBusy(false);}};
  const publish=async()=>{if(!id)return;setBusy(true);setError("");try{const a=await publishAdminAssignment(id);setStatus(a.status);toast.success("Assignment published");}catch(e){const message=errText(e);setError(message);toast.error("Unable to publish assignment",{description:message});}finally{setBusy(false);}};
  const toggleType=(value:"file"|"text"|"link")=>setForm({...form,allowed_submission_types:form.allowed_submission_types.includes(value)?form.allowed_submission_types.filter(x=>x!==value):[...form.allowed_submission_types,value]});
  return <div className="fixed inset-0 z-50 bg-[#071326]/70 p-5 overflow-y-auto"><div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 space-y-5"><div className="flex justify-between"><div><p className="text-[11px] uppercase text-[#9AA5BE]">Assignment Builder · {status}</p><h2 className="text-[20px] font-bold">Configure assignment</h2></div><button onClick={onClose} className="text-[13px]">Close</button></div>{error&&<div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12px]">{error}</div>}<textarea rows={5} value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Assignment instructions"/><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><label className="text-[12px]">Maximum marks<input type="number" min={1} value={form.maximum_marks} onChange={e=>setForm({...form,maximum_marks:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label><label className="text-[12px]">Passing marks<input type="number" min={0} value={form.passing_marks} onChange={e=>setForm({...form,passing_marks:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label><label className="text-[12px]">Attempts<input type="number" min={1} value={form.maximum_attempts} onChange={e=>setForm({...form,maximum_attempts:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label><label className="text-[12px]">Max file MB<input type="number" min={1} max={100} value={form.maximum_file_size_mb} onChange={e=>setForm({...form,maximum_file_size_mb:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label></div><label className="text-[12px] block">Due date (optional)<input type="datetime-local" value={form.due_at?.slice(0,16)||""} onChange={e=>setForm({...form,due_at:e.target.value?new Date(e.target.value).toISOString():null})} className="w-full p-2 border rounded-lg mt-1"/></label><div><p className="text-[12px] font-semibold mb-2">Allowed submissions</p><div className="flex gap-4">{(["file","text","link"] as const).map(x=><label key={x} className="text-[12px] capitalize"><input type="checkbox" checked={form.allowed_submission_types.includes(x)} onChange={()=>toggleType(x)} className="mr-1"/>{x}</label>)}</div></div><div className="flex gap-5"><label className="text-[12px]"><input type="checkbox" checked={form.allow_late_submission} onChange={e=>setForm({...form,allow_late_submission:e.target.checked})} className="mr-1"/>Allow late submission</label><label className="text-[12px]"><input type="checkbox" checked={form.allow_resubmission} onChange={e=>setForm({...form,allow_resubmission:e.target.checked})} className="mr-1"/>Allow resubmission</label></div><div className="flex justify-end gap-2"><button disabled={busy} onClick={save} className="px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[13px]">Save Draft</button><button disabled={busy||!id} onClick={publish} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] disabled:opacity-40">Publish Assignment</button></div></div></div>;
}

function SubmissionRow({item,onDone}:{item:AdminAssignmentSubmission;onDone:()=>void}){const [marks,setMarks]=useState(item.evaluation?.marks_awarded||0);const [decision,setDecision]=useState<"passed"|"failed"|"resubmission_required">("passed");const [feedback,setFeedback]=useState(item.evaluation?.feedback||"");const [busy,setBusy]=useState(false);const submit=async()=>{setBusy(true);try{await evaluateAssignmentSubmission(item.id,{marks_awarded:marks,decision,feedback});toast.success("Evaluation saved");onDone();}catch(e){toast.error("Unable to save evaluation",{description:errText(e)});}finally{setBusy(false);}};return <div className="p-4 border rounded-2xl space-y-3"><div className="flex justify-between"><div><p className="text-[13px] font-semibold">{item.student.full_name} · {item.assignment_title}</p><p className="text-[11px] text-[#5A6A8A]">{item.course_title} · Attempt {item.attempt_number}{item.is_late?" · Late":""}</p></div><span className="text-[11px] capitalize">{item.status.replaceAll("_"," ")}</span></div>{item.text_content&&<p className="text-[12px] bg-slate-50 p-3 rounded-xl">{item.text_content}</p>}{item.link_url&&<a href={item.link_url} target="_blank" rel="noreferrer" className="text-[12px] text-blue-600 underline">Open submitted link</a>}{item.has_file&&<button onClick={()=>downloadAssignmentSubmissionFile(item.id,item.original_file_name||"submission")} className="text-[12px] text-blue-600 underline">Download {item.original_file_name}</button>}<div className="grid grid-cols-3 gap-2"><input type="number" min={0} value={marks} onChange={e=>setMarks(Number(e.target.value))} className="p-2 border rounded-lg text-[12px]"/><select value={decision} onChange={e=>setDecision(e.target.value as typeof decision)} className="p-2 border rounded-lg text-[12px]"><option value="passed">Pass</option><option value="failed">Fail</option><option value="resubmission_required">Request resubmission</option></select><input value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Feedback" className="p-2 border rounded-lg text-[12px]"/></div><button disabled={busy} onClick={submit} className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-[12px]">{busy?"Saving…":"Save Evaluation"}</button></div>}
function SubmissionReview({onClose}:{onClose:()=>void}){const [items,setItems]=useState<AdminAssignmentSubmission[]>([]);const [error,setError]=useState("");const load=()=>loadAssignmentSubmissions().then(setItems).catch(e=>setError(errText(e)));useEffect(load,[]);return <div className="fixed inset-0 z-50 bg-[#071326]/70 p-5 overflow-y-auto"><div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 space-y-4"><div className="flex justify-between"><h2 className="text-[20px] font-bold">Assignment Submissions</h2><button onClick={onClose}>Close</button></div>{error&&<div className="text-red-600 text-[12px]">{error}</div>}{items.map(x=><SubmissionRow key={x.id} item={x} onDone={load}/>)}{!items.length&&!error&&<div className="py-10 text-center text-[#9AA5BE] text-[13px]">No submitted assignments yet.</div>}</div></div>}

function CertificateManagement({onClose}:{onClose:()=>void}){const [items,setItems]=useState<AdminCertificate[]>([]);const [search,setSearch]=useState("");const [filter,setFilter]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState("");const load=()=>loadAdminCertificates(search,filter).then(setItems).catch(e=>setError(errText(e)));useEffect(()=>{const timer=setTimeout(load,250);return()=>clearTimeout(timer);},[search,filter]);useEffect(()=>{if(error){toast.error("Certificate action failed",{description:error});setError("");}},[error]);const revoke=async(item:AdminCertificate)=>{const reason=window.prompt("Reason for revoking this certificate?");if(!reason)return;setBusy(item.id);setError("");try{await revokeCertificate(item.id,reason);toast.success("Certificate revoked");await load();}catch(e){setError(errText(e));}finally{setBusy("");}};const reissue=async(item:AdminCertificate)=>{setBusy(item.id);setError("");try{await reissueCertificate(item.id);toast.success("Certificate reissued");await load();}catch(e){setError(errText(e));}finally{setBusy("");}};return <div className="fixed inset-0 z-50 bg-[#071326]/70 p-4 sm:p-5 overflow-y-auto"><div className="max-w-5xl mx-auto bg-[#F2F5FC] rounded-2xl overflow-hidden"><div className="p-5 bg-[#0F1F3B] text-white flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-widest text-white/50">Admin LMS</p><h2 className="text-[20px] font-semibold mt-1">Certificate Management</h2></div><button onClick={onClose} className="px-3 py-2 bg-white/10 rounded-xl text-[12px]">Close</button></div><div className="p-5 space-y-4"><div className="bg-white border border-[rgba(27,58,107,0.08)] rounded-2xl p-4 flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student, course or certificate number" className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFD] border rounded-xl text-[12px]"/></div><select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-2.5 border rounded-xl text-[12px] bg-white"><option value="">All statuses</option><option value="issued">Issued</option><option value="revoked">Revoked</option><option value="superseded">Superseded</option></select></div><div className="space-y-3">{items.map(item=><div key={item.id} className="bg-white border border-[rgba(27,58,107,0.08)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4"><span className="w-10 h-10 shrink-0 rounded-xl bg-[#EBF1FA] flex items-center justify-center"><ShieldCheck size={18} className="text-[#1B3A6B]"/></span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-[13.5px] font-semibold">{item.student_name}</p><span className={`px-2 py-0.5 rounded-full text-[9.5px] font-semibold capitalize ${item.status==="issued"?"bg-emerald-50 text-emerald-700":item.status==="revoked"?"bg-red-50 text-red-700":"bg-slate-100 text-slate-600"}`}>{item.status}</span></div><p className="text-[11.5px] text-[#5A6A8A] mt-1">{item.course_title}</p><p className="text-[10px] text-[#9AA5BE] mt-1">{item.certificate_number} · {new Date(item.issued_at).toLocaleDateString()}</p></div><div className="flex gap-2">{item.status==="issued"&&<button disabled={busy===item.id} onClick={()=>revoke(item)} className="px-3 py-2 border border-red-200 text-red-700 rounded-xl text-[11px] font-semibold">Revoke</button>}{item.status==="revoked"&&<button disabled={busy===item.id} onClick={()=>reissue(item)} className="px-3 py-2 bg-[#1B3A6B] text-white rounded-xl text-[11px] font-semibold">Reissue</button>}</div></div>)}{!items.length&&!error&&<div className="py-12 text-center text-[13px] text-[#9AA5BE]">No certificates found.</div>}</div></div></div></div>}

export function LMSAdminSection({ onBack, onLogout }: { onBack?: () => void | Promise<void>; onLogout?: () => void | Promise<void> }) {
  const [adminPage,setAdminPage]=useState<AdminPage>("dashboard");
  const [courseStep,setCourseStep]=useState(1);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [adminProfile,setAdminProfile]=useState<AdminProfile|null>(null);
  const [loggingOut,setLoggingOut]=useState(false);
  const [items, setItems] = useState<AdminCourseListItem[]>([]);
  const [detail, setDetail] = useState<AdminCourseDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CourseStatus>("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [courseForm, setCourseForm] = useState<CourseInput>(blankCourse);
  const [sectionTitle, setSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [lessonSectionId, setLessonSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonInput>(blankLesson);
  const [quizLessonId,setQuizLessonId]=useState<string|null>(null);
  const [assignmentLessonId,setAssignmentLessonId]=useState<string|null>(null);
  const [submissionsOpen,setSubmissionsOpen]=useState(false);
  const [certificatesOpen,setCertificatesOpen]=useState(false);
  const [analytics,setAnalytics]=useState<AdminAnalyticsOverview|null>(null);

  const loadList = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await loadCourses({ page: nextPage, pageSize: 20, search, status: statusFilter, level: levelFilter === "all" ? undefined : levelFilter });
      setItems(result.items);
      setPages(result.pages);
      setTotal(result.total);
      if (!selectedId && result.items[0]) setSelectedId(result.items[0].id);
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (courseId: string) => {
    setSelectedId(courseId);
    setError("");
    try {
      const result = await loadCourse(courseId);
      setDetail(result);
      setCourseForm({
        title: result.title,
        slug: result.slug,
        description: result.description,
        level: result.level,
        duration_hours: result.duration_hours,
        skills: result.skills,
        status: result.status,
        thumbnail_url: result.thumbnail_url || "",
        instructor_name: result.instructor_name || "",
      });
      setEditorOpen(true);
    } catch (err) {
      setError(errText(err));
    }
  };

  useEffect(() => { void loadList(page); }, [page, statusFilter, levelFilter]);
  useEffect(() => { loadAdminAnalytics().then(setAnalytics).catch((err)=>setError(errText(err))); }, []);
  useEffect(()=>{getCurrentAdmin().then(setAdminProfile).catch(err=>setError(errText(err)));},[]);
  useEffect(()=>{if(!notice)return;toast.success(notice,{id:"admin-operation-success",duration:3500});setNotice("");},[notice]);
  useEffect(()=>{if(!error)return;toast.error("Action could not be completed",{id:"admin-operation-error",description:error,duration:6500});setError("");},[error]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); void loadList(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const refreshSelected = async () => {
    if (!selectedId) return;
    await loadDetail(selectedId);
    await loadList(page);
  };

  const saveCourse = async () => {
    const creating = !selectedId;
    setSubmitting(true);
    setError("");
    try {
      const payload: CourseInput = {
        ...courseForm,
        title: courseForm.title.trim(),
        slug: courseForm.slug?.trim() || undefined,
        description: courseForm.description.trim(),
        thumbnail_url: courseForm.thumbnail_url?.trim() || null,
        instructor_name: courseForm.instructor_name?.trim() || null,
      };
      const result = selectedId ? await updateCourse(selectedId, payload) : await createCourse(payload);
      setNotice(selectedId ? "Course updated." : "Course created.");
      setSelectedId(result.id);
      if(creating)setAdminPage("courses");
      await loadDetail(result.id);
      await loadList(1);
    } catch (err) {
      setError(errText(err));
    } finally { setSubmitting(false); }
  };

  const removeCourse = async () => {
    if (!selectedId || !window.confirm("Delete this course?")) return;
    setSubmitting(true);
    try {
      await deleteCourse(selectedId);
      setNotice("Course deleted.");
      setSelectedId(null);
      setDetail(null);
      setEditorOpen(false);
      await loadList(1);
    } catch (err) { setError(errText(err)); } finally { setSubmitting(false); }
  };
  const publishSelected = async () => { if (!selectedId) return; setSubmitting(true); try { const result = await publishCourse(selectedId); setDetail(result); setNotice("Course published."); await loadList(page); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const archiveSelected = async () => { if (!selectedId) return; setSubmitting(true); try { const result = await archiveCourse(selectedId); setDetail(result); setNotice("Course archived."); await loadList(page); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const restoreSelected = async () => { if (!selectedId) return; setSubmitting(true); try { const result = await restoreCourse(selectedId); setDetail(result); setNotice("Course restored."); await loadList(page); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const addSection = async () => { if (!selectedId || !sectionTitle.trim()) return; setSubmitting(true); try { await createSection(selectedId, { title: sectionTitle.trim() }); setSectionTitle(""); setNotice("Section created."); await refreshSelected(); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const updateSectionTitle = async () => { if (!editingSectionId || !editingSectionTitle.trim()) return; setSubmitting(true); try { await updateSection(editingSectionId, { title: editingSectionTitle.trim() }); setEditingSectionId(null); setEditingSectionTitle(""); setNotice("Section updated."); await refreshSelected(); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const deleteSectionId = async (sectionId: string) => { if (!window.confirm("Delete this section?")) return; setSubmitting(true); try { await deleteSection(sectionId); setNotice("Section deleted."); await refreshSelected(); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const moveSection = async (sectionId: string, direction: -1 | 1) => { if (!detail) return; const ids = detail.sections.map((section) => section.id); const index = ids.indexOf(sectionId); const target = index + direction; if (index < 0 || target < 0 || target >= ids.length) return; [ids[index], ids[target]] = [ids[target], ids[index]]; setSubmitting(true); try { const result = await reorderSections(detail.id, { ids }); setDetail(result); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const startLesson = (sectionId: string, lesson?: AdminCourseDetail["sections"][number]["lessons"][number]) => { setLessonSectionId(sectionId); setEditingLessonId(lesson?.id || null); setLessonForm(lesson ? { title: lesson.title, lesson_type: lesson.lesson_type, duration_minutes: lesson.duration_minutes, sequence: lesson.sequence, youtube_id: lesson.youtube_id || "", article_content: lesson.article_content || "", is_preview: lesson.is_preview } : blankLesson); };
  const submitLesson = async () => { if (!lessonSectionId) return; setSubmitting(true); try { const payload = { ...lessonForm, title: lessonForm.title.trim(), youtube_id: lessonForm.youtube_id?.trim() || null, article_content: lessonForm.article_content?.trim() || null } satisfies LessonInput; if (editingLessonId) { await updateLesson(editingLessonId, payload); setNotice("Lesson updated."); } else { await createLesson(lessonSectionId, payload); setNotice("Lesson created."); } setLessonSectionId(null); setEditingLessonId(null); setLessonForm(blankLesson); await refreshSelected(); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const deleteLessonId = async (lessonId: string) => { if (!window.confirm("Delete this lesson?")) return; setSubmitting(true); try { await deleteLesson(lessonId); setNotice("Lesson deleted."); await refreshSelected(); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };
  const moveLesson = async (sectionId: string, lessonId: string, direction: -1 | 1) => { if (!detail) return; const section = detail.sections.find((item) => item.id === sectionId); if (!section) return; const ids = section.lessons.map((lesson) => lesson.id); const index = ids.indexOf(lessonId); const target = index + direction; if (index < 0 || target < 0 || target >= ids.length) return; [ids[index], ids[target]] = [ids[target], ids[index]]; setSubmitting(true); try { const result = await reorderLessons(sectionId, { ids }); setDetail((current) => current ? { ...current, sections: current.sections.map((entry) => entry.id === result.id ? result : entry) } : current); } catch (err) { setError(errText(err)); } finally { setSubmitting(false); } };

  const stats = [
    { label: "Students", value: analytics?.summary.total_students ?? "—", icon: Users },
    { label: "Active learners", value: analytics?.summary.active_learners ?? "—", icon: Activity },
    { label: "Enrollments", value: analytics?.summary.total_enrollments ?? "—", icon: BookOpen },
    { label: "Completion rate", value: analytics ? `${analytics.summary.course_completion_rate}%` : "—", icon: CheckCircle2 },
  ];
  const openNewCourse=()=>{setSelectedId(null);setDetail(null);setCourseForm(blankCourse);setEditorOpen(true);setCourseStep(1);setAdminPage("add-course");setSidebarOpen(false);setError("");setNotice("");};
  const navigation=[
    {key:"dashboard" as const,label:"Dashboard",description:"Overview & analytics",icon:LayoutDashboard},
    {key:"courses" as const,label:"Courses",description:"Manage curriculum",icon:BookOpen},
    {key:"add-course" as const,label:"Add Course",description:"Create systematically",icon:Plus},
  ];
  const adminName=adminProfile?.email.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,value=>value.toUpperCase())||"LMS Admin";
  const adminInitials=adminName.split(" ").slice(0,2).map(value=>value[0]).join("").toUpperCase()||"AD";
  const handleLogout=async()=>{setLoggingOut(true);toast.loading("Signing out…",{id:"admin-logout"});try{await (onLogout?.()??onBack?.());toast.success("Signed out successfully",{id:"admin-logout"});}catch(error){toast.error("Unable to sign out",{id:"admin-logout",description:errText(error)});setLoggingOut(false);}};

  return (
    <div className="min-h-screen bg-[#F2F5FC] text-[#0F1C3F]" style={{ fontFamily: "var(--font-sans)" }}>
      <Toaster position="top-right" richColors closeButton expand={false} visibleToasts={4} toastOptions={{className:"!rounded-2xl !border !shadow-xl !font-[var(--font-sans)]",descriptionClassName:"!text-[12px] !leading-relaxed"}} />
      {quizLessonId&&<QuizBuilder lessonId={quizLessonId} onClose={()=>setQuizLessonId(null)}/>} 
      {assignmentLessonId&&<AssignmentBuilder lessonId={assignmentLessonId} onClose={()=>setAssignmentLessonId(null)}/>} 
      {submissionsOpen&&<SubmissionReview onClose={()=>setSubmissionsOpen(false)}/>} 
      {certificatesOpen&&<CertificateManagement onClose={()=>setCertificatesOpen(false)}/>} 
      <header className="sticky top-0 z-20 bg-[#0F1F3B] text-white border-b border-white/5">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><button onClick={()=>setSidebarOpen(x=>!x)} className="lg:hidden p-2 rounded-xl bg-white/5"><Menu size={16}/></button>{onBack&&<button onClick={()=>void onBack()} className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><ArrowLeft size={16} /></button>}<div><p className="text-[13px] font-semibold">EduConnect</p><p className="text-[10px] uppercase tracking-[0.2em] text-white/45 mt-1">Admin LMS</p></div></div>
          <div className="flex items-center gap-2"><button onClick={openNewCourse} className="hidden sm:flex px-3 py-2 rounded-xl bg-[#D97706] text-[12px] font-semibold items-center gap-2"><Plus size={14} />New Course</button><div className="relative"><button onClick={()=>setProfileOpen(value=>!value)} aria-expanded={profileOpen} className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors"><span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D97706] to-[#F59E0B] text-white flex items-center justify-center text-[11px] font-bold shadow-sm">{adminInitials}</span><span className="hidden md:block text-left max-w-[150px]"><b className="block text-[11.5px] truncate">{adminName}</b><small className="block text-[9.5px] text-white/45 truncate">Administrator</small></span><ChevronDown size={13} className={`text-white/55 transition-transform ${profileOpen?"rotate-180":""}`}/></button>{profileOpen&&<><button aria-label="Close profile menu" onClick={()=>setProfileOpen(false)} className="fixed inset-0 z-20 cursor-default"/><div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[290px] bg-white text-[#0F1C3F] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"><div className="p-4 bg-gradient-to-br from-[#F8FAFD] to-[#EBF1FA]"><div className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-[#1B3A6B] text-white flex items-center justify-center text-[13px] font-bold">{adminInitials}</span><div className="min-w-0"><p className="text-[13px] font-semibold truncate">{adminName}</p><p className="text-[10.5px] text-[#5A6A8A] truncate">LMS Administrator</p></div></div></div><div className="px-4 py-3 space-y-2 border-y"><p className="flex items-center gap-2 text-[11px] text-[#5A6A8A]"><Mail size={13} className="shrink-0"/><span className="truncate">{adminProfile?.email||"Loading profile…"}</span></p>{adminProfile?.mobile&&<p className="flex items-center gap-2 text-[11px] text-[#5A6A8A]"><Smartphone size={13}/>{adminProfile.mobile}</p>}<p className="flex items-center gap-2 text-[10.5px] text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500"/>Active session</p></div><div className="p-2"><button disabled={loggingOut} onClick={()=>void handleLogout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-red-600 hover:bg-red-50 disabled:opacity-50"><span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><LogOut size={14}/></span><span><b className="block text-[11.5px]">Logout</b><small className="text-[9.5px] text-red-400">End this admin session</small></span></button></div></div></>}</div></div>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-65px)]">
        <aside className={`${sidebarOpen?"block":"hidden"} lg:block fixed lg:sticky top-[65px] z-10 lg:z-auto w-[260px] h-[calc(100vh-65px)] shrink-0 bg-white border-r border-[rgba(27,58,107,0.08)] p-4`}><div className="mb-5 p-4 rounded-2xl bg-[#1B3A6B] text-white"><p className="text-[10px] uppercase tracking-widest text-white/50">Administration</p><p className="text-[14px] font-semibold mt-2">Learning Management</p></div><nav className="space-y-1">{navigation.map(item=>{const Icon=item.icon;const active=adminPage===item.key;return <button key={item.key} onClick={()=>item.key==="add-course"?openNewCourse():(setAdminPage(item.key),setSidebarOpen(false))} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${active?"bg-[#EBF1FA] text-[#1B3A6B]":"text-[#5A6A8A] hover:bg-[#F8FAFD]"}`}><span className={`w-9 h-9 rounded-xl flex items-center justify-center ${active?"bg-[#1B3A6B] text-white":"bg-[#EFF2FA]"}`}><Icon size={16}/></span><span><b className="block text-[12.5px]">{item.label}</b><small className="text-[10.5px] text-[#9AA5BE]">{item.description}</small></span></button>})}<div className="h-px bg-slate-100 my-3"/><button onClick={()=>setSubmissionsOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-[#5A6A8A] hover:bg-[#F8FAFD]"><span className="w-9 h-9 rounded-xl bg-[#EFF2FA] flex items-center justify-center"><ClipboardCheck size={16}/></span><span><b className="block text-[12.5px]">Submissions</b><small className="text-[10.5px] text-[#9AA5BE]">Review assignments</small></span></button><button onClick={()=>setCertificatesOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-[#5A6A8A] hover:bg-[#F8FAFD]"><span className="w-9 h-9 rounded-xl bg-[#EFF2FA] flex items-center justify-center"><ShieldCheck size={16}/></span><span><b className="block text-[12.5px]">Certificates</b><small className="text-[10.5px] text-[#9AA5BE]">Manage credentials</small></span></button></nav></aside>
      <div className="flex-1 min-w-0 px-5 py-5 space-y-5">
        {adminPage==="dashboard"&&<><div><p className="text-[11px] uppercase tracking-widest text-[#9AA5BE]">Admin workspace</p><h1 className="text-[24px] font-bold mt-1" style={{fontFamily:"var(--font-serif)"}}>Dashboard</h1><p className="text-[12.5px] text-[#5A6A8A] mt-1">Monitor learning performance and manage key LMS operations.</p></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map((stat) => <div key={stat.label} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] p-4 shadow-sm"><div className="flex items-center justify-between mb-2"><span className="text-[12px] text-[#5A6A8A]">{stat.label}</span><stat.icon size={15} className="text-[#1B3A6B]" /></div><p className="text-[22px] font-bold">{stat.value}</p></div>)}</div>
        {analytics&&<div className="grid xl:grid-cols-[1fr_1.5fr] gap-4"><div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] p-5 shadow-sm"><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-[#EBF1FA] flex items-center justify-center"><BarChart3 size={16} className="text-[#1B3A6B]"/></span><div><h2 className="text-[14px] font-semibold text-[#0F1C3F]">Learning health</h2><p className="text-[10.5px] text-[#9AA5BE]">Platform-wide engagement</p></div></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">{[{value:`${analytics.summary.average_quiz_score}%`,label:"Quiz average"},{value:analytics.summary.pending_assignment_evaluations,label:"Pending reviews"},{value:analytics.summary.video_learning_minutes,label:"Video minutes"}].map(item=><div key={item.label} className="p-3 bg-[#F8FAFD] border border-[rgba(27,58,107,0.08)] rounded-xl text-center"><p className="text-[20px] font-bold text-[#1B3A6B]">{item.value}</p><p className="text-[10px] text-[#5A6A8A] mt-0.5">{item.label}</p></div>)}</div></div><div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="text-[14px] font-semibold text-[#0F1C3F]">Course performance</h2><p className="text-[10.5px] text-[#9AA5BE] mt-0.5">Average learner progress</p></div><span className="text-[10.5px] text-[#5A6A8A] bg-[#F4F7FC] px-2.5 py-1 rounded-full">Top enrollments</span></div><div className="grid md:grid-cols-2 gap-x-5 gap-y-4 mt-4">{analytics.course_performance.slice(0,4).map(course=><div key={course.course_id} className="min-w-0"><div className="flex justify-between gap-3 text-[11px]"><span className="truncate text-[#0F1C3F] font-medium">{course.title}</span><span className="font-semibold text-[#1B3A6B]">{course.average_progress}%</span></div><div className="h-1.5 bg-[#E8ECF5] rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#1B3A6B] rounded-full" style={{width:`${course.average_progress}%`}}/></div><p className="text-[9.5px] text-[#9AA5BE] mt-1.5">{course.enrollment_count} enrollments · {course.completion_rate}% completed</p></div>)}</div></div></div>}<div className="grid sm:grid-cols-3 gap-3"><button onClick={()=>setAdminPage("courses")} className="p-5 bg-white border rounded-2xl text-left"><BookOpen size={18} className="text-[#1B3A6B]"/><b className="block text-[13px] mt-3">Manage Courses</b><span className="text-[11px] text-[#9AA5BE]">{total} courses available</span></button><button onClick={openNewCourse} className="p-5 bg-[#1B3A6B] text-white rounded-2xl text-left"><Plus size={18}/><b className="block text-[13px] mt-3">Create Course</b><span className="text-[11px] text-white/55">Start a new draft</span></button><button onClick={()=>setSubmissionsOpen(true)} className="p-5 bg-white border rounded-2xl text-left"><ClipboardCheck size={18} className="text-[#1B3A6B]"/><b className="block text-[13px] mt-3">Review Work</b><span className="text-[11px] text-[#9AA5BE]">Pending evaluations</span></button></div></>}
        <div className={`${adminPage==="dashboard"?"hidden":"flex"} flex-col lg:flex-row gap-4`}>
          <section className={`${adminPage==="add-course"?"hidden":"block"} lg:w-[48%] space-y-4`}>
            <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] p-4 shadow-sm space-y-3">
              <div className="flex gap-2 flex-col md:flex-row md:items-center"><div className="relative flex-1"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses" className="w-full pl-8 pr-3 py-2.5 bg-[#F8FAFD] border border-[rgba(27,58,107,0.12)] rounded-xl text-[13px] outline-none" /></div><div className="flex gap-1 flex-wrap">{(["all", "published", "draft", "archived"] as const).map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-2 rounded-xl text-[12px] font-medium capitalize ${statusFilter === status ? "bg-[#1B3A6B] text-white" : "bg-white text-[#5A6A8A]"}`}>{status}</button>)}</div><select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-[rgba(27,58,107,0.12)] text-[12px] bg-white outline-none"><option value="all">All levels</option>{LEVELS.map((level) => <option key={level}>{level}</option>)}</select></div>
              <p className="text-[12px] text-[#5A6A8A]">{loading ? "Loading courses…" : `${items.length} on this page`}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] shadow-sm overflow-hidden">
              {loading ? <div className="p-10 flex items-center justify-center gap-2 text-[#5A6A8A]"><Loader2 size={16} className="animate-spin" />Loading…</div> : items.length === 0 ? <div className="p-10 text-center text-[#5A6A8A]"><BookOpen size={22} className="mx-auto mb-3 text-[#CBD5E1]" />No courses found.</div> : <table className="w-full"><thead><tr className="border-b border-[rgba(27,58,107,0.08)] bg-[#F8FAFD]"><th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-[#9AA5BE]">Course</th><th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-[#9AA5BE]">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{items.map((course) => <tr key={course.id} className="border-b border-[rgba(27,58,107,0.05)] hover:bg-[#FAFBFE]"><td className="px-4 py-4"><button onClick={() => void loadDetail(course.id)} className="text-left"><p className="text-[13.5px] font-semibold">{course.title}</p><p className="text-[11.5px] text-[#5A6A8A] mt-1">{course.level} • {course.duration_hours}h • {course.section_count} sections</p></button></td><td className="px-4 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${STATUS_BADGE[course.status]}`}>{course.status}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-1"><button onClick={() => void loadDetail(course.id)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><Edit2 size={14} /></button></div></td></tr>)}</tbody></table>}
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#5A6A8A]"><span>Page {page} of {pages || 1}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="px-3 py-2 rounded-xl border border-[rgba(27,58,107,0.12)] disabled:opacity-40 flex items-center gap-1"><ChevronLeft size={14} />Prev</button><button disabled={pages > 0 && page >= pages} onClick={() => setPage((value) => value + 1)} className="px-3 py-2 rounded-xl border border-[rgba(27,58,107,0.12)] disabled:opacity-40 flex items-center gap-1">Next<ChevronRight size={14} /></button></div></div>
          </section>
          <section className={`${adminPage==="add-course"?"w-full max-w-4xl mx-auto":"lg:w-[52%]"} bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] shadow-sm overflow-hidden`}>
            {!editorOpen ? (
              <div className="p-8 text-center text-[#5A6A8A]"><Layers size={24} className="mx-auto mb-3 text-[#CBD5E1]" />Select a course or create a new one to open the curriculum builder.</div>
            ) : !detail ? (
              <div className="p-6 space-y-6">
                <div><span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_BADGE.draft}`}>New draft</span><h2 className="text-[24px] font-bold mt-2" style={{ fontFamily: "var(--font-serif)" }}>Create a new course</h2><p className="text-[13px] text-[#5A6A8A] mt-1">Complete three short steps. Curriculum can be added after the draft is created.</p></div>
                <div className="grid grid-cols-3 gap-2">{[{n:1,label:"Basics"},{n:2,label:"Configuration"},{n:3,label:"Review"}].map(step=><div key={step.n} className={`p-3 rounded-xl border ${courseStep===step.n?"bg-[#EBF1FA] border-[#1B3A6B]":courseStep>step.n?"bg-emerald-50 border-emerald-200":"bg-[#F8FAFD] border-slate-200"}`}><span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${courseStep>=step.n?"bg-[#1B3A6B] text-white":"bg-slate-200 text-slate-500"}`}>{courseStep>step.n?<CheckCircle2 size={13}/>:step.n}</span><p className="text-[11.5px] font-semibold mt-2">{step.label}</p></div>)}</div>
                {courseStep===1&&<div className="space-y-4"><label className="block text-[12px] font-semibold">Course title <span className="text-red-500">*</span><input value={courseForm.title} onChange={(e) => setCourseForm((value) => ({ ...value, title: e.target.value }))} placeholder="e.g. Backend APIs with Node.js" className="w-full mt-1.5 px-3 py-3 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" /></label><label className="block text-[12px] font-semibold">Description <span className="text-red-500">*</span><textarea value={courseForm.description} onChange={(e) => setCourseForm((value) => ({ ...value, description: e.target.value }))} rows={5} className="w-full mt-1.5 px-3 py-3 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none resize-none" placeholder="What students will learn and build" /></label><label className="block text-[12px] font-semibold">Instructor name<input value={courseForm.instructor_name || ""} onChange={(e) => setCourseForm((value) => ({ ...value, instructor_name: e.target.value }))} placeholder="Instructor or team name" className="w-full mt-1.5 px-3 py-3 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" /></label></div>}
                {courseStep===2&&<div className="grid md:grid-cols-2 gap-4"><label className="text-[12px] font-semibold">Course slug<input value={courseForm.slug || ""} onChange={(e) => setCourseForm((value) => ({ ...value, slug: e.target.value }))} placeholder="auto-generated if empty" className="w-full mt-1.5 px-3 py-3 rounded-xl border bg-[#F8FAFD]" /></label><label className="text-[12px] font-semibold">Level<select value={courseForm.level} onChange={(e) => setCourseForm((value) => ({ ...value, level: e.target.value }))} className="w-full mt-1.5 px-3 py-3 rounded-xl border bg-[#F8FAFD]">{LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label><label className="text-[12px] font-semibold">Duration (hours)<input type="number" min={1} value={courseForm.duration_hours} onChange={(e) => setCourseForm((value) => ({ ...value, duration_hours: Number(e.target.value) }))} className="w-full mt-1.5 px-3 py-3 rounded-xl border bg-[#F8FAFD]" /></label><label className="text-[12px] font-semibold">Skills <span className="text-red-500">*</span><input value={joinSkills(courseForm.skills)} onChange={(e) => setCourseForm((value) => ({ ...value, skills: splitSkills(e.target.value) }))} placeholder="Node.js, REST, PostgreSQL" className="w-full mt-1.5 px-3 py-3 rounded-xl border bg-[#F8FAFD]" /></label><label className="md:col-span-2 text-[12px] font-semibold">Thumbnail URL<input value={courseForm.thumbnail_url || ""} onChange={(e) => setCourseForm((value) => ({ ...value, thumbnail_url: e.target.value }))} placeholder="https://..." className="w-full mt-1.5 px-3 py-3 rounded-xl border bg-[#F8FAFD]" /></label></div>}
                {courseStep===3&&<div className="rounded-2xl border bg-[#F8FAFD] p-5 space-y-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-widest text-[#9AA5BE]">Draft preview</p><h3 className="text-[18px] font-bold mt-1">{courseForm.title}</h3><p className="text-[12px] text-[#5A6A8A] mt-2">{courseForm.description}</p></div><span className="px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-semibold">{courseForm.level}</span></div><div className="grid sm:grid-cols-3 gap-3">{[{label:"Duration",value:`${courseForm.duration_hours} hours`},{label:"Instructor",value:courseForm.instructor_name||"Not specified"},{label:"Skills",value:courseForm.skills.length}].map(x=><div key={x.label} className="bg-white p-3 rounded-xl border"><p className="text-[10px] text-[#9AA5BE]">{x.label}</p><p className="text-[12px] font-semibold mt-1">{x.value}</p></div>)}</div><p className="text-[11px] text-[#5A6A8A]">Course draft create hone ke baad Curriculum Builder automatically open hoga.</p></div>}
                <div className="flex justify-between border-t pt-5"><button disabled={courseStep===1||submitting} onClick={()=>setCourseStep(x=>Math.max(1,x-1))} className="px-4 py-2.5 rounded-xl border text-[12px] font-semibold disabled:opacity-40">Previous</button>{courseStep<3?<button disabled={(courseStep===1&&(!courseForm.title.trim()||!courseForm.description.trim()))||(courseStep===2&&(!courseForm.duration_hours||!courseForm.skills.length))} onClick={()=>setCourseStep(x=>Math.min(3,x+1))} className="px-5 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-[12px] font-semibold disabled:opacity-40">Continue</button>:<button disabled={submitting} onClick={() => void saveCourse()} className="px-5 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-[12px] font-semibold flex items-center gap-2 disabled:opacity-60"><Save size={14}/>{submitting?"Creating…":"Create Draft & Add Curriculum"}</button>}</div>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${STATUS_BADGE[detail.status]}`}>{detail.status}</span>
                    <h2 className="text-[22px] font-bold mt-2" style={{ fontFamily: "var(--font-serif)" }}>{detail.title}</h2>
                    <p className="text-[13px] text-[#5A6A8A] mt-1">{detail.description}</p>
                  </div>
                  <button onClick={() => setEditorOpen(false)} className="p-2 rounded-lg hover:bg-[#F4F7FC]"><Eye size={16} /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={courseForm.title} onChange={(e) => setCourseForm((value) => ({ ...value, title: e.target.value }))} placeholder="Course title" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <input value={courseForm.slug || ""} onChange={(e) => setCourseForm((value) => ({ ...value, slug: e.target.value }))} placeholder="course-slug" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <select value={courseForm.level} onChange={(e) => setCourseForm((value) => ({ ...value, level: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none">{LEVELS.map((level) => <option key={level}>{level}</option>)}</select>
                  <input type="number" min={1} value={courseForm.duration_hours} onChange={(e) => setCourseForm((value) => ({ ...value, duration_hours: Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <input value={joinSkills(courseForm.skills)} onChange={(e) => setCourseForm((value) => ({ ...value, skills: splitSkills(e.target.value) }))} placeholder="React, FastAPI, PostgreSQL" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <input value={courseForm.instructor_name || ""} onChange={(e) => setCourseForm((value) => ({ ...value, instructor_name: e.target.value }))} placeholder="Instructor name" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                </div>
                <textarea value={courseForm.description} onChange={(e) => setCourseForm((value) => ({ ...value, description: e.target.value }))} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none resize-none" placeholder="Course description" />
                <div className="flex gap-2 flex-wrap">
                  <button disabled={submitting} onClick={() => void saveCourse()} className="px-4 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-[13px] font-semibold flex items-center gap-2 disabled:opacity-60"><Save size={14} />Save</button>
                  <button disabled={submitting || !selectedId || detail.status === "published"} onClick={() => void publishSelected()} className="px-4 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] text-[13px] font-semibold disabled:opacity-60">Publish</button>
                  <button disabled={submitting || !selectedId || detail.status === "archived"} onClick={() => void archiveSelected()} className="px-4 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] text-[13px] font-semibold disabled:opacity-60">Archive</button>
                  <button disabled={submitting || !selectedId || detail.status !== "archived"} onClick={() => void restoreSelected()} className="px-4 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] text-[13px] font-semibold disabled:opacity-60">Restore</button>
                  <button disabled={submitting || !selectedId} onClick={() => void removeCourse()} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-[13px] font-semibold disabled:opacity-60">Delete</button>
                </div>
                <div className="rounded-2xl border border-[rgba(27,58,107,0.08)] bg-[#FAFBFE] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div><h3 className="text-[15px] font-semibold">Publication Readiness</h3><p className="text-[12px] text-[#5A6A8A]">{detail.publication_readiness.is_ready ? "Ready to publish" : "Fix the issues below"}</p></div>
                    {detail.publication_readiness.is_ready ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-amber-600" />}
                  </div>
                  <div className="space-y-2">{detail.publication_readiness.issues.length === 0 ? <p className="text-[13px] text-emerald-700">No blocking issues.</p> : detail.publication_readiness.issues.map((issue) => <div key={issue} className="flex items-start gap-2 text-[12.5px] text-amber-700"><Lock size={13} className="mt-0.5 shrink-0" /><span>{issue}</span></div>)}</div>
                </div>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-[1fr_auto] gap-2">
                    <input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="New section title" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-white outline-none" />
                    <button disabled={submitting || !sectionTitle.trim()} onClick={() => void addSection()} className="px-4 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-[13px] font-semibold flex items-center gap-2 disabled:opacity-60"><Plus size={14} />Add Section</button>
                  </div>
                  {detail.sections.map((section, index) => (
                    <div key={section.id} className="rounded-2xl border border-[rgba(27,58,107,0.08)] bg-white overflow-hidden">
                      <div className="px-4 py-3 flex items-start justify-between gap-3 border-b border-[rgba(27,58,107,0.05)] bg-[#FAFBFE]">
                        <div>{editingSectionId === section.id ? <input value={editingSectionTitle} onChange={(e) => setEditingSectionTitle(e.target.value)} className="px-3 py-2 rounded-xl border border-[rgba(27,58,107,0.12)] bg-white outline-none" /> : <><p className="text-[13.5px] font-semibold">{index + 1}. {section.title}</p><p className="text-[11.5px] text-[#5A6A8A]">{section.lessons.length} lessons</p></>}</div>
                        <div className="flex items-center gap-1">{editingSectionId === section.id ? <button onClick={() => void updateSectionTitle()} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><Save size={14} /></button> : <button onClick={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><Edit2 size={14} /></button>}<button onClick={() => void moveSection(section.id, -1)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><ChevronLeft size={14} /></button><button onClick={() => void moveSection(section.id, 1)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><ChevronRight size={14} /></button><button onClick={() => void deleteSectionId(section.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button></div>
                      </div>
                      <div className="p-4 space-y-3">
                        {section.lessons.map((lesson) => {
                          const meta = LESSON_META[lesson.lesson_type];
                          return <div key={lesson.id} className="rounded-xl border border-[rgba(27,58,107,0.08)] bg-[#FCFDFF] p-3"><div className="flex items-start justify-between gap-3"><div><div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-semibold bg-slate-50 text-slate-700 border-slate-100"><meta.icon size={11} />{meta.label}</div><p className="text-[13px] font-semibold mt-1">{lesson.title}</p><p className="text-[11.5px] text-[#5A6A8A]">{lesson.duration_minutes} min • {lesson.is_preview ? "Preview" : "Locked"}</p>{lesson.lesson_type==="quiz"&&<button onClick={()=>setQuizLessonId(lesson.id)} className="mt-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-semibold">Configure Quiz</button>}{lesson.lesson_type==="assignment"&&<button onClick={()=>setAssignmentLessonId(lesson.id)} className="mt-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[11px] font-semibold">Configure Assignment</button>}</div><div className="flex items-center gap-1"><button onClick={() => startLesson(section.id, lesson)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><Edit2 size={14} /></button><button onClick={() => void moveLesson(section.id, lesson.id, -1)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><ChevronLeft size={14} /></button><button onClick={() => void moveLesson(section.id, lesson.id, 1)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><ChevronRight size={14} /></button><button onClick={() => void deleteLessonId(lesson.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button></div></div></div>;
                        })}
                        {lessonSectionId === section.id ? <div className="rounded-xl border border-dashed border-[rgba(27,58,107,0.2)] bg-[#F8FAFD] p-4 space-y-3"><div className="grid md:grid-cols-2 gap-3"><input value={lessonForm.title} onChange={(e) => setLessonForm((value) => ({ ...value, title: e.target.value }))} placeholder="Lesson title" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-white outline-none" /><select value={lessonForm.lesson_type} onChange={(e) => setLessonForm((value) => ({ ...value, lesson_type: e.target.value as LessonType }))} className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-white outline-none">{Object.entries(LESSON_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select><input type="number" min={1} value={lessonForm.duration_minutes} onChange={(e) => setLessonForm((value) => ({ ...value, duration_minutes: Number(e.target.value) }))} placeholder="Duration minutes" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-white outline-none" /><input value={lessonForm.youtube_id || ""} onChange={(e) => setLessonForm((value) => ({ ...value, youtube_id: e.target.value }))} placeholder="YouTube ID or URL" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-white outline-none" /></div><textarea value={lessonForm.article_content || ""} onChange={(e) => setLessonForm((value) => ({ ...value, article_content: e.target.value }))} rows={4} placeholder="Article content" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-white outline-none resize-none" /><label className="flex items-center gap-2 text-[12px] text-[#5A6A8A]"><input type="checkbox" checked={lessonForm.is_preview} onChange={(e) => setLessonForm((value) => ({ ...value, is_preview: e.target.checked }))} />Preview lesson</label><div className="flex gap-2"><button disabled={submitting} onClick={() => void submitLesson()} className="px-4 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-[13px] font-semibold flex items-center gap-2 disabled:opacity-60"><Save size={14} />Save Lesson</button><button onClick={() => { setLessonSectionId(null); setEditingLessonId(null); }} className="px-4 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] text-[13px] font-semibold">Cancel</button></div></div> : <button onClick={() => startLesson(section.id)} className="w-full py-3 rounded-xl border border-dashed border-[rgba(27,58,107,0.18)] text-[13px] font-semibold text-[#1B3A6B]">Add lesson</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
