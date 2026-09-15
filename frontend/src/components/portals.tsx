import { useEffect, useRef, useState } from "react";
import {
  GraduationCap, Check, ChevronRight, ArrowLeft, Sparkles,
  Building2, LayoutDashboard, ExternalLink,
  UserPlus, User, ShieldCheck, Brain, Target, Route, FileText, BookOpen,
} from "lucide-react";
import { STEPS } from "../components/shared";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9 } from "./college-steps";
import { SS2, SS3, SS4, SS5, SS6 } from "./student-steps";
import { SSSkillVerify } from "./skill-verify";
import { SSCVGenerator } from "./cv-generator";
import { getCurrentStudent, getOnboarding, saveOnboardingStep } from "../api/student-auth";
import type { CurrentStudent, StepRecord } from "../api/student-auth";

/* ── Student step definitions ── */
export const STUDENT_STEPS = [
  { id: 1, key: "profile",              label: "Student Profile",       icon: User,         desc: "Personal, education & skills" },
  { id: 2, key: "skill-verification",   label: "Skill Verification",    icon: ShieldCheck,  desc: "Verify skills for your CV" },
  { id: 3, key: "career-counselling",   label: "AI Career Counselling", icon: Brain,        desc: "Assessment & career fit" },
  { id: 4, key: "career-goal",          label: "Career Goal Setup",     icon: Target,       desc: "Role, domain & companies" },
  { id: 5, key: "roadmap",              label: "AI Roadmap Generator",  icon: Route,        desc: "4-phase learning plan" },
  { id: 6, key: "dynamic-cv",           label: "Dynamic CV",            icon: FileText,     desc: "ATS-optimised CV export" },
  { id: 7, key: "dashboard",            label: "Student Dashboard",     icon: LayoutDashboard, desc: "Insights & notifications" },
];

export const STUDENT_PHASES = [
  { label: "Onboarding",       range: [1] },
  { label: "Verification",     range: [2] },
  { label: "Assessment",       range: [3] },
  { label: "Goals & Roadmap",  range: [4, 5] },
  { label: "CV & Dashboard",   range: [6, 7] },
];

function controlKey(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, index: number) {
  return control.name || control.id || control.getAttribute("placeholder") || `${control.tagName.toLowerCase()}-${control.type || "value"}-${index}`;
}

function captureStep(root: HTMLElement | null) {
  const controls: Record<string, string | boolean> = {};
  root?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((control, index) => {
    if (control.type === "file" || control.type === "password") return;
    controls[controlKey(control, index)] = control.type === "checkbox" || control.type === "radio" ? control.checked : control.value;
  });
  return { controls, visible_text: root?.innerText || "", saved_at: new Date().toISOString() };
}

