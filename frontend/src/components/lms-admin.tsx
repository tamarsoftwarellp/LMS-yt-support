import { useEffect, useState } from "react";
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
  type AdminApiError,
  type AdminCourseDetail,
  type AdminCourseListItem,
  type CourseInput,
  type CourseStatus,
  type LessonInput,
  type LessonType,
  type AdminQuizInput,
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
  const save=async()=>{setBusy(true);setError("");try{const q=await saveAdminQuiz(lessonId,form);setQuizId(q.id);setStatus(q.status);}catch(e){setError(errText(e));}finally{setBusy(false);}};
  const publish=async()=>{if(!quizId)return;setBusy(true);setError("");try{const q=await publishAdminQuiz(quizId);setStatus(q.status);}catch(e){setError(errText(e));}finally{setBusy(false);}};
  return <div className="fixed inset-0 z-50 bg-[#071326]/70 p-5 overflow-y-auto"><div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 space-y-5"><div className="flex justify-between"><div><p className="text-[11px] uppercase text-[#9AA5BE]">Quiz Builder · {status}</p><h2 className="text-[20px] font-bold">Configure assessment</h2></div><button onClick={onClose} className="text-[13px]">Close</button></div>{error&&<div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12px]">{error}</div>}<textarea value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} rows={3} className="w-full p-3 border rounded-xl" placeholder="Instructions"/><div className="grid grid-cols-3 gap-3"><label className="text-[12px]">Passing %<input type="number" min={1} max={100} value={form.passing_percentage} onChange={e=>setForm({...form,passing_percentage:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label><label className="text-[12px]">Maximum attempts<input type="number" min={1} value={form.maximum_attempts} onChange={e=>setForm({...form,maximum_attempts:Number(e.target.value)})} className="w-full p-2 border rounded-lg mt-1"/></label><label className="text-[12px]">Time limit (optional)<input type="number" min={1} value={form.time_limit_minutes||""} onChange={e=>setForm({...form,time_limit_minutes:e.target.value?Number(e.target.value):null})} className="w-full p-2 border rounded-lg mt-1"/></label></div>{form.questions.map((q,qi)=><div key={qi} className="p-4 border rounded-2xl space-y-3"><div className="flex gap-2"><input value={q.question_text} onChange={e=>setForm({...form,questions:form.questions.map((x,i)=>i===qi?{...x,question_text:e.target.value}:x)})} placeholder={`Question ${qi+1}`} className="flex-1 p-2.5 border rounded-xl"/><select value={q.question_type} onChange={e=>setForm({...form,questions:form.questions.map((x,i)=>i===qi?{...x,question_type:e.target.value as typeof q.question_type}:x)})} className="p-2 border rounded-xl"><option value="single_choice">Single choice</option><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option></select><button onClick={()=>setForm({...form,questions:form.questions.filter((_,i)=>i!==qi)})} className="p-2 text-red-600"><Trash2 size={15}/></button></div>{q.options.map((o,oi)=><div key={oi} className="flex gap-2"><input type={q.question_type==="multiple_choice"?"checkbox":"radio"} name={`correct-${qi}`} checked={o.is_correct} onChange={()=>setForm({...form,questions:form.questions.map((x,i)=>i!==qi?x:{...x,options:x.options.map((option,j)=>({...option,is_correct:j===oi?true:(q.question_type==="multiple_choice"?option.is_correct:false)}))})})}/><input value={o.option_text} onChange={e=>setForm({...form,questions:form.questions.map((x,i)=>i!==qi?x:{...x,options:x.options.map((option,j)=>j===oi?{...option,option_text:e.target.value}:option)})})} placeholder={`Option ${oi+1}`} className="flex-1 p-2 border rounded-lg"/></div>)}<button onClick={()=>setForm({...form,questions:form.questions.map((x,i)=>i===qi?{...x,options:[...x.options,{option_text:"",is_correct:false}]}:x)})} className="text-[12px] text-[#1B3A6B]">+ Add option</button></div>)}<button onClick={()=>setForm({...form,questions:[...form.questions,blankQuestion()]})} className="px-4 py-2 border rounded-xl text-[12px]">+ Add question</button><div className="flex justify-end gap-2"><button disabled={busy} onClick={save} className="px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[13px]">Save Draft</button><button disabled={busy||!quizId} onClick={publish} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] disabled:opacity-40">Publish Quiz</button></div></div></div>;
}

