import { useState } from "react";
import {
  GraduationCap, ArrowLeft, Sparkles, Download, RefreshCw,
  CheckCircle2, Copy, Check,
} from "lucide-react";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";

export function ProjectPromptPage({ onBack }: { onBack: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ── docx helpers ─────────────────────────────────────────────────────── */
  const navy        = "1B3A6B";
  const amber       = "D97706";
  const borderColor = "C5D3E8";

  const h1 = (text: string) => new Paragraph({
    text, heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    run: { color: navy, bold: true, size: 36, font: "Calibri" },
  });
  const h2 = (text: string) => new Paragraph({
    text, heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    run: { color: "0F1C3F", bold: true, size: 28, font: "Calibri" },
  });
  const h3 = (text: string) => new Paragraph({
    text, heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    run: { color: "374151", bold: true, size: 24, font: "Calibri" },
  });
  const p = (text: string, bold = false, color = "374151") => new Paragraph({
    children: [new TextRun({ text, bold, color, size: 22, font: "Calibri" })],
    spacing: { after: 100 },
  });
  const bullet = (text: string, indent = 0) => new Paragraph({
    children: [new TextRun({ text, size: 22, color: "374151", font: "Calibri" })],
    bullet: { level: indent },
    spacing: { after: 80 },
  });
  const codeBlock = (text: string) => new Paragraph({
    children: [new TextRun({ text, size: 19, color: "1B3A6B", font: "Courier New" })],
    spacing: { after: 60 },
    indent: { left: 360 },
    shading: { type: ShadingType.CLEAR, fill: "EBF1FA" },
  });
  const gap = (size = 160) => new Paragraph({ text: "", spacing: { after: size } });

  const tbl = (headers: string[], rows: string[][], widths?: number[]) => {
    const total = 9000;
    const eq = Math.floor(total / headers.length);
    const ws = widths ?? headers.map(() => eq);
    return new Table({
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map((h, i) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })], alignment: AlignmentType.LEFT })],
            width: { size: ws[i], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: navy },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
          })),
        }),
        ...rows.map((row, ri) => new TableRow({
          children: row.map((cell, ci) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, color: "374151", font: "Calibri" })], alignment: AlignmentType.LEFT })],
            width: { size: ws[ci], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? "F4F6FB" : "FFFFFF" },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
          })),
        })),
      ],
      width: { size: total, type: WidthType.DXA },
      borders: {
        top:     { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        bottom:  { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        left:    { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        right:   { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        insideH: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        insideV: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      },
    });
  };

  /* ── short prompt for copy ───────────────────────────────────────────── */
  const SHORT_PROMPT = `Build EduConnect — a full React 18 + TypeScript + Tailwind CSS AI-powered college placement and career management platform.

TECH STACK: React 18, TypeScript, Tailwind CSS, Vite, lucide-react (icons), recharts (charts), docx + file-saver (Word export), motion/react (animations). No backend — all state via React useState.

DESIGN SYSTEM:
- Fonts: DM Serif Display (headings), Outfit (body), DM Mono (mono) — import from Google Fonts
- Colors: --background #F4F6FB, --foreground #0F1C3F, --primary #1B3A6B (navy), --accent #D97706 (amber), --card #ffffff, --border rgba(27,58,107,0.12)
- inputCls: "w-full px-3 py-[9px] bg-[#EFF2FA] border-[1.5px] border-transparent rounded-[10px] text-[13.5px] outline-none focus:border-[#1B3A6B] focus:bg-white transition-all"

ROOT APP (App.tsx): Single mode state: "home"|"college"|"student"|"lms"|"fsd"|"student-login"|"admin-login"|"student-register"|"super-admin"|"project-prompt". Route each mode to its screen.

SCREENS TO BUILD:

1. HOME PAGE — Dark hero (#0A1629) with grid overlay + glow blobs. Sticky nav with Student Login, Admin, Register College buttons. Tab section toggling College/Student feature grids. How It Works two-column steps. AI callout section. Testimonials x3. Pricing table (Starter/Growth/Enterprise). FAQ accordion.

2. COLLEGE PORTAL — 9-step wizard with left sidebar (252px) + main card. Steps: Institution Details → Representative → Verification (OTP) → Campus Config (4 sub-tabs: Academic/Departments/Branding/Settings) → Faculty Setup (table + permissions matrix) → Student Onboarding (Bulk/Manual/Invite tabs) → Career Config (4 sub-tabs) → Dashboard Init (5 dashboard toggles) → Subscription & Billing (4 plans + add-ons + payment methods).

3. STUDENT PORTAL — 8-step wizard. Steps: Onboarding (email+social login + OTP verify) → Profile (4 sub-tabs: Personal/Education/Skills/Experience) → Skill Verification (6 methods: MCQ quiz, coding challenge, GitHub analysis, project submission, mentor request, admin approval) → AI Career Counselling (personal + technical assessment sliders → AI results with career-fit %) → Career Goals (role/domain/companies/location/salary) → AI Roadmap (4-phase timeline with milestones, each phase card has clickable enrolled LMS courses) → CV Generator (ATS format, docx + PDF export) → Dashboard (full-bleed: KPIs, charts, CircleGauge rings, skill tags, notifications). StudentPortal receives onLMS?: () => void prop — header "My Courses" button + sidebar LMS card both call onLMS() to switch to mode="lms".

4. STUDENT LOGIN — Two-tab: Email+Password | Mobile OTP. Forgot password, Remember me, Google + LinkedIn social buttons. Link to register.

5. ADMIN LOGIN — Role dropdown (Super Admin/College Admin/Placement Officer/Faculty). Institution selector (context-aware). Password. Then 2FA screen with 6-box authenticator OTP. Routes to Super Admin Panel.

6. STUDENT REGISTRATION — 3-step wizard: Personal Details (name/email/phone/password) → Verify Identity (independent Email OTP + Phone OTP cards, both required) → College & Course (college/dept/year/roll). Done screen with success state.

7. SUPER ADMIN PANEL — Dark sidebar (#0F1F3B, 220px) + dark top bar (#0A1629) + scrollable content. 8 nav sections: Dashboard (KPI cards + AreaChart + donut chart + pending approvals queue + activity feed) | Colleges (searchable table + status filters + drill-down College Detail) | Students (searchable table with readiness score bars) | Analytics (BarChart + LineChart + AreaChart using recharts) | Subscriptions (plan breakdown cards + transactions table) | Audit Logs (type-filtered timestamped log) | Settings (feature flags with live toggles + Danger Zone) | LMS Admin (renders LMSAdminSection from lms-admin.tsx).

8. LMS MODULE (mode="lms") — Student-facing LMS. Left sidebar nav (dashboard/my-courses/catalog/assignments/progress/certificates). Dashboard: streak/stats, activity AreaChart, radar chart, enrolled course cards. Catalog: browse all courses, enroll. Course playback: delegates to CoursePlayer from course-player.tsx via CoursePlayerAdapter (strips "m"/"h" from duration strings before passing to CourseData). CoursePlayerAdapter bridges local Course type → CourseData type.

9. FSD PAGE (mode="fsd") — Download page for Functional Specification Document (.docx). Table of contents + 3 stat KPIs + Download Word Document button. Link to Project Prompt page.

COURSE PLAYER (course-player.tsx — imported by lms.tsx): Udemy-style dark-sidebar player. Exports CoursePlayer, CourseData, Section, Lesson, LessonType. Left sidebar 300px dark #1a1a1a with section accordion + lesson rows. Video player with seekbar, play/pause/±10s, volume, speed selector (0.5x-2x), waveform. Tabs: Overview / Notes (timestamp-linked) / Q&A / Resources. Also renders Article, Quiz (scored 3 MCQs), Assignment (file upload) views by lesson type. Duration fields in CourseData are plain numeric strings (no unit suffix like "m").

LMS ADMIN (lms-admin.tsx — imported by super-admin.tsx): Udemy-style course builder. CourseList: 4 KPI cards + search + status filter tabs + table with edit/delete. CourseForm: 3 tabs — Course Info (title/category/level/instructor/description/skills/thumbnail/emoji+color pickers) | Curriculum (SectionEditor with LessonEditor rows, VideoUploadZone with drag-drop simulation, per-lesson type editors) | Settings (publish status radio + stats panel). LessonEditor: type selector (video/article/quiz/assignment), VideoUploadZone with simulated encoding progress, resources list, free-preview toggle.

SHARED COMPONENTS: SectionTitle, Field, Input (with icon), Select (with icon), InfoBox (blue/amber), Tag (pill chip), OTPInput (6-box auto-focus/backspace/paste), FileDropZone (drag-drop + progress), Toggle, CircleGauge (SVG ring), TagInput (chip input), ProgressBar.

FILE SPLIT (to stay under Babel 80KB each): shared.tsx | college-steps.tsx | student-steps.tsx | skill-verify.tsx | cv-generator.tsx | portals.tsx | home.tsx | fsd.tsx | auth.tsx | super-admin.tsx (imports lms-admin.tsx) | lms.tsx (imports course-player.tsx) | course-player.tsx | lms-admin.tsx | project-prompt.tsx | App.tsx (slim root only).

Recharts: every child element (CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, Radar, PolarGrid, PolarAngleAxis) must have an explicit key prop. All linearGradient id attributes must be namespaced per component to avoid collisions.

Install: pnpm add docx file-saver @types/file-saver`;

  /* ── generate Word doc ─────────────────────────────────────────────── */
  const generateDoc = async () => {
    setGenerating(true);

    const doc = new Document({
      styles: {
        default: { document: { run: { font: "Calibri", size: 22, color: "374151" } } },
        paragraphStyles: [
          { id: "Heading1", name: "Heading 1", basedOn: "Normal", run: { bold: true, size: 36, color: navy, font: "Calibri" }, paragraph: { spacing: { before: 400, after: 160 } } },
          { id: "Heading2", name: "Heading 2", basedOn: "Normal", run: { bold: true, size: 28, color: navy, font: "Calibri" }, paragraph: { spacing: { before: 280, after: 120 } } },
          { id: "Heading3", name: "Heading 3", basedOn: "Normal", run: { bold: true, size: 24, color: "374151", font: "Calibri" }, paragraph: { spacing: { before: 200, after: 100 } } },
        ],
      },
      sections: [{
        properties: {
          page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1.2) } },
        },
        children: [

          /* ══ COVER ══ */
          new Paragraph({
            children: [new TextRun({ text: "EduConnect", bold: true, size: 80, color: navy, font: "Calibri" })],
            alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Project Rebuild Prompt", size: 40, color: amber, font: "Calibri" })],
            alignment: AlignmentType.CENTER, spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Complete specification to regenerate the entire platform from scratch using AI", size: 24, color: "5A6A8A", font: "Calibri" })],
            alignment: AlignmentType.CENTER, spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Version 3.0  ·  July 2026  ·  EduConnect Technologies Pvt. Ltd.", size: 20, color: "9AA5BE", font: "Calibri" })],
            alignment: AlignmentType.CENTER, spacing: { after: 1600 },
          }),
          gap(400),

          /* ══ SECTION 1 — HOW TO USE ══ */
          h1("1. How to Use This Document"),
          p("This document contains everything you need to rebuild EduConnect from scratch. It is structured in three layers:"),
          bullet("Section 2 — Quick-Start Prompt: One paste into any AI coding assistant to scaffold the full project"),
          bullet("Sections 3–7 — Module Specs: Detailed screen-by-screen specifications for every module"),
          bullet("Sections 8–10 — Technical Reference: Design system, component library, file architecture"),
          gap(),
          p("Recommended workflow:", true),
          bullet("1. Paste the Quick-Start Prompt (Section 2) into Figma Make, Claude Code, or v0.dev"),
          bullet("2. Review the generated scaffold against the Module Specs (Sections 3–7)"),
          bullet("3. Reference the Design System (Section 8) to tune colors, fonts, and spacing"),
          bullet("4. Use the Component Library (Section 9) to add shared primitives"),
          bullet("5. Apply the File Architecture (Section 10) to split code under Babel's 500KB limit"),
          gap(200),

          /* ══ SECTION 2 — QUICK-START PROMPT ══ */
          h1("2. Quick-Start Prompt (Copy & Paste)"),
          p("Paste the block below verbatim into your AI assistant. It is self-contained and includes tech stack, design system, all 8 modes, all screens, and the file-split instruction.", false, "5A6A8A"),
          gap(120),
          new Paragraph({
            children: [new TextRun({ text: "─── START OF PROMPT ───", bold: true, size: 20, color: amber, font: "Calibri" })],
            alignment: AlignmentType.CENTER, spacing: { after: 120 },
          }),

          codeBlock("Build EduConnect — a full React 18 + TypeScript + Tailwind CSS AI-powered"),
          codeBlock("college placement and career management platform."),
          gap(80),
          codeBlock("TECH STACK:"),
          codeBlock("  React 18, TypeScript, Tailwind CSS, Vite"),
          codeBlock("  lucide-react (all icons)"),
          codeBlock("  recharts (BarChart, LineChart, AreaChart, PieChart)"),
          codeBlock("  docx + file-saver (Word document export)"),
          codeBlock("  motion/react (animations)"),
          codeBlock("  No backend — all state via React useState"),
          gap(80),
          codeBlock("INSTALL: pnpm add docx file-saver @types/file-saver"),
          gap(80),
          codeBlock("DESIGN SYSTEM:"),
          codeBlock("  Google Fonts: DM Serif Display (headings), Outfit (body), DM Mono (mono)"),
          codeBlock("  --background: #F4F6FB   --foreground: #0F1C3F"),
          codeBlock("  --primary: #1B3A6B (navy)  --accent: #D97706 (amber)"),
          codeBlock("  --card: #ffffff  --border: rgba(27,58,107,0.12)"),
          codeBlock("  inputCls: w-full px-3 py-[9px] bg-[#EFF2FA] border-[1.5px] border-transparent"),
          codeBlock("           rounded-[10px] text-[13.5px] outline-none focus:border-[#1B3A6B]"),
          codeBlock("           focus:bg-white transition-all"),
          gap(80),
          codeBlock("ROOT (App.tsx): mode state = 'home'|'college'|'student'|'lms'|'fsd'|"),
          codeBlock("  'student-login'|'admin-login'|'student-register'|'super-admin'|'project-prompt'"),
          gap(80),
          codeBlock("BUILD THESE 8 SCREENS:"),
          gap(80),
          codeBlock("[1] HOME PAGE (mode='home')"),
          codeBlock("  - Sticky nav: logo + links + Student Login + Admin + Register College buttons"),
          codeBlock("  - Hero: dark #0A1629 bg, 40px CSS grid overlay, two glow blobs,"),
          codeBlock("    DM Serif 64px H1 with amber gradient text, two CTA buttons,"),
          codeBlock("    4 stat cards (1200+ Colleges, 4.8L+ Students, 92% Rate, 3500+ Partners)"),
          codeBlock("  - Features tab: toggle College/Student grid of 6 feature cards each"),
          codeBlock("  - How It Works: 2-col (College 4 steps | Student 4 steps) with connector line"),
          codeBlock("  - AI Callout: dark navy bg, 3 feature cards, amber CTA"),
          codeBlock("  - Testimonials: 3 quote cards with avatar initials"),
          codeBlock("  - Pricing: Starter (Free/200) | Growth (49/1000) | Enterprise (Custom/Unlimited)"),
          codeBlock("  - FAQ: 5-item accordion, ChevronDown rotates 180deg on open"),
          gap(80),
          codeBlock("[2] COLLEGE PORTAL (mode='college') — 9-step wizard"),
          codeBlock("  Layout: sticky header + 252px sidebar + main card with footer nav"),
          codeBlock("  Phases: Registration(1-3) | Onboarding(4-8) | Billing(9)"),
          codeBlock("  Step 1: Institution Details (name, type, NAAC, address, email, phone)"),
          codeBlock("  Step 2: Representative (primary + optional secondary contact, designation)"),
          codeBlock("  Step 3: Verification (Email OTP + Mobile OTP, 6-box inputs, 30s countdown)"),
          codeBlock("  Step 4: Campus Config (4 sub-tabs: Academic/Departments/Branding/Settings)"),
          codeBlock("  Step 5: Faculty Setup (table with roles + permissions matrix 5x6)"),
          codeBlock("  Step 6: Student Onboarding (Bulk CSV/Manual/Invite Link tabs)"),
          codeBlock("  Step 7: Career Config (4 sub-tabs: Target Roles/Roadmaps/Assessments/Eligibility)"),
          codeBlock("  Step 8: Dashboard Init (5 dashboard cards with Activate toggles)"),
          codeBlock("  Step 9: Subscription (4 plans + add-ons + coupon LAUNCH30 + 4 payment methods)"),
          gap(80),
          codeBlock("[3] STUDENT PORTAL (mode='student') — 8-step wizard"),
          codeBlock("  Layout: same sidebar+card pattern, 6 phases"),
          codeBlock("  StudentPortal receives onLMS?: () => void — header 'My Courses' button"),
          codeBlock("  + sidebar LMS card both call onLMS() to switch to mode='lms'"),
          codeBlock("  Step 1: Onboarding (email/social tabs, OTP verify both email+mobile)"),
          codeBlock("  Step 2: Profile (4 sub-tabs: Personal+photo/Education/Skills TagInput/Experience)"),
          codeBlock("  Step 3: Skill Verification (6 methods below)"),
          codeBlock("    - Online Assessment: 3 MCQs one at a time → score 88% → verified"),
          codeBlock("    - Coding Challenge: dark editor textarea → evaluating 1.2s → 82% verified"),
          codeBlock("    - Project Submission: URL + description + file → in_progress"),
          codeBlock("    - GitHub Repository: URL → 2s analysis → commit/star stats → verified"),
          codeBlock("    - Mentor Verification: mentor dropdown + evidence → awaiting"),
          codeBlock("    - Admin Approval: evidence + doc upload → submitted"),
          codeBlock("  Step 4: AI Career Counselling (personal assessment + 6 sliders →"),
          codeBlock("    2200ms AI delay → results: career fits %, strengths, learning path)"),
          codeBlock("  Step 5: Career Goals (role grid single-select, domain chips, companies,"),
          codeBlock("    location, work mode, salary)"),
          codeBlock("  Step 6: AI Roadmap (2500ms generate → 4-phase timeline: Foundation/"),
          codeBlock("    Core Skills/Advanced/Interview Prep with milestones)"),
          codeBlock("    Each phase card shows enrolled LMS course cards with progress bar + play button"),
          codeBlock("    clicking a course calls onLMS?() to open LMS module"),
          codeBlock("  Step 7: CV Generator (ATS single-column format, docx + PDF export,"),
          codeBlock("    only verified skills appear)"),
          codeBlock("  Step 8: Dashboard (full-bleed: KPI cards, CircleGauge SVG rings,"),
          codeBlock("    skill tags, projects, assessments, CV preview, notifications)"),
          gap(80),
          codeBlock("[4] STUDENT LOGIN (mode='student-login')"),
          codeBlock("  Centred card 440px. Two tabs: Email+Password | Mobile OTP."),
          codeBlock("  Forgot password link, Remember me checkbox."),
          codeBlock("  Google + LinkedIn social buttons. Link to register. Back to Home."),
          gap(80),
          codeBlock("[5] ADMIN LOGIN (mode='admin-login')"),
          codeBlock("  Role dropdown (Super Admin/College Admin/Placement Officer/Faculty)."),
          codeBlock("  Institution dropdown (shown for college-level roles)."),
          codeBlock("  Security badge strip. After submit (1500ms): 2FA screen with"),
          codeBlock("  6-box authenticator OTP. Routes to super-admin on success."),
          gap(80),
          codeBlock("[6] STUDENT REGISTER (mode='student-register') — 3-step wizard"),
          codeBlock("  Step 1: Full Name, Email, Mobile, Password, Confirm. Google+LinkedIn."),
          codeBlock("  Step 2: Email OTP card + Phone OTP card (independent, both required)."),
          codeBlock("  Step 3: College dropdown, Department, Year, Roll No, T&C checkbox."),
          codeBlock("  Done: emerald check, 3 confirmation chips, AI Assessment unlocked badge."),
          gap(80),
          codeBlock("[7] SUPER ADMIN PANEL (mode='super-admin')"),
          codeBlock("  Dark top bar #0A1629 + dark sidebar #0F1F3B (220px) + scrollable content."),
          codeBlock("  8 nav sections:"),
          codeBlock("  Dashboard: 4 KPI cards, AreaChart (student growth), donut PieChart"),
          codeBlock("    (plan dist), pending approvals amber banner, activity feed"),
          codeBlock("  Colleges: search + filter tabs, table with Eye/Approve/Suspend actions,"),
          codeBlock("    drill-down College Detail (metrics, contact, subscription cards)"),
          codeBlock("  Students: searchable table with inline readiness score bars, placed badge"),
          codeBlock("  Analytics: 4 Recharts panels (BarChart, LineChart, AreaChart, metrics)"),
          codeBlock("  Subscriptions: plan breakdown cards + transactions table"),
          codeBlock("  Audit Logs: type-filtered log (college/billing/security/system/data)"),
          codeBlock("  Settings: general config, 10 feature flag toggles in 4 groups, Danger Zone"),
          codeBlock("  LMS Admin: renders <LMSAdminSection /> from lms-admin.tsx"),
          gap(80),
          codeBlock("[8] LMS MODULE (mode='lms') — student-facing LMS"),
          codeBlock("  Left sidebar nav: dashboard/my-courses/catalog/assignments/progress/certs"),
          codeBlock("  Dashboard: streak counter, activity AreaChart, radar chart, course cards"),
          codeBlock("  Catalog: browse + enroll with level/category/rating filters"),
          codeBlock("  Course playback: CoursePlayerAdapter bridges local Course type to CourseData:"),
          codeBlock("    strips 'm'/'h' suffix from duration strings, then renders <CoursePlayer />"),
          codeBlock("  Local Course type has duration like '12m'; CourseData needs plain '12'"),
          gap(80),
          codeBlock("[9] FSD PAGE (mode='fsd')"),
          codeBlock("  Download page for Functional Specification Document (.docx)."),
          codeBlock("  Table of contents card + 3 stat KPIs + Download Word Document button."),
          codeBlock("  Generates full docx via docx library and saves via file-saver."),
          gap(80),
          codeBlock("SHARED COMPONENTS (src/components/shared.tsx):"),
          codeBlock("  SectionTitle(num,title,sub), Field(label,hint,required),"),
          codeBlock("  Input(icon,suffix,...props), Select(icon,...props),"),
          codeBlock("  InfoBox(variant:blue|amber), Tag(color:blue|green|amber,onRemove),"),
          codeBlock("  OTPInput(value,onChange) — 6-box auto-focus/backspace/paste,"),
          codeBlock("  FileDropZone(label,file,onFile,onRemove) — drag-drop + progress,"),
          codeBlock("  Toggle(label,defaultChecked),"),
          codeBlock("  CircleGauge(value,size,color,label) — SVG ring,"),
          codeBlock("  TagInput(tags,onChange,placeholder) — chip input,"),
          codeBlock("  ProgressBar(value,color,height)"),
          gap(80),
          codeBlock("FILE SPLIT (all files must stay under 80KB / ~700 lines each):"),
          codeBlock("  src/app/App.tsx              — slim root, mode state + routing only"),
          codeBlock("  src/components/shared.tsx    — STEPS config + all shared components"),
          codeBlock("  src/components/college-steps.tsx  — Step1-Step9"),
          codeBlock("  src/components/student-steps.tsx  — SS1-SS6 + CircleGauge/TagInput"),
          codeBlock("  src/components/skill-verify.tsx   — SSSkillVerify (6 methods)"),
          codeBlock("  src/components/cv-generator.tsx   — SSCVGenerator + docx export"),
          codeBlock("  src/components/portals.tsx        — CollegePortal + StudentPortal (+ onLMS prop)"),
          codeBlock("  src/components/home.tsx           — HomePage"),
          codeBlock("  src/components/auth.tsx           — StudentLogin, AdminLogin, StudentRegister"),
          codeBlock("  src/components/super-admin.tsx    — SuperAdminPanel (8 sections, imports lms-admin)"),
          codeBlock("  src/components/lms-admin.tsx      — LMSAdminSection (Udemy course builder)"),
          codeBlock("  src/components/lms.tsx            — LMSModule (imports course-player)"),
          codeBlock("  src/components/course-player.tsx  — CoursePlayer, CourseData types"),
          codeBlock("  src/components/fsd.tsx            — FSDPage + docx generation"),
          codeBlock("  src/components/project-prompt.tsx — This prompt download page"),
          gap(40),
          codeBlock("Recharts: every child (CartesianGrid/XAxis/YAxis/Tooltip/Area/Bar/Line/"),
          codeBlock("  Radar/PolarGrid/PolarAngleAxis) needs explicit key prop."),
          codeBlock("  Namespace all linearGradient id= per component (e.g. 'sa-sg', 'lms-actGrad')."),

          new Paragraph({
            children: [new TextRun({ text: "─── END OF PROMPT ───", bold: true, size: 20, color: amber, font: "Calibri" })],
            alignment: AlignmentType.CENTER, spacing: { before: 120, after: 200 },
          }),

          /* ══ SECTION 3 — TECH STACK ══ */
          h1("3. Tech Stack & Dependencies"),
          tbl(
            ["Package", "Version", "Purpose"],
            [
              ["react / react-dom",   "18.x",   "UI framework"],
              ["typescript",          "5.x",    "Type safety"],
              ["tailwindcss",         "4.x",    "Utility-first CSS"],
              ["vite",                "5.x",    "Build tool + dev server"],
              ["lucide-react",        "latest", "All icons (70+ used)"],
              ["recharts",            "2.x",    "Charts: Bar, Line, Area, Pie"],
              ["docx",                "9.7.1",  "Word document generation"],
              ["file-saver",          "2.0.5",  "Trigger browser download"],
              ["@types/file-saver",   "2.0.7",  "TypeScript types for file-saver"],
              ["motion",              "latest", "Animations (import from motion/react)"],
              ["@radix-ui/*",         "latest", "Accessible primitives (Dialog etc.)"],
              ["tailwind-merge",      "latest", "Merge Tailwind class strings safely"],
              ["clsx",                "latest", "Conditional className utility"],
            ],
            [3000, 1500, 4500]
          ),
          gap(200),

          /* ══ SECTION 4 — DESIGN SYSTEM ══ */
          h1("4. Design System"),
          h2("4.1 Google Fonts Import (fonts.css)"),
          codeBlock("@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1"),
          codeBlock("  &family=Outfit:wght@300;400;500;600;700"),
          codeBlock("  &family=DM+Mono:wght@400;500&display=swap');"),
          gap(120),
          h2("4.2 CSS Custom Properties (theme.css)"),
          tbl(
            ["Token", "Value", "Usage"],
            [
              ["--background",   "#F4F6FB",               "Page background"],
              ["--foreground",   "#0F1C3F",               "Default text (deep navy)"],
              ["--card",         "#ffffff",               "Card surfaces"],
              ["--primary",      "#1B3A6B",               "Navy — buttons, icons, active states"],
              ["--primary-foreground", "#ffffff",         "Text on navy backgrounds"],
              ["--accent",       "#D97706",               "Amber — highlights and CTAs"],
              ["--border",       "rgba(27,58,107,0.12)",  "Hairline dividers"],
              ["--font-sans",    "Outfit, sans-serif",    "Body font stack"],
              ["--font-serif",   "DM Serif Display, serif","Heading font stack"],
              ["--font-mono",    "DM Mono, monospace",    "Data / label / code font"],
            ]
          ),
          gap(160),
          h2("4.3 Semantic Colour Palette"),
          tbl(
            ["Purpose", "Color", "Hex"],
            [
              ["Interactive / Primary",  "Navy",         "#1B3A6B"],
              ["CTA / Highlight",        "Amber",        "#D97706"],
              ["Success / Verified",     "Emerald",      "#059669"],
              ["Warning / Pending",      "Amber-600",    "#D97706"],
              ["Error / Danger",         "Red-500",      "#EF4444"],
              ["AI Feature Badge",       "Amber-700 bg", "#FFF8EC border #FDE68A"],
              ["Muted Text",             "Slate-500",    "#5A6A8A"],
              ["Placeholder / Disabled", "Slate-400",    "#9AA5BE"],
              ["Input Background",       "Light Blue",   "#EFF2FA"],
              ["Card Hover",             "Very Light",   "#F4F7FC"],
              ["Super Admin Bar",        "Deep Dark",    "#0A1629"],
              ["Super Admin Sidebar",    "Dark Navy",    "#0F1F3B"],
            ],
            [3000, 2000, 4000]
          ),
          gap(200),

          /* ══ SECTION 5 — MODULE SPECS ══ */
          h1("5. Module Specifications"),
          h2("5.1 College Portal — 9 Steps"),
          tbl(
            ["Step", "Title", "Key Content"],
            [
              ["1", "Institution Details",    "Name, Type (dropdown), Affiliation, NAAC Grade, AICTE ID, full address, email, phone, website"],
              ["2", "Representative",         "Primary contact (name/designation/email/mobile/LinkedIn). Toggle for secondary contact."],
              ["3", "Verification",           "Email OTP card + Mobile OTP card. 6-box input, Send OTP, 30s countdown, Resend."],
              ["4", "Campus Configuration",   "4 sub-tabs: Academic (year/sem/calendar/batches) | Departments (add/edit/remove cards) | Branding (logo upload + colour pickers) | Settings (4 toggles)"],
              ["5", "Faculty Setup",          "Faculty table (name/email/role/dept/active toggle) + permissions matrix (5 roles x 6 permissions)"],
              ["6", "Student Onboarding",     "3 tabs: Bulk CSV upload with column mapping | Manual form with add/remove entries | Invite Link with copy + QR + expiry"],
              ["7", "Career Configuration",   "4 sub-tabs: Target Roles (TagInput chips + package range) | Roadmaps (per-dept AI toggle) | Assessments (4 test toggles) | Eligibility (CGPA + backlog + attendance sliders)"],
              ["8", "Dashboard Init",         "5 dashboard cards (Institution/Placement/Faculty/Student/Career). Each: Activate toggle + widget checklist + Preview button."],
              ["9", "Subscription & Billing", "4 plans (Starter/Growth/Professional/Enterprise) + 4 add-ons + coupon field (LAUNCH30=30%) + 4 payment methods (Card/NetBanking/UPI/Bank Transfer) + order summary with GST"],
            ],
            [600, 2400, 6000]
          ),
          gap(200),

          h2("5.2 Student Portal — 8 Steps"),
          tbl(
            ["Step", "Title", "Key Content"],
            [
              ["1", "Onboarding",           "Email/Social tab toggle. Google + LinkedIn SVG buttons. Email OTP card + Mobile OTP card. Both verified → success screen."],
              ["2", "Profile",              "4 sub-tabs: Personal (circular photo + grid fields) | Education (college/course/CGPA) | Skills (4 TagInputs + cert cards) | Experience (type/title/org/duration/desc cards)"],
              ["3", "Skill Verification",   "220px skill list + right panel. 6 verification methods. Summary bar (Verified/In-Progress/Not Started) filters list. Only verified skills appear on CV."],
              ["4", "AI Career Counselling","Personal: interest chips (max 3), strengths/weaknesses TagInputs, learning style grid, work env grid. Technical: 6 range sliders. Results tab (2200ms delay): top 3 career fits with %."],
              ["5", "Career Goals",         "10 role cards (single-select), domain multi-select chips, target companies (multi + custom add), location fields, work mode pills, salary toggle+range."],
              ["6", "AI Roadmap",           "Generate button → 2500ms spinner → 4-phase vertical timeline. Each phase: circle + content card with skills/project/milestone. Bottom: certs list + internship card."],
              ["7", "CV Generator",         "ATS single-column format. Auto-populated from profile. Edit fields inline. docx export via Packer.toBlob() + saveAs(). PDF via window.print(). Only verified skills shown."],
              ["8", "Dashboard",            "Full-bleed (no padding). Banner (dark navy). Row 1: 4 KPI cards. Row 2: Career insights. Row 3: CircleGauge rings. Row 4: skill tags. Row 5: projects + assessments. Row 6: CV + AI recs. Row 7: notifications (click to dismiss)."],
            ],
            [600, 2400, 6000]
          ),
          gap(200),

          h2("5.3 LMS Module (mode='lms')"),
          tbl(
            ["Section", "Key Content"],
            [
              ["Dashboard",   "Streak/stats bar, enrolled course cards with progress, activity AreaChart, radar chart (skills). Quick-access links."],
              ["My Courses",  "Cards for enrolled courses. Progress bar per card. 'Continue' opens CoursePlayer via CoursePlayerAdapter."],
              ["Catalog",     "All courses: search, level/category filter, rating. Enroll button marks enrolledByUser=true."],
              ["Assignments", "List of pending/completed assignments from enrolled courses."],
              ["Progress",    "Phase progress bars, CircleGauge rings, certification status."],
              ["Certificates","List of earned certs, mock download button."],
            ],
            [2000, 7000]
          ),
          gap(120),
          p("CoursePlayerAdapter (inside lms.tsx) converts local Course → CourseData:"),
          codeBlock("sections: course.sections.map(s => ({"),
          codeBlock("  ...s, lessons: s.lessons.map(l => ({"),
          codeBlock("    ...l, duration: l.duration.replace('m','').replace('h','')"),
          codeBlock("  }))"),
          codeBlock("}))"),
          gap(200),

          h2("5.4 Course Player (course-player.tsx)"),
          tbl(
            ["Feature", "Details"],
            [
              ["Layout",      "Dark left sidebar 300px (#1a1a1a) + flex-1 content area. Collapsible sidebar toggle."],
              ["Sidebar",     "Section accordion: section titles expand to show lesson rows. Rows: type icon + title + duration + completion tick."],
              ["Video",       "Seekbar with buffered indicator, play/pause, ±10s skip, volume popup, speed selector (0.5/0.75/1/1.25/1.5/2x). Waveform animation when playing."],
              ["Lesson Types","Video (player), Article (text content), Quiz (3 MCQ questions, scored), Assignment (file upload with progress)."],
              ["Tabs",        "Overview (instructor card, description, skills checklist) | Notes (timestamp-linked, add/delete) | Q&A (questions + replies, thumbsUp, ask new) | Resources (downloadable files)."],
              ["Navigation",  "Top bar: prev/next lesson, progress fraction. Completion tracked per lesson."],
            ],
            [2000, 7000]
          ),
          gap(200),

          h2("5.5 LMS Admin (lms-admin.tsx)"),
          tbl(
            ["Feature", "Details"],
            [
              ["CourseList",      "4 KPI cards (Total/Published/Students/Rating). Search + status filter tabs. Table with edit/delete + confirmation modal."],
              ["CourseForm tabs", "Course Info | Curriculum | Settings — full-width tabbed form."],
              ["Course Info",     "Title, Category, Level, Instructor, Description, Skills (live chip preview), Welcome Message, Thumbnail upload, Emoji picker, Color picker + live card preview."],
              ["Curriculum",      "Stats bar (sections/lessons/videos/duration). SectionEditor rows with LessonEditor inside. Add Section + Add Lecture buttons."],
              ["SectionEditor",   "Dark #F0F4FA header, numbered badge, inline title edit, video/duration stats, collapse toggle."],
              ["LessonEditor",    "Numbered badge (S.L), type badge, inline title + duration input, expanded editor with type selector + VideoUploadZone + description + resources + free-preview toggle."],
              ["VideoUploadZone", "Drag-and-drop zone, click to browse, simulated upload progress bar, dark video thumbnail preview after upload, remove button."],
              ["Settings tab",    "Publish status radio (draft/published/archived with descriptions). Stats panel for existing courses."],
            ],
            [2500, 6500]
          ),
          gap(200),

          h2("5.6 Authentication Screens"),
          tbl(
            ["Screen", "Key Logic", "Routes To"],
            [
              ["Student Login",    "Tab toggle: Email+Pwd | Mobile OTP. Forgot pwd link. Remember me. Social login row. 'Create Account' link.", "Student Portal"],
              ["Admin Login",      "Phase 1: Role + optional institution + email + password. Phase 2 (auto): 6-box authenticator OTP. Security badge strip.", "Super Admin Panel"],
              ["Student Register", "Step 1: name/email/phone/password. Step 2: Email OTP + Phone OTP cards (independent, both required). Step 3: college/dept/year/terms. Done: success state.", "Student Portal"],
            ],
            [2500, 4500, 2000]
          ),
          gap(200),

          h2("5.7 Super Admin Panel — 8 Sections"),
          tbl(
            ["Section", "Key Features"],
            [
              ["Dashboard",       "4 KPI cards (Colleges/Students/Placement Rate/MRR). AreaChart student growth. Donut PieChart plan distribution. Pending approval amber banner with Approve/Reject. Activity feed."],
              ["Colleges",        "Search + status filter tabs. Table with 8 sample rows. Eye action opens College Detail view (metrics grid + contact card + subscription card with plan change)."],
              ["Students",        "Searchable table with avatar initials, college, dept, year, readiness score (inline progress bar), status badge, placed indicator."],
              ["Analytics",       "BarChart (college onboarding), LineChart (placement rate trend, amber), AreaChart (revenue, amber gradient), Static metrics panel (6 KPIs)."],
              ["Subscriptions",   "3 KPI cards (MRR/ARR/Paying). 3 plan breakdown cards with revenue contribution. Transactions table (ID/college/plan/amount/date/status)."],
              ["Audit Logs",      "Type filter tabs: All/College/Billing/Security/System/Data. Each row: coloured icon, actor->target, split timestamp, type badge. Export button."],
              ["Settings",        "General config (4 fields + edit icon). Feature flags in 4 groups: AI Features/Platform/Notifications/System (10 toggles total). Danger Zone (3 execute actions)."],
              ["LMS Admin",       "Renders <LMSAdminSection /> from lms-admin.tsx — full Udemy-style course builder with CourseList + CourseForm (3 tabs)."],
            ],
            [2000, 7000]
          ),
          gap(200),

          /* ══ SECTION 6 — COMPONENT LIBRARY ══ */
          h1("6. Shared Component Library"),
          tbl(
            ["Component", "Props", "Behaviour"],
            [
              ["SectionTitle",  "num: string, title: string, sub?: string",                    "Monospace num badge + serif title + muted sub text. Bottom border divider."],
              ["Field",         "label, required?, hint?, children",                            "Label with red asterisk for required. Children slot. Optional hint with Info icon."],
              ["Input",         "icon?: ElementType, suffix?: string, ...InputHTMLAttributes", "Left icon, right suffix block, uses inputCls, spreads all HTML input attributes."],
              ["Select",        "icon?: ElementType, ...SelectHTMLAttributes",                 "Left icon, ChevronDown right. Spreads all HTML select attributes."],
              ["InfoBox",       "variant: 'blue'|'amber', title?, children",                   "Rounded info panel with Info icon. Blue = #EBF1FA, Amber = amber-50 with border."],
              ["Tag",           "color: 'blue'|'green'|'amber', onRemove?",                    "Pill chip. Optional X button calls onRemove. Colour-coded background."],
              ["OTPInput",      "value: string, onChange: (v: string) => void",                "6 individual inputs. Auto-advance on digit. Backspace moves left. Paste fills all 6."],
              ["FileDropZone",  "label, file?, onFile, onRemove",                              "Drag-drop area + click. Simulates upload progress (1200ms). Shows file name + remove."],
              ["Toggle",        "label: string, defaultChecked?: boolean",                     "Pill toggle with smooth translate animation. Navy when on, slate when off."],
              ["CircleGauge",   "value: 0-100, size: number, color: string, label: string",   "SVG ring with stroke-dashoffset animation. Value % in DM Serif centre text."],
              ["TagInput",      "tags: string[], onChange, placeholder",                       "Flexible-wrap chip container. Enter or comma adds chip. X removes. No duplicates."],
              ["ProgressBar",   "value: 0-100, color?: string, height?: number",               "Single-line bar with CSS width transition. Default navy fill."],
            ],
            [2000, 3500, 3500]
          ),
          gap(200),

          /* ══ SECTION 7 — WIZARD PATTERNS ══ */
          h1("7. Wizard Layout Patterns"),
          h2("7.1 Portal Wizard (College & Student)"),
          p("Both portals share the same layout shell:"),
          bullet("Sticky header: logo + Back to Home + portal switcher pills + step counter"),
          bullet("Two-column body: 252px sticky sidebar + flex-1 main card"),
          bullet("Sidebar: dark navy header with progress bar, then phase groups with step buttons"),
          bullet("Step buttons: done = navy bg + Check icon + clickable. Active = light blue bg + ChevronRight. Future = 40% opacity + cursor-default"),
          bullet("Main card: header (step icon + title + badge) → content area → footer (Back + dot indicators + Continue/Launch)"),
          bullet("Dot indicators: coloured per phase, active dot expands to 20px wide"),
          gap(120),
          h2("7.2 Auth Wizard (Student Registration)"),
          p("Centred card (max-w-[440px]) with:"),
          bullet("3-circle stepper with connector lines. Done = emerald fill + Check, Active = navy, Future = gray"),
          bullet("Back button shown from step 2 onwards"),
          bullet("Full-width CTA always present. Label changes per step"),
          bullet("Done state: success screen, no navigation buttons, just Go to Portal CTA"),
          gap(200),

          /* ══ SECTION 8 — AI SIMULATION ══ */
          h1("8. AI Feature Simulation"),
          tbl(
            ["Feature", "Trigger", "Duration", "Loading State", "Result"],
            [
              ["Career Analysis",    "Analyze My Profile button",  "2200ms", "Brain pulse + animated progress bar",           "Tab switches to AI Results: career fit % cards, strengths chips, learning path"],
              ["Roadmap Generator",  "Generate My Roadmap button", "2500ms", "Spinning border + 4 status lines animate in",  "4-phase vertical timeline appears with milestones"],
              ["OTP Send",           "Send OTP button",            "1200ms", "RefreshCw spin in button",                     "otpSent = true, 6-box input appears"],
              ["Admin 2FA check",    "Continue to 2FA button",     "1500ms", "RefreshCw spin",                               "twoFA = true, Phase 2 OTP screen shows"],
              ["GitHub analysis",    "Analyze button",             "2000ms", "RefreshCw spin",                               "Commit/star/language stats + verification score"],
              ["Skill MCQ submit",   "Submit button",              "800ms",  "Loading state",                                "Score 88%, skill status = verified"],
              ["Code eval submit",   "Submit Solution button",     "1200ms", "Evaluating… spinner",                          "Score 82%, skill status = verified"],
            ],
            [2000, 1800, 1200, 2500, 1500]
          ),
          gap(200),

          /* ══ SECTION 9 — STATE MAP ══ */
          h1("9. Complete State Map"),
          tbl(
            ["File / Component",          "useState Variables"],
            [
              ["App.tsx",                  "mode: 'home'|'college'|'student'|'lms'|'fsd'|'student-login'|'admin-login'|'student-register'|'super-admin'|'project-prompt'"],
              ["CollegePortal",             "step: 1-9"],
              ["StudentPortal",             "step: 1-8"],
              ["StudentLogin",              "tab, email, pwd, phone, otp, otpSent, loading, error, remember"],
              ["AdminLogin",                "email, pwd, role, twoFA, otp, loading, error"],
              ["StudentRegister",           "step:'details'|'verify'|'college'|'done', name, email, phone, pwd, confirmPwd, emailOtp, phoneOtp, emailVerified, phoneVerified, college, dept, year, rollNo, terms, loading, error"],
              ["SuperAdminPanel",           "section: AdminSection (dashboard|colleges|students|analytics|subscriptions|audit|settings|lms-admin), notifOpen"],
              ["LMSModule",                "section: LMSSection, activeCourse: Course|null"],
              ["CoursePlayer",             "currentLessonId, sidebarOpen, playing, progress, volume, muted, speed, tab, notes[], qaQuestions[]"],
              ["LMSAdminSection",          "view: 'list'|'form', courses: AdminCourse[], editing: AdminCourse|undefined"],
              ["LMSAdminCourseForm",       "form: AdminCourse, tab: 'info'|'curriculum'|'settings'"],
              ["LessonEditor",             "open: boolean"],
              ["VideoUploadZone",          "pct: number|null, dragging: boolean"],
              ["CollegesSection",           "search, filter:'all'|CollegeStatus, selected:College|null"],
              ["StudentsSection",           "search"],
              ["AuditSection",              "typeFilter"],
              ["SettingsSection",           "flags: Record<string,boolean> (10 flags)"],
              ["SS1 Onboarding",            "tab, email, phone, pwd, confirmPwd, college, emailOtp, phoneOtp, emailVerified, phoneVerified, otpSent"],
              ["SS2 Profile",               "tab, photo, personal{}, education{}, skills{techSkills,langs,tools,soft}, certs[], experiences[]"],
              ["SSSkillVerify",             "skills[], selectedId, filter, quizStep, quizAns, quizScore, ghUrl, ghResult, mentorId, mentorSent, adminEvidence, adminSent, codeText, codeSubmitted, projectUrl, projectDesc, projectFile"],
              ["SS3 AI Assessment",         "tab, interests[], goals, strengths[], weaknesses[], learningStyle, workEnv, personality, scores{6 sliders}, analyzing, analyzed"],
              ["SS4 Career Goals",          "role, domains[], companies[], city, state, country, workMode, negotiable, minLPA, maxLPA"],
              ["SS5 AI Roadmap",            "generating, generated"],
              ["SSCVGenerator",             "cvData{name,email,phone,address,summary,education[],experience[],skills[],certs[],projects[]}, exporting"],
              ["SS6 Dashboard",             "activeNotifs[], cvTab"],
            ],
            [3000, 6000]
          ),
          gap(200),

          /* ══ SECTION 10 — FILE ARCHITECTURE ══ */
          h1("10. File Architecture"),
          p("CRITICAL: Babel deoptimises files over 500KB. Keep every file under 80KB by splitting as below.", true, navy),
          gap(80),
          tbl(
            ["File Path", "Max Size", "Exports"],
            [
              ["src/app/App.tsx",                  "~1KB",  "default App — mode state + 8 routing branches only"],
              ["src/styles/fonts.css",             "~1KB",  "Google Fonts @import"],
              ["src/styles/theme.css",             "~2KB",  "@theme inline CSS custom property tokens"],
              ["src/components/shared.tsx",        "12KB",  "STEPS, inputCls, SectionTitle, Field, Input, Select, InfoBox, Tag, OTPInput, FileDropZone, Toggle"],
              ["src/components/college-steps.tsx", "76KB",  "Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9"],
              ["src/components/student-steps.tsx", "80KB",  "CircleGauge, TagInput, ProgressBar, SS1, SS2, SS3, SS4, SS5, SS6"],
              ["src/components/skill-verify.tsx",  "32KB",  "SSSkillVerify (default export)"],
              ["src/components/cv-generator.tsx",  "40KB",  "SSCVGenerator (default export) — uses docx"],
              ["src/components/portals.tsx",       "20KB",  "StudentPortal, CollegePortal, STUDENT_STEPS, STUDENT_PHASES"],
              ["src/components/home.tsx",          "32KB",  "HomePage"],
              ["src/components/auth.tsx",          "36KB",  "StudentLogin, AdminLogin, StudentRegister"],
              ["src/components/super-admin.tsx",   "64KB",  "SuperAdminPanel (8 sections) — uses recharts, imports lms-admin.tsx"],
              ["src/components/lms-admin.tsx",     "80KB",  "LMSAdminSection — CourseList, CourseForm (3 tabs), SectionEditor, LessonEditor, VideoUploadZone"],
              ["src/components/lms.tsx",           "60KB",  "LMSModule + CoursePlayerAdapter — imports course-player.tsx"],
              ["src/components/course-player.tsx", "50KB",  "CoursePlayer, CourseData, Section, Lesson, LessonType — standalone Udemy-style player"],
              ["src/components/fsd.tsx",           "56KB",  "FSDPage — uses docx + file-saver"],
              ["src/components/project-prompt.tsx","60KB",  "ProjectPromptPage — this document + uses docx + file-saver"],
            ],
            [3500, 1000, 4500]
          ),
          gap(200),
          h2("10.1 Import Map"),
          p("Imports flow in one direction only — no circular dependencies:"),
          codeBlock("App.tsx"),
          codeBlock("  imports: portals.tsx, home.tsx, lms.tsx, fsd.tsx, auth.tsx,"),
          codeBlock("           super-admin.tsx, project-prompt.tsx"),
          codeBlock("portals.tsx"),
          codeBlock("  imports: shared.tsx, college-steps.tsx, student-steps.tsx,"),
          codeBlock("           skill-verify.tsx, cv-generator.tsx"),
          codeBlock("college-steps.tsx    imports: shared.tsx"),
          codeBlock("student-steps.tsx    imports: shared.tsx"),
          codeBlock("skill-verify.tsx     imports: shared.tsx, student-steps.tsx (TagInput, ProgressBar)"),
          codeBlock("cv-generator.tsx     imports: shared.tsx, student-steps.tsx (TagInput, CircleGauge)"),
          codeBlock("home.tsx             imports: (self-contained)"),
          codeBlock("auth.tsx             imports: shared.tsx (inputCls only)"),
          codeBlock("super-admin.tsx      imports: lms-admin.tsx, recharts"),
          codeBlock("lms-admin.tsx        imports: (self-contained)"),
          codeBlock("lms.tsx              imports: course-player.tsx"),
          codeBlock("course-player.tsx    imports: (self-contained)"),
          codeBlock("fsd.tsx              imports: (self-contained, docx + file-saver)"),
          codeBlock("project-prompt.tsx   imports: (self-contained, docx + file-saver)"),
          gap(400),

          /* ══ FOOTER ══ */
          new Paragraph({
            children: [new TextRun({ text: "EduConnect Project Rebuild Prompt  |  Version 3.0  |  July 2026  |  EduConnect Technologies Pvt. Ltd.", size: 18, color: "9AA5BE", italics: true, font: "Calibri" })],
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: borderColor } },
            spacing: { before: 400 },
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "EduConnect-Project-Rebuild-Prompt.docx");
    setGenerating(false);
    setDone(true);
  };

  /* ── copy short prompt ──────────────────────────────────────────────── */
  const copyPrompt = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = SHORT_PROMPT;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: try modern API if execCommand unavailable
      navigator.clipboard?.writeText(SHORT_PROMPT).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const toc = [
    { n: "1",  t: "How to Use This Document"        },
    { n: "2",  t: "Quick-Start Prompt (Copy & Paste)" },
    { n: "3",  t: "Tech Stack & Dependencies"       },
    { n: "4",  t: "Design System"                   },
    { n: "5",  t: "Module Specifications (incl. LMS)"  },
    { n: "6",  t: "Shared Component Library"        },
    { n: "7",  t: "Wizard Layout Patterns"          },
    { n: "8",  t: "AI Feature Simulation"           },
    { n: "9",  t: "Complete State Map"              },
    { n: "10", t: "File Architecture & Import Map"  },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FB]" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header className="bg-[#0A1629] sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-[920px] mx-auto px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center">
              <GraduationCap size={17} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-[14px]">EduConnect</span>
              <span className="ml-2 text-[10.5px] text-white/40 font-medium tracking-wider uppercase">Project Prompt</span>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12.5px] text-white/50 hover:text-white/80 transition-colors">
            <ArrowLeft size={13} /> Back
          </button>
        </div>
      </header>

      <div className="max-w-[920px] mx-auto px-7 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#0A1629] mb-5 shadow-lg">
            <Sparkles size={28} className="text-amber-400" />
          </div>
          <h1 className="text-[38px] font-bold text-[#0F1C3F] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Project Rebuild Prompt
          </h1>
          <p className="text-[16px] text-[#5A6A8A] mb-1">Everything needed to regenerate EduConnect from scratch</p>
          <p className="text-[13px] text-[#9AA5BE]" style={{ fontFamily: "var(--font-mono)" }}>
            Version 3.0 · 10 Sections · 9 Screens · 14 Files
          </p>
        </div>

        {/* Quick copy card */}
        <div className="bg-gradient-to-r from-[#0A1629] to-[#1B3A6B] rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <p className="text-[13px] font-bold text-white">Quick-Start Prompt</p>
              </div>
              <p className="text-[12.5px] text-white/60 max-w-lg leading-relaxed">
                One-click copy of the complete rebuild prompt. Paste directly into Figma Make, Claude Code, or any AI coding assistant.
              </p>
            </div>
            <button onClick={copyPrompt}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold shrink-0 transition-all
                ${copied ? "bg-emerald-500 text-white" : "bg-white text-[#1B3A6B] hover:bg-slate-100"}`}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Screens",          value: "9"  },
            { label: "Shared Components",value: "12" },
            { label: "Wizard Steps",     value: "20" },
            { label: "Source Files",     value: "14" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[--border] rounded-xl p-4 text-center shadow-sm">
              <p className="text-[28px] font-bold text-[#1B3A6B]" style={{ fontFamily: "var(--font-serif)" }}>{s.value}</p>
              <p className="text-[12px] text-[#5A6A8A] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table of contents */}
        <div className="bg-white border border-[--border] rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-[12px] font-semibold text-[#9AA5BE] uppercase tracking-widest mb-4">Document Contents</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0">
            {toc.map(s => (
              <div key={s.n} className="flex items-center gap-3 py-2 border-b border-[--border] last:border-0">
                <span className="w-6 h-6 rounded-lg bg-[#EBF1FA] text-[#1B3A6B] text-[11px] font-bold flex items-center justify-center shrink-0">{s.n}</span>
                <span className="text-[13px] text-[#0F1C3F] font-medium">{s.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What's inside */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { title: "Quick-Start Prompt",  desc: "Full project prompt in a single copyable code block — paste into any AI to begin.", color: "#1B3A6B" },
            { title: "Module Specs",         desc: "Screen-by-screen specification for all 8 screens, every field and interaction.", color: "#D97706" },
            { title: "Technical Reference",  desc: "Design tokens, component props, state map, file architecture, import map.", color: "#059669" },
          ].map(c => (
            <div key={c.title} className="bg-white border border-[--border] rounded-xl p-4 shadow-sm">
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: c.color }} />
              <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-1">{c.title}</p>
              <p className="text-[12.5px] text-[#5A6A8A] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Download */}
        <div className="bg-white border-2 border-[--border] rounded-2xl p-8 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[13px] text-[#5A6A8A]">
              Microsoft Word (.docx) · Calibri font · Monospace code blocks · Formatted tables
            </p>
          </div>
          <p className="text-[12px] text-[#9AA5BE] mb-7">
            Full prompt + 10 reference sections — everything needed to rebuild EduConnect from zero
          </p>

          {done ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <p className="text-[15px] font-semibold text-emerald-700">Download Complete!</p>
              <p className="text-[13px] text-[#5A6A8A]">EduConnect-Project-Rebuild-Prompt.docx saved to your Downloads folder.</p>
              <button onClick={() => { setDone(false); setGenerating(false); }}
                className="mt-2 text-[13px] text-[#1B3A6B] hover:underline flex items-center gap-1">
                <RefreshCw size={13} /> Download Again
              </button>
            </div>
          ) : (
            <button onClick={generateDoc} disabled={generating}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#1B3A6B] text-white text-[15px] font-semibold rounded-xl hover:bg-[#122748] disabled:opacity-60 transition-all shadow-md hover:shadow-lg">
              {generating
                ? <><RefreshCw size={17} className="animate-spin" /> Generating Document…</>
                : <><Download size={17} /> Download Rebuild Prompt (.docx)</>}
            </button>
          )}
        </div>

        <p className="text-center text-[12px] text-[#9AA5BE] mt-5">
          Open with Microsoft Word, Google Docs, or LibreOffice Writer
        </p>
      </div>
    </div>
  );
}
