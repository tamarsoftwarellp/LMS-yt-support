import { useState, useRef } from "react";
import {
  Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp,
  Video, AlignLeft, HelpCircle, Paperclip, Upload, GripVertical,
  BookOpen, Users, Star, TrendingUp, Search,
  Eye, FileText, Clock, Layers, Save,
  CheckCircle2, AlertCircle, PlayCircle, Settings,
  Globe, LayoutList, Info,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
type CourseStatus = "published" | "draft" | "archived";
type LessonType = "video" | "article" | "quiz" | "assignment";
type FormTab = "info" | "curriculum" | "settings";

interface Resource { id: string; name: string; size: string; }
interface AdminLesson {
  id: string; title: string; type: LessonType; duration: string;
  isPreview: boolean; videoName?: string; videoSize?: string; description?: string;
  resources: Resource[];
}
interface AdminSection { id: string; title: string; lessons: AdminLesson[]; }
interface AdminCourse {
  id: string; title: string; category: string; level: string; instructor: string;
  description: string; skills: string; totalHours: string; status: CourseStatus;
  color: string; emoji: string; enrolledCount: number; completionRate: number;
  rating: number; sections: AdminSection[]; createdAt: string; updatedAt: string;
  thumbnail?: string; welcomeMsg?: string;
}

// ─── seed data ─────────────────────────────────────────────────────────────────
const SEED_COURSES: AdminCourse[] = [
  {
    id: "ac1", title: "Full Stack Web Development", category: "Web Dev",
    level: "Intermediate", instructor: "Rahul Mehta", color: "#1B3A6B", emoji: "🌐",
    description: "Master HTML, CSS, JavaScript, React, Node.js and PostgreSQL end-to-end.",
    skills: "React, Node.js, PostgreSQL, REST APIs, Git",
    totalHours: "42", status: "published", enrolledCount: 12400,
    completionRate: 68, rating: 4.8, createdAt: "2025-01-10", updatedAt: "2026-07-01",
    sections: [
      {
        id: "s1", title: "Web Foundations", lessons: [
          { id: "l1", title: "How the Web Works", type: "video", duration: "12", isPreview: true, videoName: "web-foundations.mp4", videoSize: "234 MB", description: "Overview of HTTP, DNS, browsers.", resources: [{ id: "r1", name: "Slides.pdf", size: "1.2 MB" }] },
          { id: "l2", title: "HTML Essentials", type: "video", duration: "18", isPreview: false, videoName: "html-essentials.mp4", videoSize: "418 MB", resources: [] },
          { id: "l3", title: "CSS Layouts", type: "article", duration: "10", isPreview: false, resources: [] },
          { id: "l4", title: "Chapter Quiz", type: "quiz", duration: "5", isPreview: false, resources: [] },
        ],
      },
      {
        id: "s2", title: "JavaScript Mastery", lessons: [
          { id: "l5", title: "ES6+ Features", type: "video", duration: "22", isPreview: false, videoName: "es6-features.mp4", videoSize: "512 MB", resources: [] },
          { id: "l6", title: "Async / Await", type: "video", duration: "15", isPreview: false, resources: [] },
          { id: "l7", title: "JS Project", type: "assignment", duration: "45", isPreview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: "ac2", title: "Data Science with Python", category: "Data Science",
    level: "Beginner", instructor: "Dr. Anita Sharma", color: "#7C3AED", emoji: "📊",
    description: "Learn Python, pandas, NumPy, matplotlib and machine learning basics.",
    skills: "Python, pandas, NumPy, Matplotlib, Scikit-learn",
    totalHours: "36", status: "published", enrolledCount: 9800,
    completionRate: 54, rating: 4.7, createdAt: "2025-02-15", updatedAt: "2026-06-20",
    sections: [
      { id: "s1", title: "Python Basics", lessons: [
        { id: "l1", title: "Python Setup", type: "video", duration: "10", isPreview: true, videoName: "python-setup.mp4", videoSize: "198 MB", resources: [] },
        { id: "l2", title: "Variables & Types", type: "video", duration: "14", isPreview: false, resources: [] },
      ]},
    ],
  },
  {
    id: "ac3", title: "UI/UX Design Principles", category: "Design",
    level: "Beginner", instructor: "Priya Iyer", color: "#D97706", emoji: "🎨",
    description: "Master design thinking, Figma, wireframing, and user research.",
    skills: "Figma, Wireframing, Prototyping, User Research",
    totalHours: "0", status: "draft", enrolledCount: 0,
    completionRate: 0, rating: 0, createdAt: "2026-06-01", updatedAt: "2026-07-10",
    sections: [],
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const LESSON_TYPES: { type: LessonType; label: string; colorCls: string; icon: React.ElementType }[] = [
  { type: "video",      label: "Video",      colorCls: "bg-blue-100 text-blue-700 border-blue-200",   icon: Video },
  { type: "article",    label: "Article",    colorCls: "bg-slate-100 text-slate-700 border-slate-200", icon: AlignLeft },
  { type: "quiz",       label: "Quiz",       colorCls: "bg-purple-100 text-purple-700 border-purple-200", icon: HelpCircle },
  { type: "assignment", label: "Assignment", colorCls: "bg-amber-100 text-amber-700 border-amber-200",  icon: Paperclip },
];
const CATEGORIES = ["Web Dev","Data Science","Design","Cloud","AI/ML","CS Fundamentals","Mobile","Security"];
const LEVELS     = ["Beginner","Intermediate","Advanced"];
const EMOJIS     = ["🌐","📊","🎨","☁️","🤖","⚡","🔐","📱","🧮","🎯","🚀","💡"];
const COLORS     = ["#1B3A6B","#7C3AED","#D97706","#059669","#DC2626","#0891B2","#DB2777","#EA580C"];

function ltStyle(t: LessonType) { return LESSON_TYPES.find(x => x.type === t)?.colorCls ?? ""; }

// ─── VIDEO UPLOAD ZONE ────────────────────────────────────────────────────────
function VideoUploadZone({ lesson, onUpdate }: { lesson: AdminLesson; onUpdate: (l: AdminLesson) => void }) {
  const [pct, setPct] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const start = (name: string, size: number) => {
    const sizeMB = (size / 1024 / 1024).toFixed(1) + " MB";
    onUpdate({ ...lesson, videoName: name, videoSize: sizeMB });
    setPct(0);
    const iv = setInterval(() => setPct(p => {
      if (p === null || p >= 100) { clearInterval(iv); return 100; }
      return Math.min(p + Math.random() * 12 + 4, 100);
    }), 200);
  };

  const onFile = (f: File) => start(f.name, f.size);

  if (lesson.videoName && pct === 100) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <PlayCircle size={18} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#0F1C3F] truncate">{lesson.videoName}</p>
            <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{lesson.videoSize} · Uploaded ✓</p>
          </div>
          <button onClick={() => { onUpdate({ ...lesson, videoName: undefined, videoSize: undefined }); setPct(null); }}
            className="text-[11.5px] text-[#9AA5BE] hover:text-red-400 transition-colors flex items-center gap-1 border border-[rgba(27,58,107,0.15)] px-2.5 py-1.5 rounded-lg hover:border-red-200">
            <Trash2 size={12} /> Remove
          </button>
        </div>
        <div className="mt-3 aspect-video bg-[#0A1629] rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="text-white/20 text-[11px] font-mono">{lesson.videoName}</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <PlayCircle size={28} className="text-white/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pct !== null && pct < 100) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 animate-pulse">
            <Upload size={14} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-[12.5px] font-semibold text-blue-800 truncate">{lesson.videoName}</p>
            <p className="text-[11px] text-blue-500">Uploading… {Math.floor(pct)}%</p>
          </div>
        </div>
        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all
          ${dragging ? "border-blue-400 bg-blue-50 scale-[1.01]" : "border-[rgba(27,58,107,0.2)] hover:border-blue-400 hover:bg-blue-50/40"}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-blue-100" : "bg-[#EBF1FA]"}`}>
          <Upload size={24} className={dragging ? "text-blue-600" : "text-[#1B3A6B]"} />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-[#0F1C3F]">
            {dragging ? "Drop to upload" : "Upload video"}
          </p>
          <p className="text-[12px] text-[#5A6A8A] mt-0.5">Drag & drop or click to browse</p>
          <p className="text-[11px] text-[#CBD5E1] mt-1">MP4, MOV, AVI, MKV · Up to 4K · Max 5 GB</p>
        </div>
      </div>
    </>
  );
}

// ─── LESSON EDITOR ────────────────────────────────────────────────────────────
function LessonEditor({ lesson, sectionNum, lessonNum, onUpdate, onDelete }: {
  lesson: AdminLesson; sectionNum: number; lessonNum: number;
  onUpdate: (l: AdminLesson) => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const LT = LESSON_TYPES.find(x => x.type === lesson.type)!;

  return (
    <div className={`rounded-xl overflow-hidden border transition-all ${open ? "border-[#1B3A6B]/30 shadow-md" : "border-[rgba(27,58,107,0.1)]"} bg-white`}>
      {/* collapsed row */}
      <div className={`flex items-center gap-2.5 px-3.5 py-3 ${open ? "bg-[#F4F7FC]" : "bg-white"} cursor-pointer`}
        onClick={() => setOpen(!open)}>
        <GripVertical size={14} className="text-[#CBD5E1] cursor-grab shrink-0" onClick={e => e.stopPropagation()} />

        {/* lesson number */}
        <span className="w-6 h-6 rounded-lg bg-[#EBF1FA] text-[#1B3A6B] text-[10.5px] font-bold flex items-center justify-center shrink-0">
          {sectionNum}.{lessonNum}
        </span>

        {/* type badge */}
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border shrink-0 ${ltStyle(lesson.type)}`}>
          <LT.icon size={9} />{LT.label}
        </span>

        {/* title inline edit */}
        <input value={lesson.title} onChange={e => { e.stopPropagation(); onUpdate({ ...lesson, title: e.target.value }); }}
          onClick={e => e.stopPropagation()}
          className="flex-1 text-[13px] font-medium text-[#0F1C3F] bg-transparent outline-none placeholder:text-[#CBD5E1] min-w-0"
          placeholder="Lesson title…" />

        {/* duration */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <Clock size={11} className="text-[#9AA5BE]" />
          <input value={lesson.duration} onChange={e => onUpdate({ ...lesson, duration: e.target.value })}
            className="w-[40px] text-[12px] text-[#5A6A8A] bg-[#F8FAFB] border border-[rgba(27,58,107,0.12)] rounded-md px-1.5 py-0.5 text-center outline-none"
            placeholder="0" />
          <span className="text-[11px] text-[#9AA5BE]">min</span>
        </div>

        {/* preview badge */}
        {lesson.isPreview && (
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
            Preview
          </span>
        )}

        {/* video upload state */}
        {lesson.type === "video" && lesson.videoName && (
          <span className="text-[10.5px] text-emerald-600 font-medium flex items-center gap-1 shrink-0">
            <CheckCircle2 size={11} /> {lesson.videoSize}
          </span>
        )}
        {lesson.type === "video" && !lesson.videoName && (
          <span className="text-[10.5px] text-amber-600 font-medium flex items-center gap-1 shrink-0">
            <Upload size={10} /> No video
          </span>
        )}

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => setOpen(!open)} className="p-1.5 text-[#9AA5BE] hover:text-[#1B3A6B] rounded-lg hover:bg-[#EBF1FA] transition-colors">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={onDelete} className="p-1.5 text-[#9AA5BE] hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* expanded editor */}
      {open && (
        <div className="border-t border-[rgba(27,58,107,0.08)] bg-white">
          {/* tab strip */}
          <div className="flex border-b border-[rgba(27,58,107,0.08)] px-4">
            {[
              lesson.type === "video" ? { key: "video", label: "Video Upload", icon: Video } : null,
              { key: "content", label: lesson.type === "article" ? "Article Content" : lesson.type === "quiz" ? "Quiz Setup" : "Assignment", icon: FileText },
              { key: "resources", label: "Resources", icon: Paperclip },
              { key: "options", label: "Options", icon: Settings },
            ].filter(Boolean).map(tab => {
              const T = tab!;
              return (
                <TabBtn key={T.key} label={T.label} icon={T.icon} active={false} onClick={() => {}} />
              );
            })}
          </div>

          <div className="p-5 space-y-5">
            {/* Lesson type selector */}
            <div>
              <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2.5">Lesson Type</label>
              <div className="flex gap-2 flex-wrap">
                {LESSON_TYPES.map(lt => (
                  <button key={lt.type} onClick={() => onUpdate({ ...lesson, type: lt.type })}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[12.5px] font-semibold transition-all
                      ${lesson.type === lt.type ? lt.colorCls + " border-current shadow-sm" : "border-[rgba(27,58,107,0.12)] text-[#5A6A8A] hover:border-[#1B3A6B]/30 hover:bg-[#F4F7FC]"}`}>
                    <lt.icon size={13} />{lt.label}
                    {lesson.type === lt.type && <Check size={12} className="ml-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* VIDEO */}
            {lesson.type === "video" && (
              <div>
                <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2.5">Video File</label>
                <VideoUploadZone lesson={lesson} onUpdate={onUpdate} />
              </div>
            )}

            {/* ARTICLE */}
            {lesson.type === "article" && (
              <div>
                <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2.5">Article Content</label>
                <textarea value={lesson.description || ""} onChange={e => onUpdate({ ...lesson, description: e.target.value })}
                  placeholder="Write article content using plain text or Markdown…"
                  rows={8}
                  className="w-full text-[13.5px] text-[#374151] bg-[#F8FAFB] border border-[rgba(27,58,107,0.15)] rounded-xl p-4 outline-none focus:border-[#1B3A6B] resize-none transition-colors placeholder:text-[#CBD5E1] font-mono leading-relaxed" />
              </div>
            )}

            {/* QUIZ */}
            {lesson.type === "quiz" && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                <HelpCircle size={24} className="text-purple-400 mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-purple-700">Quiz Builder</p>
                <p className="text-[12px] text-purple-500 mt-1">Add questions after saving the course. Up to 20 questions per quiz.</p>
              </div>
            )}

            {/* ASSIGNMENT */}
            {lesson.type === "assignment" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Instructions</label>
                  <textarea value={lesson.description || ""} onChange={e => onUpdate({ ...lesson, description: e.target.value })}
                    placeholder="Describe what students need to submit and the evaluation criteria…"
                    rows={5}
                    className="w-full text-[13px] text-[#374151] bg-[#F8FAFB] border border-[rgba(27,58,107,0.15)] rounded-xl p-3.5 outline-none focus:border-[#1B3A6B] resize-none transition-colors placeholder:text-[#CBD5E1]" />
                </div>
              </div>
            )}

            {/* Description (for video) */}
            {lesson.type === "video" && (
              <div>
                <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Description <span className="font-normal normal-case text-[#9AA5BE]">(optional)</span></label>
                <textarea value={lesson.description || ""} onChange={e => onUpdate({ ...lesson, description: e.target.value })}
                  placeholder="What will students learn in this lesson?"
                  rows={3}
                  className="w-full text-[13px] text-[#374151] bg-[#F8FAFB] border border-[rgba(27,58,107,0.15)] rounded-xl p-3.5 outline-none focus:border-[#1B3A6B] resize-none transition-colors placeholder:text-[#CBD5E1]" />
              </div>
            )}

            {/* Resources */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide">Downloadable Resources</label>
                <button onClick={() => onUpdate({ ...lesson, resources: [...lesson.resources, { id: uid(), name: "Resource.pdf", size: "1.2 MB" }] })}
                  className="flex items-center gap-1 text-[12px] text-[#1B3A6B] hover:text-[#152d54] font-semibold transition-colors">
                  <Plus size={13} /> Add file
                </button>
              </div>
              {lesson.resources.length === 0 ? (
                <p className="text-[12px] text-[#CBD5E1] italic">No resources yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {lesson.resources.map(r => (
                    <div key={r.id} className="flex items-center gap-2.5 p-2.5 bg-[#F8FAFB] rounded-xl border border-[rgba(27,58,107,0.08)]">
                      <FileText size={13} className="text-[#9AA5BE] shrink-0" />
                      <input value={r.name} onChange={e => onUpdate({ ...lesson, resources: lesson.resources.map(x => x.id === r.id ? { ...x, name: e.target.value } : x) })}
                        className="flex-1 text-[12.5px] text-[#374151] bg-transparent outline-none" />
                      <button onClick={() => onUpdate({ ...lesson, resources: lesson.resources.filter(x => x.id !== r.id) })} className="text-[#CBD5E1] hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between p-3.5 bg-[#F8FAFB] rounded-xl border border-[rgba(27,58,107,0.08)]">
              <div>
                <p className="text-[13px] font-semibold text-[#0F1C3F]">Free Preview</p>
                <p className="text-[11.5px] text-[#5A6A8A]">Allow non-enrolled students to watch this lesson</p>
              </div>
              <button onClick={() => onUpdate({ ...lesson, isPreview: !lesson.isPreview })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${lesson.isPreview ? "bg-[#1B3A6B]" : "bg-[#CBD5E1]"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${lesson.isPreview ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// tiny tab button helper
function TabBtn({ label, icon: Icon, active, onClick }: { label: string; icon: React.ElementType; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors mr-1
      ${active ? "border-[#1B3A6B] text-[#1B3A6B]" : "border-transparent text-[#5A6A8A] hover:text-[#1B3A6B]"}`}>
      <Icon size={12} />{label}
    </button>
  );
}

// ─── SECTION EDITOR ───────────────────────────────────────────────────────────
function SectionEditor({ section, sectionNum, onUpdate, onDelete }: {
  section: AdminSection; sectionNum: number;
  onUpdate: (s: AdminSection) => void; onDelete: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const totalMins = section.lessons.reduce((s, l) => s + (parseInt(l.duration) || 0), 0);
  const videoCount = section.lessons.filter(l => l.type === "video").length;

  const addLesson = (type: LessonType) => {
    const labels: Record<LessonType, string> = { video: "New Video Lesson", article: "New Article", quiz: "New Quiz", assignment: "New Assignment" };
    onUpdate({ ...section, lessons: [...section.lessons, { id: uid(), title: labels[type], type, duration: "10", isPreview: false, resources: [] }] });
    setShowAddMenu(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-[rgba(27,58,107,0.15)] shadow-sm">
      {/* section header — dark Udemy-style */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-[#F0F4FA] border-b border-[rgba(27,58,107,0.12)]">
        <GripVertical size={15} className="text-[#CBD5E1] cursor-grab shrink-0" />
        <div className="w-7 h-7 rounded-xl bg-[#1B3A6B] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          {sectionNum}
        </div>

        {editingTitle ? (
          <input autoFocus value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={() => { onUpdate({ ...section, title: titleDraft }); setEditingTitle(false); }}
            onKeyDown={e => { if (e.key === "Enter") { onUpdate({ ...section, title: titleDraft }); setEditingTitle(false); } }}
            className="flex-1 text-[14px] font-bold text-[#0F1C3F] border border-[#1B3A6B] rounded-lg px-2.5 py-1 outline-none bg-white" />
        ) : (
          <button onClick={() => setEditingTitle(true)}
            className="flex-1 text-left text-[14px] font-bold text-[#0F1C3F] hover:text-[#1B3A6B] transition-colors flex items-center gap-2 group">
            Section {sectionNum}: {section.title}
            <Edit2 size={12} className="text-[#CBD5E1] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}

        <div className="flex items-center gap-2 text-[11.5px] text-[#9AA5BE] shrink-0">
          <span className="flex items-center gap-1"><Video size={11} />{videoCount} videos</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={11} />{totalMins}m</span>
        </div>

        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 text-[#9AA5BE] hover:text-[#1B3A6B] rounded-lg hover:bg-white transition-colors">
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
        <button onClick={onDelete} className="p-1.5 text-[#9AA5BE] hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {!collapsed && (
        <div className="bg-white p-3 space-y-2">
          {section.lessons.length === 0 ? (
            <div className="py-6 text-center text-[12.5px] text-[#CBD5E1]">No lessons yet. Add your first lecture below.</div>
          ) : (
            section.lessons.map((lesson, li) => (
              <LessonEditor key={lesson.id} lesson={lesson} sectionNum={sectionNum} lessonNum={li + 1}
                onUpdate={updated => onUpdate({ ...section, lessons: section.lessons.map(l => l.id === lesson.id ? updated : l) })}
                onDelete={() => onUpdate({ ...section, lessons: section.lessons.filter(l => l.id !== lesson.id) })} />
            ))
          )}

          {/* Add Lecture button */}
          <div className="relative pt-1">
            <button onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[rgba(27,58,107,0.2)] rounded-xl text-[12.5px] font-semibold text-[#1B3A6B] hover:border-[#1B3A6B] hover:bg-[#EBF1FA]/50 transition-all">
              <Plus size={14} /> Add Lecture
            </button>
            {showAddMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-xl border border-[rgba(27,58,107,0.15)] z-20 overflow-hidden">
                {LESSON_TYPES.map(lt => (
                  <button key={lt.type} onClick={() => addLesson(lt.type)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#374151] hover:bg-[#F4F7FC] transition-colors border-b border-[rgba(27,58,107,0.06)] last:border-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center border ${lt.colorCls}`}><lt.icon size={13} /></span>
                    <div className="text-left">
                      <p className="font-semibold leading-none">{lt.label}</p>
                      <p className="text-[11px] text-[#9AA5BE] mt-0.5">
                        {lt.type === "video" ? "Upload an MP4 or drag & drop" :
                         lt.type === "article" ? "Write text or paste Markdown" :
                         lt.type === "quiz" ? "Auto-graded multiple choice" : "Students submit files"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CURRICULUM TAB ───────────────────────────────────────────────────────────
function CurriculumTab({ form, set }: { form: AdminCourse; set: (p: Partial<AdminCourse>) => void }) {
  const totalLessons = form.sections.flatMap(s => s.lessons).length;
  const totalMins = form.sections.flatMap(s => s.lessons).reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
  const videoLessons = form.sections.flatMap(s => s.lessons).filter(l => l.type === "video" && l.videoName).length;
  const pendingVideos = form.sections.flatMap(s => s.lessons).filter(l => l.type === "video" && !l.videoName).length;

  return (
    <div className="space-y-5">
      {/* stats bar */}
      <div className="flex items-center gap-5 p-4 bg-[#F4F7FC] rounded-xl border border-[rgba(27,58,107,0.1)]">
        {[
          { label: "Sections", value: form.sections.length, icon: Layers },
          { label: "Lessons", value: totalLessons, icon: BookOpen },
          { label: "Videos Uploaded", value: videoLessons, icon: Video },
          { label: "Total Duration", value: `${(totalMins / 60).toFixed(1)}h`, icon: Clock },
        ].map(k => (
          <div key={k.label} className="flex items-center gap-2.5 pr-5 border-r border-[rgba(27,58,107,0.1)] last:border-0 last:pr-0">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <k.icon size={14} className="text-[#1B3A6B]" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#0F1C3F] leading-none">{k.value}</p>
              <p className="text-[11px] text-[#9AA5BE] mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
        {pendingVideos > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <AlertCircle size={13} /> {pendingVideos} video{pendingVideos > 1 ? "s" : ""} pending upload
          </div>
        )}
      </div>

      {/* sections */}
      {form.sections.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[rgba(27,58,107,0.15)] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF1FA] flex items-center justify-center mx-auto mb-4">
            <Layers size={28} className="text-[#1B3A6B]" />
          </div>
          <p className="text-[15px] font-bold text-[#0F1C3F]">No sections yet</p>
          <p className="text-[13px] text-[#9AA5BE] mt-1.5 mb-5">Start by adding a section, then add lectures to it</p>
          <button onClick={() => set({ sections: [{ id: uid(), title: "Introduction", lessons: [] }] })}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#1B3A6B] text-white text-[13.5px] font-semibold rounded-xl hover:bg-[#152d54] transition-colors shadow-sm">
            <Plus size={15} /> Add First Section
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {form.sections.map((sec, i) => (
              <SectionEditor key={sec.id} section={sec} sectionNum={i + 1}
                onUpdate={updated => set({ sections: form.sections.map(s => s.id === sec.id ? updated : s) })}
                onDelete={() => set({ sections: form.sections.filter(s => s.id !== sec.id) })} />
            ))}
          </div>
          <button onClick={() => set({ sections: [...form.sections, { id: uid(), title: `Section ${form.sections.length + 1}`, lessons: [] }] })}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[rgba(27,58,107,0.2)] rounded-xl text-[13px] font-semibold text-[#1B3A6B] hover:border-[#1B3A6B] hover:bg-[#EBF1FA]/40 transition-all">
            <Plus size={15} /> Add Section
          </button>
        </>
      )}
    </div>
  );
}

// ─── COURSE INFO TAB ──────────────────────────────────────────────────────────
function CourseInfoTab({ form, set }: { form: AdminCourse; set: (p: Partial<AdminCourse>) => void }) {
  const thumbRef = useRef<HTMLInputElement>(null);
  const [thumbName, setThumbName] = useState<string | null>(form.thumbnail || null);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* left 2/3 */}
      <div className="col-span-2 space-y-5">
        <div>
          <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Course Title *</label>
          <input value={form.title} onChange={e => set({ title: e.target.value })}
            placeholder="e.g. Complete React Developer Bootcamp 2026"
            className="w-full text-[15px] font-semibold text-[#0F1C3F] border border-[rgba(27,58,107,0.2)] rounded-xl px-4 py-3 outline-none focus:border-[#1B3A6B] transition-colors placeholder:text-[#CBD5E1] placeholder:font-normal" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Category</label>
            <select value={form.category} onChange={e => set({ category: e.target.value })}
              className="w-full text-[13px] text-[#374151] border border-[rgba(27,58,107,0.2)] rounded-xl px-3 py-2.5 outline-none focus:border-[#1B3A6B] bg-white transition-colors">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Level</label>
            <select value={form.level} onChange={e => set({ level: e.target.value })}
              className="w-full text-[13px] text-[#374151] border border-[rgba(27,58,107,0.2)] rounded-xl px-3 py-2.5 outline-none focus:border-[#1B3A6B] bg-white transition-colors">
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Instructor</label>
            <input value={form.instructor} onChange={e => set({ instructor: e.target.value })}
              placeholder="Full name"
              className="w-full text-[13px] text-[#374151] border border-[rgba(27,58,107,0.2)] rounded-xl px-3 py-2.5 outline-none focus:border-[#1B3A6B] transition-colors placeholder:text-[#CBD5E1]" />
          </div>
        </div>

        <div>
          <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Course Description</label>
          <textarea value={form.description} onChange={e => set({ description: e.target.value })}
            placeholder="What will students learn? What problems does this course solve? Who is it for?"
            rows={5}
            className="w-full text-[13.5px] text-[#374151] border border-[rgba(27,58,107,0.2)] rounded-xl px-4 py-3 outline-none focus:border-[#1B3A6B] resize-none transition-colors placeholder:text-[#CBD5E1] leading-relaxed" />
        </div>

        <div>
          <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Skills & Topics <span className="font-normal normal-case text-[#9AA5BE]">comma-separated</span></label>
          <input value={form.skills} onChange={e => set({ skills: e.target.value })}
            placeholder="React, TypeScript, Node.js, REST APIs…"
            className="w-full text-[13px] text-[#374151] border border-[rgba(27,58,107,0.2)] rounded-xl px-4 py-2.5 outline-none focus:border-[#1B3A6B] transition-colors placeholder:text-[#CBD5E1]" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.skills.split(",").map(s => s.trim()).filter(Boolean).map(s => (
              <span key={s} className="text-[11.5px] font-medium text-[#1B3A6B] bg-[#EBF1FA] border border-[rgba(27,58,107,0.2)] px-2.5 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-2">Welcome Message</label>
          <textarea value={form.welcomeMsg || ""} onChange={e => set({ welcomeMsg: e.target.value })}
            placeholder="Optional message shown to students when they enroll…"
            rows={3}
            className="w-full text-[13px] text-[#374151] border border-[rgba(27,58,107,0.2)] rounded-xl px-4 py-3 outline-none focus:border-[#1B3A6B] resize-none transition-colors placeholder:text-[#CBD5E1]" />
        </div>
      </div>

      {/* right 1/3 */}
      <div className="space-y-4">
        {/* Thumbnail */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.12)] p-4 shadow-sm">
          <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide mb-3">Course Thumbnail</label>
          <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => setThumbName(e.target.files?.[0]?.name ?? null)} />
          <button onClick={() => thumbRef.current?.click()}
            className="w-full border-2 border-dashed border-[rgba(27,58,107,0.2)] rounded-xl overflow-hidden hover:border-[#1B3A6B] transition-colors">
            <div className="aspect-video flex flex-col items-center justify-center gap-2 bg-[#F8FAFB] hover:bg-[#EBF1FA]/30 transition-colors p-4">
              {thumbName ? (
                <p className="text-[12.5px] font-semibold text-[#1B3A6B] text-center">{thumbName}</p>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#EBF1FA] flex items-center justify-center">
                    <Upload size={18} className="text-[#1B3A6B]" />
                  </div>
                  <p className="text-[12.5px] font-semibold text-[#374151]">Upload thumbnail</p>
                  <p className="text-[11px] text-[#9AA5BE]">JPG, PNG · 16:9 · Min 750×422</p>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.12)] p-4 shadow-sm space-y-4">
          <label className="block text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide">Appearance</label>
          <div>
            <p className="text-[11.5px] text-[#5A6A8A] mb-2">Emoji icon</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => set({ emoji: e })}
                  className={`w-8 h-8 rounded-lg text-[17px] flex items-center justify-center transition-all ${form.emoji === e ? "bg-[#EBF1FA] ring-2 ring-[#1B3A6B] scale-110" : "hover:bg-[#F4F7FC]"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11.5px] text-[#5A6A8A] mb-2">Brand color</p>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map(c => (
                <button key={c} onClick={() => set({ color: c })}
                  className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${form.color === c ? "ring-2 ring-offset-1 ring-[#1B3A6B] scale-110" : ""}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          {/* live card preview */}
          <div className="rounded-xl overflow-hidden border border-[rgba(27,58,107,0.1)] shadow-sm">
            <div className="h-16 flex items-center justify-center text-[28px]" style={{ background: `linear-gradient(135deg,${form.color}BB,${form.color}66)` }}>
              {form.emoji}
            </div>
            <div className="p-2.5 bg-white">
              <p className="text-[12px] font-bold text-[#0F1C3F] line-clamp-1">{form.title || "Course Title"}</p>
              <p className="text-[10.5px] text-[#9AA5BE] mt-0.5">{form.instructor || "Instructor"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ form, set, isEdit }: { form: AdminCourse; set: (p: Partial<AdminCourse>) => void; isEdit: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Publish status */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.12)] p-5 shadow-sm">
        <p className="text-[14px] font-bold text-[#0F1C3F] mb-4 flex items-center gap-2"><Globe size={15} className="text-[#1B3A6B]" /> Publish Status</p>
        {(["draft", "published", "archived"] as CourseStatus[]).map(s => (
          <label key={s} onClick={() => set({ status: s })} className="flex items-start gap-3 mb-4 cursor-pointer group">
            <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
              ${form.status === s ? "bg-[#1B3A6B] border-[#1B3A6B]" : "border-[#CBD5E1] group-hover:border-[#1B3A6B]"}`}>
              {form.status === s && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0F1C3F] capitalize">{s}</p>
              <p className="text-[11.5px] text-[#9AA5BE] leading-snug mt-0.5">
                {s === "published" ? "Live — visible to enrolled & catalog students" :
                 s === "draft" ? "Hidden from students, editable by admins only" :
                 "Removed from catalog, existing access preserved"}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Stats (edit only) */}
      {isEdit ? (
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.12)] p-5 shadow-sm">
          <p className="text-[14px] font-bold text-[#0F1C3F] mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-[#1B3A6B]" /> Performance Stats</p>
          {[
            { label: "Enrolled Students", value: form.enrolledCount.toLocaleString(), icon: Users, color: "#1B3A6B" },
            { label: "Completion Rate",   value: `${form.completionRate}%`,           icon: TrendingUp, color: "#059669" },
            { label: "Average Rating",    value: form.rating > 0 ? `⭐ ${form.rating}` : "–", icon: Star, color: "#D97706" },
            { label: "Created",           value: form.createdAt, icon: Info, color: "#9AA5BE" },
            { label: "Last Updated",      value: form.updatedAt, icon: Info, color: "#9AA5BE" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 py-2.5 border-b border-[rgba(27,58,107,0.05)] last:border-0">
              <s.icon size={13} style={{ color: s.color }} className="shrink-0" />
              <span className="text-[12.5px] text-[#5A6A8A] flex-1">{s.label}</span>
              <span className="text-[13px] font-bold text-[#0F1C3F]">{s.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#EBF1FA] rounded-2xl border border-[rgba(27,58,107,0.15)] p-5 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
            <TrendingUp size={24} className="text-[#1B3A6B]" />
          </div>
          <p className="text-[13.5px] font-semibold text-[#1B3A6B]">Stats available after publish</p>
          <p className="text-[12px] text-[#5A6A8A]">Enrollment, completion, and rating data will appear here once the course is live.</p>
        </div>
      )}
    </div>
  );
}

// ─── COURSE FORM ──────────────────────────────────────────────────────────────
function CourseForm({ initial, onSave, onCancel }: { initial?: AdminCourse; onSave: (c: AdminCourse) => void; onCancel: () => void }) {
  const isEdit = !!initial;
  const blank: AdminCourse = {
    id: uid(), title: "", category: "Web Dev", level: "Beginner", instructor: "",
    description: "", skills: "", totalHours: "0", status: "draft",
    color: "#1B3A6B", emoji: "🌐", enrolledCount: 0, completionRate: 0, rating: 0,
    sections: [], createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10),
  };
  const [form, setForm] = useState<AdminCourse>(initial ?? blank);
  const [tab, setTab] = useState<FormTab>("info");
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<AdminCourse>) => setForm(f => ({ ...f, ...patch }));

  const totalLessons = form.sections.flatMap(s => s.lessons).length;
  const totalMins    = form.sections.flatMap(s => s.lessons).reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);

  const save = () => {
    const hours = (totalMins / 60).toFixed(1);
    onSave({ ...form, totalHours: hours, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const TABS: { key: FormTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { key: "info",       label: "Course Info",  icon: Info },
    { key: "curriculum", label: "Curriculum",   icon: LayoutList, badge: totalLessons > 0 ? String(totalLessons) : undefined },
    { key: "settings",   label: "Settings",     icon: Settings },
  ];

  return (
    <div>
      {/* page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>
            {isEdit ? `Edit: ${initial?.title}` : "Create New Course"}
          </h2>
          <p className="text-[12.5px] text-[#5A6A8A] mt-0.5">
            {isEdit ? `${form.sections.length} sections · ${totalLessons} lessons · ${(totalMins / 60).toFixed(1)}h` : "Fill in course details, build your curriculum, and configure settings."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-[13px] text-[#5A6A8A] border border-[rgba(27,58,107,0.2)] rounded-xl hover:bg-[#F4F7FC] transition-colors">
            Cancel
          </button>
          <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white text-[13px] font-semibold rounded-xl hover:bg-[#152d54] transition-colors shadow-sm">
            <Save size={14} /> {isEdit ? "Save Changes" : "Create Course"}
          </button>
        </div>
      </div>

      {/* tab nav */}
      <div className="flex gap-1 border-b border-[rgba(27,58,107,0.1)] mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-[13.5px] font-semibold border-b-2 transition-colors -mb-px
              ${tab === t.key ? "border-[#1B3A6B] text-[#1B3A6B]" : "border-transparent text-[#5A6A8A] hover:text-[#1B3A6B]"}`}>
            <t.icon size={14} />
            {t.label}
            {t.badge && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#1B3A6B] text-white text-[10px] font-bold flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      {tab === "info"       && <CourseInfoTab form={form} set={set} />}
      {tab === "curriculum" && <CurriculumTab form={form} set={set} />}
      {tab === "settings"   && <SettingsTab form={form} set={set} isEdit={isEdit} />}
    </div>
  );
}

// ─── COURSE LIST ──────────────────────────────────────────────────────────────
function CourseList({ courses, onEdit, onDelete, onCreate }: {
  courses: AdminCourse[]; onEdit: (c: AdminCourse) => void;
  onDelete: (id: string) => void; onCreate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CourseStatus>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = courses.filter(c =>
    (statusFilter === "all" || c.status === statusFilter) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase()))
  );

  const totalStudents = courses.reduce((s, c) => s + c.enrolledCount, 0);
  const published = courses.filter(c => c.status === "published").length;
  const avgRating = courses.filter(c => c.rating > 0).length
    ? (courses.filter(c => c.rating > 0).reduce((s, c) => s + c.rating, 0) / courses.filter(c => c.rating > 0).length).toFixed(1)
    : "–";

  const statusCls = (s: CourseStatus) => ({
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    draft:     "bg-amber-100 text-amber-700 border-amber-200",
    archived:  "bg-slate-100 text-slate-600 border-slate-200",
  }[s]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[20px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>LMS Courses</h2>
          <p className="text-[13px] text-[#5A6A8A]">Manage your course catalog and curriculum</p>
        </div>
        <button onClick={onCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white text-[13.5px] font-semibold rounded-xl hover:bg-[#152d54] transition-colors shadow-sm">
          <Plus size={15} /> New Course
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Courses",    value: courses.length.toString(), icon: BookOpen,   color: "#1B3A6B", bg: "#EBF1FA" },
          { label: "Published",        value: published.toString(),      icon: Eye,        color: "#059669", bg: "#ECFDF5" },
          { label: "Total Students",   value: totalStudents.toLocaleString(), icon: Users, color: "#7C3AED", bg: "#F5F0FF" },
          { label: "Avg Rating",       value: avgRating,                 icon: Star,       color: "#D97706", bg: "#FFFBEB" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#5A6A8A] font-medium">{k.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-[22px] font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
            className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-[rgba(27,58,107,0.15)] rounded-xl outline-none focus:border-[#1B3A6B] transition-colors" />
        </div>
        <div className="flex gap-1 bg-white border border-[rgba(27,58,107,0.1)] rounded-xl p-1">
          {(["all","published","draft","archived"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-[12px] font-medium rounded-lg capitalize transition-colors ${statusFilter === s ? "bg-[#1B3A6B] text-white" : "text-[#5A6A8A] hover:text-[#1B3A6B]"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(27,58,107,0.08)]">
              {["Course","Curriculum","Students","Rating","Status","Updated",""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#9AA5BE] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(course => (
              <tr key={course.id} className="border-b border-[rgba(27,58,107,0.05)] hover:bg-[#F8FAFB] transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px] shrink-0" style={{ background: `${course.color}22` }}>
                      {course.emoji}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0F1C3F] leading-snug">{course.title}</p>
                      <p className="text-[11.5px] text-[#9AA5BE]">{course.instructor} · {course.level}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-[12.5px] text-[#374151] font-medium">{course.sections.length} sections</p>
                  <p className="text-[11px] text-[#9AA5BE]">{course.sections.flatMap(s => s.lessons).length} lessons · {course.totalHours}h</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-semibold text-[#0F1C3F]">{course.enrolledCount.toLocaleString()}</p>
                  {course.completionRate > 0 && <p className="text-[11px] text-[#9AA5BE]">{course.completionRate}% done</p>}
                </td>
                <td className="px-4 py-3.5">
                  {course.rating > 0 ? (
                    <div className="flex items-center gap-1"><Star size={12} className="text-amber-400" fill="currentColor" /><span className="text-[13px] font-semibold text-[#0F1C3F]">{course.rating}</span></div>
                  ) : <span className="text-[12px] text-[#CBD5E1]">–</span>}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold border capitalize ${statusCls(course.status)}`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[12px] text-[#9AA5BE]">{course.updatedAt}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(course)} className="p-1.5 text-[#9AA5BE] hover:text-[#1B3A6B] hover:bg-[#EBF1FA] rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(course.id)} className="p-1.5 text-[#9AA5BE] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#9AA5BE]">No courses match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle size={18} className="text-red-500" /></div>
              <p className="text-[15px] font-bold text-[#0F1C3F]">Delete Course?</p>
            </div>
            <p className="text-[13px] text-[#5A6A8A] mb-5">This will permanently delete the course and all its curriculum data. This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-[13px] text-[#5A6A8A] border border-[rgba(27,58,107,0.2)] rounded-xl hover:bg-[#F4F7FC] transition-colors">Cancel</button>
              <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-500 text-white text-[13px] font-semibold rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export function LMSAdminSection() {
  const [courses, setCourses] = useState<AdminCourse[]>(SEED_COURSES);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<AdminCourse | undefined>(undefined);

  const save = (c: AdminCourse) => {
    setCourses(cs => editing ? cs.map(x => x.id === c.id ? c : x) : [c, ...cs]);
    setView("list");
    setEditing(undefined);
  };

  return view === "form"
    ? <CourseForm initial={editing} onSave={save} onCancel={() => { setView("list"); setEditing(undefined); }} />
    : <CourseList courses={courses}
        onEdit={c => { setEditing(c); setView("form"); }}
        onDelete={id => setCourses(cs => cs.filter(c => c.id !== id))}
        onCreate={() => { setEditing(undefined); setView("form"); }} />;
}
