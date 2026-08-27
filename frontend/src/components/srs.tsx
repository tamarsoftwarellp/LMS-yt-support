import { useState } from "react";
import {
  GraduationCap, ArrowLeft, FileText, Download, RefreshCw,
  CheckCircle2, BookOpen, Shield, Zap, Users, Database,
  Globe, Server, Cpu, Lock,
} from "lucide-react";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";

export function SRSPage({ onBack }: { onBack: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  /* ── docx helpers ── */
  const navy = "1B3A6B";
  const amber = "D97706";
  const borderColor = "C5D3E8";

  const h1 = (t: string) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 160 }, run: { color: navy, bold: true, size: 36, font: "Calibri" } });
  const h2 = (t: string) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, run: { color: "0F1C3F", bold: true, size: 28, font: "Calibri" } });
  const h3 = (t: string) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, run: { color: "374151", bold: true, size: 24, font: "Calibri" } });
  const p = (text: string, bold = false, color = "374151") => new Paragraph({ children: [new TextRun({ text, bold, color, size: 22, font: "Calibri" })], spacing: { after: 100 } });
  const bullet = (text: string) => new Paragraph({ children: [new TextRun({ text, size: 22, color: "374151", font: "Calibri" })], bullet: { level: 0 }, spacing: { after: 80 } });
  const sub = (text: string) => new Paragraph({ children: [new TextRun({ text, size: 22, color: "374151", font: "Calibri" })], bullet: { level: 1 }, spacing: { after: 60 } });
  const gap = (n = 160) => new Paragraph({ text: "", spacing: { after: n } });

  const tbl = (headers: string[], rows: string[][], ws?: number[]) => {
    const total = 9000;
    const eq = Math.floor(total / headers.length);
    const widths = ws ?? headers.map(() => eq);
    return new Table({
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map((h, i) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })], alignment: AlignmentType.LEFT })],
            width: { size: widths[i], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: navy },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
          })),
        }),
        ...rows.map((row, ri) => new TableRow({
          children: row.map((cell, ci) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, color: "374151", font: "Calibri" })], alignment: AlignmentType.LEFT })],
            width: { size: widths[ci], type: WidthType.DXA },
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
          new Paragraph({ children: [new TextRun({ text: "EduConnect", bold: true, size: 80, color: navy, font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "Software Requirements Specification", size: 40, color: amber, font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "AI-Powered College Placement & Career Management Platform", size: 24, color: "5A6A8A", font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: "Version 1.0  ·  July 2026  ·  EduConnect Technologies Pvt. Ltd.", size: 20, color: "9AA5BE", font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
          tbl(
            ["Document Info", "Details"],
            [
              ["Document Title",    "Software Requirements Specification (SRS)"],
              ["Project Name",      "EduConnect — AI-Powered College Placement Platform"],
              ["Version",           "1.0"],
              ["Prepared By",       "EduConnect Technologies Pvt. Ltd."],
              ["Date",              "July 2026"],
              ["Status",            "Approved"],
              ["Classification",    "Internal / Confidential"],
            ],
            [3000, 6000]
          ),
          gap(400),

          /* ══ 1. INTRODUCTION ══ */
          h1("1. Introduction"),

          h2("1.1 Purpose"),
          p("This Software Requirements Specification (SRS) defines the functional and non-functional requirements for EduConnect, an AI-powered college placement and career management platform. This document is intended for developers, project managers, QA engineers, stakeholders, and system architects involved in the design, development, and deployment of the platform."),
          gap(),

          h2("1.2 Scope"),
          p("EduConnect is a full-stack web platform that bridges the gap between Indian colleges and students through automated placement management, AI-driven career counselling, skill verification, LMS course delivery, and real-time analytics. The system serves three primary user roles:"),
          bullet("Super Admin — platform-level management, college approvals, analytics, LMS course creation"),
          bullet("College Admin / TPO — institution setup, student onboarding, placement configuration, dashboards"),
          bullet("Student — profile creation, skill verification, AI roadmap, CV generation, LMS learning"),
          gap(),

          h2("1.3 Definitions & Abbreviations"),
          tbl(
            ["Term", "Definition"],
            [
              ["SRS",     "Software Requirements Specification"],
              ["TPO",     "Training & Placement Officer"],
              ["LMS",     "Learning Management System"],
              ["AI",      "Artificial Intelligence"],
              ["OTP",     "One-Time Password for 2-factor verification"],
              ["ATS",     "Applicant Tracking System — used for CV format optimisation"],
              ["NAAC",    "National Assessment and Accreditation Council"],
              ["AICTE",   "All India Council for Technical Education"],
              ["JWT",     "JSON Web Token — used for authentication"],
              ["API",     "Application Programming Interface"],
              ["CRUD",    "Create, Read, Update, Delete — basic data operations"],
              ["2FA",     "Two-Factor Authentication"],
              ["KPI",     "Key Performance Indicator"],
              ["CDN",     "Content Delivery Network"],
            ],
            [2500, 6500]
          ),
          gap(),

          h2("1.4 References"),
          bullet("IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications"),
          bullet("EduConnect Functional Specification Document v3.0 (July 2026)"),
          bullet("EduConnect Project Rebuild Prompt v3.0 (July 2026)"),
          bullet("OWASP Top 10 Security Guidelines"),
          gap(200),

          /* ══ 2. OVERALL DESCRIPTION ══ */
          h1("2. Overall Description"),

          h2("2.1 Product Perspective"),
          p("EduConnect is a standalone SPA (Single Page Application) built with Angular (frontend) and Node.js + Express (backend) with MySQL as the primary data store. The system operates as a cloud-hosted, multi-tenant platform where each college is an isolated tenant with its own data boundary."),
          gap(80),
          tbl(
            ["Layer", "Technology", "Purpose"],
            [
              ["Frontend",    "Angular 17+ (TypeScript)",        "Student, college, and admin interfaces"],
              ["Backend",     "Node.js 20 + Express",            "REST API, business logic, AI simulation"],
              ["Database",    "MySQL 8.x",                       "Primary relational data store"],
              ["Cache",       "Redis",                           "Session store, API response caching"],
              ["File Store",  "AWS S3 / Local NFS",              "CV uploads, course videos, thumbnails"],
              ["Auth",        "JWT + bcrypt + OTP (SMS/Email)",  "Authentication and 2FA"],
              ["Hosting",     "Hostinger VPS KVM 8 / AWS",       "Production deployment"],
            ],
            [2500, 3000, 3500]
          ),
          gap(),

          h2("2.2 Product Functions — Summary"),
          tbl(
            ["Module", "Key Functions"],
            [
              ["Authentication",       "Student registration, login (Email/Mobile OTP), Admin login with 2FA, JWT session management"],
              ["College Portal",        "9-step onboarding wizard: institution details, verification, campus config, faculty, students, career config, billing"],
              ["Student Portal",        "8-step wizard: profile, skill verification (6 methods), AI career counselling, roadmap, CV generation, dashboard"],
              ["LMS Module",            "Course catalog, enrollment, Udemy-style video player, quizzes, assignments, progress tracking"],
              ["Super Admin Panel",     "College approvals, platform analytics, subscription billing, audit logs, feature flags, LMS course builder"],
              ["AI Features",           "Career fit scoring, 4-phase roadmap generation, skill gap analysis, CV optimisation suggestions"],
              ["Notifications",         "Email and SMS OTPs, placement alerts, course reminders, admin approval notifications"],
              ["Document Export",       "ATS-optimised CV as DOCX/PDF, FSD document, SRS document, project prompt document"],
            ],
            [2500, 6500]
          ),
          gap(),

          h2("2.3 User Classes & Characteristics"),
          tbl(
            ["User Class", "Description", "Technical Level", "Access"],
            [
              ["Super Admin",      "EduConnect platform administrator. Manages all colleges, billing, audit, LMS content.", "High", "Full platform access"],
              ["College Admin",    "Principal / Registrar. Completes college onboarding, manages billing.", "Medium", "College-scoped"],
              ["TPO / Placement Officer", "Manages placements, student lists, career config, dashboards.", "Medium", "College-scoped"],
              ["Faculty",         "Views student progress, assigns assessments.", "Low–Medium", "Read + limited write"],
              ["Student",         "Creates profile, verifies skills, views roadmap, takes LMS courses.", "Low–Medium", "Own data only"],
            ],
            [2000, 3500, 1500, 2000]
          ),
          gap(),

          h2("2.4 Operating Environment"),
          bullet("Web browsers: Chrome 110+, Firefox 110+, Edge 110+, Safari 16+"),
          bullet("Mobile browsers: Chrome/Safari on iOS 15+ and Android 10+"),
          bullet("Backend: Node.js 20 LTS on Ubuntu 22.04 LTS"),
          bullet("Database: MySQL 8.x"),
          bullet("Minimum client internet speed: 2 Mbps (10 Mbps for video streaming)"),
          gap(),

          h2("2.5 Design & Implementation Constraints"),
          bullet("All data must remain within India (data residency compliance)"),
          bullet("No third-party AI API calls in MVP — all AI is simulated client-side with setTimeout"),
          bullet("CV export must produce valid ATS-readable DOCX format"),
          bullet("System must handle 10,000 concurrent users on Hostinger VPS KVM 8"),
          bullet("Each college's student data must be strictly isolated (multi-tenancy)"),
          bullet("HTTPS mandatory for all endpoints"),
          gap(),

          h2("2.6 Assumptions & Dependencies"),
          bullet("Colleges provide valid AICTE/NAAC registration details during onboarding"),
          bullet("Students have access to a valid email and Indian mobile number for OTP"),
          bullet("SMS OTP delivery via Twilio or MSG91 gateway"),
          bullet("Email delivery via SMTP (SendGrid or AWS SES)"),
          bullet("Course video files uploaded by admin are MP4/MOV format, max 5GB per file"),
          gap(200),

          /* ══ 3. FUNCTIONAL REQUIREMENTS ══ */
          h1("3. Functional Requirements"),

          /* 3.1 AUTH */
          h2("3.1 Authentication & Authorisation"),
          h3("FR-AUTH-01: Student Registration"),
          tbl(["Field", "Detail"], [
            ["Requirement ID", "FR-AUTH-01"],
            ["Description",    "New students register via a 3-step wizard: Personal Details → Identity Verification → College & Course."],
            ["Inputs",         "Full name, email, mobile, password, confirm password, college, department, year, roll no, terms acceptance."],
            ["Process",        "Send OTP to email and mobile independently. Both must be verified before proceeding. Hash password with bcrypt (salt rounds=12). Store JWT on success."],
            ["Output",         "Student account created. JWT token issued. Redirect to Student Portal."],
            ["Priority",       "High"],
          ], [2500, 6500]),
          gap(120),

          h3("FR-AUTH-02: Student Login"),
          tbl(["Field", "Detail"], [
            ["Requirement ID", "FR-AUTH-02"],
            ["Description",    "Existing students log in via Email+Password or Mobile OTP."],
            ["Tab 1",          "Email + Password with Forgot Password link and Remember Me checkbox."],
            ["Tab 2",          "Mobile number input → OTP SMS → 6-box OTP verification."],
            ["Social Login",   "Google OAuth and LinkedIn OAuth as alternatives."],
            ["Output",         "JWT token issued (15 min access + 7 day refresh). Redirect to Student Portal."],
            ["Priority",       "High"],
          ], [2500, 6500]),
          gap(120),

          h3("FR-AUTH-03: Admin Login with 2FA"),
          tbl(["Field", "Detail"], [
            ["Requirement ID", "FR-AUTH-03"],
            ["Description",    "Admin users (Super Admin, College Admin, TPO, Faculty) authenticate via role-based login with mandatory 2FA."],
            ["Phase 1",        "Role dropdown, institution dropdown (for college roles), email, password."],
            ["Phase 2",        "Authenticator OTP (6-digit, 30-second rotating) shown after 1500ms credential check."],
            ["Output",         "JWT with role claims issued. Redirect to appropriate admin panel."],
            ["Priority",       "High"],
          ], [2500, 6500]),
          gap(200),

          /* 3.2 COLLEGE PORTAL */
          h2("3.2 College Portal — 9-Step Wizard"),
          tbl(
            ["Step", "Requirement ID", "Description", "Priority"],
            [
              ["1 — Institution Details",    "FR-COL-01", "Capture institution name, type, NAAC grade, AICTE ID, full address, contact email, phone, website.", "High"],
              ["2 — Representative",         "FR-COL-02", "Primary contact (name/designation/email/mobile/LinkedIn). Optional secondary contact toggle.", "High"],
              ["3 — OTP Verification",       "FR-COL-03", "Send OTP to official email and mobile. Both must be independently verified. 30s countdown timer with Resend.", "High"],
              ["4 — Campus Configuration",   "FR-COL-04", "4 sub-tabs: Academic (batches, calendar), Departments (add/edit/remove), Branding (logo, colours), Settings (toggles).", "High"],
              ["5 — Faculty Setup",          "FR-COL-05", "Faculty table with roles. Permissions matrix: 5 roles × 6 permissions (View/Edit Students, Manage Placements, etc.).", "High"],
              ["6 — Student Onboarding",     "FR-COL-06", "Three methods: Bulk CSV upload with column mapping, Manual entry form, Invite Link with QR code.", "High"],
              ["7 — Career Configuration",   "FR-COL-07", "Target roles, package range, AI roadmap toggle per department, assessment toggles, eligibility criteria.", "Medium"],
              ["8 — Dashboard Initialization","FR-COL-08","Activate/configure 5 dashboards: Institution Overview, Placement Analytics, Faculty, Student Activity, Career Insights.", "Medium"],
              ["9 — Subscription & Billing", "FR-COL-09", "Plan selection (Starter/Growth/Professional/Enterprise), add-ons, coupon code, 4 payment methods, GST calculation.", "High"],
            ],
            [2200, 1600, 3800, 1400]
          ),
          gap(200),

          /* 3.3 STUDENT PORTAL */
          h2("3.3 Student Portal — 8-Step Wizard"),
          tbl(
            ["Step", "Requirement ID", "Description", "Priority"],
            [
              ["1 — Onboarding",           "FR-STU-01", "Email/social login tabs, OTP verification for both email and mobile, success screen.", "High"],
              ["2 — Profile",              "FR-STU-02", "4 sub-tabs: Personal (photo, grid fields), Education (college/CGPA), Skills (4 TagInputs + certs), Experience (cards).", "High"],
              ["3 — Skill Verification",   "FR-STU-03", "6 methods: MCQ assessment, coding challenge, GitHub analysis, project submission, mentor request, admin approval.", "High"],
              ["4 — AI Career Counselling","FR-STU-04", "Personal assessment (interests/strengths/personality) + Technical (6 sliders 0–10). AI results after 2200ms.", "High"],
              ["5 — Career Goals",         "FR-STU-05", "Role grid (single-select), domain chips, target companies, location, work mode, salary range.", "Medium"],
              ["6 — AI Roadmap",           "FR-STU-06", "4-phase timeline generated after 2500ms. Each phase has skills, project, milestone. LMS course cards per phase.", "High"],
              ["7 — CV Generator",         "FR-STU-07", "ATS single-column format. Only verified skills shown. Export as DOCX (docx library) and PDF (window.print).", "High"],
              ["8 — Student Dashboard",    "FR-STU-08", "Full-bleed layout. KPI cards, CircleGauge rings, skill tags, project list, assessments, CV preview, notifications.", "High"],
            ],
            [2200, 1600, 3800, 1400]
          ),
          gap(120),

          h3("FR-STU-03A: Skill Verification Methods"),
          tbl(
            ["Method", "Flow", "Result"],
            [
              ["Online Assessment",   "3 MCQs shown one at a time with progress bar. Submit triggers 800ms evaluation.", "Score 88% → status = verified"],
              ["Coding Challenge",    "Challenge brief + dark-theme code textarea. Submit Solution → 1200ms evaluating.", "Score 82% → status = verified"],
              ["Project Submission",  "Project URL + description (min 20 chars) + file upload. Submit for review.", "status = in_progress (awaiting admin)"],
              ["GitHub Repository",   "URL input → Analyze (2000ms) → commit/star/language stats displayed.", "status = verified after review"],
              ["Mentor Verification", "Mentor dropdown + evidence textarea → Send Request.", "status = in_progress (awaiting mentor)"],
              ["Admin Approval",      "Evidence textarea (min 30 chars) + document upload → Submit for Review.", "status = in_progress (awaiting admin)"],
            ],
            [2500, 4000, 2500]
          ),
          gap(200),

          /* 3.4 LMS */
          h2("3.4 LMS Module"),
          tbl(
            ["Req ID", "Feature", "Description", "Priority"],
            [
              ["FR-LMS-01", "Course Catalog",    "Browse all courses with category/level/rating filters. Search by title or instructor.", "High"],
              ["FR-LMS-02", "Course Enrollment", "Student clicks Enroll → enrolledByUser = true. Enrolled courses appear in My Courses.", "High"],
              ["FR-LMS-03", "Course Playback",   "Udemy-style player: dark sidebar accordion, video simulation, ±10s skip, speed selector (0.5×–2×), volume.", "High"],
              ["FR-LMS-04", "Lesson Types",      "Video, Article (text/markdown), Quiz (3 MCQs, scored), Assignment (file upload with progress).", "High"],
              ["FR-LMS-05", "Notes",             "Students add timestamp-linked notes per lesson. View/delete notes in Notes tab.", "Medium"],
              ["FR-LMS-06", "Q&A",               "Students post questions. Instructor replies shown. ThumbsUp count. Ask new question form.", "Medium"],
              ["FR-LMS-07", "Progress Tracking", "Completion tracked per lesson. Section and course % calculated automatically.", "High"],
              ["FR-LMS-08", "Certificates",      "Certificate issued when course progress = 100%. Downloadable mock certificate.", "Low"],
              ["FR-LMS-09", "Resources",         "Downloadable file attachments per lesson (PDF, ZIP). Listed in Resources tab.", "Medium"],
              ["FR-LMS-10", "LMS Dashboard",     "Enrolled course cards with progress, streak counter, activity chart, radar chart for skill coverage.", "High"],
            ],
            [1500, 2000, 4500, 1000]
          ),
          gap(200),

          /* 3.5 SUPER ADMIN */
          h2("3.5 Super Admin Panel"),
          tbl(
            ["Req ID", "Section", "Description", "Priority"],
            [
              ["FR-SA-01", "Dashboard",       "4 KPI cards (Colleges/Students/Placement Rate/MRR). AreaChart, donut PieChart, pending approvals queue, activity feed.", "High"],
              ["FR-SA-02", "College Mgmt",    "Searchable table. Status filters. Approve/Suspend/Reinstate actions. Drill-down to College Detail with metrics and subscription management.", "High"],
              ["FR-SA-03", "Student Mgmt",    "Cross-college student table. Readiness score bars, placed indicator, dept/year filters.", "Medium"],
              ["FR-SA-04", "Analytics",       "BarChart (onboarding), LineChart (placement trend), AreaChart (revenue), static KPI panel.", "Medium"],
              ["FR-SA-05", "Subscriptions",   "Plan breakdown cards with revenue contribution. Transactions table with status.", "High"],
              ["FR-SA-06", "Audit Log",       "Type-filtered timestamped log: college/billing/security/system/data actions. Export to CSV.", "High"],
              ["FR-SA-07", "Settings",        "General config (read-only + edit). Feature flags (10 toggles, 4 groups). Danger Zone (3 actions).", "Medium"],
              ["FR-SA-08", "LMS Admin",       "Course builder: CourseList + CourseForm (3 tabs: Course Info, Curriculum, Settings). Udemy-style SectionEditor + LessonEditor + VideoUploadZone.", "High"],
            ],
            [1500, 2000, 4500, 1000]
          ),
          gap(200),

          /* 3.6 AI FEATURES */
          h2("3.6 AI Feature Requirements"),
          tbl(
            ["Req ID", "Feature", "Input", "Processing", "Output"],
            [
              ["FR-AI-01", "Career Fit Scoring",  "Interest chips (max 3), 6 technical sliders (0–10)", "Weighted scoring algorithm (2200ms simulation)", "Top 3 career paths with fit % (e.g. Full Stack 92%)"],
              ["FR-AI-02", "Roadmap Generator",   "Selected career goal, domain, current skill level", "Phase planning engine (2500ms simulation)", "4-phase timeline with skills, project, milestone per phase"],
              ["FR-AI-03", "Skill Gap Analysis",  "Profile skills vs. target role requirements", "Gap comparison matrix", "Missing skills highlighted, LMS course recommendations"],
              ["FR-AI-04", "Company Readiness",   "Readiness score, verified skills, target companies", "Scoring per company", "% readiness per target company (e.g. Google 45%)"],
            ],
            [1400, 2000, 2200, 1800, 1600]
          ),
          gap(200),

          /* ══ 4. NON-FUNCTIONAL REQUIREMENTS ══ */
          h1("4. Non-Functional Requirements"),

          h2("4.1 Performance Requirements"),
          tbl(
            ["Metric", "Requirement", "Measurement"],
            [
              ["Page Load Time",         "< 3 seconds on 4G connection",            "Lighthouse Performance Score ≥ 85"],
              ["API Response Time",      "< 500ms for 95% of requests",             "P95 latency under load testing"],
              ["Concurrent Users",       "10,000 simultaneous users",               "Load test with Apache JMeter or k6"],
              ["Video Stream Start",     "< 5 seconds to first frame",              "Measured from click to play"],
              ["Database Query Time",    "< 100ms for indexed queries",             "MySQL slow query log threshold"],
              ["File Upload",            "CV/document upload < 30 seconds for 10MB","Server-side measurement"],
              ["Availability (Uptime)",  "99.5% monthly uptime SLA",               "Uptime Robot monitoring"],
            ],
            [3000, 3500, 2500]
          ),
          gap(),

          h2("4.2 Security Requirements"),
          tbl(
            ["Req ID", "Requirement", "Implementation"],
            [
              ["NFR-SEC-01", "Password hashing",          "bcrypt with salt rounds = 12"],
              ["NFR-SEC-02", "JWT security",              "Access token 15 min expiry. Refresh token 7 days, rotated on use. Stored in httpOnly cookie."],
              ["NFR-SEC-03", "SQL Injection prevention",  "Parameterised queries only via mysql2. No string concatenation in SQL."],
              ["NFR-SEC-04", "XSS prevention",            "Angular default sanitisation. Content Security Policy headers via Nginx."],
              ["NFR-SEC-05", "HTTPS everywhere",          "TLS 1.2+ enforced via Nginx. HTTP redirects to HTTPS. HSTS header enabled."],
              ["NFR-SEC-06", "Rate limiting",             "100 requests/min per IP on API. 5 OTP attempts max per 10 minutes."],
              ["NFR-SEC-07", "File upload security",      "Whitelist MIME types (PDF/DOCX/MP4/MOV/PNG/JPG). Max 5 GB. Virus scan on upload."],
              ["NFR-SEC-08", "2FA for admins",            "TOTP-based 6-digit code required for all admin logins."],
              ["NFR-SEC-09", "Data isolation",            "Every DB query scoped to college_id. Row-level security enforced in API middleware."],
              ["NFR-SEC-10", "Audit logging",             "All admin actions logged with actor, action, target, IP, timestamp."],
            ],
            [1400, 2800, 4800]
          ),
          gap(),

          h2("4.3 Scalability Requirements"),
          bullet("Horizontal scaling: Node.js app must be stateless to allow multiple instances behind a load balancer."),
          bullet("Session state stored in Redis (not in-memory) to enable multi-instance deployment."),
          bullet("Database: MySQL read replicas for read-heavy operations (course catalog, analytics)."),
          bullet("File storage: Object storage (S3-compatible) for course videos, CV uploads — not local disk."),
          bullet("CDN: Static Angular assets served from CDN edge nodes (CloudFront or Cloudflare)."),
          bullet("Auto-scaling: PM2 cluster mode uses all available CPU cores. VPS can be upgraded without code change."),
          gap(),

          h2("4.4 Usability Requirements"),
          bullet("All forms must display inline validation errors without full page reload."),
          bullet("Wizards (College Portal, Student Portal, Registration) must save progress on each step so users can resume."),
          bullet("Error messages must be human-readable and actionable (not raw error codes)."),
          bullet("Colour contrast ratio must meet WCAG 2.1 AA standard (4.5:1 for normal text)."),
          bullet("Loading states must be shown for all async operations longer than 300ms."),
          bullet("All interactive elements must be keyboard navigable."),
          gap(),

          h2("4.5 Reliability & Availability"),
          bullet("Database backups: automated daily MySQL dump retained for 30 days."),
          bullet("Application: PM2 auto-restarts crashed Node.js processes within 5 seconds."),
          bullet("Health check endpoint: GET /api/health returns 200 OK with server status."),
          bullet("Graceful degradation: if Redis is unavailable, fall back to database sessions."),
          bullet("Error tracking: Sentry integration for uncaught exceptions in Node.js and Angular."),
          gap(),

          h2("4.6 Maintainability"),
          bullet("All API endpoints follow RESTful conventions with versioning (/api/v1/)."),
          bullet("Code must have inline comments for non-obvious logic. JSDoc for all exported functions."),
          bullet("Environment-specific config managed via .env files — no hardcoded credentials."),
          bullet("Database migrations managed via a migration tool (Flyway or Liquibase)."),
          gap(200),

          /* ══ 5. SYSTEM ARCHITECTURE ══ */
          h1("5. System Architecture"),

          h2("5.1 High-Level Architecture"),
          p("EduConnect follows a 3-tier architecture: Presentation (Angular SPA), Application (Node.js REST API), and Data (MySQL + Redis)."),
          gap(80),
          tbl(
            ["Tier", "Component", "Technology", "Responsibility"],
            [
              ["Presentation", "Angular SPA",         "Angular 17+, TypeScript, Tailwind CSS",  "Render UI, handle routing, call REST APIs"],
              ["Application",  "REST API",             "Node.js 20, Express, JWT, PM2",          "Business logic, auth, AI simulation, file handling"],
              ["Data",         "Primary DB",           "MySQL 8.x",                              "Persistent relational data storage"],
              ["Data",         "Cache",                "Redis 7.x",                              "Sessions, hot query results, rate limit counters"],
              ["Data",         "File Storage",         "S3 / Hostinger Object Storage",          "Course videos, CV files, thumbnails"],
              ["Infrastructure","Reverse Proxy",       "Nginx",                                  "SSL termination, static file serving, load balancing"],
              ["Infrastructure","Process Manager",     "PM2 (cluster mode)",                     "Node.js lifecycle, auto-restart, multi-core utilisation"],
            ],
            [1800, 2000, 2500, 2700]
          ),
          gap(),

          h2("5.2 API Structure"),
          tbl(
            ["Route Prefix", "Module", "Key Endpoints"],
            [
              ["/api/v1/auth",          "Authentication",    "POST /register, POST /login, POST /verify-otp, POST /refresh, POST /logout"],
              ["/api/v1/colleges",      "College Mgmt",      "GET /list, POST /register, PUT /:id, GET /:id/dashboard, POST /:id/approve"],
              ["/api/v1/students",      "Student Mgmt",      "POST /profile, GET /profile, PUT /profile, GET /roadmap, POST /skills/verify"],
              ["/api/v1/lms",           "LMS",               "GET /courses, POST /enroll/:id, GET /courses/:id/lessons, PUT /progress"],
              ["/api/v1/admin/courses", "LMS Admin",         "GET /, POST /, PUT /:id, DELETE /:id, POST /:id/sections, POST /:id/lessons"],
              ["/api/v1/super",         "Super Admin",       "GET /dashboard, GET /colleges, POST /colleges/:id/approve, GET /audit-logs"],
              ["/api/v1/cv",            "CV Generator",      "GET /generate, POST /export/docx, POST /export/pdf"],
              ["/api/v1/billing",       "Billing",           "GET /plans, POST /subscribe, GET /transactions, POST /coupon/validate"],
            ],
            [2500, 2000, 4500]
          ),
          gap(200),

          /* ══ 6. DATABASE ══ */
          h1("6. Database Requirements"),

          h2("6.1 Core Tables"),
          tbl(
            ["Table", "Primary Key", "Key Columns", "Relationships"],
            [
              ["users",           "user_id (UUID)",     "email, mobile, password_hash, role, college_id, created_at",              "FK → colleges.college_id"],
              ["colleges",        "college_id (UUID)",  "name, type, naac_grade, address, status, plan_tier, created_at",          "Parent of users, departments"],
              ["departments",     "dept_id",            "college_id, name, hod_name, hod_email, student_count",                    "FK → colleges"],
              ["student_profiles","profile_id",         "user_id, photo_url, cgpa, graduation_year, skills[], experience[]",       "FK → users"],
              ["skill_verifications","verify_id",       "user_id, skill_name, method, status, score, verified_at",                 "FK → users"],
              ["courses",         "course_id (UUID)",   "title, category, level, instructor, status, created_by, thumbnail_url",   "FK → users (creator)"],
              ["course_sections", "section_id",         "course_id, title, order_index",                                          "FK → courses"],
              ["lessons",         "lesson_id",          "section_id, title, type, duration_mins, video_url, is_preview",           "FK → course_sections"],
              ["enrollments",     "enrollment_id",      "user_id, course_id, enrolled_at, completed_at, progress_pct",             "FK → users, courses"],
              ["lesson_progress", "progress_id",        "enrollment_id, lesson_id, completed, completed_at",                      "FK → enrollments, lessons"],
              ["transactions",    "txn_id",             "college_id, plan_tier, amount, gst, status, payment_method, created_at",  "FK → colleges"],
              ["audit_logs",      "log_id",             "actor_id, action, target, ip_address, type, created_at",                  "FK → users"],
            ],
            [2000, 1800, 3500, 1700]
          ),
          gap(),

          h2("6.2 Indexing Strategy"),
          tbl(
            ["Table", "Index", "Purpose"],
            [
              ["users",            "INDEX (email), INDEX (mobile), INDEX (college_id)",         "Fast login lookup, college-scoped queries"],
              ["courses",          "INDEX (status), INDEX (category), INDEX (level)",            "Catalog filtering"],
              ["enrollments",      "INDEX (user_id, course_id) UNIQUE, INDEX (course_id)",       "Enrollment check, course stats"],
              ["lesson_progress",  "INDEX (enrollment_id, lesson_id) UNIQUE",                   "Progress lookup"],
              ["audit_logs",       "INDEX (type), INDEX (created_at), INDEX (actor_id)",         "Filtered log queries"],
              ["transactions",     "INDEX (college_id), INDEX (status), INDEX (created_at)",     "Billing reports"],
            ],
            [2000, 4000, 3000]
          ),
          gap(200),

          /* ══ 7. EXTERNAL INTERFACES ══ */
          h1("7. External Interface Requirements"),

          h2("7.1 User Interface"),
          bullet("Angular SPA served as static files from CDN/Nginx."),
          bullet("Responsive design supporting desktop (1280px+), tablet (768px), and mobile (375px+)."),
          bullet("Design system: Outfit (body), DM Serif Display (headings), DM Mono (mono). Primary colour #1B3A6B, accent #D97706."),
          bullet("All modals, dropdowns, and tooltips must be accessible (ARIA attributes, keyboard navigation)."),
          gap(),

          h2("7.2 API Interface"),
          bullet("All API responses follow JSON:API-like format: { success, data, error, meta }."),
          bullet("Pagination: all list endpoints support ?page=1&limit=20."),
          bullet("Versioning: /api/v1/ prefix. Breaking changes increment version."),
          bullet("CORS: restricted to configured CORS_ORIGIN environment variable."),
          gap(),

          h2("7.3 Third-Party Integrations"),
          tbl(
            ["Service", "Provider", "Purpose"],
            [
              ["SMS OTP",         "MSG91 / Twilio",          "Send OTP to mobile numbers for verification and login"],
              ["Email OTP/Alerts","SendGrid / AWS SES",       "Send OTP emails, placement alerts, college notifications"],
              ["OAuth",           "Google, LinkedIn",        "Social login for students"],
              ["File Storage",    "AWS S3 / Hostinger S3",   "Course video storage, CV uploads, thumbnails"],
              ["CDN",             "Cloudflare / CloudFront", "Angular static file delivery"],
              ["Error Tracking",  "Sentry",                  "Backend and frontend error monitoring"],
              ["Payments",        "Razorpay / CCAvenue",     "College subscription billing (INR)"],
            ],
            [2000, 2500, 4500]
          ),
          gap(200),

          /* ══ 8. USE CASES ══ */
          h1("8. Key Use Cases"),
          tbl(
            ["Use Case ID", "Title", "Actor", "Pre-condition", "Post-condition"],
            [
              ["UC-01", "College Registration",        "College Admin",  "Admin has valid AICTE/NAAC details",          "College account created, OTP verified, step 1–9 complete"],
              ["UC-02", "Student Self-Registration",   "Student",        "Student has email + Indian mobile",           "Account created, email + phone verified, redirect to portal"],
              ["UC-03", "Skill Verification (MCQ)",    "Student",        "Student in Step 3, skill selected",           "Skill status = verified, score stored, skill appears on CV"],
              ["UC-04", "AI Roadmap Generation",       "Student",        "Career goals saved in Step 5",                "4-phase roadmap displayed, LMS course recommendations shown"],
              ["UC-05", "CV Export",                   "Student",        "At least 1 verified skill",                   "DOCX file downloaded via browser, PDF via window.print"],
              ["UC-06", "Course Enrollment",           "Student",        "Student logged in, course not yet enrolled",  "enrolledByUser = true, course appears in My Courses"],
              ["UC-07", "Complete Lesson",             "Student",        "Student enrolled, lesson not yet complete",   "lesson_progress row created, course progress% updated"],
              ["UC-08", "Approve College",             "Super Admin",    "College status = pending",                    "College status = active, admin notified via email"],
              ["UC-09", "Create LMS Course",           "Super Admin",    "Admin in LMS Admin section",                  "Course saved with sections + lessons, status = draft/published"],
              ["UC-10", "Bulk Student Upload",         "College Admin",  "Step 6, valid CSV file prepared",             "Student records created, invite links sent, count shown"],
              ["UC-11", "Subscribe to Plan",           "College Admin",  "Step 9, plan selected",                       "Payment processed, subscription active, access unlocked"],
              ["UC-12", "View Audit Log",              "Super Admin",    "Admin logged in",                             "Filtered, paginated log displayed. Export as CSV available"],
            ],
            [1200, 2400, 1800, 2400, 2200]
          ),
          gap(200),

          /* ══ 9. CONSTRAINTS & RISKS ══ */
          h1("9. Constraints, Risks & Mitigation"),
          tbl(
            ["Risk", "Likelihood", "Impact", "Mitigation"],
            [
              ["VPS KVM 8 overload at 10K peak users",    "Medium", "High",   "PM2 cluster mode + Redis caching reduces DB load by ~70%. Upgrade to KVM 16 if needed."],
              ["Video streaming overloads bandwidth",     "Medium", "High",   "Host videos on S3 + CloudFront CDN. Do not serve from VPS directly."],
              ["MySQL connection pool exhaustion",        "Low",    "High",   "Pool size = 500. Read replicas for SELECT queries. Redis caches hot data."],
              ["SMS OTP delivery failure",                "Low",    "Medium", "Fallback to email OTP if SMS fails. Alert admin dashboard on delivery failure rate."],
              ["Data breach / unauthorised access",       "Low",    "High",   "JWT httpOnly cookies, bcrypt, 2FA for admins, HTTPS, rate limiting, college_id scoping."],
              ["File upload abuse (large files)",         "Medium", "Medium", "5 GB max enforced server-side. MIME type whitelist. Virus scan via ClamAV."],
              ["AI results not meaningful (mock data)",   "High",   "Low",    "Acceptable for MVP. Real AI (OpenAI API) planned for v2. Current simulation is deterministic."],
            ],
            [2800, 1200, 1000, 4000]
          ),
          gap(200),

          /* ══ 10. ACCEPTANCE CRITERIA ══ */
          h1("10. Acceptance Criteria"),
          tbl(
            ["Module", "Criterion", "Test Method"],
            [
              ["Auth",             "Student can register, verify OTP, and log in within 3 minutes",                "Manual + automated E2E test"],
              ["College Portal",   "All 9 steps complete without errors, data persists after each step",           "QA regression test"],
              ["Skill Verification","All 6 methods result in correct status change (verified/in_progress)",        "Unit + manual test"],
              ["AI Roadmap",       "Roadmap generates within 3 seconds and contains all 4 phases",                 "Performance + functional test"],
              ["CV Export",        "DOCX downloads successfully, opens in Word, ATS-parseable, no corrupt fields", "Manual review"],
              ["LMS Playback",     "Video lesson loads within 5 seconds, progress saves on lesson complete",       "Manual + performance test"],
              ["Super Admin",      "College approval changes status, audit log records the action within 1 second","Functional test"],
              ["Performance",      "10,000 simulated users produce P95 API latency < 500ms",                       "k6 load test"],
              ["Security",         "OWASP Top 10 vulnerabilities absent in penetration test report",               "Security audit"],
              ["Billing",          "Coupon LAUNCH30 applies 30% discount, GST 18% calculated correctly",          "Functional test"],
            ],
            [2000, 4500, 2500]
          ),
          gap(400),

          /* ══ FOOTER ══ */
          new Paragraph({
            children: [new TextRun({ text: "EduConnect SRS  |  Version 1.0  |  July 2026  |  EduConnect Technologies Pvt. Ltd.  |  Confidential", size: 18, color: "9AA5BE", italics: true, font: "Calibri" })],
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: borderColor } },
            spacing: { before: 400 },
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "EduConnect-SRS.docx");
    setGenerating(false);
    setDone(true);
  };

  const sections = [
    { n: "1",  t: "Introduction",                       icon: BookOpen  },
    { n: "2",  t: "Overall Description",                icon: Globe     },
    { n: "3",  t: "Functional Requirements",            icon: Zap       },
    { n: "4",  t: "Non-Functional Requirements",        icon: Shield    },
    { n: "5",  t: "System Architecture",                icon: Server    },
    { n: "6",  t: "Database Requirements",              icon: Database  },
    { n: "7",  t: "External Interface Requirements",    icon: Cpu       },
    { n: "8",  t: "Key Use Cases",                      icon: Users     },
    { n: "9",  t: "Constraints, Risks & Mitigation",    icon: Lock      },
    { n: "10", t: "Acceptance Criteria",                icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FB]" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header className="bg-[#1B3A6B] sticky top-0 z-50">
        <div className="max-w-[960px] mx-auto px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center">
              <GraduationCap size={17} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-[14px]">EduConnect</span>
              <span className="ml-2 text-[10.5px] text-white/40 font-medium tracking-wider uppercase">SRS Document</span>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12.5px] text-white/50 hover:text-white/80 transition-colors">
            <ArrowLeft size={13} /> Back
          </button>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-7 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1B3A6B] mb-5 shadow-lg">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-[38px] font-bold text-[#0F1C3F] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Software Requirements Specification
          </h1>
          <p className="text-[16px] text-[#5A6A8A] mb-1">EduConnect — AI-Powered College Placement & Career Platform</p>
          <p className="text-[13px] text-[#9AA5BE]" style={{ fontFamily: "var(--font-mono)" }}>
            Version 1.0 · IEEE Std 830 · 10 Sections · July 2026
          </p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Functional Req.",     value: "40+",  color: "#1B3A6B", bg: "#EBF1FA" },
            { label: "Non-Functional Req.", value: "20+",  color: "#7C3AED", bg: "#F5F0FF" },
            { label: "Use Cases",           value: "12",   color: "#059669", bg: "#ECFDF5" },
            { label: "Acceptance Criteria", value: "10",   color: "#D97706", bg: "#FFFBEB" },
          ].map(k => (
            <div key={k.label} className="bg-white border border-[rgba(27,58,107,0.1)] rounded-xl p-4 text-center shadow-sm">
              <p className="text-[26px] font-bold" style={{ color: k.color, fontFamily: "var(--font-serif)" }}>{k.value}</p>
              <p className="text-[11.5px] mt-0.5" style={{ color: "#5A6A8A" }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Document info card */}
        <div className="bg-white border border-[rgba(27,58,107,0.1)] rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-[11.5px] font-semibold text-[#9AA5BE] uppercase tracking-widest mb-4">Document Information</p>
          <div className="grid grid-cols-3 gap-x-8 gap-y-2.5">
            {[
              { k: "Standard",      v: "IEEE Std 830-1998" },
              { k: "Version",       v: "1.0" },
              { k: "Date",          v: "July 2026" },
              { k: "Status",        v: "Approved" },
              { k: "Classification",v: "Internal / Confidential" },
              { k: "Prepared By",   v: "EduConnect Technologies Pvt. Ltd." },
            ].map(row => (
              <div key={row.k} className="flex items-baseline gap-2">
                <span className="text-[11.5px] font-semibold text-[#9AA5BE] shrink-0">{row.k}:</span>
                <span className="text-[12.5px] text-[#0F1C3F] font-medium">{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table of contents */}
        <div className="bg-white border border-[rgba(27,58,107,0.1)] rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-[11.5px] font-semibold text-[#9AA5BE] uppercase tracking-widest mb-4">Table of Contents</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0">
            {sections.map(s => (
              <div key={s.n} className="flex items-center gap-3 py-2.5 border-b border-[rgba(27,58,107,0.06)] last:border-0">
                <span className="w-6 h-6 rounded-lg bg-[#EBF1FA] text-[#1B3A6B] text-[10.5px] font-bold flex items-center justify-center shrink-0">{s.n}</span>
                <s.icon size={12} className="text-[#9AA5BE] shrink-0" />
                <span className="text-[13px] text-[#0F1C3F] font-medium">{s.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module coverage */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { title: "Authentication",    desc: "Registration, login, OTP, 2FA, JWT, OAuth",         color: "#1B3A6B" },
            { title: "College Portal",    desc: "9-step wizard, faculty, billing, dashboards",        color: "#7C3AED" },
            { title: "Student Portal",    desc: "Profile, skill verify, AI counselling, roadmap, CV", color: "#059669" },
            { title: "LMS Module",        desc: "Catalog, enrollment, course player, progress",       color: "#0891B2" },
            { title: "Super Admin",       desc: "College mgmt, analytics, audit, LMS builder",        color: "#D97706" },
            { title: "Infrastructure",    desc: "Performance, security, scalability, DB design",      color: "#DC2626" },
          ].map(c => (
            <div key={c.title} className="bg-white border border-[rgba(27,58,107,0.1)] rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <p className="text-[13px] font-semibold text-[#0F1C3F]">{c.title}</p>
              </div>
              <p className="text-[11.5px] text-[#5A6A8A] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Download */}
        <div className="bg-white border-2 border-[rgba(27,58,107,0.12)] rounded-2xl p-8 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[13px] text-[#5A6A8A]">
              Microsoft Word (.docx) · Calibri font · IEEE Std 830 structure · Formatted tables
            </p>
          </div>
          <p className="text-[12px] text-[#9AA5BE] mb-7">
            40+ functional requirements · Security, performance & scalability specs · Database schema · Acceptance criteria
          </p>

          {done ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <p className="text-[15px] font-semibold text-emerald-700">Download Complete!</p>
              <p className="text-[13px] text-[#5A6A8A]">EduConnect-SRS.docx saved to your Downloads folder.</p>
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
                : <><Download size={17} /> Download SRS Document (.docx)</>}
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
