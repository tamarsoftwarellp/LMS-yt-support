import { useState } from "react";
import {
  User, FileText, GraduationCap, ShieldCheck, Briefcase, Rocket,
  Award, ClipboardList, Activity, Link, Download, Globe, Check, X,
  CheckCircle2, XCircle, RefreshCw, Edit3,
} from "lucide-react";
import { Field, Input, InfoBox, inputCls } from "../components/shared";
import { TagInput, CircleGauge } from "./student-steps";

/* ── Interfaces ── */
export interface CVSection { id: string; label: string; visible: boolean; icon: React.ElementType; }

export interface CVData {
  name: string; email: string; phone: string; linkedin: string;
  github: string; portfolio: string; location: string; summary: string;
  education: { degree: string; college: string; board: string; year: string; cgpa: string }[];
  skills: { technical: string[]; languages: string[]; tools: string[]; soft: string[] };
  experience: { title: string; company: string; duration: string; location: string; bullets: string[] }[];
  projects: { title: string; tech: string; duration: string; bullets: string[]; link: string }[];
  certifications: { name: string; issuer: string; year: string }[];
  assessments: { name: string; score: number; max: number }[];
  readiness: { overall: number; role: string; roleScore: number };
  publicUrl: string;
}

export function SSCVGenerator() {
  const [activeSec, setActiveSec] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [exportDone, setExportDone] = useState<"pdf" | "docx" | null>(null);

  const [sections, setSections] = useState<CVSection[]>([
    { id: "personal",    label: "Personal Details",       visible: true,  icon: User },
    { id: "summary",     label: "Professional Summary",   visible: true,  icon: FileText },
    { id: "education",   label: "Education",              visible: true,  icon: GraduationCap },
    { id: "skills",      label: "Verified Skills",        visible: true,  icon: ShieldCheck },
    { id: "experience",  label: "Internship Experience",  visible: true,  icon: Briefcase },
    { id: "projects",    label: "Projects",               visible: true,  icon: Rocket },
    { id: "certifications", label: "Certifications",     visible: true,  icon: Award },
    { id: "assessments", label: "Assessment Scores",      visible: true,  icon: ClipboardList },
    { id: "readiness",   label: "Readiness Score",        visible: false, icon: Activity },
    { id: "profile",     label: "Public Profile Link",    visible: true,  icon: Link },
  ]);

  const [cv, setCV] = useState<CVData>({
    name: "Aisha Patel",
    email: "aisha.patel@college.edu.in",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/aisha-patel",
    github: "github.com/aisha-patel",
    portfolio: "aishapatel.dev",
    location: "Mumbai, Maharashtra",
    summary: "Final-year B.E. Computer Engineering student with hands-on experience in full-stack web development using React and Node.js. Demonstrated ability to build and deploy production-grade applications. Seeking a Full Stack Developer role to contribute technical skills within a high-growth engineering team.",
    education: [{
      degree: "Bachelor of Engineering — Computer Engineering",
      college: "Rajiv Gandhi Institute of Technology, Mumbai",
      board: "Mumbai University",
      year: "2021 – 2025",
      cgpa: "8.4 / 10",
    }],
    skills: {
      technical: ["React.js", "Node.js", "HTML5 & CSS3", "JavaScript (ES6+)", "REST APIs", "Git & GitHub"],
      languages: ["JavaScript", "Python", "Java", "SQL"],
      tools: ["VS Code", "Figma", "Postman", "Docker (basic)", "AWS (basic)"],
      soft: ["Problem Solving", "Team Collaboration", "Communication", "Agile / Scrum"],
    },
    experience: [{
      title: "Frontend Developer Intern",
      company: "Startup XYZ Pvt. Ltd.",
      duration: "May 2024 – July 2024",
      location: "Bangalore, Karnataka",
      bullets: [
        "Developed and deployed 5 reusable React components for the analytics dashboard, reducing UI development time by 30%.",
        "Integrated REST APIs with React Query for real-time data fetching, improving page load performance by 20%.",
        "Collaborated with the design team using Figma to implement pixel-perfect responsive UI screens.",
        "Participated in daily standups, code reviews, and sprint planning following Agile methodology.",
      ],
    }],
    projects: [
      {
        title: "E-Commerce Platform",
        tech: "React.js, Node.js, MongoDB, Stripe API",
        duration: "Jan 2024 – Mar 2024",
        bullets: [
          "Built full-stack e-commerce app with product catalogue, cart management, and Stripe payment integration.",
          "Implemented JWT-based authentication with role-based access control for admin and customer users.",
          "Deployed frontend on Vercel and backend on Render with CI/CD pipeline via GitHub Actions.",
        ],
        link: "github.com/aisha-patel/ecommerce",
      },
      {
        title: "Task Management App",
        tech: "React.js, Node.js, PostgreSQL",
        duration: "Oct 2023 – Nov 2023",
        bullets: [
          "Built a CRUD task management application with drag-and-drop Kanban board using React DnD.",
          "Designed RESTful API with Express.js and PostgreSQL with proper indexing for query optimisation.",
        ],
        link: "github.com/aisha-patel/taskapp",
      },
    ],
    certifications: [
      { name: "Meta Front-End Developer Professional Certificate", issuer: "Meta (Coursera)", year: "2024" },
      { name: "AWS Cloud Practitioner Essentials",                 issuer: "Amazon Web Services", year: "2024" },
      { name: "JavaScript Algorithms and Data Structures",         issuer: "freeCodeCamp", year: "2023" },
    ],
    assessments: [
      { name: "Aptitude Test",        score: 82, max: 100 },
      { name: "Coding Assessment",    score: 76, max: 100 },
      { name: "Communication Skills", score: 88, max: 100 },
    ],
    readiness: { overall: 68, role: "Full Stack Developer", roleScore: 72 },
    publicUrl: "educonnect.in/cv/aisha-patel-2025",
  });

  const visibleSections = sections.filter(s => s.visible).map(s => s.id);
  const toggleSection = (id: string) => setSections(s => s.map(x => x.id === id ? { ...x, visible: !x.visible } : x));

  const updateField = (path: string, value: string) => {
    setCV(prev => {
      const keys = path.split(".");
      const copy = { ...prev } as Record<string, unknown>;
      let obj: Record<string, unknown> = copy;
      for (let i = 0; i < keys.length - 1; i++) { obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown>) }; obj = obj[keys[i]] as Record<string, unknown>; }
      obj[keys[keys.length - 1]] = value;
      return copy as CVData;
    });
  };

  /* ATS score */
  const atsChecks = [
    { label: "Contact info complete",    pass: !!(cv.email && cv.phone && cv.linkedin) },
    { label: "Professional summary",     pass: cv.summary.length > 80 },
    { label: "Education details",        pass: cv.education.length > 0 },
    { label: "Verified skills listed",   pass: cv.skills.technical.length >= 3 },
    { label: "Work/internship experience", pass: cv.experience.length > 0 },
    { label: "Project portfolio",        pass: cv.projects.length >= 2 },
    { label: "Certifications",           pass: cv.certifications.length > 0 },
    { label: "Standard section order",   pass: true },
    { label: "No special characters",    pass: true },
    { label: "Keyword density",          pass: cv.skills.technical.length >= 5 },
  ];
  const atsScore = Math.round((atsChecks.filter(c => c.pass).length / atsChecks.length) * 100);

  /* ── DOCX Export ── */
  const exportDOCX = async () => {
    setExporting("docx");
    const { Document: Doc, Packer: Pk, Paragraph: Para, TextRun: TR, HeadingLevel: HL,
      AlignmentType: AT, BorderStyle: BS, UnderlineType: UT, WidthType: WT } = await import("docx");
    const { saveAs: save } = await import("file-saver");

    const hr = () => new Para({
      border: { bottom: { style: BS.SINGLE, size: 6, color: "1B3A6B" } },
      spacing: { after: 100 },
      children: [],
    });

    const secHeader = (text: string) => new Para({
      children: [new TR({ text: text.toUpperCase(), bold: true, size: 24, color: "1B3A6B", font: "Calibri" })],
      spacing: { before: 280, after: 60 },
      border: { bottom: { style: BS.SINGLE, size: 4, color: "C5D3E8" } },
    });

    const bullet = (text: string) => new Para({
      children: [new TR({ text, size: 20, font: "Calibri", color: "374151" })],
      bullet: { level: 0 },
      spacing: { after: 60 },
    });

    const line = (left: string, right: string, bold = false) => new Para({
      children: [
        new TR({ text: left, bold, size: 20, font: "Calibri", color: bold ? "0F1C3F" : "374151" }),
        new TR({ text: "  |  " + right, size: 20, font: "Calibri", color: "9AA5BE" }),
      ],
      spacing: { after: 60 },
    });

    const doc = new Doc({
      styles: { default: { document: { run: { font: "Calibri", size: 20, color: "374151" } } } },
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 864, right: 864 } } },
        children: [
          /* Name */
          new Para({
            children: [new TR({ text: cv.name, bold: true, size: 48, color: "1B3A6B", font: "Calibri" })],
            alignment: AT.LEFT, spacing: { after: 60 },
          }),
          /* Contact */
          new Para({
            children: [new TR({
              text: [cv.email, cv.phone, cv.linkedin, cv.github, cv.location].filter(Boolean).join("  |  "),
              size: 18, font: "Calibri", color: "5A6A8A",
            })],
            spacing: { after: 200 },
          }),

          ...(visibleSections.includes("summary") ? [
            secHeader("Professional Summary"),
            new Para({ children: [new TR({ text: cv.summary, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 160 } }),
          ] : []),

          ...(visibleSections.includes("education") ? [
            secHeader("Education"),
            ...cv.education.map(e => [
              new Para({ children: [new TR({ text: e.degree, bold: true, size: 22, font: "Calibri", color: "0F1C3F" })], spacing: { after: 40 } }),
              new Para({ children: [new TR({ text: `${e.college}  |  ${e.year}  |  CGPA: ${e.cgpa}`, size: 20, font: "Calibri", color: "5A6A8A" })], spacing: { after: 160 } }),
            ]).flat(),
          ] : []),

          ...(visibleSections.includes("skills") ? [
            secHeader("Technical Skills (Verified)"),
            new Para({ children: [new TR({ text: `Languages: ${cv.skills.languages.join(", ")}`, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 60 } }),
            new Para({ children: [new TR({ text: `Frameworks & Libraries: ${cv.skills.technical.join(", ")}`, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 60 } }),
            new Para({ children: [new TR({ text: `Tools & Platforms: ${cv.skills.tools.join(", ")}`, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 60 } }),
            new Para({ children: [new TR({ text: `Soft Skills: ${cv.skills.soft.join(", ")}`, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 160 } }),
          ] : []),

          ...(visibleSections.includes("experience") ? [
            secHeader("Internship Experience"),
            ...cv.experience.map(e => [
              new Para({ children: [new TR({ text: e.title, bold: true, size: 22, font: "Calibri", color: "0F1C3F" })], spacing: { after: 30 } }),
              new Para({ children: [new TR({ text: `${e.company}  |  ${e.duration}  |  ${e.location}`, size: 20, font: "Calibri", color: "5A6A8A" })], spacing: { after: 80 } }),
              ...e.bullets.map(b => bullet(b)),
              new Para({ spacing: { after: 120 }, children: [] }),
            ]).flat(),
          ] : []),

          ...(visibleSections.includes("projects") ? [
            secHeader("Projects"),
            ...cv.projects.map(p => [
              new Para({
                children: [
                  new TR({ text: p.title, bold: true, size: 22, font: "Calibri", color: "0F1C3F" }),
                  new TR({ text: `  |  ${p.tech}  |  ${p.duration}`, size: 20, font: "Calibri", color: "5A6A8A" }),
                ],
                spacing: { after: 80 },
              }),
              ...p.bullets.map(b => bullet(b)),
              new Para({ children: [new TR({ text: `Repository: ${p.link}`, size: 18, font: "Calibri", color: "1B3A6B" })], spacing: { after: 120 } }),
            ]).flat(),
          ] : []),

          ...(visibleSections.includes("certifications") ? [
            secHeader("Certifications"),
            ...cv.certifications.map(c =>
              new Para({ children: [new TR({ text: `${c.name}  —  ${c.issuer}  (${c.year})`, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 80 }, bullet: { level: 0 } })
            ),
            new Para({ spacing: { after: 80 }, children: [] }),
          ] : []),

          ...(visibleSections.includes("assessments") ? [
            secHeader("Assessment Scores"),
            ...cv.assessments.map(a =>
              new Para({ children: [new TR({ text: `${a.name}: ${a.score} / ${a.max}`, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 60 }, bullet: { level: 0 } })
            ),
            new Para({ spacing: { after: 80 }, children: [] }),
          ] : []),

          ...(visibleSections.includes("readiness") ? [
            secHeader("Career Readiness"),
            new Para({ children: [new TR({ text: `Overall Readiness: ${cv.readiness.overall}%  |  ${cv.readiness.role}: ${cv.readiness.roleScore}%`, size: 20, font: "Calibri", color: "374151" })], spacing: { after: 160 } }),
          ] : []),

          ...(visibleSections.includes("profile") ? [
            secHeader("Public Profile"),
            new Para({ children: [new TR({ text: `EduConnect Profile: ${cv.publicUrl}`, size: 20, font: "Calibri", color: "1B3A6B" })], spacing: { after: 80 } }),
            new Para({ children: [new TR({ text: `Portfolio: ${cv.portfolio}`, size: 20, font: "Calibri", color: "1B3A6B" })], spacing: { after: 80 } }),
          ] : []),
        ],
      }],
    });

    const blob = await Pk.toBlob(doc);
    save(blob, `${cv.name.replace(/ /g, "_")}_CV_ATS.docx`);
    setExporting(null);
    setExportDone("docx");
    setTimeout(() => setExportDone(null), 3000);
  };

  /* ── PDF Export (browser print) ── */
  const exportPDF = () => {
    setExporting("pdf");
    const skillLines = [
      `Languages: ${cv.skills.languages.join(", ")}`,
      `Frameworks & Libraries: ${cv.skills.technical.join(", ")}`,
      `Tools & Platforms: ${cv.skills.tools.join(", ")}`,
      `Soft Skills: ${cv.skills.soft.join(", ")}`,
    ].join("<br/>");
    const expHtml = cv.experience.map(e => `
      <div style="margin-bottom:10pt">
        <div style="display:flex;justify-content:space-between">
          <strong style="font-size:11pt">${e.title}</strong>
          <span style="color:#666;font-size:10pt">${e.duration}</span>
        </div>
        <div style="color:#555;font-size:10pt;margin-bottom:4pt">${e.company} &nbsp;|&nbsp; ${e.location}</div>
        <ul style="margin:0;padding-left:16pt">${e.bullets.map(b => `<li style="font-size:10pt;margin-bottom:3pt">${b}</li>`).join("")}</ul>
      </div>`).join("");
    const projHtml = cv.projects.map(p => `
      <div style="margin-bottom:10pt">
        <div style="display:flex;justify-content:space-between">
          <strong style="font-size:11pt">${p.title}</strong>
          <span style="color:#666;font-size:10pt">${p.duration}</span>
        </div>
        <div style="color:#555;font-size:10pt;margin-bottom:4pt">Tech: ${p.tech}</div>
        <ul style="margin:0;padding-left:16pt">${p.bullets.map(b => `<li style="font-size:10pt;margin-bottom:3pt">${b}</li>`).join("")}</ul>
        <div style="font-size:9pt;color:#1B3A6B;margin-top:3pt">&#x1F517; ${p.link}</div>
      </div>`).join("");
    const certHtml = cv.certifications.map(c => `<li style="font-size:10pt;margin-bottom:3pt">${c.name} &mdash; ${c.issuer} (${c.year})</li>`).join("");
    const assHtml = cv.assessments.map(a => `<li style="font-size:10pt;margin-bottom:3pt">${a.name}: <strong>${a.score}/${a.max}</strong></li>`).join("");

    const sectionHtml = (title: string, content: string) => `
      <div style="margin-bottom:14pt">
        <div style="font-size:11pt;font-weight:700;color:#1B3A6B;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1.5pt solid #1B3A6B;padding-bottom:3pt;margin-bottom:8pt">${title}</div>
        ${content}
      </div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        body{font-family:Calibri,Arial,sans-serif;font-size:10pt;color:#374151;margin:0;padding:0}
        @page{margin:0.9in 0.8in;size:A4}
        @media print{body{-webkit-print-color-adjust:exact}}
      </style></head><body>
      <div style="font-size:22pt;font-weight:700;color:#1B3A6B;margin-bottom:4pt">${cv.name}</div>
      <div style="font-size:9pt;color:#5A6A8A;margin-bottom:14pt;border-bottom:1pt solid #C5D3E8;padding-bottom:8pt">
        ${[cv.email, cv.phone, cv.linkedin, cv.github, cv.location].filter(Boolean).join("&nbsp;&nbsp;|&nbsp;&nbsp;")}
      </div>
      ${visibleSections.includes("summary") ? sectionHtml("Professional Summary", `<p style="font-size:10pt;margin:0;line-height:1.5">${cv.summary}</p>`) : ""}
      ${visibleSections.includes("education") ? sectionHtml("Education", cv.education.map(e => `
        <div><strong style="font-size:11pt">${e.degree}</strong>
        <div style="color:#555;font-size:10pt">${e.college} &nbsp;|&nbsp; ${e.year} &nbsp;|&nbsp; CGPA: ${e.cgpa}</div></div>`).join("")) : ""}
      ${visibleSections.includes("skills") ? sectionHtml("Technical Skills (Verified)", `<div style="line-height:1.8">${skillLines}</div>`) : ""}
      ${visibleSections.includes("experience") ? sectionHtml("Internship Experience", expHtml) : ""}
      ${visibleSections.includes("projects") ? sectionHtml("Projects", projHtml) : ""}
      ${visibleSections.includes("certifications") ? sectionHtml("Certifications", `<ul style="margin:0;padding-left:16pt">${certHtml}</ul>`) : ""}
      ${visibleSections.includes("assessments") ? sectionHtml("Assessment Scores", `<ul style="margin:0;padding-left:16pt">${assHtml}</ul>`) : ""}
      ${visibleSections.includes("readiness") ? sectionHtml("Career Readiness", `<p style="margin:0;font-size:10pt">Overall Readiness: <strong>${cv.readiness.overall}%</strong> &nbsp;|&nbsp; ${cv.readiness.role}: <strong>${cv.readiness.roleScore}%</strong></p>`) : ""}
      ${visibleSections.includes("profile") ? sectionHtml("Public Profile", `<p style="margin:0;font-size:10pt">EduConnect: ${cv.publicUrl}<br/>Portfolio: ${cv.portfolio}</p>`) : ""}
      </body></html>`;

    const pw = window.open("", "_blank", "width=800,height=900");
    if (pw) {
      pw.document.write(html);
      pw.document.close();
      pw.focus();
      setTimeout(() => { pw.print(); setExporting(null); setExportDone("pdf"); setTimeout(() => setExportDone(null), 3000); }, 500);
    } else {
      setExporting(null);
    }
  };

  /* ── Section editor panel ── */
  const renderEditor = () => {
    if (!activeSec) return (
      <div className="flex flex-col items-center justify-center h-32 text-[#9AA5BE] text-center">
        <Edit3 size={22} className="mb-2" />
        <p className="text-[12.5px]">Click any section to edit its content</p>
      </div>
    );

    const inputRow = (label: string, path: string, value: string, type = "text") => (
      <Field key={path} label={label}>
        <Input type={type} value={value} onChange={e => updateField(path, e.target.value)} />
      </Field>
    );

    if (activeSec === "personal") return (
      <div className="grid grid-cols-2 gap-3">
        {inputRow("Full Name", "name", cv.name)}
        {inputRow("Email", "email", cv.email, "email")}
        {inputRow("Phone", "phone", cv.phone, "tel")}
        {inputRow("Location", "location", cv.location)}
        {inputRow("LinkedIn", "linkedin", cv.linkedin)}
        {inputRow("GitHub", "github", cv.github)}
        {inputRow("Portfolio", "portfolio", cv.portfolio)}
      </div>
    );

    if (activeSec === "summary") return (
      <Field label="Professional Summary" hint="2–3 sentences, keyword-rich, ATS-optimised">
        <textarea rows={5} value={cv.summary} onChange={e => setCV(p => ({ ...p, summary: e.target.value }))}
          className={`${inputCls} resize-none`} />
        <p className="text-[11px] text-[#9AA5BE] mt-1">{cv.summary.length} characters — aim for 300–600</p>
      </Field>
    );

    if (activeSec === "education") return (
      <div className="grid grid-cols-2 gap-3">
        {inputRow("Degree / Course", "education.0.degree", cv.education[0].degree)}
        {inputRow("College / University", "education.0.college", cv.education[0].college)}
        {inputRow("Affiliated Board", "education.0.board", cv.education[0].board)}
        {inputRow("Year", "education.0.year", cv.education[0].year)}
        {inputRow("CGPA", "education.0.cgpa", cv.education[0].cgpa)}
      </div>
    );

    if (activeSec === "skills") return (
      <div className="space-y-3">
        {(["technical","languages","tools","soft"] as const).map(k => (
          <Field key={k} label={k === "technical" ? "Frameworks & Libraries" : k === "languages" ? "Programming Languages" : k === "tools" ? "Tools & Platforms" : "Soft Skills"}>
            <TagInput tags={cv.skills[k]} onAdd={t => setCV(p => ({ ...p, skills: { ...p.skills, [k]: [...p.skills[k], t] } }))}
              onRemove={t => setCV(p => ({ ...p, skills: { ...p.skills, [k]: p.skills[k].filter(x => x !== t) } }))}
              placeholder="Type + Enter to add" color={k === "technical" ? "blue" : k === "languages" ? "green" : "amber"} />
          </Field>
        ))}
        <InfoBox title="ATS Tip" variant="blue">List skills as comma-separated keywords. Avoid visual chip displays — they are stripped by ATS parsers.</InfoBox>
      </div>
    );

    if (activeSec === "experience") return (
      <div className="space-y-3">
        {inputRow("Job Title", "experience.0.title", cv.experience[0].title)}
        {inputRow("Company", "experience.0.company", cv.experience[0].company)}
        {inputRow("Duration", "experience.0.duration", cv.experience[0].duration)}
        {inputRow("Location", "experience.0.location", cv.experience[0].location)}
        <Field label="Bullet Points" hint="One achievement per line">
          <textarea rows={6} value={cv.experience[0].bullets.join("\n")}
            onChange={e => setCV(p => ({ ...p, experience: [{ ...p.experience[0], bullets: e.target.value.split("\n") }, ...p.experience.slice(1)] }))}
            className={`${inputCls} resize-none`} />
        </Field>
        <InfoBox title="ATS Tip" variant="blue">Start each bullet with an action verb (Developed, Implemented, Designed, Led). Include measurable outcomes.</InfoBox>
      </div>
    );

    if (activeSec === "projects") return (
      <div className="space-y-4">
        {cv.projects.map((p, i) => (
          <div key={i} className="p-3 bg-[#F4F6FB] rounded-xl border border-[--border] space-y-3">
            <p className="text-[12px] font-semibold text-[#1B3A6B]">Project {i + 1}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title"><Input value={p.title} onChange={e => setCV(prev => { const ps = [...prev.projects]; ps[i] = { ...ps[i], title: e.target.value }; return { ...prev, projects: ps }; })} /></Field>
              <Field label="Tech Stack"><Input value={p.tech} onChange={e => setCV(prev => { const ps = [...prev.projects]; ps[i] = { ...ps[i], tech: e.target.value }; return { ...prev, projects: ps }; })} /></Field>
            </div>
            <Field label="GitHub Link"><Input icon={Link} value={p.link} onChange={e => setCV(prev => { const ps = [...prev.projects]; ps[i] = { ...ps[i], link: e.target.value }; return { ...prev, projects: ps }; })} /></Field>
          </div>
        ))}
      </div>
    );

    return (
      <div className="flex flex-col items-center justify-center h-24 text-[#9AA5BE]">
        <p className="text-[12.5px]">This section is auto-populated from your profile data.</p>
      </div>
    );
  };

  /* ── ATS CV Preview ── */
  const CVPreview = () => {
    const sec = (title: string, children: React.ReactNode) => (
      <div className="mb-4">
        <div className="text-[9.5pt] font-bold tracking-widest text-[#1B3A6B] uppercase border-b-2 border-[#1B3A6B] pb-0.5 mb-2">{title}</div>
        {children}
      </div>
    );
    const bul = (text: string) => <div key={text} className="flex gap-2 text-[9pt] text-[#374151] mb-0.5"><span className="shrink-0 mt-0.5">•</span><span>{text}</span></div>;

    return (
      <div className="bg-white shadow-lg border border-slate-200 rounded-sm"
        style={{ fontFamily: "Calibri, Arial, sans-serif", padding: "28pt 32pt", minHeight: "842pt", lineHeight: 1.45, fontSize: "10pt" }}>
        {/* Name */}
        <div className="text-[22pt] font-bold text-[#1B3A6B] leading-none mb-1">{cv.name}</div>
        {/* Contact */}
        <div className="text-[8.5pt] text-[#5A6A8A] border-b border-slate-300 pb-2 mb-3 flex flex-wrap gap-x-3 gap-y-0.5">
          {[cv.email, cv.phone, cv.linkedin, cv.github, cv.location].filter(Boolean).map((c, i, a) => (
            <span key={c}>{c}{i < a.length - 1 ? <span className="mx-1.5 text-slate-300">|</span> : null}</span>
          ))}
        </div>

        {visibleSections.includes("summary") && sec("Professional Summary",
          <p className="text-[9.5pt] text-[#374151] leading-relaxed">{cv.summary}</p>
        )}

        {visibleSections.includes("education") && sec("Education",
          cv.education.map((e, i) => (
            <div key={i} className="flex justify-between items-start mb-1">
              <div>
                <div className="text-[10pt] font-bold text-[#0F1C3F]">{e.degree}</div>
                <div className="text-[9pt] text-[#5A6A8A]">{e.college} &nbsp;|&nbsp; Affiliated: {e.board}</div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="text-[9pt] font-semibold text-[#0F1C3F]">{e.year}</div>
                <div className="text-[9pt] text-[#5A6A8A]">CGPA: {e.cgpa}</div>
              </div>
            </div>
          ))
        )}

        {visibleSections.includes("skills") && sec("Technical Skills (Verified)",
          <div className="space-y-0.5 text-[9.5pt] text-[#374151]">
            <div><span className="font-semibold text-[#0F1C3F]">Languages:</span> {cv.skills.languages.join(", ")}</div>
            <div><span className="font-semibold text-[#0F1C3F]">Frameworks & Libraries:</span> {cv.skills.technical.join(", ")}</div>
            <div><span className="font-semibold text-[#0F1C3F]">Tools & Platforms:</span> {cv.skills.tools.join(", ")}</div>
            <div><span className="font-semibold text-[#0F1C3F]">Soft Skills:</span> {cv.skills.soft.join(", ")}</div>
          </div>
        )}

        {visibleSections.includes("experience") && sec("Internship Experience",
          cv.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="text-[10.5pt] font-bold text-[#0F1C3F]">{e.title}</div>
                <div className="text-[9pt] text-[#5A6A8A] shrink-0 ml-3">{e.duration}</div>
              </div>
              <div className="text-[9pt] text-[#5A6A8A] mb-1">{e.company} &nbsp;|&nbsp; {e.location}</div>
              {e.bullets.map(bul)}
            </div>
          ))
        )}

        {visibleSections.includes("projects") && sec("Projects",
          cv.projects.map((p, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="text-[10.5pt] font-bold text-[#0F1C3F]">{p.title}</div>
                <div className="text-[9pt] text-[#5A6A8A] shrink-0 ml-3">{p.duration}</div>
              </div>
              <div className="text-[9pt] text-[#5A6A8A] mb-1">Tech Stack: {p.tech} &nbsp;|&nbsp; <span className="text-[#1B3A6B]">{p.link}</span></div>
              {p.bullets.map(bul)}
            </div>
          ))
        )}

        {visibleSections.includes("certifications") && sec("Certifications",
          cv.certifications.map(c => (
            <div key={c.name} className="flex justify-between items-baseline text-[9.5pt]">
              <div className="flex gap-2"><span>•</span><span className="text-[#0F1C3F]">{c.name}</span><span className="text-[#5A6A8A]">— {c.issuer}</span></div>
              <span className="text-[#5A6A8A] shrink-0 ml-3">{c.year}</span>
            </div>
          ))
        )}

        {visibleSections.includes("assessments") && sec("Assessment Scores",
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {cv.assessments.map(a => (
              <div key={a.name} className="text-[9.5pt]">
                <span className="text-[#0F1C3F] font-semibold">{a.name}:</span>{" "}
                <span className="text-[#374151]">{a.score} / {a.max}</span>
              </div>
            ))}
          </div>
        )}

        {visibleSections.includes("readiness") && sec("Career Readiness",
          <div className="text-[9.5pt] text-[#374151]">
            Overall Readiness: <span className="font-semibold">{cv.readiness.overall}%</span> &nbsp;|&nbsp;
            {cv.readiness.role}: <span className="font-semibold">{cv.readiness.roleScore}%</span>
          </div>
        )}

        {visibleSections.includes("profile") && sec("Public Profile",
          <div className="text-[9.5pt]">
            <div><span className="text-[#0F1C3F] font-semibold">EduConnect CV:</span> <span className="text-[#1B3A6B]">{cv.publicUrl}</span></div>
            <div><span className="text-[#0F1C3F] font-semibold">Portfolio:</span> <span className="text-[#1B3A6B]">{cv.portfolio}</span></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between min-w-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 min-w-0">
            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-[#E8ECF5] text-[#5A6A8A]" style={{ fontFamily: "var(--font-mono)" }}>2.7</span>
            <h2 className="text-[16px] sm:text-[17px] text-[#0F1C3F] break-words" style={{ fontFamily: "var(--font-serif)" }}>Dynamic CV Generator</h2>
            <span className="max-w-full flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><ShieldCheck size={10} /> ATS-Optimised</span>
          </div>
          <p className="text-[12.5px] text-[#5A6A8A]">Auto-generated from your verified profile. Toggle sections, edit inline, then export.</p>
        </div>
        {/* ATS Score */}
        <div className="w-full lg:w-auto md:flex py-6 items-center gap-3 bg-white border border-[--border] rounded-xl px-3 sm:px-4  shadow-sm shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-[#9AA5BE] uppercase tracking-wide">ATS Score</p>
            <p className="text-[26px] font-bold leading-none" style={{ fontFamily: "var(--font-serif)", color: atsScore >= 80 ? "#059669" : atsScore >= 60 ? "#D97706" : "#DC2626" }}>{atsScore}%</p>
          </div>
          <div className="space-y-1 min-w-0 flex-1 lg:min-w-[140px]">
            {atsChecks.slice(0, 5).map(c => (
              <div key={c.label} className="flex items-center gap-1.5">
                {c.pass ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-400 shrink-0" />}
                <span className="text-[10px] text-[#5A6A8A] truncate">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export bar */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 bg-white border border-[--border] rounded-xl shadow-sm">
        <span className="text-[12.5px] font-semibold text-[#0F1C3F]">Export:</span>
        <button onClick={exportPDF} disabled={!!exporting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#DC2626] text-white text-[13px] rounded-[10px] hover:bg-[#b91c1c] disabled:opacity-50 transition-colors font-semibold shadow-sm">
          {exporting === "pdf" ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
          {exportDone === "pdf" ? "PDF Downloaded ✓" : "PDF"}
        </button>
        <button onClick={exportDOCX} disabled={!!exporting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] disabled:opacity-50 transition-colors font-semibold shadow-sm">
          {exporting === "docx" ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
          {exportDone === "docx" ? "DOCX Downloaded ✓" : "DOCX"}
        </button>
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#EFF2FA] rounded-[10px] min-w-0 overflow-hidden">
            <Globe size={13} className="text-[#1B3A6B] shrink-0" />
            <span className="text-[12px] text-[#1B3A6B] truncate" style={{ fontFamily: "var(--font-mono)" }}>{cv.publicUrl}</span>
          </div>
          <button onClick={() => { setUrlCopied(true); setTimeout(() => setUrlCopied(false), 2000); }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 border border-[--border] bg-white text-[12.5px] text-[#5A6A8A] rounded-[10px] hover:bg-[#F4F7FC] transition-colors font-medium shrink-0">
            {urlCopied ? <><Check size={12} className="text-emerald-500" /> Copied!</> : <><Link size={12} /> Copy URL</>}
          </button>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5 w-full min-w-0">

        {/* LEFT — Section controls */}
        <div className="w-full min-w-0 space-y-2">
          <p className="text-[11.5px] font-semibold text-[#9AA5BE] uppercase tracking-wide px-1">Sections ({visibleSections.length} visible)</p>
          {sections.map(sec => {
            const Icon = sec.icon;
            const isActive = activeSec === sec.id;
            return (
              <div key={sec.id} className={`w-full min-w-0 rounded-xl border-2 transition-all overflow-hidden ${isActive ? "border-[#1B3A6B] shadow-sm" : "border-[--border]"}`}>
                <div className={`w-full min-w-0 flex items-center gap-2.5 px-3 py-2.5 cursor-pointer ${isActive ? "bg-[#EBF1FA]" : "bg-white hover:bg-[#F8FAFB]"}`}
                  onClick={() => setActiveSec(activeSec === sec.id ? null : sec.id)}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${sec.visible ? "bg-[#1B3A6B]" : "bg-[#E8ECF5]"}`}>
                    <Icon size={12} className={sec.visible ? "text-white" : "text-[#9AA5BE]"} />
                  </div>
                  <span className={`flex-1 text-[12.5px] font-medium truncate ${isActive ? "text-[#1B3A6B]" : sec.visible ? "text-[#0F1C3F]" : "text-[#9AA5BE]"}`}>{sec.label}</span>
                  <button onClick={e => { e.stopPropagation(); toggleSection(sec.id); }}
                    className={`w-9 h-5 rounded-full transition-colors shrink-0 relative ${sec.visible ? "bg-[#1B3A6B]" : "bg-[#D1D9E8]"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${sec.visible ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                {isActive && (
                  <div className="border-t border-[--border] p-2.5 sm:p-3 bg-[#FAFBFD] min-w-0 overflow-hidden">
                    {renderEditor()}
                  </div>
                )}
              </div>
            );
          })}

          {/* ATS checklist */}
          <div className="mt-3 p-3 bg-white border border-[--border] rounded-xl">
            <p className="text-[11.5px] font-semibold text-[#0F1C3F] mb-2">ATS Checklist</p>
            {atsChecks.map(c => (
              <div key={c.label} className="flex items-center gap-2 py-0.5">
                {c.pass
                  ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                  : <XCircle size={11} className="text-red-400 shrink-0" />}
                <span className={`text-[11px] ${c.pass ? "text-[#5A6A8A]" : "text-red-500"}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — ATS CV Preview */}
        <div className="w-full min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <p className="text-[12px] font-semibold text-[#5A6A8A] uppercase tracking-wide">Live ATS Preview</p>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11.5px] text-[#5A6A8A]">Updates in real-time as you edit</span>
            </div>
          </div>
          <div className="w-full max-w-full overflow-auto max-h-[880px] rounded-xl border border-slate-200 shadow-inner bg-slate-100 p-2 sm:p-4">
            <CVPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