function restoreStep(root: HTMLElement | null, data?: Record<string, unknown>) {
  const controls = data?.controls as Record<string, string | boolean> | undefined;
  if (!controls) return;
  root?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((control, index) => {
    const value = controls[controlKey(control, index)];
    if (value === undefined) return;
    if (control.type === "checkbox" || control.type === "radio") control.checked = Boolean(value);
    else control.value = String(value);
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

/* ════════════════════════════════════════════════════════
   STUDENT PORTAL
════════════════════════════════════════════════════════ */
export function StudentPortal({ onSwitch, onHome, onLMS }: { onSwitch: () => void; onHome?: () => void; onLMS?: () => void }) {
  const [step, setStep] = useState(1);
  const [savedSteps, setSavedSteps] = useState<Record<string, StepRecord>>({});
  const [student, setStudent] = useState<CurrentStudent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const draftControlsRef = useRef<Record<string, string | boolean>>({});
  const isCompleted = (s: number) => s < step;

  const stepComponents: Record<number, React.ReactNode> = {
    1: <SS2 />, 2: <SSSkillVerify />, 3: <SS3 />, 4: <SS4 />,
    5: <SS5 onLMS={onLMS} />, 6: <SSCVGenerator />, 7: <SS6 />,
  };

  useEffect(() => {
    Promise.all([getCurrentStudent(), getOnboarding()])
      .then(([me, progress]) => {
        setStudent(me);
        setSavedSteps(Object.fromEntries(progress.steps.map(item => [item.step_key, item])));
        setStep(progress.current_step);
      })
      .catch((err: Error) => setSaveError(err.message));
  }, []);

  useEffect(() => {
    const key = STUDENT_STEPS[step - 1].key;
    draftControlsRef.current = { ...((savedSteps[key]?.data.controls as Record<string, string | boolean> | undefined) || {}) };
    const timer = window.setTimeout(() => {
      restoreStep(contentRef.current, savedSteps[key]?.data);
      if (step === 1 && student && !savedSteps[key]) {
        const values: Record<string, string> = {
          "Aisha Patel": student.full_name,
          "+91 98765 43210": student.mobile,
          "aisha@college.edu.in": student.email,
          "Rajiv Gandhi Institute of Technology": student.college_name,
          "B.E. / B.Tech / BCA / MCA": student.program_name,
        };
        contentRef.current?.querySelectorAll<HTMLInputElement>("input").forEach(input => {
          const value = values[input.placeholder];
          if (value) {
            input.value = value;
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [step, savedSteps, student]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const mergeVisibleControls = () => {
      const snapshot = captureStep(root);
      draftControlsRef.current = { ...draftControlsRef.current, ...snapshot.controls };
    };
    root.addEventListener("input", mergeVisibleControls);
    root.addEventListener("change", mergeVisibleControls);
    root.addEventListener("click", mergeVisibleControls, true);
    return () => {
      root.removeEventListener("input", mergeVisibleControls);
      root.removeEventListener("change", mergeVisibleControls);
      root.removeEventListener("click", mergeVisibleControls, true);
    };
  }, [step]);

  const saveAndContinue = async () => {
    const current = STUDENT_STEPS[step - 1];
    setSaving(true);
    setSaveError("");
    try {
      const visible = captureStep(contentRef.current);
      const record = await saveOnboardingStep(current.key, {
        ...visible,
        controls: { ...draftControlsRef.current, ...visible.controls },
      }, "completed");
      setSavedSteps(previous => ({ ...previous, [current.key]: record }));
      if (step < 7) setStep(value => value + 1);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save this step.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F5FC]" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header className="bg-[#1B3A6B] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-7 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center"><GraduationCap size={17} className="text-white" /></div>
            <div>
              <p className="text-white font-semibold text-[14px] leading-none">EduConnect</p>
              <p className="text-white/45 text-[10.5px] mt-0.5">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onHome && (
              <button onClick={onHome} className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={12} /> Home
              </button>
            )}
            {onLMS && (
              <button onClick={onLMS} className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20">
                <BookOpen size={12} /> My Courses
              </button>
            )}
            <div className="flex items-center gap-1 p-0.5 bg-white/10 rounded-full">
              <button onClick={onSwitch} className="px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white rounded-full transition-colors">College Portal</button>
              <span className="px-3 py-1.5 text-[11.5px] font-semibold text-[#1B3A6B] bg-white rounded-full">Student Portal</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            {student && <span className="text-white/70 text-[11.5px]">{student.full_name}</span>}
            <span className="text-white/50 text-[11.5px]" style={{ fontFamily: "var(--font-mono)" }}>Step {step} of 7</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-7 py-7 grid gap-5" style={{ gridTemplateColumns: "252px 1fr" }}>
        {/* Sidebar */}
        <aside className="sticky top-[62px] self-start">
          <div className="bg-white rounded-2xl border border-[--border] overflow-hidden shadow-sm">
            <div className="p-5 bg-[#1B3A6B]">
              <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mb-2.5">Progress</p>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 6) * 100}%` }} />
              </div>
              <p className="text-[11px] text-white/50 mt-2">{Math.round(((step - 1) / 6) * 100)}% complete</p>
            </div>
            <div className="p-2.5">
              {STUDENT_PHASES.map(ph => (
                <div key={ph.label} className="mb-1">
                  <p className="text-[10px] font-semibold tracking-wider text-[#9AA5BE] uppercase px-2.5 py-1.5">{ph.label}</p>
                  {ph.range.map(sid => {
                    const s = STUDENT_STEPS[sid - 1];
                    const Icon = s.icon;
                    const done   = isCompleted(sid);
                    const active = sid === step;
                    return (
                      <button key={sid} onClick={() => done && setStep(sid)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left mb-0.5 transition-all ${active ? "bg-[#EBF1FA]" : done ? "hover:bg-[#F4F7FC] cursor-pointer" : "opacity-40 cursor-default"}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done || active ? "bg-[#1B3A6B]" : "bg-[#E8ECF5]"}`}>
                          {done ? <Check size={12} className="text-white" /> : <Icon size={12} className={active ? "text-white" : "text-[#5A6A8A]"} />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[11.5px] font-semibold leading-none truncate ${active ? "text-[#1B3A6B]" : done ? "text-[#0F1C3F]" : "text-[#9AA5BE]"}`}>{s.label}</p>
                          <p className="text-[10.5px] text-[#9AA5BE] mt-0.5">{s.desc}</p>
                        </div>
                        {active && <ChevronRight size={12} className="text-[#1B3A6B] ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            {onLMS && (
              <div className="px-3 pb-3">
                <button onClick={onLMS}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-[#EBF1FA] hover:bg-[#D8E5F5] border border-[rgba(27,58,107,0.15)] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#1B3A6B] flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[12.5px] font-bold text-[#1B3A6B] leading-none">My LMS Courses</p>
                    <p className="text-[10.5px] text-[#5A6A8A] mt-0.5">3 enrolled · 62% progress</p>
                  </div>
                  <ChevronRight size={13} className="text-[#1B3A6B] opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              </div>
            )}
            <div className="p-4 border-t border-[--border] text-center">
              <p className="text-[11.5px] text-[#5A6A8A]">Need help?</p>
              <a href="mailto:support@educonnect.in" className="text-[11.5px] text-[#1B3A6B] font-medium hover:underline">support@educonnect.in</a>
            </div>
          </div>
        </aside>

        {/* Main Card */}
        <main className="bg-white rounded-2xl border border-[--border] shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-5 border-b border-[--border] flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0">
              {(() => { const Icon = STUDENT_STEPS[step - 1].icon; return <Icon size={19} className="text-white" />; })()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[19px] text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{STUDENT_STEPS[step - 1].label}</h1>
                {(step === 3 || step === 5 || step === 6) && (
                  <span className="flex items-center gap-1 text-[10.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><Sparkles size={10} /> AI-Powered</span>
                )}
              </div>
              <p className="text-[12.5px] text-[#5A6A8A] mt-0.5">{STUDENT_STEPS[step - 1].desc}</p>
            </div>
            <span className="text-[11.5px] text-[#9AA5BE]" style={{ fontFamily: "var(--font-mono)" }}>Step {step}/7</span>
          </div>

          {/* Content */}
          {saveError && <div className="mx-8 mt-5 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-[12.5px]">{saveError}</div>}
          <div ref={contentRef} className={step === 7 ? "" : "px-8 py-7"}>{stepComponents[step]}</div>

          {/* Footer */}
          {step < 7 && (
            <div className="px-8 py-5 border-t border-[--border] flex items-center justify-between">
              <button onClick={() => step > 1 && setStep(s => s - 1)} disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2 border border-[--border] rounded-[10px] text-[13.5px] font-medium text-[#5A6A8A] hover:bg-[#F4F7FC] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-1.5">
                {STUDENT_STEPS.map((_, i) => {
                  const n = i + 1;
                  const ph = n <= 2 ? "#1B3A6B" : n === 3 ? "#059669" : n === 4 ? "#D97706" : n <= 6 ? "#7C3AED" : n === 7 ? "#DC2626" : "#059669";
                  return (
                    <div key={n} className="rounded-full transition-all duration-300"
                      style={{ width: n === step ? 20 : 7, height: 5, background: n === step ? ph : n < step ? `${ph}66` : "#E8ECF5" }} />
                  );
                })}
              </div>
              <button onClick={saveAndContinue} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-[#1B3A6B] text-white text-[13.5px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shadow-sm">
                {saving ? "Saving…" : step === 6 ? "Save & View Dashboard" : "Save & Continue"} <ChevronRight size={14} />
              </button>
            </div>
          )}
          {step === 7 && (
            <div className="px-8 py-4 border-t border-[--border] flex items-center justify-between bg-[#F8FAFB]">
              <button onClick={() => setStep(6)} className="flex items-center gap-2 px-4 py-2 border border-[--border] rounded-[10px] text-[13.5px] font-medium text-[#5A6A8A] hover:bg-white transition-all">
                <ArrowLeft size={14} /> Back
              </button>
              <p className="text-[12.5px] text-[#9AA5BE]">Your personalized dashboard is live</p>
              <button className="flex items-center gap-2 px-5 py-2 bg-[#D97706] text-white text-[13.5px] rounded-[10px] hover:bg-[#b45309] transition-colors font-medium shadow-sm">
                <ExternalLink size={14} /> Open Full Portal
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   COLLEGE PORTAL
════════════════════════════════════════════════════════ */
export function CollegePortal({ onSwitch, onHome }: { onSwitch: () => void; onHome?: () => void }) {
  const pathStep=Number(window.location.pathname.match(/^\/college\/onboarding\/step-(\d+)$/)?.[1]||1);
  const [step, setStep] = useState(Math.min(9,Math.max(1,pathStep)));
  const navigateStep=(next:number)=>{const safe=Math.min(9,Math.max(1,next));window.history.pushState({},"",`/college/onboarding/step-${safe}`);setStep(safe);window.scrollTo({top:0,behavior:"smooth"});};
  useEffect(()=>{if(window.location.pathname==="/college")window.history.replaceState({},"","/college/onboarding/step-1");const restore=()=>setStep(Math.min(9,Math.max(1,Number(window.location.pathname.match(/^\/college\/onboarding\/step-(\d+)$/)?.[1]||1))));window.addEventListener("popstate",restore);return()=>window.removeEventListener("popstate",restore);},[]);
  const isCompleted = (s: number) => s < step;

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1 />, 2: <Step2 />, 3: <Step3 />,
    4: <Step4 />, 5: <Step5 />, 6: <Step6 />,
    7: <Step7 />, 8: <Step8 />, 9: <Step9 />,
  };

  const phaseOf = (s: number) => s <= 3 ? "Registration" : s <= 8 ? "Onboarding Setup" : "Billing";
  const phases  = [
    { label: "Registration",     range: [1, 2, 3] },
    { label: "Onboarding Setup", range: [4, 5, 6, 7, 8] },
    { label: "Billing",          range: [9] },
  ];

  return (
    <div className="min-h-screen bg-[#F2F5FC]" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header className="bg-[#1B3A6B] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-7 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center">
              <Building2 size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-[14px] leading-none">EduConnect</p>
              <p className="text-white/45 text-[10.5px] mt-0.5">Institution Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Home link */}
            {onHome && (
              <button onClick={onHome} className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={12} /> Home
              </button>
            )}
            {/* Portal switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-white/10 rounded-full">
              <span className="px-3 py-1.5 text-[11.5px] font-semibold text-[#1B3A6B] bg-white rounded-full">College Portal</span>
              <button onClick={onSwitch} className="px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white rounded-full transition-colors">Student Portal</button>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              {phases.map((ph, i) => {
                const active = ph.range.includes(step);
                const done   = Math.max(...ph.range) < step;
                return (
                  <div key={ph.label} className="flex items-center gap-2">
                    {i > 0 && <div className="w-5 h-px bg-white/20" />}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium ${active ? "bg-white/20 text-white" : done ? "bg-white/10 text-white/60" : "bg-white/5 text-white/30"}`}>
                      {done && <Check size={10} />}{ph.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/50 text-[11.5px]" style={{ fontFamily: "var(--font-mono)" }}>Step {step} of 9</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-7 py-7 grid gap-5" style={{ gridTemplateColumns: "252px 1fr" }}>

        {/* Sidebar */}
        <aside className="sticky top-[62px] self-start">
          <div className="bg-white rounded-2xl border border-[--border] overflow-hidden shadow-sm">
            {/* Progress */}
            <div className="p-5 bg-[#1B3A6B]">
              <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mb-2.5">Progress</p>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 8) * 100}%` }} />
              </div>
              <p className="text-[11px] text-white/50 mt-2">{Math.round(((step - 1) / 8) * 100)}% complete</p>
            </div>

            {/* Phase groups */}
            <div className="p-2.5">
              {phases.map(ph => (
                <div key={ph.label} className="mb-1">
                  <p className="text-[10px] font-semibold tracking-wider text-[#9AA5BE] uppercase px-2.5 py-1.5">{ph.label}</p>
                  {ph.range.map(sid => {
                    const s = STEPS[sid - 1];
                    const Icon = s.icon;
                    const done   = isCompleted(sid);
                    const active = sid === step;
                    return (
                      <button key={sid} onClick={() => done && navigateStep(sid)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left mb-0.5 transition-all ${active ? "bg-[#EBF1FA]" : done ? "hover:bg-[#F4F7FC] cursor-pointer" : "opacity-40 cursor-default"}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done || active ? "bg-[#1B3A6B]" : "bg-[#E8ECF5]"}`}>
                          {done ? <Check size={12} className="text-white" /> : <Icon size={12} className={active ? "text-white" : "text-[#5A6A8A]"} />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[11.5px] font-semibold leading-none truncate ${active ? "text-[#1B3A6B]" : done ? "text-[#0F1C3F]" : "text-[#9AA5BE]"}`}>{s.label}</p>
                          <p className="text-[10.5px] text-[#9AA5BE] mt-0.5">{s.desc}</p>
                        </div>
                        {active && <ChevronRight size={12} className="text-[#1B3A6B] ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[--border] text-center">
              <p className="text-[11.5px] text-[#5A6A8A]">Need help?</p>
              <a href="mailto:support@educonnect.in" className="text-[11.5px] text-[#1B3A6B] font-medium hover:underline">support@educonnect.in</a>
            </div>
          </div>
        </aside>

        {/* Main Card */}
        <main className="bg-white rounded-2xl border border-[--border] shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-8 py-5 border-b border-[--border] flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0">
              {(() => { const Icon = STEPS[step - 1].icon; return <Icon size={19} className="text-white" />; })()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[19px] text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{STEPS[step - 1].label}</h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#EBF1FA] text-[#1B3A6B]">{phaseOf(step)}</span>
              </div>
              <p className="text-[12.5px] text-[#5A6A8A] mt-0.5">{STEPS[step - 1].desc}</p>
            </div>
            <span className="text-[11.5px] text-[#9AA5BE]" style={{ fontFamily: "var(--font-mono)" }}>Step {step}/9</span>
          </div>

          {/* Content */}
          <div className="px-8 py-7">{stepComponents[step]}</div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[--border] flex items-center justify-between">
            <button onClick={() => step > 1 && navigateStep(step-1)} disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 border border-[--border] rounded-[10px] text-[13.5px] font-medium text-[#5A6A8A] hover:bg-[#F4F7FC] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ArrowLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => {
                const n = i + 1;
                const ph = n <= 3 ? "#1B3A6B" : n <= 8 ? "#D97706" : "#7C3AED";
                return (
                  <div key={n} className="rounded-full transition-all duration-300"
                    style={{ width: n === step ? 20 : 7, height: 5, background: n === step ? ph : n < step ? `${ph}66` : "#E8ECF5" }} />
                );
              })}
            </div>

            {step < 9 ? (
              <button onClick={() => navigateStep(step+1)}
                className="flex items-center gap-2 px-5 py-2 bg-[#1B3A6B] text-white text-[13.5px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shadow-sm">
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button className="flex items-center gap-2 px-5 py-2 bg-[#D97706] text-white text-[13.5px] rounded-[10px] hover:bg-[#b45309] transition-colors font-medium shadow-sm">
                Launch Portal <LayoutDashboard size={14} />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
