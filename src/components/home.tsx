import { useState } from "react";
import {
  GraduationCap,
  Building2,
  Users,
  Target,
  LayoutDashboard,
  CreditCard,
  UserPlus,
  Brain,
  Route,
  Activity,
  FileText,
  Briefcase,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  X,
  Star,
  LogIn,
  ShieldCheck,
  BookOpen,
  Menu,
} from "lucide-react";

export function HomePage({
  onCollege,
  onStudent,
  onFSD,
  onStudentLogin,
  onAdminLogin,
  onStudentRegister,
  onLMS,
}: {
  onCollege: () => void;
  onStudent: () => void;
  onFSD?: () => void;
  onStudentLogin?: () => void;
  onAdminLogin?: () => void;
  onStudentRegister?: () => void;
  onLMS?: () => void;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"college" | "student">("college");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: "1,200+", label: "Colleges Onboarded" },
    { value: "4.8L+", label: "Students Placed" },
    { value: "92%", label: "Placement Rate" },
    { value: "3,500+", label: "Recruiting Partners" },
  ];

  const collegeFeatures = [
    {
      icon: Building2,
      title: "Institution Setup",
      desc: "Register your college, configure departments, batches and branding in minutes.",
    },
    {
      icon: Users,
      title: "Faculty & Team Roles",
      desc: "Set granular permissions for faculty, placement officers and coordinators.",
    },
    {
      icon: GraduationCap,
      title: "Student Onboarding",
      desc: "Bulk CSV upload, invite links, or manual registration — your choice.",
    },
    {
      icon: Target,
      title: "Career Configuration",
      desc: "Define target roles, eligibility criteria, and custom assessment rules.",
    },
    {
      icon: LayoutDashboard,
      title: "5 Live Dashboards",
      desc: "Institution, placement, faculty, analytics, and student activity — all in one.",
    },
    {
      icon: CreditCard,
      title: "Flexible Billing",
      desc: "Starter to Enterprise plans. Pay per student, per semester, or annually.",
    },
  ];

  const studentFeatures = [
    {
      icon: UserPlus,
      title: "Quick Onboarding",
      desc: "Sign up with email, mobile, Google, or LinkedIn — verified in under 2 minutes.",
    },
    {
      icon: Brain,
      title: "AI Career Assessment ⭐",
      desc: "Personal + technical assessment generating your exact career-fit percentages.",
    },
    {
      icon: Route,
      title: "AI Roadmap Generator ⭐",
      desc: "4-phase personalized roadmap with skills, projects, certs, and timeline.",
    },
    {
      icon: Activity,
      title: "Readiness Scores",
      desc: "Real-time scores for overall, role-specific, and company-specific readiness.",
    },
    {
      icon: FileText,
      title: "Dynamic CV Builder",
      desc: "Auto-populates from your profile. Export PDF/DOCX or share a public link.",
    },
    {
      icon: Briefcase,
      title: "Placement Matching",
      desc: "Get matched with internships and jobs that fit your goals and skill level.",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Priya Menon",
      role: "Placement Head, RGIIT Mumbai",
      avatar: "PM",
      text: "EduConnect transformed our placement process. We went from 58% to 91% placement rate in one academic year. The dashboards save us 20+ hours a week.",
    },
    {
      name: "Arjun Shah",
      role: "B.Tech CSE, 2024 Graduate",
      avatar: "AS",
      text: "The AI roadmap was spot on. It told me exactly what to learn and in what order. I got placed at Microsoft — I genuinely think EduConnect made the difference.",
    },
    {
      name: "Ms. Kavitha Reddy",
      role: "TPO, Hyderabad Institute",
      avatar: "KR",
      text: "Onboarding 1,200 students used to take weeks. With EduConnect's bulk upload and verification system, we did it in 3 days.",
    },
  ];

  const faqs = [
    {
      q: "How long does college registration take?",
      a: "The full 9-step registration wizard takes about 45–60 minutes. You can save progress and return at any time.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes — Starter plan is free up to 200 students. No credit card required. Upgrade anytime as you grow.",
    },
    {
      q: "How does the AI career counselling work?",
      a: "Students complete a personal + technical self-assessment. Our AI model processes skill gaps, interests, and goals to generate a career-fit score and a phased roadmap unique to each student.",
    },
    {
      q: "Can students use EduConnect independently?",
      a: "Students can sign up individually and access the full AI assessment, roadmap, and profile tools — even before their college is on EduConnect.",
    },
    {
      q: "What file formats are supported for uploads?",
      a: "Student bulk upload supports .csv and .xlsx. Profile photos accept JPG, PNG and WebP. CV export is available as PDF and DOCX.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free",
      students: "Up to 200",
      color: "border-[--border] bg-white",
      badge: null,
      cta: "Get Started",
    },
    {
      name: "Growth",
      price: "₹49/mo",
      students: "Up to 1,000",
      color: "border-[#1B3A6B] bg-[#EBF1FA]",
      badge: "Popular",
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      students: "Unlimited",
      color: "border-[#D97706] bg-[#FFF8EC]",
      badge: "Best Value",
      cta: "Contact Sales",
    },
  ];

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[--border]">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-5 md:px-6 lg:px-7 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[9px] bg-[#1B3A6B] flex items-center justify-center shrink-0">
              {" "}
              <GraduationCap size={17} className="text-white" />
            </div>
            <span className="text-[16px] font-bold text-[#0F1C3F]">
              EduConnect
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-5 xl:gap-6 text-[13px] xl:text-[13.5px] font-medium text-[#5A6A8A]">
            {" "}
            <a
              href="#features"
              className="hover:text-[#1B3A6B] transition-colors"
            >
              Features
            </a>
            <a
              href="#portals"
              className="hover:text-[#1B3A6B] transition-colors"
            >
              Portals
            </a>
            <a
              href="#pricing"
              className="hover:text-[#1B3A6B] transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="hover:text-[#1B3A6B] transition-colors"
            >
              Stories
            </a>
            <a href="#faq" className="hover:text-[#1B3A6B] transition-colors">
              FAQ
            </a>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onStudentLogin ?? onStudent}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#1B3A6B] hover:bg-[#EBF1FA] rounded-[10px] transition-colors"
            >
              <LogIn size={13} />
              Student Login
            </button>
            <button
              onClick={onAdminLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#5A6A8A] hover:bg-[#F4F6FB] rounded-[10px] transition-colors border border-[rgba(27,58,107,0.15)]"
            >
              <ShieldCheck size={13} />
              Admin
            </button>
            <button
              onClick={onLMS}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#7C3AED] hover:bg-[#F5F0FF] rounded-[10px] transition-colors border border-[#7C3AED]/30"
            >
              <BookOpen size={13} />
              LMS
            </button>
            <button
              onClick={onCollege}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#1B3A6B] rounded-[10px] hover:bg-[#122748] transition-colors shadow-sm"
            >
              Register College
            </button>
          </div>
          <button
            type="button"
            onClick={() => setNavOpen(!navOpen)}
            aria-label={
              navOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={navOpen}
            className=" lg:hidden flex items-center justify-center  w-10 h-10 p-2 text-[#5A6A8A] hover:text-[#1B3A6B] hover:bg-[#F4F  6FB] transition-colors  rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          >
            {" "}
            {navOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {navOpen && (
          <div className="lg:hidden border-t border-[--border] bg-white px-4 sm:px-5 md:px-6 py-4 space-y-2">
            {["Features", "Portals", "Pricing", "Stories", "FAQ"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setNavOpen(false)}
                  className=" block min-h-[44px] px-3 py-3 rounded-lg text-[13.5px] font-medium text-[#5A6A8A] hover:text-[#1B3A6B] hover:bg-[#F4F6FB] transition-colors"
                >
                  {item}
                </a>
              ),
            )}
            <div className="pt-3 flex flex-col sm:grid sm:grid-cols-2 gap-2">
              <button
                onClick={onStudentLogin ?? onStudent}
                className="w-full min-h-[44px] px-4 py-2.5 border border-[--border] rounded-[10px] text-[13px] font-medium text-[#1B3A6B] flex items-center justify-center gap-2 hover:bg-[#EBF1FA] transition-colors"
              >
                <LogIn size={13} />
                Student Login
              </button>
              <button
                onClick={onAdminLogin}
                className="w-full py-2.5 border border-[--border] rounded-[10px] text-[13px] font-medium text-[#5A6A8A] flex items-center justify-center gap-2"
              >
                <ShieldCheck size={13} />
                Admin Login
              </button>
              <button
                onClick={onCollege}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#1B3A6B] rounded-[10px] text-[13px] font-semibold text-white hover:bg-[#122748] transition-colors"
              >
                Register College
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0A1629]">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[480px] h-[480px] rounded-full bg-[#1B3A6B] opacity-30 blur-[120px]" />
        <div className="absolute bottom-[-60px] right-[10%] w-[360px] h-[360px] rounded-full bg-[#D97706] opacity-20 blur-[100px]" />

        <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-5 md:px-6 lg:px-7 py-14 sm:py-16 md:py-20 lg:py-24 text-center">
          {" "}
          <div className="inline-flex max-w-full items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/15 px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8">
            {" "}
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-[10px] sm:text-[11px] md:text-[12px] font-medium text-white/80">
              {" "}
              AI-Powered Career Platform for Indian Colleges
            </span>
          </div>
          <h1
            className=" text-[36px] sm:text-[44px] md:text-[52px] lg:text-[60px] xl:text-[64px] font-bold  text-white leading-[1.08] mb-5 sm:mb-6  max-w-3xl mx-auto"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            From Campus to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Career — Faster.
            </span>
          </h1>
          <p className=" text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-white/60 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            EduConnect connects colleges and students with AI-powered tools for
            placement, career roadmaps, and skill tracking — all in one
            platform.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12 sm:mb-16">
            <button
              onClick={onCollege}
              className="  w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 bg-white text-[#0F1C3F]
              text-[13px] sm:text-[14px] font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
            >
              <Building2 size={16} /> Register Your College
            </button>
            <button
              onClick={onStudentRegister ?? onStudent}
              className=" w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#D97706] text-white text-[13px] sm:text-[14px] font-semibold rounded-xl hover:bg-[#b45309] transition-colors shadow-lg"
            >
              <GraduationCap size={16} /> Student Sign Up{" "}
              <ArrowRight size={15} />
            </button>
          </div>
          <div className=" flex  flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 -mt-6 sm:-mt-8 mb-8 sm:mb-10">
            <button
              onClick={onStudentLogin ?? onStudent}
              className="flex items-center gap-1.5 text-[11px] sm:text-[12px] md:text-[12.5px] text-white/60 hover:text-white/90 transition-colors"
            >
              <LogIn size={13} /> Already a student? Sign in
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={onAdminLogin}
              className="flex items-center gap-1.5 text-[11px] sm:text-[12px] md:text-[12.5px] text-white/60 hover:text-white/90 transition-colors"
            >
              <ShieldCheck size={13} /> Admin / College Login
            </button>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 rounded-xl py-4 px-3"
              >
                <p
                  className="  text-[22px] sm:text-[24px]  md:text-[28px] font-bold  text-white mb-0.5"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {s.value}
                </p>
                <p className="text-[10px] sm:text-[11px] md:text-[12px] text-white/50 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTAL TABS ── */}
      <section id="portals" className="bg-[#F4F6FB] py-12 sm:py-16 md:py-20">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-5 md:px-6 lg:px-7">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold tracking-[0.15em] sm:tracking-widest text-[#1B3A6B] uppercase">
              Two Portals, One Platform
            </span>
            <h2
              className=" text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#0F1C3F] mt-2 leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Built for Colleges and Students
            </h2>
            <p className=" text-[13px] sm:text-[14px] md:text-[15px] text-[#5A6A8A] mt-3 max-w-lg mx-auto leading-relaxed">
              Whether you&apos;re managing placements for thousands of students
              or navigating your first job hunt — EduConnect has your back.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-6 sm:mb-8 px-2">
            <div className="flex w-full sm:w-auto gap-1 p-1 bg-white border border-[--border] rounded-xl shadow-sm">
              {(["college", "student"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 text-[12px] sm:text-[13px] md:text-[13.5px] font-semibold rounded-[10px] transition-all ${activeTab === t ? "bg-[#1B3A6B] text-white shadow" : "text-[#5A6A8A] hover:text-[#1B3A6B]"}`}
                >
                  {t === "college" ? (
                    <>
                      <Building2 size={14} /> College Portal
                    </>
                  ) : (
                    <>
                      <GraduationCap size={14} /> Student Portal
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {(activeTab === "college" ? collegeFeatures : studentFeatures).map(
              (f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="bg-white border border-[--border] rounded-2xl p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EBF1FA] flex items-center justify-center mb-3 group-hover:bg-[#1B3A6B] transition-colors">
                      <Icon
                        size={17}
                        className="text-[#1B3A6B] group-hover:text-white transition-colors"
                      />
                    </div>
                    <p className="text-[13px] sm:text-[14px] font-semibold text-[#0F1C3F] mb-1">
                      {f.title}
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-[#5A6A8A] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                );
              },
            )}
          </div>

          <div className="flex justify-center px-2">
            {activeTab === "college" ? (
              <button
                onClick={onCollege}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#1B3A6B] text-white text-[13px] sm:text-[14px] font-semibold rounded-xl hover:bg-[#122748] transition-colors shadow-md"
              >
                <Building2 size={16} /> Start College Registration{" "}
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={onStudent}
                className=" w-full sm:w-auto flex items-center justify-center  gap-2 px-5sm:px-7 py-3 sm:py-3.5 bg-[#D97706] text-white text-[13px] sm:text-[14px] font-semibold rounded-xl hover:bg-[#b45309] transition-colors shadow-md"
              >
                <GraduationCap size={16} /> Open Student Portal{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="features" className="bg-white py-12 sm:py-16 md:py-20">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-5 md:px-6 lg:px-7">
          <div className="text-center mb-10 sm:mb-12 md:mb-14">
            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold tracking-[0.15em] sm:tracking-widest text-[#D97706] uppercase">
              Step by Step
            </span>
            <h2
              className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#0F1C3F] mt-2 leading-tight "
              style={{ fontFamily: "var(--font-serif)" }}
            >
              How EduConnect Works
            </h2>
          </div>
          <div className="grid grid-cols-1 px-8 min-[1000px]:grid-cols-2 gap-10 md:gap-12 min-[1000px]:gap-16">
            {/* For Colleges */}
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-white" />
                </div>
                <p className="text-[15px] sm:text-[16px] font-bold text-[#0F1C3F]">
                  For Colleges
                </p>
              </div>
              <div className="relative">
                <div className="absolute left-[15px] sm:left-4 top-4 bottom-4 w-0.5 bg-[--border]" />

                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Register & Verify",
                      desc: "Enter institution details and verify via OTP — takes 10 minutes.",
                    },
                    {
                      step: 2,
                      title: "Configure Campus",
                      desc: "Add departments, batches, faculty roles, and your college branding.",
                    },
                    {
                      step: 3,
                      title: "Onboard Students",
                      desc: "Upload student CSVs or send invite links. Students activate their accounts.",
                    },
                    {
                      step: 4,
                      title: "Launch Placements",
                      desc: "Set up career targets, assessments, and go live — placements start rolling in.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="group flex gap-3 sm:gap-5 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[#F4F6FB] hover:shadow-sm"
                    >
                      {/* Step Number */}
                      <div className="w-8 h-8 min-w-8 rounded-full bg-[#1B3A6B] text-white text-[11px] sm:text-[12px] font-bold flex items-center justify-center shrink-0 z-10 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D97706]">
                        {item.step}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-1">
                        <p className="text-[13px] sm:text-[13.5px] font-semibold text-[#0F1C3F] transition-colors duration-300 group-hover:text-[#1B3A6B]">
                          {item.title}
                        </p>

                        <p className="text-[12px] sm:text-[12.5px] text-[#5A6A8A] mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={onCollege}
                className=" mt-5 sm:mt-6 w-full  sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white text-[13px] sm:text-[13.5px] rounded-xl hover:bg-[#122748] transition-colors font-semibold"
              >
                Register College <ArrowRight size={14} />
              </button>
            </div>

            {/* For Students */}
            <div className="w-full">
              {/* Header */}
              <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D97706] flex items-center justify-center shrink-0">
                  <GraduationCap
                    size={18}
                    className="text-white sm:w-5 sm:h-5"
                  />
                </div>

                <p className="text-[15px] sm:text-[16px] font-bold text-[#0F1C3F]">
                  For Students
                </p>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[15px] sm:left-[16px] top-4 bottom-4 w-0.5 bg-[--border]" />

                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Create Account",
                      desc: "Sign up with email, mobile or social login — verified in under 2 minutes.",
                    },
                    {
                      step: 2,
                      title: "Build Your Profile",
                      desc: "Add education, skills, experience, and get your dynamic CV auto-generated.",
                    },
                    {
                      step: 3,
                      title: "AI Assessment",
                      desc: "Complete the AI career counselling to know exactly where you stand.",
                    },
                    {
                      step: 4,
                      title: "Get Your Roadmap",
                      desc: "Receive a 4-phase AI roadmap, apply for internships, and track progress daily.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="group flex items-start gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[#F8FAFC] hover:shadow-sm hover:translate-x-1"
                    >
                      {/* Step Number */}
                      <div className="w-8 h-8 min-w-8 sm:w-9 sm:h-9 sm:min-w-9 rounded-full bg-[#D97706] text-white text-[11px] sm:text-[12px] font-bold flex items-center justify-center shrink-0 z-10 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1B3A6B]">
                        {item.step}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1 sm:pb-2">
                        <p className="text-[13px] sm:text-[13.5px] md:text-[14px] font-semibold text-[#0F1C3F] leading-snug transition-colors duration-300 group-hover:text-[#D97706]">
                          {item.title}
                        </p>

                        <p className="text-[11.5px] sm:text-[12px] md:text-[12.5px] text-[#5A6A8A] mt-1 leading-relaxed max-w-full">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button */}
              <button
                onClick={onStudent}
                className=" mt-5 sm:mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#D97706] text-white text-[13px] sm:text-[13.5px] rounded-xl hover:bg-[#b45309] active:scale-[0.98] transition-all duration-200 font-semibold "
              >
                Student Portal
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI CALLOUT ── */}
      <section className="bg-gradient-to-br from-[#0A1629] to-[#1B3A6B] py-10 sm:py-12 md:py-16">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 md:px-7 text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-400/15 border border-amber-400/30 px-3 sm:px-4 py-1.5 rounded-full mb-5 sm:mb-6">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-[11px] sm:text-[12px] font-semibold text-amber-300">
              AI-Powered Features
            </span>
          </div>
          <h2
            className="text-[25px] sm:text-[30px] md:text-[36px] font-bold text-white mb-3 sm:mb-4 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Not just a portal. An intelligent career co-pilot.
          </h2>
          <p className="text-[13px] sm:text-[14px] md:text-[16px] text-white/60 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
            Our AI engine analyses your skills, interests, and goals — then
            generates a career-fit score, a phased learning roadmap, and
            role-specific recommendations. Updated in real time as you grow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[
              {
                icon: Brain,
                label: "Career Fit Score",
                value: "Up to 95% accuracy on role match predictions",
              },
              {
                icon: Route,
                label: "AI Roadmap",
                value: "4-phase custom path with projects, certs & milestones",
              },
              {
                icon: Target,
                label: "Company Readiness",
                value: "Scores for specific companies you are targeting",
              },
            ].map((ai) => {
              const Icon = ai.icon;
              return (
                <div
                  key={ai.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 text-left"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-400/15 flex items-center justify-center mb-3">
                    <Icon size={17} className="text-amber-400" />
                  </div>
                  <p className="text-[13px] sm:text-[14px] font-semibold text-white mb-1">
                    {ai.label}
                  </p>
                  <p className="text-[11.5px] sm:text-[12px] md:text-[12.5px] text-white/50 leading-relaxed">
                    {ai.value}
                  </p>
                </div>
              );
            })}
          </div>
          <button
            onClick={onStudent}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-amber-400 text-[#0A1629] text-[13px] sm:text-[14px] font-bold rounded-xl hover:bg-amber-300 transition-colors shadow-lg"
          >
            <Sparkles size={16} /> Try the AI Assessment{" "}
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="testimonials"
        className="bg-white py-12 sm:py-16 md:py-20 overflow-hidden"
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-7">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <span className="text-[11px] font-semibold tracking-widest text-[#1B3A6B] uppercase">
              Success Stories
            </span>
            <h2
              className="text-[23x] font-bold text-[#0F1C3F] mt-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Trusted by students & institutions
            </h2>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-5 animate-testimonials">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className=" min-w-full md:min-w-0 bg-[#F4F6FB] border border-[--border] rounded-2xl p-5 sm:p-6 "
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[13.5px] text-[#0F1C3F] leading-relaxed mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[--border]">
                  <div className="w-9 h-9 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-[11px] font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#0F1C3F]">
                      {t.name}
                    </p>
                    <p className="text-[11.5px] text-[#5A6A8A]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-[#F4F6FB] py-14 sm:py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-7">
          {/* Heading */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-[#D97706] uppercase">
              Pricing
            </span>

            <h2
              className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-[#0F1C3F] mt-2 leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Simple plans, no surprises
            </h2>

            <p className="text-[13px] sm:text-[14px] text-[#5A6A8A] mt-3 max-w-xl mx-auto leading-relaxed">
              Students always get EduConnect for free. Colleges choose a plan.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`border-2 rounded-2xl p-5 sm:p-6 relative flex flex-col h-full ${p.color}`}
              >
                {/* Badge */}
                {p.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full ${
                      p.name === "Growth"
                        ? "bg-[#1B3A6B] text-white"
                        : "bg-[#D97706] text-white"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}

                {/* Plan Name */}
                <p className="text-[14px] sm:text-[15px] font-bold text-[#0F1C3F] mb-1">
                  {p.name}
                </p>

                {/* Price */}
                <p
                  className="text-[26px] sm:text-[28px] font-bold text-[#0F1C3F] mb-0.5"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {p.price}

                  <span className="text-[12px] sm:text-[13px] font-normal text-[#5A6A8A]">
                    {p.price !== "Free" && p.price !== "Custom"
                      ? "/student"
                      : ""}
                  </span>
                </p>

                {/* Students */}
                <p className="text-[12px] sm:text-[12.5px] text-[#5A6A8A] mb-5">
                  {p.students}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6 flex-1">
                  {[
                    "Dashboard & reports",
                    p.name !== "Starter" ? "AI career tools" : null,
                    p.name === "Enterprise" ? "Dedicated support" : null,
                    p.name !== "Starter" ? "Bulk student upload" : null,
                    "Basic placement tools",
                  ]
                    .filter(Boolean)
                    .map((f) => (
                      <div
                        key={f}
                        className="flex items-start gap-2 text-[12px] sm:text-[12.5px] text-[#5A6A8A]"
                      >
                        <Check
                          size={13}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                        <span>{f}</span>
                      </div>
                    ))}
                </div>

                {/* CTA */}
                <button
                  onClick={onCollege}
                  className={`w-full py-2.5 rounded-[10px] text-[13px] sm:text-[13.5px] font-semibold transition-colors ${
                    p.name === "Growth"
                      ? "bg-[#1B3A6B] text-white hover:bg-[#122748]"
                      : p.name === "Enterprise"
                        ? "bg-[#D97706] text-white hover:bg-[#b45309]"
                        : "border-2 border-[--border] text-[#1B3A6B] hover:bg-[#EBF1FA]"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-7">
          {/* Heading */}
          <div className="text-center mb-9 sm:mb-10 lg:mb-12">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-[#1B3A6B] uppercase">
              FAQ
            </span>

            <h2
              className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-[#0F1C3F] mt-2 leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Common questions
            </h2>
          </div>

          {/* FAQ List */}
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-[--border] rounded-xl overflow-hidden"
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left hover:bg-[#F4F6FB] transition-colors"
                  aria-expanded={activeFaq === i}
                >
                  <span className="text-[13px] sm:text-[14px] font-medium text-[#0F1C3F] leading-relaxed">
                    {faq.q}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-[#5A6A8A] shrink-0 transition-transform duration-200 ${
                      activeFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer */}
                {activeFaq === i && (
                  <div className="px-4 sm:px-5 pb-4 pt-3 text-[12.5px] sm:text-[13.5px] text-[#5A6A8A] leading-relaxed border-t border-[--border] bg-[#F8FAFB]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0A1629] py-14 sm:py-16 lg:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-7 text-center">
          {/* Heading */}
          <h2
            className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Ready to transform placements?
          </h2>

          {/* Description */}
          <p className="text-[14px] sm:text-[15px] lg:text-[16px] text-white/60 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            Join 1,200+ colleges and 4.8 lakh students already using EduConnect
            to build better careers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full">
            {/* College Button */}
            <button
              onClick={onCollege}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#0F1C3F] text-[14px] sm:text-[15px] font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
            >
              <Building2 size={17} className="shrink-0" />
              <span>Register College — It&apos;s Free</span>
            </button>

            {/* Student Button */}
            <button
              onClick={onStudent}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-amber-400 text-[#0A1629] text-[14px] sm:text-[15px] font-bold rounded-xl hover:bg-amber-300 transition-colors shadow-lg"
            >
              <GraduationCap size={17} className="shrink-0" />
              <span>I&apos;m a Student</span>
              <ArrowRight size={15} className="shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#06101E] py-8 sm:py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-7">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded-[8px] bg-[#1B3A6B] flex items-center justify-center">
                <GraduationCap size={14} className="text-white" />
              </div>

              <span className="text-[14px] font-bold text-white">
                EduConnect
              </span>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] sm:text-[12.5px] text-white/40">
              {["Privacy Policy", "Terms of Use", "Contact"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-white/70 transition-colors whitespace-nowrap"
                >
                  {l}
                </a>
              ))}

              {onFSD && (
                <button
                  type="button"
                  onClick={onFSD}
                  className="flex items-center gap-1.5 hover:text-white/70 transition-colors whitespace-nowrap"
                >
                  <FileText size={12} />
                  FSD Download
                </button>
              )}
            </div>

            {/* Copyright */}
            <p className="text-[11px] sm:text-[12px] text-white/30 text-center whitespace-nowrap">
              © 2025 EduConnect Technologies Pvt. Ltd.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
