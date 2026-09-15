import { useState } from "react";
import {
  GraduationCap,
  ArrowLeft,
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  convertInchesToTwip,
  UnderlineType,
} from "docx";
import { saveAs } from "file-saver";

export function FSDPage({
  onBack,
  onPrompt,
  onSRS,
}: {
  onBack: () => void;
  onPrompt?: () => void;
  onSRS?: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const navy = "1B3A6B";
  const amber = "D97706";
  const lightBg = "EBF1FA";
  const borderColor = "C5D3E8";

  const makeHeading = (
    text: string,
    level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
    spaceBefore = 300,
    spaceAfter = 120,
  ) =>
    new Paragraph({
      text,
      heading: level,
      spacing: { before: spaceBefore, after: spaceAfter },
      run: { color: level === HeadingLevel.HEADING_1 ? navy : "0F1C3F" },
    });

  const makeP = (
    text: string,
    opts: {
      bold?: boolean;
      color?: string;
      indent?: number;
      bullet?: boolean;
    } = {},
  ) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          bold: opts.bold,
          color: opts.color ?? "374151",
          size: 22,
        }),
      ],
      spacing: { after: 100 },
      ...(opts.bullet ? { bullet: { level: 0 } } : {}),
      indent: opts.indent ? { left: opts.indent } : undefined,
    });

  const makeKV = (key: string, value: string) =>
    new Paragraph({
      children: [
        new TextRun({
          text: key + ": ",
          bold: true,
          color: "0F1C3F",
          size: 22,
        }),
        new TextRun({ text: value, color: "374151", size: 22 }),
      ],
      spacing: { after: 80 },
    });

  const makeTable = (
    headers: string[],
    rows: string[][],
    colWidths?: number[],
  ) => {
    const totalWidth = 9000;
    const equalW = Math.floor(totalWidth / headers.length);
    const widths = colWidths ?? headers.map(() => equalW);

    const headerRow = new TableRow({
      children: headers.map(
        (h, i) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: h,
                    bold: true,
                    color: "FFFFFF",
                    size: 20,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            width: { size: widths[i], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: navy },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
          }),
      ),
      tableHeader: true,
    });

    const dataRows = rows.map(
      (row, ri) =>
        new TableRow({
          children: row.map(
            (cell, ci) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: cell, size: 20, color: "374151" }),
                    ],
                    alignment: AlignmentType.LEFT,
                  }),
                ],
                width: { size: widths[ci], type: WidthType.DXA },
                shading: {
                  type: ShadingType.CLEAR,
                  fill: ri % 2 === 0 ? "F4F6FB" : "FFFFFF",
                },
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
              }),
          ),
        }),
    );

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: totalWidth, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        insideH: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        insideV: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      },
    });
  };

  const generateDoc = async () => {
    setGenerating(true);

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: "Calibri", size: 22, color: "374151" } },
        },
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            run: { bold: true, size: 36, color: navy, font: "Calibri" },
            paragraph: { spacing: { before: 400, after: 160 } },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            run: { bold: true, size: 28, color: navy, font: "Calibri" },
            paragraph: { spacing: { before: 300, after: 120 } },
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            run: { bold: true, size: 24, color: "374151", font: "Calibri" },
            paragraph: { spacing: { before: 200, after: 100 } },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1.2),
                right: convertInchesToTwip(1.2),
              },
            },
          },
          children: [
            /* ── COVER ── */
            new Paragraph({
              children: [
                new TextRun({
                  text: "EduConnect",
                  bold: true,
                  size: 72,
                  color: navy,
                  font: "Calibri",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 1200, after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Functional Specification Document",
                  size: 36,
                  color: amber,
                  font: "Calibri",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "AI-Powered College Placement & Career Management Platform",
                  size: 24,
                  color: "5A6A8A",
                  font: "Calibri",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Version 2.0  ·  July 2026  ·  EduConnect Technologies Pvt. Ltd.",
                  size: 20,
                  color: "9AA5BE",
                  font: "Calibri",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 1600 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "", break: 1 })],
              spacing: { after: 400 },
            }),

            /* ── SECTION 1 — OVERVIEW ── */
            makeHeading("1. Overview", HeadingLevel.HEADING_1),
            makeP(
              "EduConnect is a web platform connecting Indian colleges and students through placement management, AI career counselling, and skill verification. The application is built as a single React + TypeScript + Tailwind CSS project (App.tsx).",
            ),
            new Paragraph({ spacing: { after: 120 } }),
            makeTable(
              ["Mode", "View Rendered"],
              [
                ['"home"', "Landing / Marketing page (HomePage)"],
                ['"college"', "College Registration Portal — 9-step wizard"],
                ['"student"', "Student Portal — 8-step wizard"],
                [
                  '"lms"',
                  "LMS Module — student-facing course player (LMSModule)",
                ],
                ['"student-login"', "Student Login screen"],
                ['"admin-login"', "Admin Login screen (+ 2FA)"],
                ['"student-register"', "Student Registration 3-step wizard"],
                [
                  '"super-admin"',
                  "Super Admin Panel — 8 sections (incl. LMS Admin)",
                ],
                ['"fsd"', "This Functional Specification Document"],
                ['"project-prompt"', "Project Rebuild Prompt download page"],
              ],
              [2800, 6200],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 2 — DESIGN SYSTEM ── */
            makeHeading("2. Design System", HeadingLevel.HEADING_1),
            makeHeading("2.1 Fonts", HeadingLevel.HEADING_2),
            makeTable(
              ["Role", "Family", "Weights"],
              [
                ["Display / Headings", "DM Serif Display", "Regular, Italic"],
                ["Body Text", "Outfit", "300, 400, 500, 600, 700"],
                ["Mono / Data Labels", "DM Mono", "400, 500"],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),
            makeHeading("2.2 Color Tokens", HeadingLevel.HEADING_2),
            makeTable(
              ["Token", "Value", "Usage"],
              [
                ["--background", "#F4F6FB", "Page background"],
                ["--foreground", "#0F1C3F", "Default text"],
                ["--primary", "#1B3A6B", "Navy — primary interactive"],
                ["--accent", "#D97706", "Amber — highlights & CTAs"],
                ["--border", "rgba(27,58,107,0.12)", "Hairline rules"],
                ["--font-sans", "Outfit, sans-serif", "Body font stack"],
                [
                  "--font-serif",
                  "DM Serif Display, serif",
                  "Heading font stack",
                ],
                ["--font-mono", "DM Mono, monospace", "Data / label font"],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),
            makeHeading(
              "2.3 Shared Primitive Components",
              HeadingLevel.HEADING_2,
            ),
            makeTable(
              ["Component", "Props / Behaviour"],
              [
                [
                  "SectionTitle",
                  "num + title + sub — renders section badge, serif heading, muted subtext",
                ],
                [
                  "Field",
                  "label + hint + required marker wrapping any children",
                ],
                [
                  "Input",
                  "Spreads InputHTMLAttributes, optional left icon, optional right suffix text",
                ],
                ["Select", "Spreads SelectHTMLAttributes, optional left icon"],
                [
                  "InfoBox",
                  "variant: blue | amber | green — coloured left-border info panel",
                ],
                [
                  "Tag",
                  "Pill chip, color: blue | green | amber, optional onRemove X button",
                ],
                [
                  "OTPInput",
                  "6 individual boxes, auto-focus on type, backspace navigates back, paste fills all 6",
                ],
                [
                  "FileDropZone",
                  "Drag-and-drop area, click to open file picker, simulated progress bar",
                ],
                ["Toggle", "Label + styled checkbox toggle"],
                [
                  "CircleGauge",
                  "SVG ring gauge — props: value (0-100), size, color, label. % text in DM Serif",
                ],
                [
                  "TagInput",
                  "Wrapping chip container + inline text input, Enter/comma to add, X to remove",
                ],
                [
                  "ProgressBar",
                  "Props: value, color, height. Smooth CSS transition on width",
                ],
              ],
              [2400, 6600],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 3 — HOME PAGE ── */
            makeHeading("3. Home Page", HeadingLevel.HEADING_1),
            makeHeading("3.1 Sticky Navigation", HeadingLevel.HEADING_2),
            makeP(
              "• Left: EduConnect logo (GraduationCap icon + bold wordmark)",
              { bullet: true },
            ),
            makeP(
              "• Centre: anchor links — Features, Portals, Pricing, Stories, FAQ",
              { bullet: true },
            ),
            makeP(
              "• Right: Student Login (ghost → student mode) + Register College (navy → college mode)",
              { bullet: true },
            ),
            makeP(
              "• Mobile: hamburger collapses to full-width dropdown with all links and CTAs",
              { bullet: true },
            ),

            makeHeading("3.2 Hero Section", HeadingLevel.HEADING_2),
            makeP(
              "Background #0A1629 dark navy with 40px CSS grid overlay (4% opacity) and two ambient glow blobs (navy top-left, amber bottom-right).",
            ),
            makeP(
              "• Announcement badge: AI-Powered Career Platform for Indian Colleges",
              { bullet: true },
            ),
            makeP(
              "• H1 (DM Serif Display, 64px): From Campus to Career — Faster. — 'Career' in amber gradient text",
              { bullet: true },
            ),
            makeP(
              "• Two CTA buttons: Register Your College (white) and Student Portal → (amber)",
              { bullet: true },
            ),
            makeP(
              "• 4 stat cards: 1,200+ Colleges | 4.8L+ Students Placed | 92% Placement Rate | 3,500+ Recruiting Partners",
              { bullet: true },
            ),

            makeHeading("3.3 Portal Tabs Section", HeadingLevel.HEADING_2),
            makeP(
              "Toggle pills switch between College Portal and Student Portal feature grids.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["Tab", "6 Feature Cards"],
              [
                [
                  "College Portal",
                  "Institution Setup · Faculty & Team Roles · Student Onboarding · Career Configuration · 5 Live Dashboards · Flexible Billing",
                ],
                [
                  "Student Portal",
                  "Quick Onboarding · AI Career Assessment ⭐ · AI Roadmap ⭐ · Readiness Scores · Dynamic CV Builder · Placement Matching",
                ],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),
            makeP(
              "Cards: hover lifts with shadow, icon bg transitions to navy. CTA button below grid routes to correct portal.",
            ),

            makeHeading("3.4 How It Works", HeadingLevel.HEADING_2),
            makeP(
              "Two columns — For Colleges (navy) and For Students (amber). Each has 4 numbered steps with vertical connector line.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["For Colleges", "For Students"],
              [
                [
                  "1. Register & Verify (OTP, 10 min)",
                  "1. Create Account (email / social, 2 min)",
                ],
                [
                  "2. Configure Campus (depts, batches, branding)",
                  "2. Build Your Profile (education, skills, experience)",
                ],
                [
                  "3. Onboard Students (CSV / invite links)",
                  "3. AI Assessment (career counselling, skill gaps)",
                ],
                [
                  "4. Launch Placements (targets, assessments)",
                  "4. Get Your Roadmap (4-phase AI plan, internships)",
                ],
              ],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            makeHeading("3.5 AI Callout Section", HeadingLevel.HEADING_2),
            makeP(
              "Dark navy gradient background. Title: 'Not just a portal. An intelligent career co-pilot.' Three amber-icon feature cards: Career Fit Score, AI Roadmap, Company Readiness. CTA: Try the AI Assessment (amber → student mode).",
            ),

            makeHeading("3.6 Testimonials", HeadingLevel.HEADING_2),
            makeTable(
              ["Name", "Role", "Key Claim"],
              [
                [
                  "Dr. Priya Menon",
                  "Placement Head, RGIIT Mumbai",
                  "58% → 91% placement rate in one year, saves 20hrs/week",
                ],
                [
                  "Arjun Shah",
                  "B.Tech CSE Graduate 2024",
                  "AI roadmap guided him to Microsoft placement",
                ],
                [
                  "Ms. Kavitha Reddy",
                  "TPO, Hyderabad Institute",
                  "1,200 students onboarded in 3 days vs. weeks",
                ],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading("3.7 Pricing Plans", HeadingLevel.HEADING_2),
            makeTable(
              ["Plan", "Price", "Students", "Badge", "Key Features"],
              [
                [
                  "Starter",
                  "Free",
                  "Up to 200",
                  "—",
                  "Dashboards, basic placement tools",
                ],
                [
                  "Growth",
                  "₹49/student/sem",
                  "Up to 1,000",
                  "Popular",
                  "AI tools, bulk upload, reports",
                ],
                [
                  "Enterprise",
                  "Custom",
                  "Unlimited",
                  "Best Value",
                  "Dedicated support, white-label",
                ],
              ],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            makeHeading(
              "3.8 FAQ Accordion (5 Questions)",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "ChevronDown rotates 180° when expanded. Only one open at a time.",
              { bullet: false },
            ),
            makeP(
              "1. How long does college registration take? → 45–60 min, saveable progress",
              { bullet: true },
            ),
            makeP(
              "2. Is there a free trial? → Starter plan free up to 200 students, no card required",
              { bullet: true },
            ),
            makeP(
              "3. How does AI career counselling work? → Personal + technical assessment, processes skill gaps and goals",
              { bullet: true },
            ),
            makeP(
              "4. Can students use EduConnect independently? → Yes, full AI tools even without college account",
              { bullet: true },
            ),
            makeP(
              "5. What file formats are supported? → CSV/XLSX for bulk upload, PDF/DOCX for CV export",
              { bullet: true },
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 4 — COLLEGE PORTAL ── */
            makeHeading(
              "4. College Portal — 9-Step Wizard",
              HeadingLevel.HEADING_1,
            ),
            makeHeading("4.1 Layout", HeadingLevel.HEADING_2),
            makeP(
              "Sticky header: logo + ← Home + portal switcher pills + step counter (X of 9).",
            ),
            makeP("Two-column body: 252px sidebar | flex-1 main card."),
            makeP(
              "Main card: header with step icon/title/phase badge → content area → footer with Back/Continue.",
            ),
            makeP(
              "Footer: dot progress indicators with phase colours (navy = steps 1-3, amber = 4-8, purple = 9).",
            ),
            new Paragraph({ spacing: { after: 120 } }),
            makeTable(
              ["Phase", "Steps", "Color"],
              [
                ["Registration", "1, 2, 3", "Navy #1B3A6B"],
                ["Onboarding Setup", "4, 5, 6, 7, 8", "Amber #D97706"],
                ["Billing", "9", "Purple #7C3AED"],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),
            makeHeading("Sidebar Behaviour", HeadingLevel.HEADING_3),
            makeP(
              "Completed steps: navy bg with Check icon, clickable to navigate back.",
              { bullet: true },
            ),
            makeP(
              "Current step: light blue #EBF1FA bg with ChevronRight indicator.",
              { bullet: true },
            ),
            makeP(
              "Future steps: 40% opacity, cursor-default, non-interactive.",
              { bullet: true },
            ),

            makeHeading(
              "4.2 Step 1 — Institution Details",
              HeadingLevel.HEADING_2,
            ),
            makeTable(
              ["Field", "Type", "Options / Notes"],
              [
                ["Institution Name", "Text input", "Required"],
                [
                  "Institution Type",
                  "Dropdown",
                  "University / Autonomous / Affiliated / Deemed / Private",
                ],
                ["Affiliation Body", "Text input", "Required"],
                ["Establishment Year", "Number input", ""],
                ["NAAC Grade", "Dropdown", "A++ / A+ / A / B++ / B+ / B / C"],
                ["AICTE Approval ID", "Text input", ""],
                ["Address Line 1", "Text input", "Required"],
                ["City", "Text input", "Required"],
                ["State", "Dropdown", "All 28 Indian states + UTs"],
                ["PIN Code", "Text input", "Required"],
                ["Country", "Text input", "Default: India"],
                ["Official Email", "Email input", "Required"],
                ["Phone", "Tel input", "Required"],
                ["Website URL", "URL input", ""],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "4.3 Step 2 — Authorized Representative",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Primary contact form: Full Name, Designation (Principal/Dean/TPO/Registrar/HOD/Coordinator), Email, Mobile, LinkedIn URL.",
            ),
            makeP(
              "Toggle: Add Additional Contact — reveals identical second person form.",
            ),
            makeP(
              "InfoBox: primary contact receives all platform communications.",
            ),

            makeHeading("4.4 Step 3 — Verification", HeadingLevel.HEADING_2),
            makeP(
              "Two verification cards: Email Verification and Mobile Verification.",
            ),
            makeP(
              "Each card shows: contact display, Pending/Verified badge, Send OTP button.",
            ),
            makeP(
              "After Send OTP: 6-box OTPInput + Verify OTP button + 30-second countdown resend timer.",
            ),
            makeP("Verified card: turns green with CheckCircle2 icon."),
            makeP(
              "Both verified: full success screen with congratulations state.",
            ),

            makeHeading(
              "4.5 Step 4 — Campus Configuration (4 Sub-tabs)",
              HeadingLevel.HEADING_2,
            ),
            makeTable(
              ["Sub-tab", "Content"],
              [
                [
                  "Academic",
                  "Academic year, Semester/Annual system, calendar months, batch table (add/remove), course type checkboxes",
                ],
                [
                  "Departments",
                  "Add/remove department cards — Name, HOD Name, HOD Email, Student Count. Pre-filled with 3 samples.",
                ],
                [
                  "Branding",
                  "Logo drag-drop upload, Primary colour picker, Secondary colour picker, Tagline text",
                ],
                [
                  "Settings",
                  "4 toggles: Email Notifications, SMS Alerts, Auto-approval, Public placement statistics",
                ],
              ],
              [2000, 7000],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "4.6 Step 5 — Faculty & Placement Team Setup",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Faculty table rows: Name, Email, Designation, Role dropdown, Department, Active/Inactive toggle. Add/remove rows. Pre-filled with 3 sample entries.",
            ),
            makeP(
              "Permissions matrix: rows = 5 roles, columns = 6 permissions, each cell = checkbox.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["Role", "Permissions (checkboxes)"],
              [
                [
                  "Admin",
                  "View Students · Edit Students · Manage Placements · View Reports · Manage Faculty · Billing Access",
                ],
                [
                  "Placement Officer",
                  "View Students · Edit Students · Manage Placements · View Reports · — · —",
                ],
                ["Faculty", "View Students · — · — · View Reports · — · —"],
                [
                  "Coordinator",
                  "View Students · Edit Students · Manage Placements · View Reports · — · —",
                ],
                ["Viewer", "View Students · — · — · View Reports · — · —"],
              ],
              [2500, 6500],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "4.7 Step 6 — Student Onboarding (3 Tabs)",
              HeadingLevel.HEADING_2,
            ),
            makeTable(
              ["Tab", "Functionality"],
              [
                [
                  "Bulk Upload",
                  "FileDropZone (.csv/.xlsx) → simulated progress → success with record count. Download template button. Column mapping dropdowns.",
                ],
                [
                  "Manual Registration",
                  "Name, Roll No, Email, Mobile, Department, Batch, Course form. Add Student appends to list. Each entry removable.",
                ],
                [
                  "Invite Link",
                  "Generated URL in monospace. Copy + QR code buttons. Expiry date picker. Max uses input. Sent invites count.",
                ],
              ],
              [2500, 6500],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "4.8 Step 7 — Career & Placement Configuration (4 Sub-tabs)",
              HeadingLevel.HEADING_2,
            ),
            makeTable(
              ["Sub-tab", "Content"],
              [
                [
                  "Target Roles",
                  "TagInput for role chips, industry sector chips, package range (min/max LPA)",
                ],
                [
                  "Roadmaps",
                  "Per-department AI roadmap toggle, visibility radio: Students / Faculty / Both",
                ],
                [
                  "Assessments",
                  "4 toggles: Aptitude Test, Coding Assessment, Communication Test, Technical Test. Each has Configure link.",
                ],
                [
                  "Eligibility",
                  "Min CGPA slider (0-10), backlogs allowed radio (0/1/2/Any), attendance %, custom criteria textarea",
                ],
              ],
              [2000, 7000],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "4.9 Step 8 — Dashboard Initialization",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "5 dashboard cards: Institution Overview, Placement Analytics, Faculty Dashboard, Student Activity, Career Insights.",
            ),
            makeP(
              "Each card: name, description, screenshot placeholder, Activate toggle, expandable widget checklist, Preview Dashboard button.",
            ),

            makeHeading(
              "4.10 Step 9 — Subscription & Billing",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Two-column layout: 60% plan selector | 40% sticky order summary.",
            ),
            makeTable(
              ["Plan", "Price", "Students", "Badge"],
              [
                ["Starter", "Free", "200", "—"],
                ["Growth", "₹49/student/sem", "1,000", "Most Popular"],
                ["Professional", "₹79/student/sem", "5,000", "—"],
                ["Enterprise", "Custom", "Unlimited", "Best Value"],
              ],
            ),
            new Paragraph({ spacing: { after: 100 } }),
            makeP(
              "Add-ons (checkboxes): AI Career Counselling +₹15 · Advanced Analytics +₹10 · Custom Integrations +₹25 · White-label Branding +₹20.",
            ),
            makeP(
              "Coupon: code LAUNCH30 applies 30% discount (shown as green success state).",
            ),
            makeP(
              "Payment methods (radio cards): Credit/Debit Card (reveals card fields) · Net Banking (bank dropdown) · UPI (UPI ID input) · Bank Transfer (shows account details).",
            ),
            makeP(
              "Order summary: plan + add-ons + subtotal + GST 18% + coupon discount + total + Pay Now button.",
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 5 — STUDENT PORTAL ── */
            makeHeading(
              "5. Student Portal — 7-Step Wizard",
              HeadingLevel.HEADING_1,
            ),
            makeTable(
              ["Phase", "Steps"],
              [
                ["Onboarding", "1, 2"],
                ["Verification", "3"],
                ["Assessment", "4"],
                ["Goals & Roadmap", "5, 6"],
                ["Dashboard", "7"],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),
            makeP(
              "Step 7 (Dashboard): no Continue button, replaced by Open Full Portal (amber). Dashboard content is full-bleed (no horizontal padding).",
            ),

            makeHeading(
              "5.1 Step 1 — Student Onboarding",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Tab: Email/Mobile — Fields: Email, Mobile, Password (show/hide), Confirm Password, College dropdown.",
            ),
            makeP(
              "Tab: Social Login — Google button (white, inline SVG logo) + LinkedIn button (blue bg, inline SVG logo) + email fallback link.",
            ),
            makeP("OTP Verification section (below both tabs):"),
            makeP(
              "Two cards (Email + Mobile) each showing: contact info, badge, Send OTP → 6-box input + Verify + 30s countdown.",
              { indent: 360 },
            ),
            makeP(
              "Card turns green on verify. Both verified → Account Created! success screen.",
              { indent: 360 },
            ),

            makeHeading(
              "5.2 Step 2 — Student Profile (4 Sub-tabs)",
              HeadingLevel.HEADING_2,
            ),
            makeTable(
              ["Sub-tab", "Fields & Behaviour"],
              [
                [
                  "Personal",
                  "Circular photo upload (preview + edit overlay). Grid: Full Name, DOB, Gender, Mobile, Email, Address, LinkedIn, GitHub, Portfolio.",
                ],
                [
                  "Education",
                  "College, Course, Department, Current Semester (1-8), Graduation Year, CGPA, Percentage, Academic Achievements textarea.",
                ],
                [
                  "Skills",
                  "4 TagInput components: Technical Skills, Programming Languages, Tools & Technologies, Soft Skills. Certifications: add/remove cards (Name, Issuer, Year).",
                ],
                [
                  "Experience",
                  "Cards: type badge, title, org·duration, description, remove button. Add form: Type dropdown, Title, Organisation, Duration, Description.",
                ],
              ],
              [2000, 7000],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "5.3 Step 3 — Skill Verification",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Two-column layout: 220px skill list left | verification panel right.",
            ),
            makeP(
              "Summary bar: 3 clickable stat cards (Verified green · In Progress amber · Not Started gray) that filter the skill list.",
            ),
            makeP(
              "12 default skills across Technical, Language, and Tools categories.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["Status", "Color", "Meaning"],
              [
                [
                  "Not Started",
                  "Gray dot",
                  "No method selected, skill not on CV",
                ],
                [
                  "In Progress",
                  "Amber dot",
                  "Method selected, verification pending or submitted",
                ],
                ["Verified", "Green dot + Check", "Confirmed — appears on CV"],
              ],
            ),
            new Paragraph({ spacing: { after: 120 } }),
            makeTable(
              ["Method", "Full Interaction"],
              [
                [
                  "Online Assessment",
                  "Start Assessment → 3 MCQs one at a time with progress bar → Submit → score 88% → auto-verified",
                ],
                [
                  "Coding Challenge",
                  "Challenge brief + difficulty badge + dark-theme code textarea → Submit Solution → 1.2s evaluating spinner → verified 82%",
                ],
                [
                  "Project Submission",
                  "Project URL + description textarea (min 20 chars) + file upload → Submit → in_progress with awaiting review note",
                ],
                [
                  "GitHub Repository",
                  "URL input → Analyze (2s spinner) → commit/star/language stats + score bar → Request Verification → verified",
                ],
                [
                  "Mentor Verification",
                  "Mentor dropdown (3 options) + evidence textarea → Send Request → amber awaiting panel",
                ],
                [
                  "Admin Approval",
                  "Evidence textarea (min 30 chars) + document upload → Submit for Review → rose submitted panel",
                ],
              ],
              [2800, 6200],
            ),
            new Paragraph({ spacing: { after: 120 } }),
            makeP(
              "CV visibility banner (bottom): live count + names of verified skills. Note: Only verified skills appear on your CV.",
            ),

            makeHeading(
              "5.4 Step 4 — AI Career Counselling",
              HeadingLevel.HEADING_2,
            ),
            makeP("Sub-tab: Personal Assessment"),
            makeP(
              "Interest chips (max 3): Technology, Design, Data, Management, Finance, Healthcare, Education, Marketing.",
              { indent: 360 },
            ),
            makeP("Career Aspirations textarea.", { indent: 360 }),
            makeP(
              "Strengths TagInput (green) + Weaknesses TagInput (amber) side by side.",
              { indent: 360 },
            ),
            makeP(
              "Learning Style 2×2 grid: Visual / Auditory / Read-Write / Kinesthetic.",
              { indent: 360 },
            ),
            makeP(
              "Work Environment 2×2 grid: Remote / Hybrid / On-site / Flexible.",
              { indent: 360 },
            ),
            makeP(
              "Personality Type optional select: MBTI 16 types + RIASEC 6 types.",
              { indent: 360 },
            ),
            makeP("Sub-tab: Technical Assessment"),
            makeP(
              "6 range sliders (0-10) with live navy score badge: Programming, Aptitude, Logical Reasoning, Problem Solving, Communication, English Proficiency.",
              { indent: 360 },
            ),
            makeP(
              "6 mini progress bar score cards with colour coding (green ≥7, amber ≥5, red <5).",
              { indent: 360 },
            ),
            makeP(
              "Analyze My Profile with AI button → analyzing=true → 2200ms setTimeout → analyzed=true → switch to Results tab.",
              { indent: 360 },
            ),
            makeP("Sub-tab: AI Results"),
            makeP(
              "While analyzing: Brain icon pulse, progress bar animation.",
              { indent: 360 },
            ),
            makeP(
              "After analyzed: navy gradient card with top 3 career fits (Full Stack 92%, Data Analyst 78%, Product Manager 65%).",
              { indent: 360 },
            ),
            makeP(
              "Strengths chips (green) + Improvement areas chips (amber) side by side.",
              { indent: 360 },
            ),
            makeP("Learning path: chips connected by ArrowRight icons.", {
              indent: 360,
            }),
            makeP(
              "Stats: ~8 months to job-ready + recommended certifications list.",
              { indent: 360 },
            ),

            makeHeading(
              "5.5 Step 5 — Career Goal Setup",
              HeadingLevel.HEADING_2,
            ),
            makeTable(
              ["Section", "Interaction"],
              [
                [
                  "Target Role",
                  "10 role cards 2-column grid, single-select, Check icon on active",
                ],
                [
                  "Preferred Domain",
                  "Multi-select pill chips — 8 domain options",
                ],
                [
                  "Target Companies",
                  "Multi-select emoji pill chips (8 defaults) + custom text input + Add button",
                ],
                ["Location", "City text, State dropdown, Country dropdown"],
                ["Work Mode", "3 pill selectors: Remote / Hybrid / On-site"],
                [
                  "Salary",
                  "Negotiable toggle — if off: Min LPA + Max LPA number inputs",
                ],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "5.6 Step 6 — AI Roadmap Generator",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Initial: summary chip strip + Generate My Personalized Roadmap gradient button.",
            ),
            makeP(
              "Loading (2500ms): spinning border circle, 4 animated status lines.",
            ),
            makeP(
              "Generated: 4-phase vertical timeline with left circle + right content card.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["Phase", "Months", "Color", "Content"],
              [
                [
                  "1 — Foundation",
                  "1–2",
                  "Emerald",
                  "HTML/CSS/JS/Git · Portfolio site project · milestone",
                ],
                [
                  "2 — Core Skills",
                  "3–5",
                  "Navy",
                  "React/Node.js/REST/SQL · Task manager project · milestone",
                ],
                [
                  "3 — Advanced",
                  "6–8",
                  "Amber",
                  "System Design/TypeScript/Docker/AWS · E-Commerce project · milestone",
                ],
                [
                  "4 — Interview Prep",
                  "9–10",
                  "Purple",
                  "DSA/Mock Interviews/Resume Polish · OSS contribution · milestone",
                ],
              ],
            ),
            new Paragraph({ spacing: { after: 120 } }),
            makeP(
              "Bottom grid: Certifications list (numbered) + Internship recommendation card. Regenerate button top right.",
            ),

            makeHeading(
              "5.7 Step 7 — Student Dashboard (Full-bleed)",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Banner: dark navy gradient, avatar initials, name, course + CGPA, track pill, completion pill.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["Row", "Content"],
              [
                [
                  "Row 1 — Stat Cards",
                  "Roadmap Progress 45% · Readiness Score 68% · Skills Verified 12/20 · Days to Placement 187",
                ],
                [
                  "Row 2 — Career Insights",
                  "Recommended path (92% fit) · Strengths green · Improve amber · ~5 months remaining",
                ],
                [
                  "Row 3 — Progress Rings",
                  "Roadmap phases bar + CircleGauge rings: Overall 68% · Full Stack 72% · Google 45%",
                ],
                [
                  "Row 4 — Skill Progress",
                  "Verified (5 green tags) · In Progress (3 blue tags) · Pending (4 gray tags)",
                ],
                [
                  "Row 5 — Projects & Tests",
                  "3 project items + 2 recommended + 3 completed assessments + 2 upcoming with countdown",
                ],
                [
                  "Row 6 — CV & AI Recs",
                  "Dynamic CV (Preview/Share tabs, PDF/DOCX export) + 5 AI recommendation items",
                ],
                [
                  "Row 7 — Notifications",
                  "5 items, click to dismiss, unread = blue dot + highlighted background",
                ],
              ],
              [3000, 6000],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 6 — BEHAVIOURS ── */
            makeHeading(
              "6. Key Behaviours & Interactions",
              HeadingLevel.HEADING_1,
            ),
            makeTable(
              ["Feature", "Behaviour"],
              [
                [
                  "AI simulation",
                  "setTimeout(2200ms) for career analysis, setTimeout(2500ms) for roadmap. Animated loading state during delay.",
                ],
                [
                  "OTP inputs",
                  "6 individual inputs, auto-advance on keypress, backspace navigates back, paste fills all 6.",
                ],
                [
                  "Tag inputs",
                  "Enter or comma adds tag, X button removes it, flexible-wrap container.",
                ],
                [
                  "File upload",
                  "Drag-and-drop + click to open picker, setInterval simulates progress bar to 100%.",
                ],
                [
                  "Sidebar nav",
                  "Completed steps clickable (navigate back), future steps locked (opacity-40, cursor-default).",
                ],
                [
                  "Portal switching",
                  "Header pills switch college ↔ student. Home button returns to landing page.",
                ],
                [
                  "FAQ accordion",
                  "Single open at a time, ChevronDown rotates 180° when open.",
                ],
                [
                  "Skill verification",
                  "Method selection sets status to in_progress. Completing flow calls markVerified(score).",
                ],
                [
                  "CV visibility",
                  "Only skills with status === 'verified' appear in CV banner and exported CV.",
                ],
                [
                  "Notification dismiss",
                  "Click removes ID from activeNotifs array, card loses highlight and blue dot.",
                ],
                [
                  "Coupon code",
                  "Code LAUNCH30 applies 30% discount, shown as green success with savings amount.",
                ],
                [
                  "Quiz flow",
                  "3 questions one at a time, answer selection enables Next, final Submit triggers verification.",
                ],
              ],
              [3200, 5800],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 7 — ICONS ── */
            makeHeading("7. Icon Library", HeadingLevel.HEADING_1),
            makeP(
              "All icons from lucide-react. Inline SVG used only for Google and LinkedIn logos in Social Login.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Building2 · User · Mail · FileText · ShieldCheck · CreditCard · Settings · Users · GraduationCap · Target · LayoutDashboard · ChevronRight · Check · Upload · X · Eye · EyeOff · Clock · CheckCircle2 · XCircle · Pause · RefreshCw · Star · Zap · Building · Globe · Phone · Hash · Calendar · MapPin · Download · Info · ArrowLeft · Plus · Trash2 · BookOpen · BarChart2 · Briefcase · UserCheck · Send · FileSpreadsheet · Shield · Bell · PieChart · TrendingUp · ClipboardList · ChevronDown · AlertCircle · UserPlus · Sparkles · Award · Code · ExternalLink · Link · MessageSquare · Lightbulb · Rocket · Timer · Layers · Activity · Flag · ArrowRight · Edit3 · Route · Brain · BookMarked · Cpu · Wrench · PlayCircle · ThumbsUp · LogIn · Lock · ToggleLeft · ToggleRight · LogOut · Filter · MoreVertical · UserCheck · TrendingDown",
                  size: 18,
                  color: "5A6A8A",
                  font: "Courier New",
                }),
              ],
              spacing: { after: 200 },
            }),

            /* ── SECTION 8 — AUTH SCREENS ── */
            makeHeading("8. Authentication Screens", HeadingLevel.HEADING_1),
            makeP(
              "Three standalone full-page auth screens rendered based on mode state. All use the AuthCard centred layout (max-width 440px, white card with navy box-shadow).",
            ),
            new Paragraph({ spacing: { after: 120 } }),
            makeTable(
              ["Screen", "Route Mode", "On Success"],
              [
                [
                  "Student Login",
                  "student-login",
                  "Routes to student (Student Portal)",
                ],
                [
                  "Admin Login",
                  "admin-login",
                  "Routes to super-admin (Super Admin Panel)",
                ],
                [
                  "Student Register",
                  "student-register",
                  "Routes to student (Student Portal)",
                ],
              ],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading("8.1 Student Login", HeadingLevel.HEADING_2),
            makeP(
              "AuthHeader: GraduationCap icon + 'Student Sign In' title. Two-tab toggle: Email & Password | Mobile OTP.",
            ),
            makeTable(
              ["Tab", "Fields & Behaviour"],
              [
                [
                  "Email & Password",
                  "Email (Mail icon). Password (Eye/EyeOff toggle). Forgot password link. Remember me checkbox.",
                ],
                [
                  "Mobile OTP",
                  "+91 prefix + 10-digit phone. Send OTP reveals 6-box OTPRow + Resend. Submit verifies OTP.",
                ],
              ],
              [2500, 6500],
            ),
            new Paragraph({ spacing: { after: 100 } }),
            makeP(
              "Social row: Google + LinkedIn buttons with 'or continue with' divider. Footer: Create Account link + Back to Home.",
            ),

            makeHeading("8.2 Admin Login", HeadingLevel.HEADING_2),
            makeP(
              "ShieldCheck icon + Admin amber badge. Security notice banner. Two-phase flow:",
            ),
            makeTable(
              ["Phase", "Fields"],
              [
                [
                  "Credentials",
                  "Role dropdown (4 roles). Institution dropdown (shown for college-level roles). Email. Password. Security badges: 256-bit SSL, IP Allowlist, Audit Log, 2FA Required.",
                ],
                [
                  "2FA",
                  "Auto-shown after 1500ms credential check. 6-box authenticator OTP. 'Code resets every 30 seconds'. Back to credentials link.",
                ],
              ],
              [1800, 7200],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading(
              "8.3 Student Registration — 3-Step Wizard",
              HeadingLevel.HEADING_2,
            ),
            makeP(
              "Progress stepper: 3 circles with connector lines. Completed = green Check, active = navy, future = gray.",
            ),
            makeTable(
              ["Step", "Fields & Behaviour"],
              [
                [
                  "1 — Personal Details",
                  "Full Name, Email, Mobile (+91), Password (min 8 chars), Confirm Password with match indicator. Google + LinkedIn social sign-up.",
                ],
                [
                  "2 — Verify Identity",
                  "Email OTP card + Mobile OTP card — each independent. Both must be verified (green) before Continue is enabled.",
                ],
                [
                  "3 — College & Course",
                  "College dropdown, Department dropdown, Year dropdown, Roll No (optional). Terms & Privacy checkbox required.",
                ],
              ],
              [2200, 6800],
            ),
            new Paragraph({ spacing: { after: 100 } }),
            makeP(
              "Done screen: emerald Check circle, welcome heading, 3 confirmation chips, AI Assessment unlocked badge. 'Go to My Portal' CTA.",
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 9 — SUPER ADMIN ── */
            makeHeading("9. Super Admin Panel", HeadingLevel.HEADING_1),
            makeP(
              "Reached after Admin Login + 2FA verification. Full-page layout: dark #0A1629 top bar + dark #0F1F3B left sidebar (220px) + scrollable main content.",
            ),
            makeTable(
              ["Layout Element", "Details"],
              [
                [
                  "Top Bar",
                  "Logo + Shield icon. 'Platform Admin Access' animated amber pulsing badge. Bell (notification dropdown). Admin avatar + email. Exit button.",
                ],
                [
                  "Sidebar",
                  "7 nav items with icons. Active = bg-white/10 + white text + vertical pill. Pending badge on Colleges. Sign Out at bottom.",
                ],
                [
                  "Breadcrumb",
                  "Sticky sub-bar: Admin > [Section] with ChevronRight.",
                ],
              ],
              [2000, 7000],
            ),
            new Paragraph({ spacing: { after: 160 } }),

            makeHeading("9.1 Dashboard", HeadingLevel.HEADING_2),
            makeP(
              "4 KPI cards (2x2 grid): Total Colleges · Total Students · Placement Rate · MRR. Each: icon with tinted bg, value (DM Serif 24px), +/- change with TrendingUp/Down.",
            ),
            makeP(
              "Student Growth AreaChart (Recharts): Jan-Jul 2026, navy gradient fill. Plan Distribution PieChart: donut with 3 slices + legend.",
            ),
            makeP(
              "Pending Approvals amber banner: lists colleges awaiting approval with inline Approve/Reject buttons.",
            ),
            makeP(
              "Recent Activity feed: 5 latest audit events with type icon, action, target, and timestamp.",
            ),

            makeHeading("9.2 College Management", HeadingLevel.HEADING_2),
            makeP(
              "Search + status filter tabs + Export. Table: Institution, Location, Students, Plan, Status, Revenue, Actions (Eye / Approve-Pause / More).",
            ),
            makeP(
              "Click Eye -> College Detail: metrics grid, contact card, subscription card with Change Plan button. Context-aware action buttons (Approve/Suspend/Reinstate).",
            ),

            makeHeading("9.3 Student Management", HeadingLevel.HEADING_2),
            makeP(
              "Searchable table: Student (avatar initials + name + email), College, Dept, Year, Score (inline progress bar), Status, Placed indicator.",
            ),

            makeHeading("9.4 Analytics", HeadingLevel.HEADING_2),
            makeP(
              "4 panels: College Onboarding BarChart · Placement Rate LineChart (amber) · Revenue AreaChart (amber gradient) · Top Metrics static panel with 6 KPIs.",
            ),

            makeHeading("9.5 Subscriptions & Billing", HeadingLevel.HEADING_2),
            makeP(
              "3 KPI cards + 3 plan breakdown cards (Starter/Growth/Enterprise with revenue contribution) + Recent Transactions table.",
            ),

            makeHeading("9.6 Audit Logs", HeadingLevel.HEADING_2),
            makeP(
              "Type filter tabs: All/College/Billing/Security/System/Data. Rows: coloured icon, actor->target, split timestamp, type badge. Export Logs button.",
            ),

            makeHeading("9.7 Settings", HeadingLevel.HEADING_2),
            makeP(
              "General Config (4 read-only fields + Edit3 icon). Feature Flag groups (4 groups, 10 toggles total). Danger Zone with 3 Execute actions (Clear Cache, Reset Demo, Force Password Reset).",
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 10 — BEHAVIOURS ── */
            makeHeading(
              "10. Key Behaviours & Interactions",
              HeadingLevel.HEADING_1,
            ),
            makeTable(
              ["Feature", "Behaviour"],
              [
                [
                  "AI simulation",
                  "setTimeout(2200ms) career analysis, setTimeout(2500ms) roadmap. Animated loading state during delay.",
                ],
                [
                  "OTP inputs",
                  "6 individual inputs, auto-advance on keypress, backspace navigates back, paste fills all 6.",
                ],
                [
                  "Tag inputs",
                  "Enter or comma adds tag, X removes, flexible-wrap container.",
                ],
                [
                  "File upload",
                  "Drag-and-drop + click to open picker, simulated progress bar.",
                ],
                [
                  "Sidebar nav",
                  "Completed steps clickable, future steps locked (opacity-40, cursor-default).",
                ],
                [
                  "Portal switching",
                  "Header pills switch college <-> student. Home returns to landing.",
                ],
                [
                  "FAQ accordion",
                  "Single open at a time, ChevronDown rotates 180 degrees when open.",
                ],
                [
                  "Skill verification",
                  "Method selection sets status to in_progress. Completing calls markVerified(score).",
                ],
                [
                  "CV visibility",
                  "Only status === 'verified' skills appear in CV and export.",
                ],
                [
                  "Admin 2FA",
                  "Credentials phase (1500ms) -> setTwoFA(true) -> OTP phase. Verify OTP -> super-admin.",
                ],
                [
                  "Auth tab toggle",
                  "Switching Login tabs resets error, otpSent, and otp value.",
                ],
                [
                  "Student reg. steps",
                  "Both Email OTP and Phone OTP must be independently verified before step 2 can Continue.",
                ],
                [
                  "Feature flag toggle",
                  "Instant client-side flags[key] = !flags[key]. Simulates real toggle behaviour.",
                ],
                [
                  "College detail drill",
                  "Eye icon sets selectedCollege state, replaces list with detail. Back clears selection.",
                ],
                [
                  "Coupon code",
                  "LAUNCH30 applies 30% discount, green success with savings amount.",
                ],
                [
                  "Notification dismiss",
                  "Click removes ID from activeNotifs[], card loses highlight and blue dot.",
                ],
              ],
              [3000, 6000],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 11 — STATE MANAGEMENT ── */
            makeHeading("11. State Management Summary", HeadingLevel.HEADING_1),
            makeP(
              "No backend, no API calls. All state is React useState within each component. Files split across src/components/ to stay under Babel's 500KB deoptimisation limit.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["File / Component", "Key State Variables"],
              [
                [
                  "App.tsx",
                  "mode: 'home'|'college'|'student'|'lms'|'fsd'|'student-login'|'admin-login'|'student-register'|'super-admin'|'project-prompt'",
                ],
                ["CollegePortal", "step: 1-9"],
                ["StudentPortal", "step: 1-8"],
                [
                  "StudentLogin",
                  "tab, email, pwd, phone, otp, otpSent, loading, error, remember",
                ],
                ["AdminLogin", "email, pwd, role, twoFA, otp, loading, error"],
                [
                  "StudentRegister",
                  "step, all form fields, emailVerified, phoneVerified, terms",
                ],
                [
                  "SuperAdminPanel",
                  "section: AdminSection (dashboard|colleges|students|analytics|subscriptions|audit|settings|lms-admin), notifOpen",
                ],
                ["LMSModule", "section: LMSSection, activeCourse: Course|null"],
                [
                  "CoursePlayer",
                  "currentLessonId, sidebarOpen, playing, progress, volume, speed, tab, notes[], qaQuestions[]",
                ],
                [
                  "LMSAdminSection",
                  "view: 'list'|'form', courses: AdminCourse[], editing: AdminCourse|undefined",
                ],
                ["CollegesSection", "search, filter, selected (College|null)"],
                ["AuditSection", "typeFilter"],
                ["SettingsSection", "flags: Record<string, boolean>"],
                [
                  "SS3 AI Assessment",
                  "analyzing, analyzed, scores{}, interests[], tab",
                ],
                ["SS6 Roadmap", "generating, generated"],
                [
                  "SSSkillVerify",
                  "skills[], selectedId, filter, quizStep, quizScore, ghUrl, ghResult, mentorSent, adminSent, codeSubmitted",
                ],
                ["SSCVGenerator", "cvData{}, exporting"],
                ["SS8 Dashboard", "activeNotifs[], cvTab"],
              ],
              [3200, 5800],
            ),
            new Paragraph({ spacing: { after: 200 } }),

            /* ── SECTION 12 — FILE ARCHITECTURE ── */
            makeHeading("12. File Architecture", HeadingLevel.HEADING_1),
            makeP(
              "App.tsx was split from a 5440-line / 328KB monolith into 11 files to resolve Babel's 500KB deoptimisation error. Each file is under 80KB.",
            ),
            new Paragraph({ spacing: { after: 80 } }),
            makeTable(
              ["File", "Size", "Contents"],
              [
                [
                  "src/app/App.tsx",
                  "~1KB",
                  "Root App: mode state + routing only",
                ],
                [
                  "src/components/shared.tsx",
                  "12KB",
                  "STEPS config, inputCls, SectionTitle, Field, Input, Select, InfoBox, Tag, OTPInput, FileDropZone, Toggle",
                ],
                [
                  "src/components/college-steps.tsx",
                  "76KB",
                  "Step1-Step9 (College Portal wizard)",
                ],
                [
                  "src/components/student-steps.tsx",
                  "80KB",
                  "CircleGauge, TagInput, ProgressBar, SS1-SS6",
                ],
                [
                  "src/components/skill-verify.tsx",
                  "32KB",
                  "SSSkillVerify: 6-method skill verification",
                ],
                [
                  "src/components/cv-generator.tsx",
                  "40KB",
                  "SSCVGenerator: ATS CV builder + docx export",
                ],
                [
                  "src/components/portals.tsx",
                  "20KB",
                  "StudentPortal, CollegePortal, STUDENT_STEPS, STUDENT_PHASES",
                ],
                [
                  "src/components/home.tsx",
                  "32KB",
                  "HomePage: full marketing landing page",
                ],
                [
                  "src/components/fsd.tsx",
                  "44KB+",
                  "FSDPage: this document, Word export via docx + file-saver",
                ],
                [
                  "src/components/auth.tsx",
                  "36KB",
                  "StudentLogin, AdminLogin, StudentRegister",
                ],
                [
                  "src/components/super-admin.tsx",
                  "64KB",
                  "SuperAdminPanel: 8-section admin module with Recharts (imports lms-admin)",
                ],
                [
                  "src/components/lms-admin.tsx",
                  "80KB",
                  "LMSAdminSection: Udemy-style course builder (CourseList, CourseForm, SectionEditor, LessonEditor, VideoUploadZone)",
                ],
                [
                  "src/components/lms.tsx",
                  "60KB",
                  "LMSModule: student LMS dashboard + catalog + CoursePlayerAdapter (imports course-player)",
                ],
                [
                  "src/components/course-player.tsx",
                  "50KB",
                  "CoursePlayer: standalone Udemy-style video player with sidebar, tabs, quiz, assignment",
                ],
              ],
              [3800, 1000, 4200],
            ),
            new Paragraph({ spacing: { after: 400 } }),

            /* ── FOOTER ── */
            new Paragraph({
              children: [
                new TextRun({
                  text: "EduConnect Functional Specification Document  |  Version 2.0  |  July 2026  |  EduConnect Technologies Pvt. Ltd.",
                  size: 18,
                  color: "9AA5BE",
                  italics: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              border: {
                top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
              },
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "EduConnect-Functional-Specification.docx");
    setGenerating(false);
    setDone(true);
  };

  const sections = [
    { num: "1", title: "Overview", pages: "1" },
    { num: "2", title: "Design System", pages: "2" },
    { num: "3", title: "Home Page", pages: "3–5" },
    { num: "4", title: "College Portal — 9 Steps", pages: "5–12" },
    { num: "5", title: "Student Portal — 8 Steps", pages: "12–22" },
    { num: "6", title: "CV Generator & Skill Verification", pages: "22–24" },
    { num: "7", title: "Icon Library", pages: "25" },
    { num: "8", title: "Authentication Screens", pages: "26–28" },
    { num: "9", title: "Super Admin Panel — 7 Screens", pages: "28–34" },
    { num: "10", title: "Key Behaviours & Interactions", pages: "35" },
    { num: "11", title: "State Management Summary", pages: "36" },
    { num: "12", title: "File Architecture", pages: "37" },
  ];

  return (
    <div
      className="min-h-screen w-full bg-[#F4F6FB]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <header className="bg-[#1B3A6B] sticky top-0 z-50">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-7 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center">
              <GraduationCap size={17} className="text-white" />
            </div>
            <span className="text-white font-semibold text-[13px] sm:text-[14px] truncate">
              EduConnect
            </span>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[11.5px] sm:text-[12.5px] text-white/60 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft size={13} /> Back to App
          </button>
        </div>
      </header>

      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-7 py-8 sm:py-10 lg:py-12">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1B3A6B] mb-4 sm:mb-5 shadow-lg"> <FileText size={28} className="text-white" />
          </div>
          <h1
            className="text-[27px] sm:text-[32px] lg:text-[38px] font-bold text-[#0F1C3F] mb-2 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Functional Specification Document
          </h1>
          <p className="text-[13px] sm:text-[14px] lg:text-[16px] text-[#5A6A8A] mb-1 leading-relaxed">
            EduConnect — AI-Powered College Placement & Career Platform
          </p>
         <p className="text-[13px] sm:text-[14px] lg:text-[16px] text-[#5A6A8A] mb-1 leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Version 3.0 · 12 Sections · ~40 pages
          </p> 
        </div>

        {/* Table of contents */}
       <div className="bg-white border border-[--border] rounded-2xl p-4 sm:p-5 lg:p-6 mb-5 sm:mb-6 shadow-sm">
          <p className="text-[11px] sm:text-[12px] lg:text-[13px] font-semibold text-[#9AA5BE] uppercase tracking-widest mb-3 sm:mb-4">
            Table of Contents
          </p>
          <div className="space-y-2">
            {sections.map((s) => (
              <div key={s.num} className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-2 border-b border-[--border] last:border-0">
                <span className="w-6 h-6 rounded-lg bg-[#EBF1FA] text-[#1B3A6B] text-[11px] font-bold flex items-center justify-center shrink-0">
                  {s.num}
                </span>
                <span className="flex-1 min-w-0 text-[12px] sm:text-[13px] lg:text-[13.5px] text-[#0F1C3F] font-medium leading-relaxed">
                  {s.title}
                </span>
                <span className="text-[10px] sm:text-[11px] lg:text-[12px] text-[#9AA5BE] shrink-0"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  p. {s.pages}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Document details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: "Sections", value: "12" },
            { label: "Modules Covered", value: "6" },
            { label: "Total Steps Documented", value: "20" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-[--border] rounded-xl p-4 sm:p-5 text-center shadow-sm"
            >
              <p className="text-[25px] sm:text-[28px] font-bold text-[#1B3A6B]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {s.value}
              </p>
              <p className="text-[12px] text-[#5A6A8A] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Download button */}
        <div className="bg-white border-2 border-[--border] rounded-2xl p-5 sm:p-6 lg:p-8 text-center shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[11.5px] sm:text-[12px] lg:text-[13px] text-[#5A6A8A] leading-relaxed">
              Ready to download · Microsoft Word (.docx) · Calibri font ·
              Formatted tables
            </p>
          </div>
          <p className="text-[11px] sm:text-[12px] text-[#9AA5BE] mb-6 sm:mb-7 leading-relaxed max-w-2xl mx-auto">
            Includes all 12 sections — Auth Screens, Super Admin Panel, File
            Architecture + all existing modules
          </p>

          {done ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <p className="text-[14px] sm:text-[15px] font-semibold text-emerald-700">
                Download Complete!
              </p>
              <p className="text-[12px] sm:text-[13px] text-[#5A6A8A] leading-relaxed max-w-lg">
                EduConnect-Functional-Specification.docx saved to your Downloads
                folder.
              </p>
              <button
                onClick={() => {
                  setDone(false);
                  setGenerating(false);
                }}
                className="mt-2 text-[13px] text-[#1B3A6B] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={13} /> Download Again
              </button>
            </div>
          ) : (
            <button
              onClick={generateDoc}
              disabled={generating}
             className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#1B3A6B] text-white text-[13px] sm:text-[15px] font-semibold rounded-xl hover:bg-[#122748] disabled:opacity-60 transition-all shadow-md hover:shadow-lg" >
              {generating ? (
                <>
                  <RefreshCw size={17} className="animate-spin" /> Generating
                  Document…
                </>
              ) : (
                <>
                  <Download size={17} /> Download Word Document
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] sm:text-[12px] text-[#9AA5BE] mt-4 sm:mt-5 leading-relaxed">
          Open with Microsoft Word, Google Docs, or LibreOffice Writer
        </p>

        {(onPrompt || onSRS) && (
          <div className="mt-6 sm:mt-8 border-t border-[--border] pt-5 sm:pt-6">
            <p className="text-[12px] sm:text-[13px] text-[#5A6A8A] mb-4 text-center">
              Related project documents
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              {onSRS && (
                <button
                  onClick={onSRS}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white text-[13.5px] font-semibold rounded-xl hover:bg-[#122748] transition-colors shadow-sm"
                >
                  <FileText size={15} /> View SRS Document
                </button>
              )}
              {onPrompt && (
                <button
                  onClick={onPrompt}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5border-2 border-[#1B3A6B] text-[#1B3A6B] text-[13.5px] font-semibold rounded-xl hover:bg-[#EBF1FA] transition-colors"
                >
                  <Download size={15} /> Download Rebuild Prompt
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
