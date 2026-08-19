import { useState } from "react";
import {
  GraduationCap,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Building2,
  LayoutDashboard,
  ExternalLink,
  UserPlus,
  User,
  ShieldCheck,
  Brain,
  Target,
  Route,
  FileText,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { STEPS } from "../components/shared";
import {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7,
  Step8,
  Step9,
} from "./college-steps";
import { SS1, SS2, SS3, SS4, SS5, SS6 } from "./student-steps";
import { SSSkillVerify } from "./skill-verify";
import { SSCVGenerator } from "./cv-generator";

/* ── Student step definitions ── */
export const STUDENT_STEPS = [
  {
    id: 1,
    label: "Create Account",
    icon: UserPlus,
    desc: "Email or social login + OTP",
  },
  {
    id: 2,
    label: "Student Profile",
    icon: User,
    desc: "Personal, education & skills",
  },
  {
    id: 3,
    label: "Skill Verification",
    icon: ShieldCheck,
    desc: "Verify skills for your CV",
  },
  {
    id: 4,
    label: "AI Career Counselling",
    icon: Brain,
    desc: "Assessment & career fit",
  },
  {
    id: 5,
    label: "Career Goal Setup",
    icon: Target,
    desc: "Role, domain & companies",
  },
  {
    id: 6,
    label: "AI Roadmap Generator",
    icon: Route,
    desc: "4-phase learning plan",
  },
  {
    id: 7,
    label: "Dynamic CV",
    icon: FileText,
    desc: "ATS-optimised CV export",
  },
  {
    id: 8,
    label: "Student Dashboard",
    icon: LayoutDashboard,
    desc: "Insights & notifications",
  },
];

export const STUDENT_PHASES = [
  { label: "Onboarding", range: [1, 2] },
  { label: "Verification", range: [3] },
  { label: "Assessment", range: [4] },
  { label: "Goals & Roadmap", range: [5, 6] },
  { label: "CV & Dashboard", range: [7, 8] },
];

/* ════════════════════════════════════════════════════════
   STUDENT PORTAL
════════════════════════════════════════════════════════ */
export function StudentPortal({
  onSwitch,
  onHome,
  onLMS,
}: {
  onSwitch: () => void;
  onHome?: () => void;
  onLMS?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCompleted = (s: number) => s < step;

  const stepComponents: Record<number, React.ReactNode> = {
    1: <SS1 />,
    2: <SS2 />,
    3: <SSSkillVerify />,
    4: <SS3 />,
    5: <SS4 />,
    6: <SS5 onLMS={onLMS} />,
    7: <SSCVGenerator />,
    8: <SS6 />,
  };

  return (
    <div
      className="min-h-screen bg-[#F2F5FC]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <header className="bg-[#1B3A6B] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-7 py-3.5">
          {/* Top Header */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center">
                <GraduationCap size={17} className="text-white" />
              </div>

              <div>
                <p className="text-white font-semibold text-[14px] leading-none">
                  EduConnect
                </p>

                <p className="text-white/45 text-[10.5px] mt-0.5">
                  Student Portal
                </p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-3">
              {onHome && (
                <button
                  onClick={onHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft size={12} />
                  Home
                </button>
              )}

              {onLMS && (
                <button
                  onClick={onLMS}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20"
                >
                  <BookOpen size={12} />
                  My Courses
                </button>
              )}

              {/* Portal Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-white/10 rounded-full">
                <button
                  onClick={onSwitch}
                  className="px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white rounded-full transition-colors"
                >
                  College Portal
                </button>

                <span className="px-3 py-1.5 text-[11.5px] font-semibold text-[#1B3A6B] bg-white rounded-full">
                  Student Portal
                </span>
              </div>

              <div className="h-4 w-px bg-white/20" />

              <span
                className="text-white/50 text-[11.5px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Step {step} of 8
              </span>
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-white/10">
              <div className="flex flex-col gap-2">
                {onHome && (
                  <button
                    onClick={() => {
                      onHome();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-[12px] text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Home
                  </button>
                )}

                {onLMS && (
                  <button
                    onClick={() => {
                      onLMS();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-[12px] text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <BookOpen size={14} />
                    My Courses
                  </button>
                )}

                <button
                  onClick={() => {
                    onSwitch();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-[12px] text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Building2 size={14} />
                  College Portal
                </button>

                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/10">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-white" />

                    <span className="text-[12px] font-semibold text-white">
                      Student Portal
                    </span>
                  </div>

                  <span
                    className="text-[11px] text-white/50"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Step {step}/8
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-7 py-5 sm:py-7 grid grid-cols-1 lg:grid-cols-[252px_1fr] gap-5">
        {/* Sidebar */}
        <aside className="hidden lg:block sticky top-[62px] self-start">
          <div className="bg-white rounded-2xl border border-[--border] overflow-hidden shadow-sm">
            <div className="p-5 bg-[#1B3A6B]">
              <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mb-2.5">
                Progress
              </p>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${((step - 1) / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-white/50 mt-2">
                {Math.round(((step - 1) / 5) * 100)}% complete
              </p>
            </div>
            <div className="p-2.5">
              {STUDENT_PHASES.map((ph) => (
                <div key={ph.label} className="mb-1">
                  <p className="text-[10px] font-semibold tracking-wider text-[#9AA5BE] uppercase px-2.5 py-1.5">
                    {ph.label}
                  </p>
                  {ph.range.map((sid) => {
                    const s = STUDENT_STEPS[sid - 1];
                    const Icon = s.icon;
                    const done = isCompleted(sid);
                    const active = sid === step;
                    return (
                      <button
                        key={sid}
                        onClick={() => done && setStep(sid)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left mb-0.5 transition-all ${active ? "bg-[#EBF1FA]" : done ? "hover:bg-[#F4F7FC] cursor-pointer" : "opacity-40 cursor-default"}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done || active ? "bg-[#1B3A6B]" : "bg-[#E8ECF5]"}`}
                        >
                          {done ? (
                            <Check size={12} className="text-white" />
                          ) : (
                            <Icon
                              size={12}
                              className={
                                active ? "text-white" : "text-[#5A6A8A]"
                              }
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-[11.5px] font-semibold leading-none truncate ${active ? "text-[#1B3A6B]" : done ? "text-[#0F1C3F]" : "text-[#9AA5BE]"}`}
                          >
                            {s.label}
                          </p>
                          <p className="text-[10.5px] text-[#9AA5BE] mt-0.5">
                            {s.desc}
                          </p>
                        </div>
                        {active && (
                          <ChevronRight
                            size={12}
                            className="text-[#1B3A6B] ml-auto shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            {onLMS && (
              <div className="px-3 pb-3">
                <button
                  onClick={onLMS}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-[#EBF1FA] hover:bg-[#D8E5F5] border border-[rgba(27,58,107,0.15)] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1B3A6B] flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[12.5px] font-bold text-[#1B3A6B] leading-none">
                      My LMS Courses
                    </p>
                    <p className="text-[10.5px] text-[#5A6A8A] mt-0.5">
                      3 enrolled · 62% progress
                    </p>
                  </div>
                  <ChevronRight
                    size={13}
                    className="text-[#1B3A6B] opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </button>
              </div>
            )}
            <div className="p-4 border-t border-[--border] text-center">
              <p className="text-[11.5px] text-[#5A6A8A]">Need help?</p>
              <a
                href="mailto:support@educonnect.in"
                className="text-[11.5px] text-[#1B3A6B] font-medium hover:underline"
              >
                support@educonnect.in
              </a>
            </div>
          </div>
        </aside>

        {/* Main Card */}
        <main className="bg-white rounded-2xl border border-[--border] shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-[--border]">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0">
                {(() => {
                  const Icon = STUDENT_STEPS[step - 1].icon;
                  return (
                    <Icon
                      size={16}
                      className="sm:w-[19px] sm:h-[19px] text-white"
                    />
                  );
                })()}
              </div>

              {/* Title + Description */}
              <div className="flex-1 min-w-0">
                {/* Title Row */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                  <h1
                    className="text-[16px] sm:text-[18px] lg:text-[19px] text-[#0F1C3F] font-semibold sm:font-normal truncate"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {STUDENT_STEPS[step - 1].label}
                  </h1>

                  {/* AI Badge */}
                  {(step === 4 || step === 6 || step === 7) && (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                      <Sparkles size={9} className="sm:w-[10px] sm:h-[10px]" />
                      <span>AI-Powered</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-[10.5px] sm:text-[12px] lg:text-[12.5px] text-[#5A6A8A] mt-0.5 leading-relaxed line-clamp-2">
                  {STUDENT_STEPS[step - 1].desc}
                </p>
              </div>

              {/* Desktop Step Counter */}
              <span
                className="hidden sm:block shrink-0 text-[10.5px] lg:text-[11.5px] text-[#9AA5BE]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Step {step}/8
              </span>
            </div>
          </div>

          {/* Content */}
          <div
            className={
              step === 8 ? "" : "px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-7"
            }
          >
            {stepComponents[step]}
          </div>

          {/* Footer - Steps 1 to 7 */}
          {step < 8 && (
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-t border-[--border]">
              <div className="flex items-center justify-between gap-3">
                {/* Back Button */}
                <button
                  onClick={() => step > 1 && setStep((s) => s - 1)}
                  disabled={step === 1}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-[--border] rounded-[10px] text-[11.5px] sm:text-[13px] lg:text-[13.5px] font-medium text-[#5A6A8A] hover:bg-[#F4F7FC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <ArrowLeft size={13} className="sm:w-[14px] sm:h-[14px]" />

                  <span>Back</span>
                </button>

                {/* Step Indicators */}
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                  {STUDENT_STEPS.map((_, i) => {
                    const n = i + 1;

                    const ph =
                      n <= 2
                        ? "#1B3A6B"
                        : n === 3
                          ? "#059669"
                          : n === 4
                            ? "#D97706"
                            : n <= 6
                              ? "#7C3AED"
                              : n === 7
                                ? "#DC2626"
                                : "#059669";

                    return (
                      <div
                        key={n}
                        className="rounded-full transition-all duration-300 shrink-0"
                        style={{
                          width: n === step ? 18 : 6,

                          height: 4,

                          background:
                            n === step ? ph : n < step ? `${ph}66` : "#E8ECF5",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#1B3A6B] text-white text-[11.5px] sm:text-[13px] lg:text-[13.5px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shadow-sm shrink-0"
                >
                  <span className="sm:hidden">
                    {step === 7 ? "Dashboard" : "Next"}
                  </span>

                  <span className="hidden sm:inline">
                    {step === 7 ? "View Dashboard" : "Continue"}
                  </span>

                  <ChevronRight size={13} className="sm:w-[14px] sm:h-[14px]" />
                </button>
              </div>
            </div>
          )}

          {/* Footer - Step 8 */}
          {step === 8 && (
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-[--border] bg-[#F8FAFB]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Back */}
                <button
                  onClick={() => setStep(7)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 border border-[--border] rounded-[10px] text-[11.5px] sm:text-[13px] lg:text-[13.5px] font-medium text-[#5A6A8A] hover:bg-white transition-all"
                >
                  <ArrowLeft size={13} className="sm:w-[14px] sm:h-[14px]" />
                  Back
                </button>

                {/* Dashboard Message */}
                <p className="text-[10.5px] sm:text-[12px] lg:text-[12.5px] text-[#9AA5BE] text-center order-first sm:order-none">
                  Your personalized dashboard is live
                </p>

                {/* Open Portal */}
                <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#D97706] text-white text-[11.5px] sm:text-[13px] lg:text-[13.5px] rounded-[10px] hover:bg-[#b45309] transition-colors font-medium shadow-sm">
                  <ExternalLink size={13} className="sm:w-[14px] sm:h-[14px]" />

                  <span className="sm:hidden">Open Portal</span>

                  <span className="hidden sm:inline">Open Full Portal</span>
                </button>
              </div>
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
export function CollegePortal({
  onSwitch,
  onHome,
}: {
  onSwitch: () => void;
  onHome?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCompleted = (s: number) => s < step;

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1 />,
    2: <Step2 />,
    3: <Step3 />,
    4: <Step4 />,
    5: <Step5 />,
    6: <Step6 />,
    7: <Step7 />,
    8: <Step8 />,
    9: <Step9 />,
  };

  const phaseOf = (s: number) =>
    s <= 3 ? "Registration" : s <= 8 ? "Onboarding Setup" : "Billing";
  const phases = [
    { label: "Registration", range: [1, 2, 3] },
    { label: "Onboarding Setup", range: [4, 5, 6, 7, 8] },
    { label: "Billing", range: [9] },
  ];

  return (
    <div
      className="min-h-screen bg-[#F2F5FC]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <header className="bg-[#1B3A6B] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-5 lg:px-7 py-3">
          {/* ================= DESKTOP / TABLET HEADER ================= */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center">
                <Building2 size={17} className="text-white" />
              </div>

              <div>
                <p className="text-white font-semibold text-[14px] leading-none">
                  EduConnect
                </p>

                <p className="text-white/45 text-[10.5px] mt-0.5">
                  Institution Portal
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-2 xl:gap-3 min-w-0">
              {/* Home */}
              {onHome && (
                <button
                  onClick={onHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white transition-colors whitespace-nowrap"
                >
                  <ArrowLeft size={12} />
                  Home
                </button>
              )}

              {/* Portal Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-white/10 rounded-full shrink-0">
                <span className="px-3 py-1.5 text-[11.5px] font-semibold text-[#1B3A6B] bg-white rounded-full whitespace-nowrap">
                  College Portal
                </span>

                <button
                  onClick={onSwitch}
                  className="px-3 py-1.5 text-[11.5px] font-medium text-white/60 hover:text-white rounded-full transition-colors whitespace-nowrap"
                >
                  Student Portal
                </button>
              </div>

              <div className="h-4 w-px bg-white/20 shrink-0" />

              {/* Phases */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                {phases.map((ph, i) => {
                  const active = ph.range.includes(step);
                  const done = Math.max(...ph.range) < step;

                  return (
                    <div
                      key={ph.label}
                      className="flex items-center gap-2 shrink-0"
                    >
                      {i > 0 && (
                        <div className="w-5 h-px bg-white/20 shrink-0" />
                      )}

                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${
                          active
                            ? "bg-white/20 text-white"
                            : done
                              ? "bg-white/10 text-white/60"
                              : "bg-white/5 text-white/30"
                        }`}
                      >
                        {done && <Check size={10} />}
                        {ph.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-4 w-px bg-white/20 shrink-0" />

              {/* Step */}
              <span
                className="text-white/50 text-[11.5px] whitespace-nowrap shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Step {step} of 9
              </span>
            </div>
          </div>

          {/* ================= MOBILE / TABLET HEADER ================= */}
          <div className="lg:hidden">
            {/* Top Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Logo */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center shrink-0">
                  <Building2 size={17} className="text-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-white font-semibold text-[14px] leading-none">
                    EduConnect
                  </p>

                  <p className="text-white/45 text-[10px] mt-0.5">
                    Institution Portal
                  </p>
                </div>
              </div>

              {/* Mobile Step + Menu */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="hidden sm:block text-white/50 text-[10.5px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step {step} of 9
                </span>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>

            {/* ================= MOBILE MENU ================= */}
            {mobileMenuOpen && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex flex-col gap-3">
                  {/* Home */}
                  {onHome && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onHome();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white text-[12px] font-medium transition-colors"
                    >
                      <ArrowLeft size={13} />
                      Home
                    </button>
                  )}

                  {/* Portal Switcher */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-white/10 rounded-xl">
                    <div className="flex items-center justify-center px-3 py-2 rounded-lg bg-white text-[#1B3A6B] text-[11.5px] font-semibold">
                      College Portal
                    </div>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSwitch();
                      }}
                      className="flex items-center justify-center px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-[11.5px] font-medium transition-colors"
                    >
                      Student Portal
                    </button>
                  </div>

                  {/* Progress / Phases */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white/35 font-semibold mb-2">
                      Registration Progress
                    </p>

                    <div className="flex flex-col gap-1.5">
                      {phases.map((ph) => {
                        const active = ph.range.includes(step);
                        const done = Math.max(...ph.range) < step;

                        return (
                          <div
                            key={ph.label}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium ${
                              active
                                ? "bg-white/20 text-white"
                                : done
                                  ? "bg-white/10 text-white/60"
                                  : "bg-white/5 text-white/30"
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 shrink-0">
                              {done ? (
                                <Check size={10} />
                              ) : (
                                <span className="text-[9px]">
                                  {ph.range[0]}
                                </span>
                              )}
                            </div>

                            <span className="flex-1">{ph.label}</span>

                            {active && (
                              <span className="text-[9px] text-white/50">
                                Current
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Step */}
                  <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-lg">
                    <span className="text-[11px] text-white/40">
                      Current Step
                    </span>

                    <span
                      className="text-[11.5px] text-white/70"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Step {step} of 9
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-5 lg:px-7 py-4 sm:py-5 md:py-6 lg:py-7 grid grid-cols-1 lg:grid-cols-[252px_minmax(0,1fr)] gap-4 sm:gap-5 w-full min-w-0">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-[62px] lg:self-start">
          <div className="bg-white rounded-2xl border border-[--border] overflow-hidden shadow-sm">
            {/* Progress */}
            <div className="p-4 sm:p-5 bg-[#1B3A6B]">
              <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mb-2.5">
                Progress
              </p>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${((step - 1) / 8) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-white/50 mt-2">
                {Math.round(((step - 1) / 8) * 100)}% complete
              </p>
            </div>

            {/* Phase groups */}
            <div className="p-2.5 max-h-[420px] overflow-y-auto lg:max-h-none lg:overflow-visible">
              {phases.map((ph) => (
                <div key={ph.label} className="mb-1">
                  <p className="text-[10px] font-semibold tracking-wider text-[#9AA5BE] uppercase px-2.5 py-1.5">
                    {ph.label}
                  </p>
                  {ph.range.map((sid) => {
                    const s = STEPS[sid - 1];
                    const Icon = s.icon;
                    const done = isCompleted(sid);
                    const active = sid === step;
                    return (
                      <button
                        key={sid}
                        onClick={() => done && setStep(sid)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left mb-0.5 transition-all ${active ? "bg-[#EBF1FA]" : done ? "hover:bg-[#F4F7FC] cursor-pointer" : "opacity-40 cursor-default"}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done || active ? "bg-[#1B3A6B]" : "bg-[#E8ECF5]"}`}
                        >
                          {done ? (
                            <Check size={12} className="text-white" />
                          ) : (
                            <Icon
                              size={12}
                              className={
                                active ? "text-white" : "text-[#5A6A8A]"
                              }
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-[11.5px] font-semibold leading-none truncate ${active ? "text-[#1B3A6B]" : done ? "text-[#0F1C3F]" : "text-[#9AA5BE]"}`}
                          >
                            {s.label}
                          </p>
                          <p className="text-[10.5px] text-[#9AA5BE] mt-0.5">
                            {s.desc}
                          </p>
                        </div>
                        {active && (
                          <ChevronRight
                            size={12}
                            className="text-[#1B3A6B] ml-auto shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[--border] text-center">
              <p className="text-[11.5px] text-[#5A6A8A]">Need help?</p>
              <a
                href="mailto:support@educonnect.in"
                className="text-[11.5px] text-[#1B3A6B] font-medium hover:underline"
              >
                support@educonnect.in
              </a>
            </div>
          </div>
        </aside>

        {/* Main Card */}
        <main className="w-full min-w-0 bg-white rounded-2xl border border-[--border] shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-[--border] flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0">
              {(() => {
                const Icon = STEPS[step - 1].icon;
                return <Icon size={19} className="text-white" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="text-[17px] sm:text-[19px] text-[#0F1C3F] break-words"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {STEPS[step - 1].label}
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#EBF1FA] text-[#1B3A6B]">
                  {phaseOf(step)}
                </span>
              </div>
              <p className="text-[12.5px] text-[#5A6A8A] mt-0.5">
                {STEPS[step - 1].desc}
              </p>
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] text-[#9AA5BE] shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
              Step {step}/9
            </span>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-8 py-5 sm:py-7">
            {stepComponents[step]}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-t border-[--border] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => step > 1 && setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-[--border] rounded-[10px] text-[12px] sm:text-[13.5px] font-medium text-[#5A6A8A] hover:bg-[#F4F7FC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-1 sm:gap-1.5 max-w-full overflow-hidden">
              {STEPS.map((_, i) => {
                const n = i + 1;
                const ph = n <= 3 ? "#1B3A6B" : n <= 8 ? "#D97706" : "#7C3AED";
                return (
                  <div key={n}className="rounded-full transition-all duration-300 shrink-0"
                    style={{
                      width: n === step ? 20 : 7,
                      height: 5,
                      background:
                        n === step ? ph : n < step ? `${ph}66` : "#E8ECF5",
                    }}
                  />
                );
              })}
            </div>

            {step < 9 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 bg-[#1B3A6B] text-white text-[12px] sm:text-[13.5px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shadow-sm shrink-0"
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 bg-[#D97706] text-white text-[12px] sm:text-[13.5px] rounded-[10px] hover:bg-[#b45309] transition-colors font-medium shadow-sm shrink-0">
                Launch Portal <LayoutDashboard size={14} />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