export function LMSAdminSection({ onBack }: { onBack: () => void }) {
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
    { label: "Courses", value: total, icon: BookOpen },
    { label: "Published", value: items.filter((item) => item.status === "published").length, icon: CheckCircle2 },
    { label: "Draft", value: items.filter((item) => item.status === "draft").length, icon: Loader2 },
    { label: "Archived", value: items.filter((item) => item.status === "archived").length, icon: Archive },
  ];

  return (
    <div className="min-h-screen bg-[#F2F5FC] text-[#0F1C3F]" style={{ fontFamily: "var(--font-sans)" }}>
      {quizLessonId&&<QuizBuilder lessonId={quizLessonId} onClose={()=>setQuizLessonId(null)}/>} 
      <header className="sticky top-0 z-20 bg-[#0F1F3B] text-white border-b border-white/5">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><ArrowLeft size={16} /></button><div><p className="text-[13px] font-semibold">EduConnect</p><p className="text-[10px] uppercase tracking-[0.2em] text-white/45 mt-1">Admin LMS</p></div></div>
          <button onClick={() => { setSelectedId(null); setDetail(null); setCourseForm(blankCourse); setEditorOpen(true); }} className="px-3 py-2 rounded-xl bg-white/10 text-[12px] font-semibold flex items-center gap-2"><Plus size={14} />New Course</button>
        </div>
      </header>
      <div className="px-5 py-5 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map((stat) => <div key={stat.label} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] p-4 shadow-sm"><div className="flex items-center justify-between mb-2"><span className="text-[12px] text-[#5A6A8A]">{stat.label}</span><stat.icon size={15} className="text-[#1B3A6B]" /></div><p className="text-[22px] font-bold">{stat.value}</p></div>)}</div>
        {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-2 text-[12.5px]"><AlertCircle size={14} />{error}</div>}
        {notice && <div className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-2 text-[12.5px]"><CheckCircle2 size={14} />{notice}</div>}
        <div className="flex flex-col lg:flex-row gap-4">
          <section className="lg:w-[48%] space-y-4">
            <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] p-4 shadow-sm space-y-3">
              <div className="flex gap-2 flex-col md:flex-row md:items-center"><div className="relative flex-1"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses" className="w-full pl-8 pr-3 py-2.5 bg-[#F8FAFD] border border-[rgba(27,58,107,0.12)] rounded-xl text-[13px] outline-none" /></div><div className="flex gap-1 flex-wrap">{(["all", "published", "draft", "archived"] as const).map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-2 rounded-xl text-[12px] font-medium capitalize ${statusFilter === status ? "bg-[#1B3A6B] text-white" : "bg-white text-[#5A6A8A]"}`}>{status}</button>)}</div><select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-[rgba(27,58,107,0.12)] text-[12px] bg-white outline-none"><option value="all">All levels</option>{LEVELS.map((level) => <option key={level}>{level}</option>)}</select></div>
              <p className="text-[12px] text-[#5A6A8A]">{loading ? "Loading courses…" : `${items.length} on this page`}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] shadow-sm overflow-hidden">
              {loading ? <div className="p-10 flex items-center justify-center gap-2 text-[#5A6A8A]"><Loader2 size={16} className="animate-spin" />Loading…</div> : items.length === 0 ? <div className="p-10 text-center text-[#5A6A8A]"><BookOpen size={22} className="mx-auto mb-3 text-[#CBD5E1]" />No courses found.</div> : <table className="w-full"><thead><tr className="border-b border-[rgba(27,58,107,0.08)] bg-[#F8FAFD]"><th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-[#9AA5BE]">Course</th><th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-[#9AA5BE]">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{items.map((course) => <tr key={course.id} className="border-b border-[rgba(27,58,107,0.05)] hover:bg-[#FAFBFE]"><td className="px-4 py-4"><button onClick={() => void loadDetail(course.id)} className="text-left"><p className="text-[13.5px] font-semibold">{course.title}</p><p className="text-[11.5px] text-[#5A6A8A] mt-1">{course.level} • {course.duration_hours}h • {course.section_count} sections</p></button></td><td className="px-4 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${STATUS_BADGE[course.status]}`}>{course.status}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-1"><button onClick={() => void loadDetail(course.id)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><Edit2 size={14} /></button></div></td></tr>)}</tbody></table>}
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#5A6A8A]"><span>Page {page} of {pages || 1}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="px-3 py-2 rounded-xl border border-[rgba(27,58,107,0.12)] disabled:opacity-40 flex items-center gap-1"><ChevronLeft size={14} />Prev</button><button disabled={pages > 0 && page >= pages} onClick={() => setPage((value) => value + 1)} className="px-3 py-2 rounded-xl border border-[rgba(27,58,107,0.12)] disabled:opacity-40 flex items-center gap-1">Next<ChevronRight size={14} /></button></div></div>
          </section>
          <section className="lg:w-[52%] bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] shadow-sm overflow-hidden">
            {!editorOpen ? (
              <div className="p-8 text-center text-[#5A6A8A]"><Layers size={24} className="mx-auto mb-3 text-[#CBD5E1]" />Select a course or create a new one to open the curriculum builder.</div>
            ) : !detail ? (
              <div className="p-5 space-y-5">
                <div><span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_BADGE.draft}`}>New draft</span><h2 className="text-[22px] font-bold mt-2" style={{ fontFamily: "var(--font-serif)" }}>Create a new course</h2><p className="text-[13px] text-[#5A6A8A] mt-1">Save the course details first, then build its curriculum.</p></div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={courseForm.title} onChange={(e) => setCourseForm((value) => ({ ...value, title: e.target.value }))} placeholder="Course title" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <input value={courseForm.slug || ""} onChange={(e) => setCourseForm((value) => ({ ...value, slug: e.target.value }))} placeholder="course-slug (optional)" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <select value={courseForm.level} onChange={(e) => setCourseForm((value) => ({ ...value, level: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none">{LEVELS.map((level) => <option key={level}>{level}</option>)}</select>
                  <input type="number" min={1} value={courseForm.duration_hours} onChange={(e) => setCourseForm((value) => ({ ...value, duration_hours: Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <input value={joinSkills(courseForm.skills)} onChange={(e) => setCourseForm((value) => ({ ...value, skills: splitSkills(e.target.value) }))} placeholder="React, FastAPI, PostgreSQL" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                  <input value={courseForm.instructor_name || ""} onChange={(e) => setCourseForm((value) => ({ ...value, instructor_name: e.target.value }))} placeholder="Instructor name" className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none" />
                </div>
                <textarea value={courseForm.description} onChange={(e) => setCourseForm((value) => ({ ...value, description: e.target.value }))} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-[rgba(27,58,107,0.12)] bg-[#F8FAFD] outline-none resize-none" placeholder="Course description" />
                <button disabled={submitting || !courseForm.title.trim() || !courseForm.description.trim()} onClick={() => void saveCourse()} className="px-4 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-[13px] font-semibold flex items-center gap-2 disabled:opacity-60"><Save size={14} />Create Draft Course</button>
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
                          return <div key={lesson.id} className="rounded-xl border border-[rgba(27,58,107,0.08)] bg-[#FCFDFF] p-3"><div className="flex items-start justify-between gap-3"><div><div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-semibold bg-slate-50 text-slate-700 border-slate-100"><meta.icon size={11} />{meta.label}</div><p className="text-[13px] font-semibold mt-1">{lesson.title}</p><p className="text-[11.5px] text-[#5A6A8A]">{lesson.duration_minutes} min • {lesson.is_preview ? "Preview" : "Locked"}</p>{lesson.lesson_type==="quiz"&&<button onClick={()=>setQuizLessonId(lesson.id)} className="mt-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-semibold">Configure Quiz</button>}</div><div className="flex items-center gap-1"><button onClick={() => startLesson(section.id, lesson)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><Edit2 size={14} /></button><button onClick={() => void moveLesson(section.id, lesson.id, -1)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><ChevronLeft size={14} /></button><button onClick={() => void moveLesson(section.id, lesson.id, 1)} className="p-2 rounded-lg hover:bg-[#EBF1FA]"><ChevronRight size={14} /></button><button onClick={() => void deleteLessonId(lesson.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button></div></div></div>;
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
  );
}
