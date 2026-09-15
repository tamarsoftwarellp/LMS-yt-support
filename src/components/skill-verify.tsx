import { useState } from "react";
import {
  ShieldCheck, CheckCircle2, RefreshCw, Clock, ExternalLink, Code,
  Upload, Globe, Check, X, Info, Send, UserCheck, ClipboardList, Rocket,
} from "lucide-react";
import { Field, Input, Select, InfoBox, inputCls } from "../components/shared";
import { ProgressBar } from "./student-steps";

/* ── Types ── */
type SkillStatus = "not_started" | "in_progress" | "verified";
type VerifyMethod = "assessment" | "coding" | "project" | "github" | "mentor" | "admin" | null;

interface SkillEntry {
  id: number;
  name: string;
  category: string;
  status: SkillStatus;
  method: VerifyMethod;
  score?: number;
  notes?: string;
}

const DEFAULT_SKILLS: SkillEntry[] = [
  { id: 1,  name: "React",        category: "Technical",  status: "verified",     method: "github",     score: 88 },
  { id: 2,  name: "JavaScript",   category: "Technical",  status: "verified",     method: "assessment", score: 92 },
  { id: 3,  name: "HTML/CSS",     category: "Technical",  status: "verified",     method: "assessment", score: 95 },
  { id: 4,  name: "Node.js",      category: "Technical",  status: "in_progress",  method: "project" },
  { id: 5,  name: "TypeScript",   category: "Technical",  status: "in_progress",  method: "coding" },
  { id: 6,  name: "Python",       category: "Language",   status: "not_started",  method: null },
  { id: 7,  name: "Docker",       category: "Tools",      status: "not_started",  method: null },
  { id: 8,  name: "AWS",          category: "Tools",      status: "not_started",  method: null },
  { id: 9,  name: "Git",          category: "Tools",      status: "verified",     method: "github",     score: 90 },
  { id: 10, name: "SQL",          category: "Language",   status: "not_started",  method: null },
  { id: 11, name: "Figma",        category: "Tools",      status: "not_started",  method: null },
  { id: 12, name: "Java",         category: "Language",   status: "not_started",  method: null },
];

const VERIFY_METHODS = [
  { id: "assessment", label: "Online Assessment",      icon: ClipboardList, color: "text-[#1B3A6B] bg-[#EBF1FA]",  desc: "15 MCQs • Auto-scored • Instant result" },
  { id: "coding",     label: "Coding Challenge",       icon: Code,          color: "text-purple-700 bg-purple-50",  desc: "Solve a real problem • Evaluated by AI" },
  { id: "project",    label: "Project Submission",     icon: Rocket,        color: "text-emerald-700 bg-emerald-50",desc: "Upload or link a project using this skill" },
  { id: "github",     label: "GitHub Repository",      icon: ExternalLink,  color: "text-gray-700 bg-gray-100",     desc: "Link your GitHub repo for review" },
  { id: "mentor",     label: "Mentor Verification",    icon: UserCheck,     color: "text-amber-700 bg-amber-50",    desc: "Request your assigned mentor to verify" },
  { id: "admin",      label: "Admin Approval",         icon: ShieldCheck,   color: "text-rose-700 bg-rose-50",      desc: "Submit evidence for admin review" },
] as const;

