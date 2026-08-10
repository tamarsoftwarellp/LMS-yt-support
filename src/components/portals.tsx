import { useState } from "react";
import {
  GraduationCap, Check, ChevronRight, ArrowLeft, Sparkles,
  Building2, LayoutDashboard, ExternalLink,
  UserPlus, User, ShieldCheck, Brain, Target, Route, FileText, BookOpen,
} from "lucide-react";
import { STEPS } from "../components/shared";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9 } from "./college-steps";
import { SS1, SS2, SS3, SS4, SS5, SS6 } from "./student-steps";
import { SSSkillVerify } from "./skill-verify";
import { SSCVGenerator } from "./cv-generator";

/* ── Student step definitions ── */
export const STUDENT_STEPS = [
  { id: 1, label: "Create Account",        icon: UserPlus,     desc: "Email or social login + OTP" },
  { id: 2, label: "Student Profile",        icon: User,         desc: "Personal, education & skills" },
  { id: 3, label: "Skill Verification",     icon: ShieldCheck,  desc: "Verify skills for your CV" },
  { id: 4, label: "AI Career Counselling",  icon: Brain,        desc: "Assessment & career fit" },
  { id: 5, label: "Career Goal Setup",      icon: Target,       desc: "Role, domain & companies" },
  { id: 6, label: "AI Roadmap Generator",   icon: Route,        desc: "4-phase learning plan" },
  { id: 7, label: "Dynamic CV",             icon: FileText,     desc: "ATS-optimised CV export" },
  { id: 8, label: "Student Dashboard",      icon: LayoutDashboard, desc: "Insights & notifications" },
];

export const STUDENT_PHASES = [
  { label: "Onboarding",       range: [1, 2] },
  { label: "Verification",     range: [3] },
  { label: "Assessment",       range: [4] },
  { label: "Goals & Roadmap",  range: [5, 6] },
  { label: "CV & Dashboard",   range: [7, 8] },
];

/* ════════════════════════════════════════════════════════
   STUDENT PORTAL
════════════════════════════════════════════════════════ */
export function StudentPortal({ onSwitch, onHome, onLMS }: { onSwitch: () => void; onHome?: () => void; onLMS?: () => void }) {
  const [step, setStep] = useState(1);
  const isCompleted = (s: number) => s < step;

  const stepComponents: Record<number, React.ReactNode> = {
    1: <SS1 />, 2: <SS2 />, 3: <SSSkillVerify />,
    4: <SS3 />, 5: <SS4 />, 6: <SS5 onLMS={onLMS} />, 7: <SSCVGenerator />, 8: <SS6 />,
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
            <span className="text-white/50 text-[11.5px]" style={{ fontFamily: "var(--font-mono)" }}>Step {step} of 8</span>
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
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 5) * 100}%` }} />
              </div>
              <p className="text-[11px] text-white/50 mt-2">{Math.round(((step - 1) / 5) * 100)}% complete</p>
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
                {(step === 4 || step === 6 || step === 7) && (
                  <span className="flex items-center gap-1 text-[10.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><Sparkles size={10} /> AI-Powered</span>
                )}
              </div>
              <p className="text-[12.5px] text-[#5A6A8A] mt-0.5">{STUDENT_STEPS[step - 1].desc}</p>
            </div>
            <span className="text-[11.5px] text-[#9AA5BE]" style={{ fontFamily: "var(--font-mono)" }}>Step {step}/8</span>
          </div>

          {/* Content */}
          <div className={step === 8 ? "" : "px-8 py-7"}>{stepComponents[step]}</div>

          {/* Footer */}
          {step < 8 && (
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
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-5 py-2 bg-[#1B3A6B] text-white text-[13.5px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shadow-sm">
                {step === 7 ? "View Dashboard" : "Continue"} <ChevronRight size={14} />
              </button>
            </div>
          )}
          {step === 8 && (
            <div className="px-8 py-4 border-t border-[--border] flex items-center justify-between bg-[#F8FAFB]">
              <button onClick={() => setStep(7)} className="flex items-center gap-2 px-4 py-2 border border-[--border] rounded-[10px] text-[13.5px] font-medium text-[#5A6A8A] hover:bg-white transition-all">
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
  const [step, setStep] = useState(1);
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
            <button onClick={() => step > 1 && setStep(s => s - 1)} disabled={step === 1}
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
              <button onClick={() => setStep(s => s + 1)}
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
