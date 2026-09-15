import { useState, useRef, useCallback } from "react";
import {
  Mail,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  User,
  Upload,
  Edit3,
  ExternalLink,
  Code,
  Globe,
  GraduationCap,
  X,
  Plus,
  Award,
  ArrowRight,
  RefreshCw,
  Check,
  Sparkles,
  Brain,
  Route,
  Flag,
  Rocket,
  Timer,
  Lightbulb,
  MapPin,
  Hash,
  Target,
  ThumbsUp,
  Bell,
  TrendingUp,
  Briefcase,
  MessageSquare,
  Activity,
  BarChart2,
  ClipboardList,
  Layers,
  Calendar,
  PlayCircle,
  Link,
  FileText,
  BookMarked,
  Cpu,
  ArrowLeft,
  ChevronRight,
  UserPlus,
  BookOpen,
} from "lucide-react";
import {
  SectionTitle,
  Field,
  Input,
  Select,
  InfoBox,
  Tag,
  OTPInput,
  inputCls,
} from "../components/shared";

/* ── Circular gauge ── */
export function CircleGauge({
  value,
  size = 88,
  color = "#1B3A6B",
  label,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E8ECF5"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fontSize={size * 0.19}
          fontWeight="700"
          fill="#0F1C3F"
          fontFamily="var(--font-serif)"
        >
          {value}%
        </text>
      </svg>
      {label && (
        <p className="text-[11px] text-[#5A6A8A] text-center leading-tight">
          {label}
        </p>
      )}
    </div>
  );
}

/* ── Tag input ── */
export function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  color = "blue",
}: {
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
  placeholder?: string;
  color?: "blue" | "green" | "amber";
}) {
  const [val, setVal] = useState("");
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-[#EFF2FA] rounded-[10px] min-h-[48px]">
      {tags.map((t) => (
        <Tag key={t} color={color} onRemove={() => onRemove(t)}>
          {t}
        </Tag>
      ))}
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === ",") && val.trim()) {
            onAdd(val.trim());
            setVal("");
            e.preventDefault();
          }
        }}
        placeholder={tags.length === 0 ? placeholder : "Add more…"}
        className="bg-transparent outline-none text-[13px] text-[#0F1C3F] placeholder:text-[#9AA5BE] min-w-[120px] flex-1"
      />
    </div>
  );
}