export function SSSkillVerify() {
  const [skills, setSkills] = useState<SkillEntry[]>(DEFAULT_SKILLS);
  const [selectedId, setSelectedId] = useState<number>(4);
  const [filter, setFilter] = useState<"all" | SkillStatus>("all");
  const [quizStep, setQuizStep] = useState(0);   // 0=idle, 1=running, 2=done
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [ghUrl, setGhUrl] = useState("");
  const [ghAnalyzing, setGhAnalyzing] = useState(false);
  const [ghResult, setGhResult] = useState(false);
  const [projUrl, setProjUrl] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [mentorSent, setMentorSent] = useState(false);
  const [adminText, setAdminText] = useState("");
  const [adminSent, setAdminSent] = useState(false);
  const [codeVal, setCodeVal] = useState("// Write your solution here\nfunction solution(arr) {\n  \n}");
  const [codeSubmitted, setCodeSubmitted] = useState(false);

  const selected = skills.find(s => s.id === selectedId)!;

  const updateSkill = (id: number, patch: Partial<SkillEntry>) =>
    setSkills(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const setMethod = (method: VerifyMethod) => {
    updateSkill(selectedId, { method, status: method ? "in_progress" : "not_started" });
    setQuizStep(0); setGhResult(false); setMentorSent(false);
    setAdminSent(false); setCodeSubmitted(false);
  };

  const markVerified = (score?: number) => {
    updateSkill(selectedId, { status: "verified", score });
  };

  const verifiedCount = skills.filter(s => s.status === "verified").length;
  const inProgressCount = skills.filter(s => s.status === "in_progress").length;

  const statusMeta: Record<SkillStatus, { label: string; dot: string; text: string; bg: string }> = {
    not_started: { label: "Not Started", dot: "bg-slate-300",   text: "text-slate-500",   bg: "bg-slate-50 border-slate-200" },
    in_progress:  { label: "In Progress", dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
    verified:     { label: "Verified",    dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  };

  const quizQuestions = [
    { q: `What is the primary use of ${selected?.name}?`, opts: ["UI rendering", "State management", "Routing", "Database querying"], correct: 0 },
    { q: `Which concept is core to ${selected?.name}?`, opts: ["Virtual DOM", "REST APIs", "SSH tunneling", "Docker layers"], correct: 0 },
    { q: `Best practice when using ${selected?.name}?`, opts: ["Avoid mutations", "Use global state always", "Skip error handling", "Hard-code values"], correct: 0 },
  ];

  const filteredSkills = filter === "all" ? skills : skills.filter(s => s.status === filter);

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 overflow-x-hidden">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 min-w-0">
          <span className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-[#E8ECF5] text-[#5A6A8A]" style={{ fontFamily: "var(--font-mono)" }}>2.3</span>
          <h2 className="text-[16px] sm:text-[17px] text-[#0F1C3F] break-words" style={{ fontFamily: "var(--font-serif)" }}>Skill Verification</h2>
          <span className="max-w-full text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck size={10} /> Only verified skills appear on your CV</span>
        </div>
        <p className="text-[12.5px] text-[#5A6A8A]">Verify each skill through assessments, challenges, projects, or mentor review.</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        {[
          { label: "Verified", count: verifiedCount, color: "border-emerald-200 bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
          { label: "In Progress", count: inProgressCount,color:"border-amber-200 bg-amber-50",text: "text-amber-700", icon: RefreshCw },
          { label: "Not Started", count: skills.length - verifiedCount - inProgressCount, color: "border-[--border] bg-[#F4F6FB]", text: "text-[#5A6A8A]", icon: Clock },
        ].map(s => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => setFilter(s.label === "Verified" ? "verified" : s.label === "In Progress" ? "in_progress" : "not_started")}
              className={`w-full min-w-0 flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 transition-all hover:shadow-sm ${s.color}`}>
              <Icon size={16} className={s.text} />
              <div className="text-left">
                <p className={`text-[20px] font-bold leading-none ${s.text}`} style={{ fontFamily: "var(--font-serif)" }}>{s.count}</p>
                <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{s.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Overall progress */}
      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-1.5">
          <span className="text-[11.5px] sm:text-[12.5px] font-bold text-[#1B3A6B] break-words">Overall Verification Progress</span>
          <span className="text-[11.5px] sm:text-[12.5px] font-bold text-[#1B3A6B] break-words">{verifiedCount}/{skills.length} skills verified</span>
        </div>
        <ProgressBar value={(verifiedCount / skills.length) * 100} color="#059669" height={7} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4 w-full min-w-0">

        {/* LEFT — Skill list */}
        <div className="w-full max-w-full min-w-0 space-y-5 overflow-x-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11.5px] font-semibold text-[#5A6A8A] uppercase tracking-wide">Skills ({filteredSkills.length})</p>
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} className="text-[11px] text-[#1B3A6B] hover:underline">Clear filter</button>
            )}
          </div>
          {filteredSkills.map(sk => {
            const meta = statusMeta[sk.status];
            const active = sk.id === selectedId;
            return (
              <button key={sk.id} onClick={() => { setSelectedId(sk.id); setQuizStep(0); setGhResult(false); setMentorSent(false); setAdminSent(false); setCodeSubmitted(false); }}
                className={`w-full min-w-0 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border-2 ${active ? "border-[#1B3A6B] bg-[#EBF1FA]" : "border-transparent hover:bg-[#F4F7FC]"}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12.5px] font-semibold truncate ${active ? "text-[#1B3A6B]" : "text-[#0F1C3F]"}`}>{sk.name}</p>
                  <p className="text-[10.5px] text-[#9AA5BE]">{sk.category}</p>
                </div>
                {sk.status === "verified" && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
                {sk.status === "in_progress" && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* RIGHT — Verification panel */}
        <div className="w-full min-w-0 bg-white border-2 border-[--border] rounded-2xl overflow-hidden">

          {/* Skill header */}
          <div className={`px-4 sm:px-5 py-4 border-b border-[--border] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0 ${selected.status === "verified" ? "bg-emerald-50" : selected.status === "in_progress" ? "bg-amber-50" : "bg-[#F8FAFB]"}`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] sm:text-[16px] font-bold text-[#0F1C3F] break-words">{selected.name}</p>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusMeta[selected.status].bg} ${statusMeta[selected.status].text}`}>
                  {statusMeta[selected.status].label}
                </span>
              </div>
              <p className="text-[12px] text-[#5A6A8A] mt-0.5">{selected.category} skill</p>
            </div>
            {selected.status === "verified" && selected.score && (
              <div className="text-center">
                <p className="text-[24px] font-bold text-emerald-600" style={{ fontFamily: "var(--font-serif)" }}>{selected.score}%</p>
                <p className="text-[11px] text-emerald-600">Score</p>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-5 min-w-0">
            {/* Method selector */}
            {selected.status !== "verified" && (
              <div className="mb-5">
                <p className="text-[12.5px] font-semibold text-[#0F1C3F] mb-3">Choose Verification Method</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {VERIFY_METHODS.map(m => {
                    const Icon = m.icon;
                    const active = selected.method === m.id;
                    return (
                      <button key={m.id} onClick={() => setMethod(m.id as VerifyMethod)}
                        className={`w-full min-w-0 flex flex-col items-start gap-1.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${active ? "border-[#1B3A6B] bg-[#EBF1FA]" : "border-[--border] bg-white hover:border-slate-300"}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.color}`}><Icon size={13} /></div>
                        <p className={`text-[11.5px] font-semibold leading-tight ${active ? "text-[#1B3A6B]" : "text-[#0F1C3F]"}`}>{m.label}</p>
                        <p className={`text-[10.5px] text-[#9AA5BE] leading-tight break-words`}>{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Already verified state */}
            {selected.status === "verified" && (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <p className="text-[15px] font-bold text-emerald-700 mb-1">Skill Verified!</p>
                <p className="text-[12.5px] text-[#5A6A8A] max-w-xs mb-2">
                  <strong className="text-[#0F1C3F]">{selected.name}</strong> has been verified via{" "}
                  {VERIFY_METHODS.find(m => m.id === selected.method)?.label}.
                </p>
                <p className="text-[12px] text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> This skill appears on your CV</p>
                <button onClick={() => updateSkill(selected.id, { status: "not_started", method: null, score: undefined })}
                  className="mt-4 text-[12px] text-[#5A6A8A] hover:text-red-500 transition-colors flex items-center gap-1">
                  <X size={12} /> Remove verification
                </button>
              </div>
            )}

            {/* ── Method Action Areas ── */}

            {/* ONLINE ASSESSMENT */}
            {selected.status !== "verified" && selected.method === "assessment" && (
              <div>
                {quizStep === 0 && (
                  <div className="p-4 bg-[#EBF1FA] rounded-xl text-center">
                    <ClipboardList size={24} className="text-[#1B3A6B] mx-auto mb-2" />
                    <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-1">Online Assessment — {selected.name}</p>
                    <p className="text-[11.5px] sm:text-[12px] text-[#5A6A8A] mb-4 break-words">15 multiple-choice questions · ~10 minutes · Score ≥70% to pass</p>
                    <button onClick={() => setQuizStep(1)} className="px-5 py-2.5 bg-[#1B3A6B] text-white text-[13px] rounded-xl hover:bg-[#122748] font-semibold transition-colors">
                      Start Assessment
                    </button>
                  </div>
                )}
                {quizStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12.5px] font-semibold text-[#0F1C3F]">Question {Math.min(quizScore + 1, 3)} of 3 (sample)</p>
                      <span className="text-[11.5px] text-[#5A6A8A]" style={{ fontFamily: "var(--font-mono)" }}>Score: {quizScore * 33}%</span>
                    </div>
                    <ProgressBar value={(quizScore / 3) * 100} height={4} />
                    <div className="p-4 bg-[#F8FAFB] rounded-xl border border-[--border]">
                      <p className="text-[13.5px] font-medium text-[#0F1C3F] mb-4">{quizQuestions[Math.min(quizScore, 2)].q}</p>
                      <div className="space-y-2">
                        {quizQuestions[Math.min(quizScore, 2)].opts.map((opt, i) => (
                          <button key={opt} onClick={() => setQuizAnswer(i)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-[12.5px] transition-all ${quizAnswer === i ? "border-[#1B3A6B] bg-[#EBF1FA] text-[#1B3A6B] font-semibold" : "border-[--border] bg-white hover:border-slate-300 text-[#0F1C3F]"}`}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button disabled={quizAnswer === null}
                      onClick={() => {
                        const isLast = quizScore >= 2;
                        const newScore = quizScore + 1;
                        setQuizAnswer(null);
                        if (isLast) { setQuizStep(2); markVerified(88); } else setQuizScore(newScore);
                      }}
                      className="w-full py-2.5 bg-[#1B3A6B] text-white text-[13px] rounded-xl font-semibold disabled:opacity-40 hover:bg-[#122748] transition-colors">
                      {quizScore >= 2 ? "Submit Assessment" : "Next Question"}
                    </button>
                  </div>
                )}
                {quizStep === 2 && (
                  <div className="flex flex-col items-center py-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3"><CheckCircle2 size={28} className="text-emerald-600" /></div>
                    <p className="text-[15px] font-bold text-emerald-700">Passed! Score: 88%</p>
                    <p className="text-[12.5px] text-[#5A6A8A] mt-1 mb-4"><strong>{selected.name}</strong> is now verified and visible on your CV.</p>
                  </div>
                )}
              </div>
            )}

            {/* CODING CHALLENGE */}
            {selected.status !== "verified" && selected.method === "coding" && (
              <div className="space-y-4">
                <div className="p-4 bg-[#F8FAFB] rounded-xl border border-[--border]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                   <p className="text-[13px] sm:text-[13.5px] font-semibold text-[#0F1C3F] break-words">Challenge: Array Manipulation with {selected.name}</p>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Medium</span>
                  </div>
                  <p className="text-[12.5px] text-[#5A6A8A] mb-3">Given an array of integers, return a new array where each element is the sum of its two neighbours. Handle edge cases.</p>
                  <div className="flex gap-2 flex-wrap text-[11.5px]">
                    {["Arrays", "Loops", "Edge Cases"].map(t => <span key={t} className="bg-[#EBF1FA] text-[#1B3A6B] px-2.5 py-1 rounded-full font-medium">{t}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#5A6A8A] mb-1.5">Your Solution</p>
                  <textarea value={codeVal} onChange={e => setCodeVal(e.target.value)} rows={7}
                    className="w-full bg-[#0F1C3F] text-emerald-300 text-[12px] rounded-xl p-4 outline-none resize-none border-2 border-transparent focus:border-[#1B3A6B]"
                    style={{ fontFamily: "var(--font-mono)" }} />
                </div>
                {!codeSubmitted ? (
                  <button onClick={() => { setCodeSubmitted(true); setTimeout(() => markVerified(82), 1200); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5  bg-[#1B3A6B] text-white text-[13px] rounded-xl hover:bg-[#122748] transition-colors font-semibold">
                    <Send size={13} /> Submit Solution
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] font-medium text-emerald-700">
                    <RefreshCw size={13} className="animate-spin" /> Evaluating submission…
                  </div>
                )}
              </div>
            )}

            {/* PROJECT SUBMISSION */}
            {selected.status !== "verified" && selected.method === "project" && (
              <div className="space-y-4">
                <Field label="Project URL (GitHub / Live link)">
                  <Input icon={Globe} placeholder="https://github.com/you/project" value={projUrl} onChange={e => setProjUrl(e.target.value)} />
                </Field>
                <Field label="How is this project built using this skill?" hint="Min 50 characters">
                  <textarea rows={3} value={projDesc} onChange={e => setProjDesc(e.target.value)}
                    placeholder={`Describe how ${selected.name} was used in this project…`}
                    className={`${inputCls} resize-none`} />
                </Field>
                <Field label="Supporting Files (Optional)">
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#EFF2FA] rounded-[10px] border-2 border-dashed border-[#1B3A6B]/20 cursor-pointer hover:bg-[#E5EBF7] transition-colors">
                    <Upload size={16} className="text-[#1B3A6B]" />
                    <span className="text-[12.5px] text-[#5A6A8A]">Upload screenshots or documents (.pdf, .png, .jpg)</span>
                  </div>
                </Field>
                <button disabled={!projUrl.trim() || projDesc.length < 20}
                  onClick={() => updateSkill(selectedId, { status: "in_progress", notes: "Project submitted — awaiting review" })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white text-[13px] rounded-xl hover:bg-[#122748] disabled:opacity-40 transition-colors font-semibold">
                  <Send size={13} /> Submit Project
                </button>
                {selected.notes && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[12.5px] text-amber-700">
                    <Clock size={13} /> {selected.notes}
                  </div>
                )}
              </div>
            )}

            {/* GITHUB REVIEW */}
            {selected.status !== "verified" && selected.method === "github" && (
              <div className="space-y-4">
                <Field label={`GitHub Repository URL for ${selected.name}`}>
                  <Input icon={ExternalLink} placeholder="https://github.com/username/repo" value={ghUrl} onChange={e => setGhUrl(e.target.value)} />
                </Field>
                {!ghResult ? (
                  <button disabled={!ghUrl.trim() || ghAnalyzing}
                    onClick={() => { setGhAnalyzing(true); setTimeout(() => { setGhAnalyzing(false); setGhResult(true); }, 2000); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white text-[13px] rounded-xl hover:bg-[#122748] disabled:opacity-40 transition-colors font-semibold">
                    {ghAnalyzing ? <><RefreshCw size={13} className="animate-spin" /> Analyzing Repository…</> : <><Code size={13} /> Analyze Repository</>}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-[#F8FAFB] border border-[--border] rounded-xl">
                      <p className="text-[12.5px] font-semibold text-[#0F1C3F] mb-3 flex items-center gap-2"><ExternalLink size={13} className="text-[#1B3A6B]" /> Repository Analysis</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        {[
                          { label: "Commits",    value: "124" },
                          { label: "Stars",      value: "18" },
                          { label: "Languages",  value: selected.name },
                        ].map(s => (
                          <div key={s.label} className="w-full min-w-0 bg-white border border-[--border] rounded-lg px-3 py-2 text-center">
                            <p className="text-[15px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{s.value}</p>
                            <p className="text-[10.5px] text-[#9AA5BE]">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {["Active development history detected", `${selected.name} used in 60%+ of codebase`, "Clean commit messages & code structure"].map(i => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-emerald-700"><Check size={11} /> {i}</div>
                        ))}
                      </div>
                      <ProgressBar value={88} color="#059669" height={5} />
                      <p className="text-[11.5px] text-emerald-700 font-semibold mt-1">Repository Score: 88/100</p>
                    </div>
                    <button onClick={() => markVerified(88)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-[13px] rounded-xl hover:bg-emerald-700 transition-colors font-semibold">
                      <ShieldCheck size={13} /> Request Verification (88%)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MENTOR VERIFICATION */}
            {selected.status !== "verified" && selected.method === "mentor" && (
              <div className="space-y-4">
                <Field label="Select Mentor">
                  <Select icon={UserCheck}>
                    <option value="">Choose your assigned mentor</option>
                    <option>Prof. Suresh Kumar (Computer Engineering)</option>
                    <option>Ms. Anita Sharma (Full Stack Development)</option>
                    <option>Dr. Ramesh Iyer (Data Science)</option>
                  </Select>
                </Field>
                <Field label="Evidence / Notes for Mentor">
                  <textarea rows={3} placeholder="Describe how you have demonstrated this skill. Include any relevant projects, assignments, or practical work…"
                    className={`${inputCls} resize-none`} />
                </Field>
                {!mentorSent ? (
                  <button onClick={() => setMentorSent(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-[13px] rounded-xl hover:bg-amber-700 transition-colors font-semibold">
                    <Send size={13} /> Send Verification Request
                  </button>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-amber-800">Request Sent</p>
                      <p className="text-[12px] text-amber-700 mt-0.5">Your mentor has been notified. Verification usually takes 1–2 business days. You will be notified once approved.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN APPROVAL */}
            {selected.status !== "verified" && selected.method === "admin" && (
              <div className="space-y-4">
                <InfoBox title="Admin Verification" variant="blue">
                  Submit evidence of your skill proficiency. An admin will review and approve within 3–5 business days.
                </InfoBox>
                <Field label="Evidence Description" required>
                  <textarea rows={4} value={adminText} onChange={e => setAdminText(e.target.value)}
                    placeholder="Describe in detail how you have developed and used this skill. Include project names, outcomes, and any measurable results…"
                    className={`${inputCls} resize-none`} />
                </Field>
                <Field label="Supporting Documents">
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#EFF2FA] rounded-[10px] border-2 border-dashed border-[#1B3A6B]/20 cursor-pointer hover:bg-[#E5EBF7] transition-colors">
                    <Upload size={16} className="text-[#1B3A6B]" />
                    <span className="text-[12.5px] text-[#5A6A8A]">Certificates, project files, screenshots</span>
                  </div>
                </Field>
                {!adminSent ? (
                  <button disabled={adminText.length < 30}
                    onClick={() => { setAdminSent(true); updateSkill(selectedId, { notes: "Submitted for admin review" }); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white text-[13px] rounded-xl hover:bg-rose-700 disabled:opacity-40 transition-colors font-semibold">
                    <Send size={13} /> Submit for Admin Review
                  </button>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                    <Clock size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-rose-800">Submitted for Review</p>
                      <p className="text-[12px] text-rose-700 mt-0.5">An admin will review your submission within 3–5 business days. You will receive an email notification.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No method selected yet */}
            {selected.status !== "verified" && !selected.method && (
              <div className="flex flex-col items-center py-8 text-center text-[#9AA5BE]">
                <ShieldCheck size={28} className="mb-3 text-[#C8D5E8]" />
                <p className="text-[13px] font-medium">Select a verification method above</p>
                <p className="text-[12px] mt-1">to start verifying <strong className="text-[#5A6A8A]">{selected.name}</strong></p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV visibility note */}
      <div className="w-full min-w-0 flex items-start gap-3 p-3 sm:p-4 bg-[#EBF1FA] border border-[#1B3A6B]/15  rounded-xl">
        <Info size={15} className="text-[#1B3A6B] mt-0.5 shrink-0" />
        <div className="min-w-0 break-words">
          <p className="text-[13px] font-semibold text-[#1B3A6B]">CV Visibility: {verifiedCount} of {skills.length} skills will appear</p>
          <p className="text-[12px] text-[#5A6A8A] mt-0.5">
            Currently verified:{" "}
            <span className="font-medium text-[#0F1C3F]">
              {skills.filter(s => s.status === "verified").map(s => s.name).join(", ") || "None yet"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