/* ── Progress bar ── */
export function ProgressBar({
  value,
  color = "#1B3A6B",
  height = 6,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="w-full bg-[#E8ECF5] rounded-full overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SS1 — STUDENT ONBOARDING
════════════════════════════════════════════════════════ */
export function SS1() {
  const [tab, setTab] = useState<"email" | "social">("email");
  const [showPass, setShowPass] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mobileSent, setMobileSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const startCountdown = useCallback(() => {
    setCountdown(30);
    const t = setInterval(
      () =>
        setCountdown((p) => {
          if (p <= 1) {
            clearInterval(t);
            return 0;
          }
          return p - 1;
        }),
      1000,
    );
  }, []);

  const bothVerified = emailVerified && mobileVerified;

  if (bothVerified)
    return (
      <div className="flex flex-col items-center py-10 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
          <CheckCircle2 size={38} className="text-emerald-600" />
        </div>
        <h2
          className="text-[20px] sm:text-[22px] text-[#0F1C3F] mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Account Created!
        </h2>
        <p className="text-[13.5px] text-[#5A6A8A] max-w-sm mb-6">
          Your student account has been set up. Continue to build your profile
          and get your personalized career roadmap.
        </p>
        {/* <div className="flex gap-3">
        {["Email ✓", "Mobile ✓"].map(b => (
          <span key={b} className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">{b}</span>
        ))}
      </div> */}
      </div>
    );

  return (
    <div className="space-y-7">
      <SectionTitle
        num="2.1"
        title="Student Registration"
        sub="Create your account to get started"
      />

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-[#EFF2FA] rounded-xl w-full sm:w-fit">
        {(["email", "social"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-[12.5px] sm:text-[13px] font-medium rounded-[10px] transition-all ${tab === t ? "bg-white text-[#1B3A6B] shadow-sm" : "text-[#5A6A8A] hover:text-[#1B3A6B]"}`}
          >
            {t === "email" ? "Email / Mobile" : "Social Login"}
          </button>
        ))}
      </div>

      {tab === "social" ? (
        <div className="w-full sm:max-w-sm space-y-3">
          <button className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-white border-2 border-[--border] rounded-xl hover:border-slate-300 hover:shadow-sm transition-all font-medium text-[13.5px] sm:text-[14px] text-[#0F1C3F]">
            <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l7 5.1C15.1 15.2 19.2 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.6 7.4 6.3 14.7z"
              />
              <path
                fill="#FBBC05"
                d="M24 46c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.8 37.3 27 38 24 38c-6.1 0-11.3-4.1-13.1-9.7l-7 5.4C7.7 40.9 15.3 46 24 46z"
              />
              <path
                fill="#EA4335"
                d="M44.5 20H24v8.5h11.8c-.8 2.5-2.5 4.6-4.7 6.1l6.6 5.4C41.5 36.5 45 30.7 45 24c0-1.3-.2-2.7-.5-4z"
              />
            </svg>
            Continue with Google
          </button>
          <button className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-[#0A66C2] border-2 border-[#0A66C2] rounded-xl hover:bg-[#0856a8] transition-all font-medium text-[13.5px] sm:text-[14px] text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="shrink-0">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
          </button>
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[--border]" />
            <span className="text-[11px] sm:text-[12px] text-[#9AA5BE] text-center">
              or register with email
            </span>
            <div className="flex-1 h-px bg-[--border]" />
          </div>
          <button
            onClick={() => setTab("email")}
            className="w-full px-5 py-2.5 border border-[--border] rounded-xl text-[13px] font-medium text-[#5A6A8A] hover:bg-[#F4F7FC] transition-colors"
          >
            Register with Email / Mobile
          </button>
        </div>
      ) : (
        <div className=" grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl">
          <Field label="Email Address" required>
            <Input
              icon={Mail}
              type="email"
              placeholder="student@college.edu.in"
            />
          </Field>
          {/* <Field label="Mobile Number" required><Input icon={Phone} type="tel" placeholder="+91 98765 43210" /></Field> */}
          <Field label="Password" required>
            <div className="relative">
              <Input
                icon={Shield}
                type={showPass ? "text" : "password"}
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password" required>
            <Input
              icon={Shield}
              type="password"
              placeholder="Repeat password"
            />
          </Field>
          <div className="col-span-1 md:col-span-2 sm:col-span-3">
            <Field label="College (from registered institutions)" required>
              <Select icon={Building2}>
                <option value="">Select your college</option>
                <option>Rajiv Gandhi Institute of Technology</option>
                <option>Mumbai University</option>
                <option>IIT Bombay</option>
              </Select>
            </Field>
          </div>
        </div>
      )}

      {/* OTP Verification */}
      <div>
        <SectionTitle
          num="2.1b"
          title="Verify Your Contacts"
          sub="Confirm your email and mobile to activate your account"
        />
        <div className="space-y-4">
          {[
            {
              type: "email" as const,
              label: "Email Verification",
              icon: Mail,
              contact: "student@college.edu.in",
              sent: emailSent,
              setSent: setEmailSent,
              verified: emailVerified,
              setVerified: setEmailVerified,
              otp: emailOtp,
              setOtp: setEmailOtp,
            },
            {
              type: "mobile" as const,
              label: "Mobile Verification",
              icon: Phone,
              contact: "+91 98765 43210",
              sent: mobileSent,
              setSent: setMobileSent,
              verified: mobileVerified,
              setVerified: setMobileVerified,
              otp: mobileOtp,
              setOtp: setMobileOtp,
            },
          ].map((v) => (
            <div
              key={v.type}
              className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${v.verified ? "border-emerald-200 bg-emerald-50/30" : "border-[--border] bg-white"}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${v.verified ? "bg-emerald-100" : "bg-[#E8ECF5]"}`}
                  >
                    {v.verified ? (
                      <CheckCircle2 size={17} className="text-emerald-600" />
                    ) : (
                      <v.icon size={16} className="text-[#1B3A6B]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#0F1C3F]">
                      {v.label}
                    </p>
                    <p
                      className="text-[11.5px] text-[#5A6A8A] truncate"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {v.contact}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${v.verified ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100"}`}
                >
                  {v.verified ? "Verified" : "Pending"}
                </span>
              </div>
              {!v.verified &&
                (!v.sent ? (
                  <button
                    onClick={() => {
                      v.setSent(true);
                      if (v.type === "mobile") startCountdown();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <v.icon size={13} /> Send OTP
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[12.5px] text-[#5A6A8A]">
                      Enter the 6-digit OTP sent to{" "}
                      <strong className="text-[#0F1C3F] break-all">{v.contact}</strong>
                    </p>
                    <OTPInput value={v.otp} onChange={v.setOtp} />
                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        onClick={() =>
                          v.otp.length === 6 && v.setVerified(true)
                        }
                        className="px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
                      >
                        Verify OTP
                      </button>
                      <button
                        disabled={countdown > 0}
                        onClick={startCountdown}
                        className="text-[12.5px] text-[#1B3A6B] hover:underline disabled:opacity-40 disabled:no-underline"
                      >
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SS2 — STUDENT PROFILE
════════════════════════════════════════════════════════ */
export function SS2() {
  const [tab, setTab] = useState<
    "personal" | "education" | "skills" | "experience"
  >("personal");
  const [photo, setPhoto] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [techSkills, setTechSkills] = useState([
    "React",
    "JavaScript",
    "HTML/CSS",
  ]);
  const [langs, setLangs] = useState(["Python", "JavaScript", "Java"]);
  const [tools, setTools] = useState(["VS Code", "Git", "Figma"]);
  const [softSkills, setSoftSkills] = useState(["Communication", "Teamwork"]);
  const [certs, setCerts] = useState([
    { id: 1, name: "AWS Cloud Practitioner", issuer: "Amazon", year: "2024" },
  ]);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState({ name: "", issuer: "", year: "" });
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      type: "Internship",
      title: "Frontend Developer Intern",
      org: "Startup XYZ",
      duration: "May–Jul 2024",
      desc: "Built React components for the dashboard.",
    },
    {
      id: 2,
      type: "Project",
      title: "E-Commerce Platform",
      org: "Personal Project",
      duration: "2024",
      desc: "Full-stack app with Node.js and React.",
    },
  ]);
  const [showAddExp, setShowAddExp] = useState(false);
  const [newExp, setNewExp] = useState({
    type: "Internship",
    title: "",
    org: "",
    duration: "",
    desc: "",
  });

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
  ] as const;

  const expTypes = [
    "Internship",
    "Freelancing",
    "Part-Time Job",
    "Project",
    "Hackathon",
    "Competition",
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        num="2.2"
        title="Student Profile"
        sub="Build a comprehensive profile to power your career journey"
      />

      {/* Tab bar */}
      <div className=" flex flex-wrap gap-1 p-1 bg-[#EFF2FA] rounded-xl w-full sm:w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-5 py-2 text-[12px] sm:text-[13px] font-medium rounded-[10px] transition-all ${tab === t.id ? "bg-white text-[#1B3A6B] shadow-sm" : "text-[#5A6A8A] hover:text-[#1B3A6B]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Personal */}
      {tab === "personal" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 text-center sm:text-left">
            <div
              onClick={() => photoRef.current?.click()}
              className="w-20 h-20 rounded-full bg-[#E8ECF5] flex items-center justify-center cursor-pointer hover:bg-[#D7E2F2] transition-colors border-2 border-dashed border-[#1B3A6B]/30 overflow-hidden relative group shrink-0"
            >
              {photo ? (
                <img
                  src={photo}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload size={18} className="text-[#1B3A6B]" />
                  <span className="text-[10px] text-[#5A6A8A]">Upload</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Edit3 size={16} className="text-white" />
              </div>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPhoto(URL.createObjectURL(f));
              }}
            />
            <div>
              <p className="text-[13.5px] font-medium text-[#0F1C3F]">
                Profile Photo
              </p>
              <p className="text-[12px] text-[#5A6A8A] mt-0.5">
                JPG or PNG, min 200×200px. Your face should be clearly visible.
              </p>
              <button
                onClick={() => photoRef.current?.click()}
                className="mt-2 text-[12.5px] text-[#1B3A6B] font-medium hover:underline"
              >
                {photo ? "Change photo" : "Upload photo"}
              </button>
            </div>
          </div>
          <div className=" grid grid-cols-1 sm:grid-cols-1  md:grid-cols-2 gap-4 sm:gap-5 w-full">
            <div className="col-span-1 sm:col-span-2">
              <Field label="Full Name" required>
                <Input icon={User} placeholder="Aisha Patel" />
              </Field>
            </div>
            <Field label="Date of Birth" required>
              <Input type="date" />
            </Field>
            <Field label="Gender" required>
              <Select>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </Select>
            </Field>
            <Field label="Mobile Number" required>
              <Input icon={Phone} type="tel" placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email Address" required>
              <Input
                icon={Mail}
                type="email"
                placeholder="aisha@college.edu.in"
              />
            </Field>
            <div className="col-span-1 sm:col-span-2 ">
              <Field label="Address">
                <textarea
                  rows={2}
                  placeholder="Flat, Street, City, State, PIN"
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
            <Field label="LinkedIn Profile">
              <Input
                icon={ExternalLink}
                placeholder="linkedin.com/in/aisha-patel"
              />
            </Field>
            <Field label="GitHub Profile">
              <Input icon={Code} placeholder="github.com/aisha-patel" />
            </Field>
            <div className="col-span-1 sm:col-span-2">
              <Field label="Portfolio Website">
                <Input icon={Globe} placeholder="https://aishapatel.dev" />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Education */}
      {tab === "education" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="col-span-1 sm:col-span-2">
            <Field label="College / University" required>
              <Input
                icon={Building2}
                placeholder="Rajiv Gandhi Institute of Technology"
              />
            </Field>
          </div>
          <Field label="Course" required>
            <Input placeholder="B.E. / B.Tech / BCA / MCA" />
          </Field>
          <Field label="Department" required>
            <Select>
              <option value="">Select dept</option>
              <option>Computer Engineering</option>
              <option>Electronics & Communication</option>
              <option>Information Technology</option>
              <option>Mechanical Engineering</option>
            </Select>
          </Field>
          <Field label="Current Semester / Year" required>
            <Select>
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s}>Semester {s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Graduation Year" required>
            <Select>
              <option value="">Select year</option>
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </Select>
          </Field>
          <Field label="CGPA" hint="Out of 10">
            <Input placeholder="8.40" suffix="/ 10" />
          </Field>
          <Field label="Percentage" hint="Overall %">
            <Input placeholder="84.0" suffix="%" />
          </Field>
          <div className="col-span-1 sm:col-span-2">
            <Field label="Academic Achievements">
              <textarea
                rows={3}
                placeholder="Scholarships, rank, awards, publications…"
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Skills */}
      {tab === "skills" && (
        <div className="space-y-5">
          {[
            {
              label: "Technical Skills",
              tags: techSkills,
              setTags: setTechSkills,
              placeholder: "e.g. React, Node.js…",
              color: "blue" as const,
            },
            {
              label: "Programming Languages",
              tags: langs,
              setTags: setLangs,
              placeholder: "e.g. Python, Go…",
              color: "green" as const,
            },
            {
              label: "Tools & Technologies",
              tags: tools,
              setTags: setTools,
              placeholder: "e.g. Docker, AWS…",
              color: "amber" as const,
            },
            {
              label: "Soft Skills",
              tags: softSkills,
              setTags: setSoftSkills,
              placeholder: "e.g. Leadership…",
              color: "blue" as const,
            },
          ].map((s) => (
            <Field key={s.label} label={s.label}>
              <TagInput
                tags={s.tags}
                onAdd={(t) => s.setTags((p) => [...p, t])}
                onRemove={(t) => s.setTags((p) => p.filter((x) => x !== t))}
                placeholder={s.placeholder}
                color={s.color}
              />
            </Field>
          ))}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-[#0F1C3F]">
                Certifications
              </label>
              <button
                onClick={() => setShowAddCert(!showAddCert)}
                className="flex items-center gap-1 text-[12.5px] text-[#1B3A6B] font-medium hover:underline"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            {certs.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-[--border] rounded-xl mb-2"
              >
                <Award size={14} className="text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#0F1C3F]">
                    {c.name}
                  </p>
                  <p className="text-[11.5px] text-[#5A6A8A]">
                    {c.issuer} · {c.year}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCerts((cs) => cs.filter((x) => x.id !== c.id))
                  }
                  className="p-1 text-[#9AA5BE] hover:text-red-500"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            {showAddCert && (
              <div className="p-4 bg-[#EBF1FA] rounded-xl space-y-3">
                <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Field label="Certification Name">
                      <Input
                        placeholder="AWS Cloud Practitioner"
                        value={newCert.name}
                        onChange={(e) =>
                          setNewCert((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Issuing Org">
                    <Input
                      placeholder="Amazon / Google"
                      value={newCert.issuer}
                      onChange={(e) =>
                        setNewCert((p) => ({ ...p, issuer: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Year">
                    <Input
                      placeholder="2024"
                      value={newCert.year}
                      onChange={(e) =>
                        setNewCert((p) => ({ ...p, year: e.target.value }))
                      }
                    />
                  </Field>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      if (newCert.name) {
                        setCerts((c) => [...c, { ...newCert, id: Date.now() }]);
                        setNewCert({ name: "", issuer: "", year: "" });
                        setShowAddCert(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddCert(false)}
                    className="px-4 py-2 border border-[--border] text-[#5A6A8A] text-[13px] rounded-[10px] hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {tab === "experience" && (
        <div className="space-y-4">
          {experiences.map((e) => (
            <div
              key={e.id}
              className="p-4 bg-white border border-[--border] rounded-xl"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Tag
                      color={
                        e.type === "Internship"
                          ? "green"
                          : e.type === "Project"
                            ? "blue"
                            : "amber"
                      }
                    >
                      {e.type}
                    </Tag>
                    <p className="text-[13.5px] font-medium text-[#0F1C3F]">
                      {e.title}
                    </p>
                  </div>
                  <p className="text-[12px] text-[#5A6A8A]">
                    {e.org} · {e.duration}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setExperiences((es) => es.filter((x) => x.id !== e.id))
                  }
                  className="p-1 text-[#9AA5BE] hover:text-red-500 self-end sm:self-auto"
                >
                  <X size={13} />
                </button>
              </div>
              <p className="text-[12.5px] text-[#5A6A8A]">{e.desc}</p>
            </div>
          ))}
          {showAddExp ? (
            <div className="p-4 bg-[#EBF1FA] rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
                <Field label="Type">
                  <Select
                    value={newExp.type}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    {expTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Title">
                  <Input
                    placeholder="Role / Project name"
                    value={newExp.title}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Organisation / Company">
                  <Input
                    placeholder="Company / Self"
                    value={newExp.org}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, org: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Duration">
                  <Input
                    placeholder="May–Jul 2024"
                    value={newExp.duration}
                    onChange={(e) =>
                      setNewExp((p) => ({ ...p, duration: e.target.value }))
                    }
                  />
                </Field>
                <div className="col-span-1 sm:col-span-2 ">
                  <Field label="Description">
                    <textarea
                      rows={2}
                      value={newExp.desc}
                      onChange={(e) =>
                        setNewExp((p) => ({ ...p, desc: e.target.value }))
                      }
                      placeholder="What did you do? Key achievements?"
                      className={`${inputCls} resize-none`}
                    />
                  </Field>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    if (newExp.title) {
                      setExperiences((e) => [
                        ...e,
                        { ...newExp, id: Date.now() },
                      ]);
                      setNewExp({
                        type: "Internship",
                        title: "",
                        org: "",
                        duration: "",
                        desc: "",
                      });
                      setShowAddExp(false);
                    }
                  }}
                  className="px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
                >
                  Add Entry
                </button>
                <button
                  onClick={() => setShowAddExp(false)}
                  className="px-4 py-2 border border-[--border] text-[#5A6A8A] text-[13px] rounded-[10px] hover:bg-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddExp(true)}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#1B3A6B]/30 text-[#1B3A6B] text-[13px] rounded-xl hover:bg-[#EBF1FA] transition-colors font-medium w-full justify-center"
            >
              <Plus size={14} /> Add Experience / Project / Hackathon
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SS3 — AI CAREER COUNSELLING ⭐
════════════════════════════════════════════════════════ */
export function SS3() {
  const [tab, setTab] = useState<"personal" | "technical" | "results">(
    "personal",
  );
  const [interests, setInterests] = useState<string[]>(["Technology", "Data"]);
  const [learningStyle, setLearningStyle] = useState("Visual");
  const [workEnv, setWorkEnv] = useState("Hybrid");
  const [personality, setPersonality] = useState("");
  const [strengths, setStrengths] = useState([
    "Problem Solving",
    "Analytical Thinking",
  ]);
  const [weaknesses, setWeaknesses] = useState(["Public Speaking"]);
  const [scores, setScores] = useState({
    programming: 7,
    aptitude: 6,
    logical: 7,
    problemSolving: 8,
    communication: 5,
    english: 7,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const interestOptions = [
    "Technology",
    "Design",
    "Data",
    "Management",
    "Finance",
    "Healthcare",
    "Education",
    "Marketing",
  ];
  const mbtiOptions = [
    "INTJ",
    "ENTJ",
    "INFP",
    "ENFP",
    "ISTP",
    "ESTP",
    "ISFJ",
    "ESFJ",
    "INTP",
    "ENTP",
    "INFJ",
    "ENFJ",
    "ISTJ",
    "ESTJ",
    "ISFP",
    "ESFP",
  ];

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
      setTab("results");
    }, 2200);
  };

  const scoreLabels: Record<string, string> = {
    programming: "Programming Knowledge",
    aptitude: "Aptitude",
    logical: "Logical Reasoning",
    problemSolving: "Problem Solving",
    communication: "Communication Skills",
    english: "English Proficiency",
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-4 min-[380px]:space-y-5 sm:space-y-6 px-0">
      <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-2 sm:gap-3 mb-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <span className="inline-flex w-fit shrink-0 items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-mono)" }}    >
            2.3
          </span>
          <h2 className="text-[14px] min-[380px]:text-[16px] sm:text-[17px] text-[#0F1C3F] break-words" style={{ fontFamily: "var(--font-serif)" }}>AI Career Counselling</h2>
        </div>
        <span className="flex items-center gap-1 text-[10px] min-[380px]:text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit shrink-0">
          <Sparkles size={11} /> AI-Powered
        </span>
      </div>
      <p className="text-[12px] min-[380px]:text-[12.5px] text-[#5A6A8A] -mt-4">
        Complete the assessment to generate your personalized career roadmap
      </p>

      <div className="w-full overflow-x-auto scrollbar-hide bg-[#EFF2FA] rounded-xl p-1">
      <div className="flex min-w-max gap-1">
       {[
        { id: "personal", label: "Personal Assessment" },
        { id: "technical", label: "Technical Assessment" },
        { id: "results", label: analyzed ? "⭐ AI Results" : "AI Results" },
        ].map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id as typeof tab)}
          className={`
          shrink-0
          px-2.5 min-[380px]:px-3 sm:px-4
          py-2
          text-[10.5px] min-[380px]:text-[11px] sm:text-[13px]
          font-medium
          rounded-[10px]
          whitespace-nowrap
          transition-all
          ${
            tab === t.id
              ? "bg-white text-[#1B3A6B] shadow-sm"
              : "text-[#5A6A8A] hover:text-[#1B3A6B]"
          }
        `}
      >
        {t.label}
      </button>
    ))}
  </div>
</div>

      {tab === "personal" && (
        <div className="space-y-5 sm:space-y-6">
          <Field label="Interests (select up to 3)">
            <div className="flex flex-wrap gap-1.5 min-[380px]:gap-2 p-2.5 min-[380px]:p-3 bg-[#EFF2FA] rounded-[10px]">
              {interestOptions.map((i) => (
                <button
                  key={i}
                  onClick={() =>
                    setInterests((p) =>
                      p.includes(i)
                        ? p.filter((x) => x !== i)
                        : p.length < 3
                          ? [...p, i]
                          : p,
                    )
                  }
                  className={`px-2.5 min-[380px]:px-3 py-1.5 rounded-full text-[11.5px] min-[380px]:text-[12.5px] font-medium border transition-all ${interests.includes(i) ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "bg-white text-[#5A6A8A] border-[--border] hover:border-[#1B3A6B]"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Career Aspirations">
            <textarea
              rows={2}
              placeholder="What kind of work excites you? Where do you see yourself in 5 years?"
              className={`${inputCls} resize-none`}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="Strengths">
              <TagInput
                tags={strengths}
                onAdd={(t) => setStrengths((p) => [...p, t])}
                onRemove={(t) => setStrengths((p) => p.filter((x) => x !== t))}
                placeholder="e.g. Analytical thinking…"
                color="green"
              />
            </Field>
            <Field label="Weaknesses / Areas to Improve">
              <TagInput
                tags={weaknesses}
                onAdd={(t) => setWeaknesses((p) => [...p, t])}
                onRemove={(t) => setWeaknesses((p) => p.filter((x) => x !== t))}
                placeholder="e.g. Public speaking…"
                color="amber"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="Learning Style">
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
                {["Visual", "Auditory", "Read-Write", "Kinesthetic"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setLearningStyle(s)}
                      className={`py-2 px-3 text-[12px] min-[380px]:text-[12.5px] font-medium rounded-[10px] border-2 transition-all whitespace-nowrap overflow-hidden text-ellipsis ${learningStyle === s ? "border-[#1B3A6B] bg-[#EBF1FA] text-[#1B3A6B]" : "border-[--border] bg-white text-[#5A6A8A] hover:border-slate-300"}`}
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </Field>
            <Field label="Preferred Work Environment">
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
                {["Remote", "Hybrid", "On-site", "Flexible"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setWorkEnv(s)}
                    className={`py-2 px-3 text-[12px] min-[380px]:text-[12.5px] font-medium rounded-[10px] border-2 transition-all whitespace-nowrap overflow-hidden text-ellipsis ${workEnv === s ? "border-[#1B3A6B] bg-[#EBF1FA] text-[#1B3A6B]" : "border-[--border] bg-white text-[#5A6A8A] hover:border-slate-300"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field
            label="Personality Type (Optional)"
            hint="MBTI or RIASEC — skip if unsure"
          >
            <Select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
            >
              <option value="">Select (optional)</option>
              <optgroup label="MBTI">
                {mbtiOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </optgroup>
              <optgroup label="RIASEC">
                {[
                  "Realistic",
                  "Investigative",
                  "Artistic",
                  "Social",
                  "Enterprising",
                  "Conventional",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </optgroup>
            </Select>
          </Field>
        </div>
      )}

      {tab === "technical" && (
        <div className="space-y-5 sm:space-y-6">
          <InfoBox title="Self-Assessment" variant="blue">
            Rate your current skill level on a scale of 0–10 for each area. Be
            honest — this helps the AI give you the most accurate roadmap.
          </InfoBox>
          <div className="bg-white border border-[--border] rounded-xl p-3.5 min-[380px]:p-4 sm:p-5 space-y-4 sm:space-y-5">
            {(Object.keys(scores) as Array<keyof typeof scores>).map(
              (field) => (
                <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="w-full sm:w-40 md:w-48 shrink-0 text-[11.5px] min-[380px]:text-[12px] sm:text-[12.5px]">
                    {scoreLabels[field]}
                  </span>
                  <div className="flex items-center gap-2.5 min-[380px]:gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={scores[field]}
                      onChange={(e) =>
                        setScores((s) => ({ ...s, [field]: +e.target.value }))
                      }
                      className="flex-1 min-w-0 h-1.5 accent-[#1B3A6B]"
                    />
                    <span className="w-8 h-7 rounded-lg bg-[#1B3A6B] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                      {scores[field]}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2.5 min-[380px]:gap-3">
            {(Object.entries(scores) as [string, number][]).map(([k, v]) => (
              <div
                key={k}
                className="bg-white border border-[--border] rounded-xl p-3"
              >
                <p className="text-[10.5px] min-[380px]:text-[11px] text-[#5A6A8A] mb-2">
                  {scoreLabels[k]}
                </p>
                <ProgressBar
                  value={v * 10}
                  color={v >= 7 ? "#059669" : v >= 5 ? "#D97706" : "#DC2626"}
                  height={5}
                />
                <p className="text-[12px] min-[380px]:text-[12.5px] font-bold text-[#0F1C3F] mt-1.5">
                  {v}/10
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center justify-center gap-2 px-4 min-[380px]:px-6 py-3 bg-gradient-to-r from-[#1B3A6B] to-[#2a5298] text-white text-[13px] min-[380px]:text-[13.5px] sm:text-[14px] rounded-xl hover:opacity-90 transition-all font-semibold shadow-md disabled:opacity-60 w-full sm:w-auto"
          >
            {analyzing ? (
              <>
                <RefreshCw size={15} className="animate-spin shrink-0" /> Analyzing with
                AI…
              </>
            ) : (
              <>
                <Sparkles size={15} className="shrink-0" /> Analyze My Profile with AI
              </>
            )}
          </button>
        </div>
      )}

      {tab === "results" &&
        (analyzing ? (
          <div className="flex flex-col items-center py-16 gap-4 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] flex items-center justify-center shrink-0">
              <Brain size={30} className="text-white animate-pulse" />
            </div>
            <p className="text-[14px] min-[380px]:text-[15px] font-semibold text-[#0F1C3F]">
              AI Analyzing Your Profile…
            </p>
            <p className="text-[12.5px] min-[380px]:text-[13px] text-[#5A6A8A]">
              Processing assessment data, skills, and interests
            </p>
            <div className="w-full max-w-[192px] h-1.5 bg-[#E8ECF5] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#1B3A6B] rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        ) : !analyzed ? (
          <div className="flex flex-col items-center py-12 text-center gap-4 px-4">
            <div className="w-16 h-16 rounded-full bg-[#EBF1FA] flex items-center justify-center shrink-0">
              <Brain size={28} className="text-[#1B3A6B]" />
            </div>
            <p className="text-[13.5px] min-[380px]:text-[14px] font-medium text-[#0F1C3F]">
              Complete the assessment first
            </p>
            <p className="text-[12px] min-[380px]:text-[12.5px] text-[#5A6A8A] max-w-xs">
              Fill in the Personal and Technical assessments, then click
              "Analyze My Profile with AI" to see your results.
            </p>
            <button
              onClick={() => setTab("technical")}
              className="px-5 py-2 bg-[#1B3A6B] text-white text-[12.5px] min-[380px]:text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
            >
              Go to Technical Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4 min-[380px]:space-y-5">
            <div className="p-3.5 min-[380px]:p-4 sm:p-5 bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] rounded-xl text-white">
              <div className="flex items-center gap-2 mb-3 min-[380px]:mb-4">
                <Sparkles size={16} className="text-amber-300 shrink-0" />
                <p className="font-semibold text-[13px] min-[380px]:text-[14px]">
                  Best-Fit Career Roles
                </p>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    role: "Full Stack Developer",
                    fit: 92,
                    color: "bg-emerald-400",
                  },
                  { role: "Data Analyst", fit: 78, color: "bg-amber-400" },
                  { role: "Product Manager", fit: 65, color: "bg-blue-400" },
                ].map((r, i) => (
                  <div key={r.role} className="flex items-center gap-1.5 min-[380px]:gap-2 sm:gap-3">
                    <span className="text-[10.5px] min-[380px]:text-[11px] font-bold text-white/60 w-3.5 min-[380px]:w-4 shrink-0">
                      #{i + 1}
                    </span>
                    <span className="text-[11.5px] min-[380px]:text-[12.5px] sm:text-[13px] font-medium text-white flex-1 min-w-0 truncate">
                      {r.role}
                    </span>
                    <div className="w-10 min-[380px]:w-16 sm:w-24 h-1.5 bg-white/20 rounded-full overflow-hidden shrink-0">
                      <div
                        className={`h-full ${r.color} rounded-full`}
                        style={{ width: `${r.fit}%` }}
                      />
                    </div>
                    <span className="text-[11px] min-[380px]:text-[12px] font-bold text-white w-8 min-[380px]:w-10 text-right shrink-0">
                      {r.fit}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-[380px]:gap-4">
              <div className="p-3.5 min-[380px]:p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[11.5px] min-[380px]:text-[12px] font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
                  <ThumbsUp size={13} className="shrink-0" /> Identified Strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Problem Solving",
                    "JavaScript Proficiency",
                    "React Ecosystem",
                    "Analytical Mindset",
                  ].map((s) => (
                    <span
                      key={s}
                      className="text-[11px] min-[380px]:text-[11.5px] font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3.5 min-[380px]:p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11.5px] min-[380px]:text-[12px] font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                  <Lightbulb size={13} className="shrink-0" /> Areas to Improve
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "System Design",
                    "SQL & Databases",
                    "Communication Skills",
                    "DSA Depth",
                  ].map((s) => (
                    <span
                      key={s}
                      className="text-[11px] min-[380px]:text-[11.5px] font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3.5 min-[380px]:p-4 bg-white border border-[--border] rounded-xl">
              <p className="text-[12.5px] min-[380px]:text-[13px] font-semibold text-[#0F1C3F] mb-3 flex items-center gap-1.5">
                <Route size={14} className="text-[#1B3A6B] shrink-0" /> Recommended
                Learning Path
              </p>
              <div className="flex items-center gap-1.5 min-[380px]:gap-2 flex-wrap">
                {[
                  "HTML/CSS/JS Basics",
                  "React Framework",
                  "Node.js + APIs",
                  "SQL & MongoDB",
                  "System Design",
                  "Interview Prep",
                ].map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-1.5 min-[380px]:gap-2">
                    <span className="text-[11px] min-[380px]:text-[12px] font-medium text-[#1B3A6B] bg-[#EBF1FA] px-2.5 min-[380px]:px-3 py-1.5 rounded-full">
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <ArrowRight size={12} className="text-[#9AA5BE] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-[380px]:gap-3 sm:gap-4">
              <div className="p-3.5 min-[380px]:p-4 bg-white border border-[--border] rounded-xl text-center">
                <Timer size={18} className="text-[#1B3A6B] mx-auto mb-2" />
                <p
                  className="text-[20px] min-[380px]:text-[22px] font-bold text-[#0F1C3F]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  ~8 mo
                </p>
                <p className="text-[11px] min-[380px]:text-[11.5px] text-[#5A6A8A]">
                  Time to job-ready
                </p>
              </div>
              <div className="p-3.5 min-[380px]:p-4 bg-white border border-[--border] rounded-xl sm:col-span-1">
                <p className="text-[11.5px] min-[380px]:text-[12px] font-semibold text-[#0F1C3F] mb-2 flex items-center gap-1.5">
                  <Award size={13} className="text-amber-500 shrink-0" /> Suggested
                  Certifications
                </p>
                {[
                  "Meta React Developer (Meta)",
                  "AWS Cloud Practitioner (Amazon)",
                  "Google Data Analytics (Google)",
                ].map((c) => (
                  <div
                    key={c}
                    className="flex items-center gap-2 text-[11.5px] min-[380px]:text-[12.5px] text-[#5A6A8A] py-0.5"
                  >
                    <Check size={11} className="text-emerald-500 shrink-0" /> <span className="min-w-0">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SS4 — CAREER GOAL SETUP
════════════════════════════════════════════════════════ */
export function SS4() {
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [domains, setDomains] = useState<string[]>(["IT Services", "FinTech"]);
  const [companies, setCompanies] = useState<string[]>([
    "Google",
    "Microsoft",
    "Startup",
  ]);
  const [workMode, setWorkMode] = useState("Hybrid");
  const [salaryMin, setSalaryMin] = useState("6");
  const [salaryMax, setSalaryMax] = useState("12");
  const [negotiable, setNegotiable] = useState(false);
  const [customCompany, setCustomCompany] = useState("");

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "AI/ML Engineer",
    "DevOps Engineer",
    "Cybersecurity Analyst",
    "UI/UX Designer",
    "QA Engineer",
    "Product Manager",
  ];
  const domainList = [
    "IT Services",
    "FinTech",
    "Healthcare",
    "EdTech",
    "E-Commerce",
    "Banking",
    "Manufacturing",
    "Government",
  ];
  const companyList = [
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Microsoft",
    "Google",
    "Amazon",
    "Startup",
  ];
  const companyEmojis: Record<string, string> = {
    TCS: "🏢",
    Infosys: "🔷",
    Wipro: "🌿",
    Accenture: "⬛",
    Microsoft: "🪟",
    Google: "🔍",
    Amazon: "📦",
    Startup: "🚀",
  };

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) =>
    setList(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
    );

  return (
    <div className="space-y-8">
      <SectionTitle
        num="2.4"
        title="Career Goal Setup"
        sub="Define your target role, domain, and companies"
      />

      <div>
        <label className="block text-[13px] font-medium text-[#0F1C3F] mb-3">
          Target Role <span className="text-red-500">*</span>
        </label>
        <div className=" grid grid-cols-1 sm:grid-cols-2 gap-2.5 ">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setTargetRole(r)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all text-[13px] font-medium ${targetRole === r ? "border-[#1B3A6B] bg-[#EBF1FA] text-[#1B3A6B]" : "border-[--border] bg-white text-[#5A6A8A] hover:border-slate-300"}`}
            >
              {r}
              {targetRole === r && <Check size={14} className="shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#0F1C3F] mb-3">
          Preferred Domain (multi-select)
        </label>
        <div className="flex flex-wrap gap-2">
          {domainList.map((d) => (
            <button
              key={d}
              onClick={() => toggleItem(domains, setDomains, d)}
              className={`px-4 py-2 rounded-full text-[12.5px] font-medium border-2 transition-all ${domains.includes(d) ? "border-[#1B3A6B] bg-[#1B3A6B] text-white" : "border-[--border] bg-white text-[#5A6A8A] hover:border-[#1B3A6B]"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#0F1C3F] mb-3">
          Target Companies (multi-select)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {companyList.map((c) => (
            <button
              key={c}
              onClick={() => toggleItem(companies, setCompanies, c)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-medium border-2 transition-all ${companies.includes(c) ? "border-[#1B3A6B] bg-[#EBF1FA] text-[#1B3A6B]" : "border-[--border] bg-white text-[#5A6A8A] hover:border-[#1B3A6B]"}`}
            >
              <span>{companyEmojis[c]}</span> {c}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Add custom company"
            value={customCompany}
            onChange={(e) => setCustomCompany(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && customCompany.trim()) {
                setCompanies((c) => [...c, customCompany.trim()]);
                setCustomCompany("");
              }
            }}
          />
          <button
            onClick={() => {
              if (customCompany.trim()) {
                setCompanies((c) => [...c, customCompany.trim()]);
                setCustomCompany("");
              }
            }}
            className="px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shrink-0 flex items-center justify-center"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div>
        <SectionTitle num="2.4b" title="Preferred Location" />
        <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 ">
          <Field label="Preferred City">
            <Input icon={MapPin} placeholder="Bangalore / Mumbai" />
          </Field>
          <Field label="State">
            <Select>
              <option value="">Any state</option>
              <option>Maharashtra</option>
              <option>Karnataka</option>
              <option>Delhi</option>
              <option>Telangana</option>
            </Select>
          </Field>
          <Field label="Country">
            <Select>
              <option>India</option>
              <option>USA</option>
              <option>UK</option>
              <option>Germany</option>
            </Select>
          </Field>
        </div>
        <label className="block text-[13px] font-medium text-[#0F1C3F] mb-2">
          Work Mode Preference
        </label>
        <div className="flex flex-wrap gap-2">
          {["Remote", "Hybrid", "On-site"].map((m) => (
            <button
              key={m}
              onClick={() => setWorkMode(m)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-[13px] font-medium border-2 transition-all ${workMode === m ? "border-[#1B3A6B] bg-[#EBF1FA] text-[#1B3A6B]" : "border-[--border] bg-white text-[#5A6A8A] hover:border-slate-300"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <label className="text-[13px] font-medium text-[#0F1C3F]">
            Salary Expectations (Optional)
          </label>
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-[--border] rounded-xl">
            <span className="text-[13px] text-[#0F1C3F]">Negotiable</span>
            <button
              onClick={() => setNegotiable(!negotiable)}
              className={`w-10 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${negotiable ? "bg-[#1B3A6B]" : "bg-slate-200"}`}
              style={{ height: "22px" }}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${negotiable ? "translate-x-[18px]" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>
        {!negotiable && (
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <Field label="Minimum">
              <Input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                icon={Hash}
                suffix="LPA"
                placeholder="6"
              />
            </Field>
            <div className="hidden sm:block mt-5 text-[#5A6A8A]">—</div>
            <Field label="Maximum">
              <Input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                icon={Hash}
                suffix="LPA"
                placeholder="12"
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SS5 — AI ROADMAP GENERATOR ⭐
════════════════════════════════════════════════════════ */
export function SS5({ onLMS }: { onLMS?: () => void } = {}) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  const phases = [
    {
      num: 1,
      title: "Foundation",
      months: "Months 1–2",
      color: "#059669",
      bg: "bg-emerald-50 border-emerald-200",
      skills: ["HTML/CSS", "JavaScript Basics", "Git & GitHub", "Linux CLI"],
      project: {
        title: "Personal Portfolio Website",
        desc: "Static responsive site with HTML, CSS, JavaScript",
      },
      milestone: "Can build static web pages",
      courses: [
        {
          id: "c1",
          title: "Full Stack Web Development",
          emoji: "🌐",
          color: "#1B3A6B",
          progress: 62,
          lessons: 68,
        },
      ],
    },
    {
      num: 2,
      title: "Core Skills",
      months: "Months 3–5",
      color: "#1B3A6B",
      bg: "bg-[#EBF1FA] border-[#1B3A6B]/20",
      skills: ["React.js", "Node.js", "REST APIs", "SQL Basics", "MongoDB"],
      project: {
        title: "Task Management App",
        desc: "Full-stack CRUD app with React frontend and Node.js API",
      },
      milestone: "Can build and deploy full-stack web apps",
      courses: [
        {
          id: "c1",
          title: "Full Stack Web Development",
          emoji: "🌐",
          color: "#1B3A6B",
          progress: 62,
          lessons: 68,
        },
        {
          id: "c6",
          title: "DSA & Competitive Programming",
          emoji: "⚡",
          color: "#0891B2",
          progress: 15,
          lessons: 60,
        },
      ],
    },
    {
      num: 3,
      title: "Advanced",
      months: "Months 6–8",
      color: "#D97706",
      bg: "bg-amber-50 border-amber-200",
      skills: ["System Design", "TypeScript", "Docker Basics", "AWS S3/EC2"],
      project: {
        title: "E-Commerce Platform",
        desc: "Production-grade app with auth, payments, and CI/CD",
      },
      milestone: "Job-ready for mid-level Full Stack roles",
      courses: [
        {
          id: "c4",
          title: "Cloud Computing & AWS",
          emoji: "☁️",
          color: "#059669",
          progress: 0,
          lessons: 80,
        },
        {
          id: "c5",
          title: "Machine Learning A–Z",
          emoji: "🤖",
          color: "#DC2626",
          progress: 0,
          lessons: 92,
        },
      ],
    },
    {
      num: 4,
      title: "Interview Prep",
      months: "Months 9–10",
      color: "#7C3AED",
      bg: "bg-purple-50 border-purple-200",
      skills: [
        "DSA Patterns",
        "Mock Interviews",
        "Resume Polish",
        "Portfolio Review",
      ],
      project: {
        title: "Open Source Contribution",
        desc: "Contribute to a GitHub project to demonstrate collaboration",
      },
      milestone: "Ready for placement interviews",
      courses: [
        {
          id: "c6",
          title: "DSA & Competitive Programming",
          emoji: "⚡",
          color: "#0891B2",
          progress: 15,
          lessons: 60,
        },
      ],
    },
  ];

  if (!generated && !generating)
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="flex items-baseline gap-3">
            <span
              className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-[#E8ECF5] text-[#5A6A8A]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              2.5
            </span>
            <h2
              className="text-[16px] sm:text-[17px] text-[#0F1C3F]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              AI Roadmap Generator
            </h2>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Sparkles size={11} /> AI-Powered
          </span>
        </div>
        <div className="p-4 sm:p-5 bg-[#EBF1FA] rounded-xl flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0F1C3F] mb-1">
              Based on your assessment & goals
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                "Full Stack Developer",
                "Google · Microsoft",
                "Hybrid",
                "8 LPA+",
              ].map((t) => (
                <span
                  key={t}
                  className="text-[11.5px] font-medium text-[#1B3A6B] bg-white border border-[#1B3A6B]/20 px-2.5 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={generate}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#1B3A6B] to-[#2a5298] text-white text-[13.5px] sm:text-[14px] rounded-xl hover:opacity-90 transition-all font-semibold shadow-md w-full sm:w-auto"
        >
          <Sparkles size={16} /> Generate My Personalized Roadmap
        </button>
      </div>
    );

  if (generating)
    return (
      <div className="flex flex-col items-center py-16 gap-5 px-4 text-center">
        <div className="relative w-20 h-20">
          <div className="w-20 h-20 rounded-full border-4 border-[#E8ECF5]" />
          <div className="absolute inset-0 rounded-full border-4 border-[#1B3A6B] border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Route size={26} className="text-[#1B3A6B]" />
          </div>
        </div>
        <p className="text-[15px] font-semibold text-[#0F1C3F]">
          Building your personalized roadmap…
        </p>
        <div className="space-y-1.5 text-center">
          {[
            "Analyzing skill gaps",
            "Mapping to career goal",

            "Scheduling milestones",
            "Estimating timeline",
          ].map((s) => (
            <p
              key={s}
              className="text-[12.5px] text-[#5A6A8A] flex items-center gap-2 justify-center"
            >
              <RefreshCw size={11} className="animate-spin text-[#1B3A6B]" />{" "}
              {s}
            </p>
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            className="text-[16px] sm:text-[17px] text-[#0F1C3F]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Your AI-Generated Roadmap
          </h2>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Check size={11} /> Generated
          </span>
        </div>
        <button
          onClick={() => setGenerated(false)}
          className="text-[12.5px] text-[#1B3A6B] hover:underline flex items-center gap-1"
        >
          <RefreshCw size={12} /> Regenerate
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-[#EBF1FA] rounded-xl">
        <Target size={15} className="text-[#1B3A6B] shrink-0" />
        <span className="text-[13px] font-medium text-[#0F1C3F]">
          Full Stack Developer
        </span>
        <div className="hidden sm:block w-px h-4 bg-[#1B3A6B]/20" />
        <Timer size={14} className="text-[#5A6A8A]" />
        <span className="text-[13px] text-[#5A6A8A]">10 months total</span>
        <div className="hidden sm:block w-px h-4 bg-[#1B3A6B]/20" />
        <Flag size={14} className="text-amber-600" />
        <span className="text-[13px] text-[#5A6A8A]">4 milestones</span>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-[--border]" />
        <div className="space-y-5">
          {phases.map((ph) => (
            <div key={ph.num} className="flex gap-3 sm:gap-5">
              <div className="flex flex-col items-center gap-0 shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold z-10 shadow-sm"
                  style={{ background: ph.color }}
                >
                  {ph.num}
                </div>
              </div>
              <div className={`flex-1 min-w-0 border rounded-xl p-4 ${ph.bg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-semibold text-[#0F1C3F]">
                      {ph.title}
                    </p>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-[#5A6A8A]">
                      {ph.months}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5A6A8A] flex items-center gap-1">
                    <Flag size={10} /> {ph.milestone}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ph.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-white border border-white/50 text-[#0F1C3F]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
                  <Rocket
                    size={13}
                    className="text-[#1B3A6B] mt-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-[#0F1C3F]">
                      Project: {ph.project.title}
                    </p>
                    <p className="text-[11.5px] text-[#5A6A8A]">
                      {ph.project.desc}
                    </p>
                  </div>
                </div>
                {/* Assigned LMS courses */}
                <div className="mt-2.5 space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#5A6A8A] uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen size={11} /> Assigned Courses
                  </p>
                  {ph.courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onLMS?.()}
                      className="w-full flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-white/70 hover:border-white hover:shadow-sm transition-all group text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] shrink-0"
                        style={{ background: `${c.color}22` }}
                      >
                        {c.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#0F1C3F] truncate leading-snug">
                          {c.title}
                        </p>
                        {c.progress > 0 ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex-1 h-1 bg-[#E8ECF5] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${c.progress}%`,
                                  background: c.color,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-semibold shrink-0"
                              style={{ color: c.color }}
                            >
                              {c.progress}%
                            </span>
                          </div>
                        ) : (
                          <p className="text-[10.5px] text-[#9AA5BE] mt-0.5">
                            {c.lessons} lessons · Not started
                          </p>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <PlayCircle size={14} className="text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-[--border] rounded-xl">
          <p className="text-[13px] font-semibold text-[#0F1C3F] mb-3 flex items-center gap-2">
            <Award size={14} className="text-amber-500" /> Recommended
            Certifications
          </p>
          {[
            "Meta React Developer",
            "AWS Cloud Practitioner",
            "Google Data Analytics",
          ].map((c, i) => (
            <div
              key={c}
              className="flex items-center gap-2 py-1.5 border-b border-[--border] last:border-0"
            >
              <span className="w-5 h-5 rounded-full bg-[#EBF1FA] text-[#1B3A6B] text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-[12.5px] text-[#5A6A8A]">{c}</span>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border border-[--border] rounded-xl">
          <p className="text-[13px] font-semibold text-[#0F1C3F] mb-3 flex items-center gap-2">
            <Briefcase size={14} className="text-[#1B3A6B]" /> Internship
            Recommendation
          </p>
          <div className="p-3 bg-[#EBF1FA] rounded-lg">
            <p className="text-[13px] font-medium text-[#1B3A6B]">
              3 internships match your profile
            </p>
            <p className="text-[11.5px] text-[#5A6A8A] mt-1">
              Bangalore · Full Stack · ₹15–25K/mo
            </p>
            <button className="mt-2 text-[12px] text-[#1B3A6B] font-medium hover:underline flex items-center gap-1">
              View opportunities <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SS6 — STUDENT DASHBOARD
════════════════════════════════════════════════════════ */
export function SS6() {
  const [activeNotifs, setActiveNotifs] = useState([0, 1, 2]);
  const [cvTab, setCvTab] = useState<"preview" | "share">("preview");

  const notifs = [
    {
      icon: Bell,
      color: "text-amber-600 bg-amber-50",
      text: "Aptitude Test due in 2 days",
      time: "2h ago",
      type: "Assessment reminder",
    },
    {
      icon: TrendingUp,
      color: "text-[#1B3A6B] bg-[#EBF1FA]",
      text: 'Phase 2 "Core Skills" roadmap unlocked!',
      time: "1d ago",
      type: "Roadmap update",
    },
    {
      icon: Briefcase,
      color: "text-emerald-600 bg-emerald-50",
      text: "TCS Recruitment Drive opens next Monday",
      time: "1d ago",
      type: "Job alert",
    },
    {
      icon: Award,
      color: "text-purple-600 bg-purple-50",
      text: "Internship at Groww — Apply by Dec 15",
      time: "2d ago",
      type: "Internship",
    },
    {
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-50",
      text: "Mentor feedback received on E-Commerce Project",
      time: "3d ago",
      type: "Mentor feedback",
    },
  ];

  const roadmapModules = [
    { label: "Foundation", pct: 100, color: "#059669" },
    { label: "Core Skills", pct: 60, color: "#1B3A6B" },
    { label: "Advanced", pct: 20, color: "#D97706" },
    { label: "Interview Prep", pct: 0, color: "#7C3AED" },
  ];

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 md:-mx-8 -mt-7">
      <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2a5298] px-4 sm:px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-[16px] font-bold shrink-0">
            AP
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-[15px]">Aisha Patel</p>
            <p className="text-white/60 text-[12px] sm:text-[12.5px]">
              B.E. Computer Science · 2021–2025 · CGPA 8.4
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11.5px] font-medium text-white bg-white/15 px-3 py-1.5 rounded-full">
            Full Stack Developer Track
          </span>
          <span className="text-[11.5px] font-medium text-emerald-300 bg-emerald-900/30 border border-emerald-400/30 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Check size={11} /> Profile 72% Complete
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Roadmap Progress",
              value: "45%",
              sub: "Phase 2 active",
              icon: Route,
              color: "bg-[#EBF1FA] text-[#1B3A6B]",
              pct: 45,
              barColor: "#1B3A6B",
            },
            {
              label: "Readiness Score",
              value: "68%",
              sub: "Good — keep going",
              icon: Activity,
              color: "bg-amber-50 text-amber-600",
              pct: 68,
              barColor: "#D97706",
            },
            {
              label: "Skills Verified",
              value: "12/20",
              sub: "8 in progress",
              icon: CheckCircle2,
              color: "bg-emerald-50 text-emerald-600",
              pct: 60,
              barColor: "#059669",
            },
            {
              label: "Days to Placement",
              value: "187",
              sub: "Target: Jun 2025",
              icon: Calendar,
              color: "bg-purple-50 text-purple-600",
              pct: null,
              barColor: "",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white border border-[--border] rounded-xl p-3 sm:p-4"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}
                >
                  <Icon size={15} />
                </div>
                <p
                  className="text-[19px] sm:text-[22px] font-bold text-[#0F1C3F]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {s.value}
                </p>
                <p className="text-[11px] sm:text-[11.5px] text-[#5A6A8A] mb-2">{s.label}</p>
                {s.pct !== null && (
                  <ProgressBar value={s.pct} color={s.barColor} height={4} />
                )}
                <p className="text-[10.5px] text-[#9AA5BE] mt-1.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
          <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" /> Career Insights
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-[#EBF1FA] rounded-xl text-center gap-1">
              <p className="text-[11.5px] text-[#5A6A8A]">Recommended Path</p>
              <p
                className="text-[14px] font-bold text-[#1B3A6B]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Full Stack Dev
              </p>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                92% fit
              </span>
            </div>
            <div className="col-span-1 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-[11.5px] font-semibold text-emerald-800 mb-2">
                Strengths
              </p>
              <div className="space-y-1">
                {["Problem Solving", "JavaScript", "React"].map((s) => (
                  <div
                    key={s}
                    className="text-[12px] text-emerald-700 flex items-center gap-1.5"
                  >
                    <Check size={10} /> {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-1 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[11.5px] font-semibold text-amber-800 mb-2">
                Improve
              </p>
              <div className="space-y-1">
                {["System Design", "SQL", "Communication"].map((s) => (
                  <div
                    key={s}
                    className="text-[12px] text-amber-700 flex items-center gap-1.5"
                  >
                    <ArrowRight size={10} /> {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-white border border-[--border] rounded-xl text-center gap-1">
              <Timer size={18} className="text-[#1B3A6B]" />
              <p className="text-[11.5px] text-[#5A6A8A]">Time remaining</p>
              <p className="text-[16px] font-bold text-[#0F1C3F]">~5 months</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13.5px] font-semibold text-[#0F1C3F] flex items-center gap-2">
                <Route size={14} className="text-[#1B3A6B]" /> Roadmap Progress
              </p>
              <span className="text-[12px] font-bold text-[#1B3A6B]">45%</span>
            </div>
            <ProgressBar value={45} height={6} />
            <div className="mt-4 space-y-3">
              {roadmapModules.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12.5px] text-[#5A6A8A]">
                      {m.label}
                    </span>
                    <span className="text-[12px] font-medium text-[#0F1C3F]">
                      {m.pct}%
                    </span>
                  </div>
                  <ProgressBar value={m.pct} color={m.color} height={5} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-[--border]">
              <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-700">
                <CheckCircle2 size={13} /> 3 milestones achieved
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-amber-600">
                <RefreshCw size={13} /> 2 upcoming
              </div>
            </div>
          </div>

          <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
            <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-4 flex items-center gap-2">
              <Activity size={14} className="text-[#1B3A6B]" /> Readiness Scores
            </p>
            <div className=" grid grid-cols-1 sm:grid-cols-3 gap-3 justify-items-center">
              <CircleGauge
                value={68}
                size={84}
                color="#1B3A6B"
                label="Overall"
              />
              <CircleGauge
                value={72}
                size={84}
                color="#D97706"
                label="Full Stack Dev"
              />
              <CircleGauge
                value={45}
                size={84}
                color="#DC2626"
                label="Google"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
          <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-4 flex items-center gap-2">
            <Layers size={14} className="text-[#1B3A6B]" /> Skill Progress
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[12px] font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Verified (5)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["React", "JavaScript", "Git", "HTML/CSS", "Node.js"].map(
                  (s) => (
                    <Tag key={s} color="green">
                      {s}
                    </Tag>
                  ),
                )}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#1B3A6B] mb-2 flex items-center gap-1.5">
                <RefreshCw size={12} /> In Progress (3)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["TypeScript", "Docker", "AWS"].map((s) => (
                  <Tag key={s} color="blue">
                    {s}
                  </Tag>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#9AA5BE] mb-2 flex items-center gap-1.5">
                <RefreshCw size={12} /> Pending (4)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Kubernetes", "GraphQL", "Redis", "Kafka"].map((s) => (
                  <span
                    key={s}
                    className="text-[11.5px] font-medium text-[#9AA5BE] bg-slate-100 px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
            <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-4 flex items-center gap-2">
              <Rocket size={14} className="text-[#1B3A6B]" /> Project Progress
            </p>
            <div className="space-y-3">
              {[
                { label: "Todo App with React", status: "done", pct: 100 },
                { label: "REST API with Node.js", status: "done", pct: 100 },
                { label: "E-Commerce Platform", status: "ongoing", pct: 60 },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-3">
                  {p.status === "done" ? (
                    <CheckCircle2
                      size={15}
                      className="text-emerald-500 shrink-0"
                    />
                  ) : (
                    <RefreshCw size={15} className="text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[#0F1C3F] truncate">
                      {p.label}
                    </p>
                    {p.status === "ongoing" && (
                      <ProgressBar value={p.pct} color="#D97706" height={3} />
                    )}
                  </div>
                  <span
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${p.status === "done" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}
                  >
                    {p.status === "done" ? "Done" : `${p.pct}%`}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-[--border]">
                <p className="text-[11.5px] font-medium text-[#5A6A8A] mb-2">
                  Recommended
                </p>
                {["Blog CMS", "Real-time Chat App"].map((p) => (
                  <div
                    key={p}
                    className="flex items-center justify-between py-1 gap-2"
                  >
                    <span className="text-[12px] text-[#5A6A8A] truncate">{p}</span>
                    <button className="text-[11.5px] font-medium text-[#1B3A6B] bg-[#EBF1FA] px-2.5 py-1 rounded-lg hover:bg-[#D7E5F7] transition-colors flex items-center gap-1 shrink-0">
                      <PlayCircle size={11} /> Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
            <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-4 flex items-center gap-2">
              <ClipboardList size={14} className="text-[#1B3A6B]" /> Assessment
              Status
            </p>
            <div className="space-y-2.5 mb-3">
              {[
                { name: "Aptitude Test", score: 82, status: "done" },
                { name: "Coding Assessment", score: 76, status: "done" },
                { name: "Communication Test", score: 88, status: "done" },
              ].map((a) => (
                <div
                  key={a.name}
                  className="flex items-center gap-3 px-3 py-2 bg-[#F8FAFB] rounded-lg"
                >
                  <CheckCircle2
                    size={13}
                    className="text-emerald-500 shrink-0"
                  />
                  <span className="text-[12.5px] text-[#0F1C3F] flex-1">
                    {a.name}
                  </span>
                  <span className="text-[12px] font-bold text-emerald-700">
                    {a.score}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] font-semibold text-[#5A6A8A] mb-2">
              Upcoming
            </p>
            {[
              { name: "System Design", due: "5 days" },
              { name: "Mock Interview", due: "12 days" },
            ].map((a) => (
              <div
                key={a.name}
                className="flex items-center gap-3 px-3 py-2 bg-amber-50 rounded-lg mb-1.5"
              >
                <RefreshCw size={13} className="text-amber-600 shrink-0" />
                <span className="text-[12.5px] text-[#0F1C3F] flex-1">
                  {a.name}
                </span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                  in {a.due}
                </span>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-[--border]">
              <span className="text-[12px] text-[#5A6A8A]">Avg. Score</span>
              <span className="text-[14px] font-bold text-[#0F1C3F]">82%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <p className="text-[13.5px] font-semibold text-[#0F1C3F] flex items-center gap-2">
                <FileText size={14} className="text-[#1B3A6B]" /> Dynamic CV
              </p>
              <div className="flex gap-1 p-0.5 bg-[#EFF2FA] rounded-lg">
                {(["preview", "share"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCvTab(t)}
                    className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all capitalize ${cvTab === t ? "bg-white text-[#1B3A6B] shadow-sm" : "text-[#5A6A8A]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {cvTab === "preview" ? (
              <div className="border border-[--border] rounded-lg p-4 bg-[#FAFBFD] text-[11px] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0F1C3F]">
                      Aisha Patel
                    </p>
                    <p className="text-[#5A6A8A] break-words">
                      Full Stack Developer · aisha@college.edu.in
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#E8ECF5] flex items-center justify-center text-[10px] font-bold text-[#1B3A6B] shrink-0">
                    AP
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "JavaScript", "SQL"].map((s) => (
                    <span
                      key={s}
                      className="bg-[#EBF1FA] text-[#1B3A6B] px-1.5 py-0.5 rounded text-[10px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="h-px bg-[--border]" />
                <div>
                  <p className="font-semibold text-[#0F1C3F]">Education</p>
                  <p className="text-[#5A6A8A]">
                    B.E. Computer Engineering · CGPA 8.4 · 2025
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1C3F]">Experience</p>
                  <p className="text-[#5A6A8A]">
                    Frontend Intern · Startup XYZ · May–Jul 2024
                  </p>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 bg-[#E8ECF5] rounded-full"
                    style={{ width: `${85 - i * 12}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-[#EBF1FA] rounded-lg">
                  <p className="text-[12px] font-medium text-[#1B3A6B] mb-0.5">
                    Public Profile URL
                  </p>
                  <p
                    className="text-[11.5px] text-[#5A6A8A] font-mono break-all"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    educonnect.in/profile/aisha-patel
                  </p>
                </div>
                <button className="w-full flex items-center gap-1 justify-center text-[12.5px] text-[#5A6A8A] hover:text-[#1B3A6B] transition-colors">
                  <Link size={12} /> Copy Public Link
                </button>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1B3A6B] text-white text-[12.5px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium">
                <FileText size={13} /> PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[--border] text-[#5A6A8A] text-[12.5px] rounded-[10px] hover:bg-[#F4F7FC] transition-colors font-medium">
                <FileText size={13} /> DOCX
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#1B3A6B]/20">
            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] px-4 sm:px-5 py-4">
              <p className="text-white font-semibold text-[13.5px] flex items-center gap-2">
                <Sparkles size={14} className="text-amber-300" /> AI
                Recommendations
              </p>
              <p className="text-white/60 text-[11.5px] mt-0.5">
                Personalized for your goals & progress
              </p>
            </div>
            <div className="bg-white p-4 space-y-3">
              {[
                {
                  icon: Cpu,
                  label: "Next Skill to Learn",
                  value: "TypeScript — aligns with Full Stack goal",
                  color: "text-[#1B3A6B] bg-[#EBF1FA]",
                },
                {
                  icon: BookMarked,
                  label: "Recommended Course",
                  value: '"The Complete React Developer" — Udemy',
                  color: "text-amber-600 bg-amber-50",
                },
                {
                  icon: Rocket,
                  label: "Suggested Project",
                  value: "Build a Real-time Chat App with Socket.io",
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  icon: Briefcase,
                  label: "Internship Opportunities",
                  value: "3 matches found in Bangalore",
                  color: "text-purple-600 bg-purple-50",
                },
                {
                  icon: Lightbulb,
                  label: "Improvement Tip",
                  value: "Solve 2 DSA problems daily to boost logical score",
                  color: "text-[#5A6A8A] bg-slate-100",
                },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${r.color}`}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-semibold text-[#9AA5BE] uppercase tracking-wide">
                        {r.label}
                      </p>
                      <p className="text-[12.5px] text-[#0F1C3F]">{r.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5">
          <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-4 flex items-center gap-2">
            <Bell size={14} className="text-[#1B3A6B]" /> Notifications
          </p>
          <div className="space-y-2">
            {notifs.map((n, i) => {
              const Icon = n.icon;
              const unread = activeNotifs.includes(i);
              return (
                <div
                  key={i}
                  onClick={() =>
                    setActiveNotifs((a) => a.filter((x) => x !== i))
                  }
                  className={`flex items-start gap-3 px-3 sm:px-4 py-3 rounded-xl cursor-pointer transition-all ${unread ? "bg-[#F4F7FC]" : "bg-white hover:bg-[#F8FAFB]"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#0F1C3F]">
                      {n.text}
                    </p>
                    <p className="text-[11.5px] text-[#9AA5BE] mt-0.5">
                      {n.type} · {n.time}
                    </p>
                  </div>
                  {unread && (
                    <div className="w-2 h-2 rounded-full bg-[#1B3A6B] mt-1.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
