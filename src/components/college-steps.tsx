import { useState } from "react";
import {
  Building2,
  User,
  Mail,
  Settings,
  Users,
  GraduationCap,
  Target,
  LayoutDashboard,
  CreditCard,
  ChevronRight,
  Check,
  X,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Star,
  Zap,
  Building,
  Globe,
  Phone,
  Hash,
  Calendar,
  MapPin,
  Download,
  Info,
  Plus,
  Trash2,
  BookOpen,
  BarChart2,
  Briefcase,
  UserCheck,
  Send,
  FileSpreadsheet,
  Bell,
  PieChart,
  TrendingUp,
  ClipboardList,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  SectionTitle,
  Field,
  Input,
  Select,
  InfoBox,
  Tag,
  OTPInput,
  FileDropZone,
  Toggle,
  inputCls,
} from "../components/shared";

type UploadedFile = {
  name: string;
  size: number;
  status: "uploading" | "done";
};

/* ─────────────────────────────────────────────────────────────────────────
   STEPS 1–3  (Registration)
───────────────────────────────────────────────────────────────────────── */

export function Step1() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          num="1.1"
          title="Institution Details"
          sub="Basic information about your institution"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="col-span-1 sm:col-span-2">
            <Field label="College / University Name" required>
              <Input
                icon={Building2}
                placeholder="e.g. Rajiv Gandhi Institute of Technology"
              />
            </Field>
          </div>
          <Field label="Institution Type" required>
            <Select icon={Building2}>
              <option value="">Select type</option>
              <option>College</option>
              <option>University</option>
              <option>Institute</option>
              <option>Deemed University</option>
            </Select>
          </Field>
          <Field label="Ownership" required>
            <Select>
              <option value="">Select ownership</option>
              <option>Government</option>
              <option>Private</option>
              <option>Autonomous</option>
              <option>PPP</option>
            </Select>
          </Field>
          <Field label="Registration Number" required>
            <Input icon={Hash} placeholder="MH-12345/2009" />
          </Field>
          <Field label="Year of Establishment" required>
            <Input icon={Calendar} type="number" placeholder="2005" />
          </Field>
          <Field label="Official Website" required>
            <Input
              icon={Globe}
              type="url"
              placeholder="https://www.college.edu.in"
            />
          </Field>
          <Field
            label="Official Email Domain"
            required
            hint="Used to validate staff emails"
          >
            <Input suffix="domain" placeholder="college.edu.in" />
          </Field>
          <Field label="Contact Number" required>
            <Input icon={Phone} type="tel" placeholder="+91 98765 43210" />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle
          num="1.2"
          title="Accreditation"
          sub="Current accreditation & recognition details"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Field label="AICTE Approval Number">
            <Input placeholder="AICTE-2024-MH-1234" />
          </Field>
          <Field label="UGC Recognition">
            <Input placeholder="F.9-1/2009(CPP-I)" />
          </Field>
          <Field label="NAAC Grade">
            <Select>
              <option value="">Select grade</option>
              {["A++", "A+", "A", "B++", "B+", "B", "C"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="NBA Status">
            <Select>
              <option value="">Select status</option>
              <option>Accredited</option>
              <option>Partial</option>
              <option>Applied</option>
              <option>Not Applicable</option>
            </Select>
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle
          num="1.3"
          title="Address"
          sub="Registered address of the institution"
        />
        <div className="grid grid-cols-1 md:grid-cols-2  gap-4 sm:gap-5">
          <Field label="Country" required>
            <Select icon={MapPin}>
              <option>India</option>
            </Select>
          </Field>
          <Field label="State" required>
            <Select>
              <option value="">Select state</option>
              {[
                "Maharashtra",
                "Karnataka",
                "Tamil Nadu",
                "Delhi",
                "Gujarat",
                "Rajasthan",
                "UP",
                "West Bengal",
                "AP",
                "Telangana",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="City" required>
            <Input placeholder="Mumbai" />
          </Field>
          <Field label="Postal Code" required>
            <Input placeholder="400001" />
          </Field>
          <div className="col-span-1 sm:col-span-2">
            <Field label="Complete Address" required>
              <textarea
                rows={3}
                placeholder="Plot No., Street, Area, District..."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Step2() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          num="2.1"
          title="Primary Contact"
          sub="Placement officer who will manage this account"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="col-span-1 sm:col-span-2">
            <Field label="Placement Officer Name" required>
              <Input icon={User} placeholder="Dr. Ramesh Kumar" />
            </Field>
          </div>
          <Field label="Designation" required>
            <Input placeholder="Training & Placement Officer" />
          </Field>
          <Field label="Employee ID">
            <Input icon={Hash} placeholder="EMP-2024-001" />
          </Field>
          <Field label="Official Email" required>
            <Input icon={Mail} type="email" placeholder="tpo@college.edu.in" />
          </Field>
          <Field label="Mobile Number" required>
            <Input icon={Phone} type="tel" placeholder="+91 98765 43210" />
          </Field>
        </div>
      </div>
      <div>
        <SectionTitle
          num="2.2"
          title="Additional Contacts"
          sub="Supporting personnel with portal access"
        />
        {[
          { title: "Principal / Director", role: "Head of Institution" },
          { title: "Training & Placement Head", role: "Department Head" },
          { title: "IT Administrator", role: "Technical Contact" },
        ].map((c) => (
          <div
            key={c.title}
            className="p-5 bg-[#F8FAFB] border border-[--border] rounded-xl mb-4 last:mb-0"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#E8ECF5] flex items-center justify-center">
                <User size={12} className="text-[#1B3A6B]" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#0F1C3F]">
                  {c.title}
                </p>
                <p className="text-[11.5px] text-[#5A6A8A]">{c.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <Input placeholder="Full Name" />
              </Field>
              <Field label="Designation">
                <Input placeholder={c.role} />
              </Field>
              <Field label="Email">
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="email@college.edu.in"
                />
              </Field>
              <Field label="Mobile">
                <Input icon={Phone} type="tel" placeholder="+91 XXXXX XXXXX" />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Step3() {
  const [emailSent, setEmailSent] = useState(false);
  const [mobileSent, setMobileSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const startCountdown = () => {
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
  };
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6">
      <SectionTitle
        num="3.0"
        title="Email & Mobile Verification"
        sub="Verify your official contact details to continue"
      />
      {[
        {
          type: "email" as const,
          label: "Email OTP Verification",
          icon: Mail,
          contact: "tpo@college.edu.in",
          sent: emailSent,
          setSent: setEmailSent,
          verified: emailVerified,
          setVerified: setEmailVerified,
          otp: emailOtp,
          setOtp: setEmailOtp,
        },
        {
          type: "mobile" as const,
          label: "Mobile OTP Verification",
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
          className={`sm:p-5 p-3 rounded-xl border-2 transition-all ${v.verified ? "border-emerald-200 bg-emerald-50/40" : "border-[--border] bg-white"}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${v.verified ? "bg-emerald-100" : "bg-[#E8ECF5]"}`}
              >
                {v.verified ? (
                  <CheckCircle2 size={19} className="text-emerald-600" />
                ) : (
                  <v.icon size={17} className="text-[#1B3A6B]" />
                )}
              </div>
              <div>
                <p className="font-medium text-[#0F1C3F] text-[13.5px]">
                  {v.label}
                </p>
                <p
                  className="text-[11.5px] text-[#5A6A8A] mt-0.5 break-all"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {v.contact}
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${v.verified ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100"}`}
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
              >
                <v.icon size={13} /> Send OTP to{" "}
                {v.type === "email" ? "Email" : "Mobile"}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-[12.5px] text-[#5A6A8A] break-words">
                  Enter the 6-digit OTP sent to{" "}
                  <strong className="text-[#0F1C3F]">{v.contact}</strong>
                </p>
                <OTPInput value={v.otp} onChange={v.setOtp} />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => v.otp.length === 6 && v.setVerified(true)}
                    className="px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
                  >
                    Verify OTP
                  </button>
                  <button
                    disabled={countdown > 0}
                    onClick={() => startCountdown()}
                    className="text-[12.5px] text-[#1B3A6B] hover:underline disabled:opacity-40 disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      ))}
      <InfoBox title="Domain Verification (Optional)">
        Add a DNS TXT record to verify ownership of your domain. This enables
        auto-approval for future staff registrations.
        <button className="mt-2 flex items-center gap-1 text-[#1B3A6B] font-medium text-[12.5px] hover:underline">
          View DNS instructions <ChevronRight size={12} />
        </button>
      </InfoBox>
    </div>
  );
}

type Department = { id: number; name: string; code: string; hod: string };
type Course = {
  id: number;
  dept: string;
  name: string;
  duration: string;
  type: string;
};
type Batch = { id: number; label: string; year: string; intake: string };

export function Step4() {
  const [depts, setDepts] = useState<Department[]>([
    { id: 1, name: "Computer Engineering", code: "CE", hod: "Dr. Anita Verma" },
    {
      id: 2,
      name: "Electronics & Communication",
      code: "EC",
      hod: "Prof. Rajan Iyer",
    },
  ]);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      dept: "Computer Engineering",
      name: "B.E. Computer Engineering",
      duration: "4 Years",
      type: "UG",
    },
    {
      id: 2,
      dept: "Electronics & Communication",
      name: "B.E. E&C Engineering",
      duration: "4 Years",
      type: "UG",
    },
  ]);
  const [batches, setBatches] = useState<Batch[]>([
    { id: 1, label: "2021–2025", year: "2021", intake: "120" },
    { id: 2, label: "2022–2026", year: "2022", intake: "120" },
    { id: 3, label: "2023–2027", year: "2023", intake: "120" },
  ]);
  const [logoFile, setLogoFile] = useState<UploadedFile | undefined>();
  const [primaryColor, setPrimaryColor] = useState("#1B3A6B");
  const [accentColor, setAccentColor] = useState("#D97706");
  const [addingDept, setAddingDept] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", code: "", hod: "" });

  const addDept = () => {
    if (!newDept.name) return;
    setDepts((d) => [...d, { ...newDept, id: Date.now() }]);
    setNewDept({ name: "", code: "", hod: "" });
    setAddingDept(false);
  };

  const addBatch = () =>
    setBatches((b) => [
      ...b,
      {
        id: Date.now(),
        label: `${new Date().getFullYear()}–${new Date().getFullYear() + 4}`,
        year: String(new Date().getFullYear()),
        intake: "60",
      },
    ]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-8">
      {/* Academic Year */}
      <div>
        <SectionTitle
          num="4.1"
          title="Academic Year"
          sub="Set the current academic calendar"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <Field label="Academic Year" required>
            <Select>
              <option>2024–2025</option>
              <option>2025–2026</option>
              <option>2026–2027</option>
            </Select>
          </Field>
          <Field label="Session Start" required>
            <Input type="date" defaultValue="2024-07-01" />
          </Field>
          <Field label="Session End" required>
            <Input type="date" defaultValue="2025-05-31" />
          </Field>
        </div>
      </div>

      {/* Departments */}
      <div>
        <SectionTitle
          num="4.2"
          title="Departments"
          sub="Add all departments offered by your institution"
        />
        <div className="space-y-2.5 mb-4">
          {depts.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 px-3 sm:px-4 py-3 bg-white border border-[--border] rounded-xl min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E8ECF5] flex items-center justify-center shrink-0">
                <BookOpen size={13} className="text-[#1B3A6B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0F1C3F]">
                  {d.name}
                </p>
                <p className="text-[11.5px] text-[#5A6A8A]">
                  Code:{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {d.code}
                  </span>{" "}
                  · HOD: {d.hod}
                </p>
              </div>
              <button
                onClick={() =>
                  setDepts((ds) => ds.filter((x) => x.id !== d.id))
                }
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#9AA5BE] hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        {addingDept ? (
          <div className="p-4 bg-[#EBF1FA] rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <Field label="Department Name">
                  <Input
                    placeholder="Computer Engineering"
                    value={newDept.name}
                    onChange={(e) =>
                      setNewDept((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </Field>
              </div>
              <Field label="Short Code">
                <Input
                  placeholder="CE"
                  value={newDept.code}
                  onChange={(e) =>
                    setNewDept((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                />
              </Field>
              <Field label="HOD Name">
                <Input
                  placeholder="Dr. Name"
                  value={newDept.hod}
                  onChange={(e) =>
                    setNewDept((p) => ({ ...p, hod: e.target.value }))
                  }
                />
              </Field>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={addDept}
                className="px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
              >
                Add Department
              </button>
              <button
                onClick={() => setAddingDept(false)}
                className="px-4 py-2 border border-[--border] text-[#5A6A8A] text-[13px] rounded-[10px] hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingDept(true)}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#1B3A6B]/30 text-[#1B3A6B] text-[13px] rounded-xl hover:bg-[#EBF1FA] transition-colors font-medium w-full justify-center"
          >
            <Plus size={14} /> Add Department
          </button>
        )}
      </div>

      {/* Courses */}
      <div>
        <SectionTitle
          num="4.3"
          title="Courses"
          sub="Programs offered across departments"
        />
        <div className="space-y-2 mb-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-[--border] rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <GraduationCap size={13} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0F1C3F]">
                  {c.name}
                </p>
                <p className="text-[11.5px] text-[#5A6A8A]">
                  {c.dept} · {c.duration} · <Tag color="green">{c.type}</Tag>
                </p>
              </div>
              <button
                onClick={() =>
                  setCourses((cs) => cs.filter((x) => x.id !== c.id))
                }
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#9AA5BE] hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setCourses((cs) => [
              ...cs,
              {
                id: Date.now(),
                dept: depts[0]?.name || "Department",
                name: "New Course",
                duration: "4 Years",
                type: "UG",
              },
            ])
          }
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-emerald-300 text-emerald-700 text-[13px] rounded-xl hover:bg-emerald-50 transition-colors font-medium w-full justify-center"
        >
          <Plus size={14} /> Add Course
        </button>
      </div>

      {/* Batches */}
      <div>
        <SectionTitle
          num="4.4"
          title="Batches"
          sub="Academic batches currently active in the portal"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {batches.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-white border border-[--border] rounded-xl min-w-0"
            >
              <div>
                <p
                  className="text-[13px] font-semibold text-[#0F1C3F]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {b.label}
                </p>
                <p className="text-[11.5px] text-[#5A6A8A]">
                  Intake: {b.intake} students
                </p>
              </div>
              <button
                onClick={() =>
                  setBatches((bs) => bs.filter((x) => x.id !== b.id))
                }
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#9AA5BE] hover:text-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={addBatch}
            className="flex flex-col items-center justify-center gap-1 px-4 py-3 border-2 border-dashed border-[--border] rounded-xl text-[#5A6A8A] hover:border-[#1B3A6B] hover:text-[#1B3A6B] hover:bg-[#EBF1FA] transition-all"
          >
            <Plus size={16} />
            <span className="text-[12px] font-medium">Add Batch</span>
          </button>
        </div>
      </div>

      {/* College Branding */}
      <div>
        <SectionTitle
          num="4.5"
          title="College Branding"
          sub="Customize the portal to match your institution"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <FileDropZone
            label="College Logo"
            required
            file={logoFile}
            onFile={setLogoFile}
            onRemove={() => setLogoFile(undefined)}
          />
          <div className="space-y-4">
            <Field label="Primary Brand Color">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 shrink-0 rounded-lg border-2 border-[--border] cursor-pointer p-0.5"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#1B3A6B"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </Field>
            <Field label="Accent Color">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 shrink-0 rounded-lg border-2 border-[--border] cursor-pointer p-0.5"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#D97706"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </Field>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Field label="Tagline / Motto">
            <Input placeholder="Excellence in Education & Innovation" />
          </Field>
          <Field label="Social Media Handle">
            <Input placeholder="@college_official" />
          </Field>
        </div>
      </div>

      {/* General Settings */}
      <div>
        <SectionTitle
          num="4.6"
          title="General Settings"
          sub="Portal language, timezone, and notification preferences"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <Field label="Language">
            <Select>
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
              <option>Tamil</option>
            </Select>
          </Field>
          <Field label="Timezone">
            <Select>
              <option>IST (UTC+5:30)</option>
            </Select>
          </Field>
          <Field label="Date Format">
            <Select>
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </Select>
          </Field>
        </div>
        <div className="mt-5 space-y-3 min-w-0">
          {[
            { label: "Enable email notifications for students", default: true },
            { label: "Enable SMS notifications", default: false },
            {
              label: "Allow student self-registration with college email",
              default: true,
            },
          ].map((s, i) => (
            <Toggle key={i} label={s.label} defaultChecked={s.default} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ROLES = [
  "Placement Officer",
  "Faculty Coordinator",
  "Department Mentor",
  "Industry Relations",
  "IT Admin",
  "Principal / Director",
];
const ROLE_COLORS: Record<string, "blue" | "green" | "amber"> = {
  "Placement Officer": "blue",
  "Faculty Coordinator": "green",
  "Department Mentor": "amber",
  "Industry Relations": "green",
  "IT Admin": "blue",
  "Principal / Director": "amber",
};

type Faculty = {
  id: number;
  name: string;
  email: string;
  dept: string;
  role: string;
  status: "active" | "invited" | "pending";
};

export function Step5() {
  const [faculty, setFaculty] = useState<Faculty[]>([
    {
      id: 1,
      name: "Dr. Anita Verma",
      email: "anita@college.edu.in",
      dept: "Computer Engineering",
      role: "Placement Officer",
      status: "active",
    },
    {
      id: 2,
      name: "Prof. Rajan Iyer",
      email: "rajan@college.edu.in",
      dept: "Electronics",
      role: "Faculty Coordinator",
      status: "invited",
    },
    {
      id: 3,
      name: "Ms. Pooja Sharma",
      email: "pooja@college.edu.in",
      dept: "Training & Placement",
      role: "Industry Relations",
      status: "pending",
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newFac, setNewFac] = useState({
    name: "",
    email: "",
    dept: "",
    role: ROLES[0],
  });

  const addFaculty = () => {
    if (!newFac.name || !newFac.email) return;
    setFaculty((f) => [
      ...f,
      { ...newFac, id: Date.now(), status: "pending" as const },
    ]);
    setNewFac({ name: "", email: "", dept: "", role: ROLES[0] });
    setShowAdd(false);
  };

  const statusStyle = (s: string) =>
    ({
      active: "text-emerald-700 bg-emerald-50",
      invited: "text-amber-700 bg-amber-50",
      pending: "text-slate-600 bg-slate-100",
    })[s] || "text-slate-600 bg-slate-100";

  return (
    <div className="space-y-8">
      {/* Placement Officer accounts */}
      <div>
        <SectionTitle
          num="5.1"
          title="Placement Officer Accounts"
          sub="Create and manage placement officer accounts"
        />

        <div className="space-y-2.5 mb-4">
          {faculty.map((f) => (
            <div
              key={f.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 sm:px-4 py-3 bg-white border border-[--border] rounded-xl"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#E8ECF5] flex items-center justify-center text-[13px] font-semibold text-[#1B3A6B] shrink-0">
                {f.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium text-[#0F1C3F] truncate">
                    {f.name}
                  </p>

                  <Tag color={ROLE_COLORS[f.role] || "blue"}>{f.role}</Tag>
                </div>

                <p
                  className="text-[11.5px] text-[#5A6A8A] mt-0.5 truncate"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {f.email} · {f.dept || "—"}
                </p>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle(
                    f.status,
                  )}`}
                >
                  {f.status}
                </span>

                <div className="flex items-center gap-1">
                  {f.status !== "active" && (
                    <button
                      onClick={() =>
                        setFaculty((fac) =>
                          fac.map((x) =>
                            x.id === f.id ? { ...x, status: "invited" } : x,
                          ),
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#EBF1FA] text-[#1B3A6B] text-[11.5px] rounded-lg hover:bg-[#D7E5F7] transition-colors font-medium whitespace-nowrap"
                    >
                      <Send size={11} />
                      <span className="hidden xs:inline">Send Invite</span>
                      <span className="xs:hidden">Invite</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setFaculty((fac) => fac.filter((x) => x.id !== f.id))
                    }
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#9AA5BE] hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Faculty */}
        {showAdd ? (
          <div className="p-3 sm:p-4 bg-[#EBF1FA] rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name">
                <Input
                  placeholder="Dr. Firstname Lastname"
                  value={newFac.name}
                  onChange={(e) =>
                    setNewFac((p) => ({
                      ...p,
                      name: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Official Email">
                <Input
                  type="email"
                  placeholder="name@college.edu.in"
                  value={newFac.email}
                  onChange={(e) =>
                    setNewFac((p) => ({
                      ...p,
                      email: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Department">
                <Input
                  placeholder="Computer Engineering"
                  value={newFac.dept}
                  onChange={(e) =>
                    setNewFac((p) => ({
                      ...p,
                      dept: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Role">
                <Select
                  value={newFac.role}
                  onChange={(e) =>
                    setNewFac((p) => ({
                      ...p,
                      role: e.target.value,
                    }))
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={addFaculty}
                className="px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium w-full sm:w-auto"
              >
                Add & Send Invite
              </button>

              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-[--border] text-[#5A6A8A] text-[13px] rounded-[10px] hover:bg-white transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#1B3A6B]/30 text-[#1B3A6B] text-[13px] rounded-xl hover:bg-[#EBF1FA] transition-colors font-medium w-full justify-center"
          >
            <Plus size={14} />
            Add Faculty / Coordinator
          </button>
        )}
      </div>

      {/* Roles & Permissions */}
      <div>
        <SectionTitle
          num="5.2"
          title="Roles & Permissions"
          sub="Define what each role can access"
        />

        {/* Horizontal scroll on mobile */}
        <div className="overflow-x-auto rounded-xl border border-[--border]">
          <table className="w-full min-w-[720px] text-[12.5px]">
            <thead className="bg-[#F8FAFB] border-b border-[--border]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-[#0F1C3F] whitespace-nowrap">
                  Role
                </th>

                {[
                  "View Students",
                  "Edit Profile",
                  "Manage Jobs",
                  "Analytics",
                  "Admin Panel",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-center px-3 py-3 font-medium text-[#5A6A8A] text-[11.5px] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[
                {
                  role: "Placement Officer",
                  perms: [true, true, true, true, true],
                },
                {
                  role: "Faculty Coordinator",
                  perms: [true, true, false, true, false],
                },
                {
                  role: "Department Mentor",
                  perms: [true, false, false, false, false],
                },
                {
                  role: "Industry Relations",
                  perms: [true, false, true, false, false],
                },
                {
                  role: "IT Admin",
                  perms: [false, false, false, false, true],
                },
              ].map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[--border] last:border-0 hover:bg-[#F8FAFB] transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Tag color={ROLE_COLORS[row.role] || "blue"}>
                      {row.role}
                    </Tag>
                  </td>

                  {row.perms.map((p, pi) => (
                    <td key={pi} className="text-center px-3 py-3">
                      {p ? (
                        <CheckCircle2
                          size={15}
                          className="text-emerald-500 mx-auto"
                        />
                      ) : (
                        <XCircle size={15} className="text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InfoBox variant="blue" title="Custom roles">
          Custom role permissions can be configured in Admin Settings after the
          initial setup is complete.
        </InfoBox>
      </div>
    </div>
  );
}

type Student = {
  id: number;
  name: string;
  rollNo: string;
  dept: string;
  batch: string;
  email: string;
  status: "active" | "invited" | "pending";
};

export function Step6() {
  const [tab, setTab] = useState<"bulk" | "manual">("bulk");
  const [csvFile, setCsvFile] = useState<UploadedFile | undefined>();
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Aisha Patel",
      rollNo: "CE21001",
      dept: "Computer Engineering",
      batch: "2021–2025",
      email: "aisha@college.edu.in",
      status: "active",
    },
    {
      id: 2,
      name: "Rohan Mehta",
      rollNo: "CE21002",
      dept: "Computer Engineering",
      batch: "2021–2025",
      email: "rohan@college.edu.in",
      status: "invited",
    },
    {
      id: 3,
      name: "Sneha Nair",
      rollNo: "EC21001",
      dept: "Electronics",
      batch: "2021–2025",
      email: "sneha@college.edu.in",
      status: "pending",
    },
    {
      id: 4,
      name: "Arjun Sharma",
      rollNo: "CE22001",
      dept: "Computer Engineering",
      batch: "2022–2026",
      email: "arjun@college.edu.in",
      status: "pending",
    },
  ]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    dept: "",
    batch: "",
    email: "",
  });

  const statusStyle = (s: string) =>
    ({
      active: "text-emerald-700 bg-emerald-50 border border-emerald-200",
      invited: "text-amber-700 bg-amber-50 border border-amber-200",
      pending: "text-slate-600 bg-slate-100 border border-slate-200",
    })[s] || "";

  const sendInviteAll = () =>
    setStudents((ss) =>
      ss.map((s) => (s.status === "pending" ? { ...s, status: "invited" } : s)),
    );

  return (
    <div className="space-y-8">
  <SectionTitle
    num="6.0"
    title="Student Onboarding"
    sub="Upload or register students and send login invitations"
  />

  {/* Stats */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {[
      {
        label: "Total Students",
        value: students.length,
        icon: GraduationCap,
        color: "bg-[#EBF1FA] text-[#1B3A6B]",
      },
      {
        label: "Activated",
        value: students.filter((s) => s.status === "active").length,
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Invite Sent",
        value: students.filter((s) => s.status === "invited").length,
        icon: Send,
        color: "bg-amber-50 text-amber-600",
      },
      {
        label: "Pending",
        value: students.filter((s) => s.status === "pending").length,
        icon: Clock,
        color: "bg-slate-50 text-slate-500",
      },
    ].map((stat) => {
      const Icon = stat.icon;

      return (
        <div
          key={stat.label}
          className="bg-white border border-[--border] rounded-xl p-3 sm:p-4"
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}
          >
            <Icon size={15} />
          </div>

          <p
            className="text-[20px] sm:text-[22px] font-bold text-[#0F1C3F]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {stat.value}
          </p>

          <p className="text-[10.5px] sm:text-[11.5px] text-[#5A6A8A]">
            {stat.label}
          </p>
        </div>
      );
    })}
  </div>

  {/* Tabs */}
  <div className="flex gap-1 p-1 bg-[#EFF2FA] rounded-xl w-full sm:w-fit overflow-x-auto">
    {(["bulk", "manual"] as const).map((t) => (
      <button
        key={t}
        onClick={() => setTab(t)}
        className={`px-3 sm:px-5 py-2 text-[12px] sm:text-[13px] font-medium rounded-[10px] transition-all whitespace-nowrap flex-1 sm:flex-none ${
          tab === t
            ? "bg-white text-[#1B3A6B] shadow-sm"
            : "text-[#5A6A8A] hover:text-[#1B3A6B]"
        }`}
      >
        {t === "bulk"
          ? "Bulk Upload (Excel/CSV)"
          : "Manual Registration"}
      </button>
    ))}
  </div>

  {/* Bulk Upload */}
  {tab === "bulk" ? (
    <div className="space-y-5">
      <FileDropZone
        label="Upload Student Data"
        required
        file={csvFile}
        onFile={setCsvFile}
        onRemove={() => setCsvFile(undefined)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-[#F8FAFB] border border-[--border] rounded-xl">
        <FileSpreadsheet
          size={18}
          className="text-emerald-600 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#0F1C3F]">
            Download Template
          </p>

          <p className="text-[12px] text-[#5A6A8A]">
            Use our Excel/CSV template to ensure correct column formatting
          </p>
        </div>

        <button
          className="flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 bg-[#1B3A6B] text-white text-[12.5px] rounded-[8px] hover:bg-[#122748] transition-colors font-medium w-full sm:w-auto shrink-0"
        >
          <Download size={13} />
          Download
        </button>
      </div>

      <InfoBox variant="amber" title="Required columns">
        Roll No, Full Name, Email, Department, Batch Year, Mobile Number
        (optional). A preview will be shown before import.
      </InfoBox>
    </div>
  ) : (
    /* Manual Registration */
    <div className="p-3 sm:p-5 bg-[#EBF1FA] rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Full Name">
          <Input
            placeholder="Student Full Name"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent((p) => ({
                ...p,
                name: e.target.value,
              }))
            }
          />
        </Field>

        <Field label="Roll Number">
          <Input
            placeholder="CE21001"
            value={newStudent.rollNo}
            onChange={(e) =>
              setNewStudent((p) => ({
                ...p,
                rollNo: e.target.value,
              }))
            }
          />
        </Field>

        <Field label="Department">
          <Select
            value={newStudent.dept}
            onChange={(e) =>
              setNewStudent((p) => ({
                ...p,
                dept: e.target.value,
              }))
            }
          >
            <option value="">Select dept</option>
            <option>Computer Engineering</option>
            <option>Electronics</option>
          </Select>
        </Field>

        <Field label="Batch">
          <Select
            value={newStudent.batch}
            onChange={(e) =>
              setNewStudent((p) => ({
                ...p,
                batch: e.target.value,
              }))
            }
          >
            <option value="">Select batch</option>
            <option>2021–2025</option>
            <option>2022–2026</option>
            <option>2023–2027</option>
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Official Email">
            <Input
              icon={Mail}
              type="email"
              placeholder="student@college.edu.in"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent((p) => ({
                  ...p,
                  email: e.target.value,
                }))
              }
            />
          </Field>
        </div>
      </div>

      <button
        onClick={() => {
          if (!newStudent.name || !newStudent.email) return;

          setStudents((s) => [
            ...s,
            {
              ...newStudent,
              id: Date.now(),
              status: "pending",
            },
          ]);

          setNewStudent({
            name: "",
            rollNo: "",
            dept: "",
            batch: "",
            email: "",
          });
        }}
        className="w-full sm:w-auto px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium"
      >
        Add Student
      </button>
    </div>
  )}

  {/* Student list */}
  <div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <h3 className="text-[13.5px] font-medium text-[#0F1C3F]">
        Registered Students ({students.length})
      </h3>

      <button
        onClick={sendInviteAll}
        className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-[#1B3A6B] text-white text-[12.5px] rounded-[8px] hover:bg-[#122748] transition-colors font-medium w-full sm:w-auto"
      >
        <Send size={12} />
        Send All Invites
      </button>
    </div>

    {/* Responsive table */}
    <div className="overflow-x-auto rounded-xl border border-[--border]">
      <table className="w-full min-w-[760px] text-[12.5px]">
        <thead className="bg-[#F8FAFB] border-b border-[--border]">
          <tr>
            {[
              "Student",
              "Roll No",
              "Department",
              "Batch",
              "Status",
              "",
            ].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 font-semibold text-[#5A6A8A] text-[11.5px] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr
              key={s.id}
              className="border-b border-[--border] last:border-0 hover:bg-[#F8FAFB] transition-colors"
            >
              <td className="px-4 py-3 min-w-[200px]">
                <p className="font-medium text-[#0F1C3F] truncate max-w-[220px]">
                  {s.name}
                </p>

                <p
                  className="text-[11px] text-[#5A6A8A] truncate max-w-[220px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s.email}
                </p>
              </td>

              <td
                className="px-4 py-3 font-mono text-[#5A6A8A] whitespace-nowrap"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {s.rollNo}
              </td>

              <td className="px-4 py-3 text-[#5A6A8A] whitespace-nowrap">
                {s.dept}
              </td>

              <td className="px-4 py-3 text-[#5A6A8A] whitespace-nowrap">
                {s.batch}
              </td>

              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle(
                    s.status
                  )}`}
                >
                  {s.status}
                </span>
              </td>

              <td className="px-4 py-3 whitespace-nowrap">
                {s.status === "pending" && (
                  <button
                    onClick={() =>
                      setStudents((ss) =>
                        ss.map((x) =>
                          x.id === s.id
                            ? { ...x, status: "invited" }
                            : x
                        )
                      )
                    }
                    className="text-[#1B3A6B] hover:underline text-[11.5px] font-medium flex items-center gap-1"
                  >
                    <Send size={11} />
                    Invite
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
  );
}

export function Step7() {
  const [roles, setRoles] = useState([
    "Software Engineer",
    "Data Analyst",
    "Product Manager",
    "Business Analyst",
    "Full Stack Developer",
    "ML Engineer",
  ]);
  const [newRole, setNewRole] = useState("");
  const [eligibilityCriteria, setEligibilityCriteria] = useState({
    minCgpa: "6.0",
    maxBacklogs: "0",
    attendance: "75",
  });
  const roadmaps = [
    {
      role: "Software Engineer",
      tracks: ["DSA", "System Design", "Web Dev", "Interview Prep"],
    },
    {
      role: "Data Analyst",
      tracks: ["Statistics", "SQL", "Python", "Tableau"],
    },
    {
      role: "Product Manager",
      tracks: [
        "Product Thinking",
        "Market Research",
        "Analytics",
        "Communication",
      ],
    },
  ];
  const assessments = [
    { name: "Aptitude Test", duration: "60 min", questions: 50, type: "MCQ" },
    {
      name: "Coding Assessment",
      duration: "90 min",
      questions: 3,
      type: "Code",
    },
    {
      name: "Communication Test",
      duration: "30 min",
      questions: 20,
      type: "MCQ",
    },
    {
      name: "Technical Round",
      duration: "45 min",
      questions: 15,
      type: "Mixed",
    },
  ];

  return (
    <div className="space-y-8">
  {/* Target Roles */}
  <div>
    <SectionTitle
      num="7.1"
      title="Target Roles"
      sub="Configure roles students can be placed in"
    />

    <div className="flex flex-wrap gap-2 mb-3">
      {roles.map((r) => (
        <Tag
          key={r}
          color="blue"
          onRemove={() =>
            setRoles((rs) => rs.filter((x) => x !== r))
          }
        >
          {r}
        </Tag>
      ))}
    </div>

    <div className="flex gap-2 w-full">
      <div className="flex-1 min-w-0">
        <Input
          placeholder="Add role (e.g. Cloud Architect)"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newRole.trim()) {
              setRoles((r) => [...r, newRole.trim()]);
              setNewRole("");
            }
          }}
        />
      </div>

      <button
        onClick={() => {
          if (newRole.trim()) {
            setRoles((r) => [...r, newRole.trim()]);
            setNewRole("");
          }
        }}
        className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 py-2 bg-[#1B3A6B] text-white text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shrink-0 flex items-center justify-center"
        aria-label="Add role"
      >
        <Plus size={14} />
        <span className="hidden sm:inline ml-1">Add</span>
      </button>
    </div>
  </div>

  {/* Career Roadmaps */}
  <div>
    <SectionTitle
      num="7.2"
      title="Career Roadmaps"
      sub="Assign default learning tracks to each career role"
    />

    <div className="space-y-3">
      {roadmaps.map((rm) => (
        <div
          key={rm.role}
          className="p-3 sm:p-4 bg-white border border-[--border] rounded-xl"
        >
          <div className="flex items-start sm:items-center gap-2 mb-3">
            <Target
              size={14}
              className="text-[#1B3A6B] shrink-0 mt-0.5 sm:mt-0"
            />

            <span className="text-[13px] font-medium text-[#0F1C3F] leading-5">
              {rm.role}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {rm.tracks.map((t, i) => (
              <div
                key={t}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#EBF1FA] rounded-lg text-[11.5px] sm:text-[12px] text-[#1B3A6B] font-medium max-w-full"
              >
                <span className="w-4 h-4 rounded-full bg-[#1B3A6B]/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>

                <span className="truncate">{t}</span>
              </div>
            ))}

            <button
              className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3 py-1.5 border border-dashed border-[#1B3A6B]/30 rounded-lg text-[12px] text-[#5A6A8A] hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors flex items-center justify-center shrink-0"
              aria-label={`Add track to ${rm.role}`}
            >
              <Plus size={12} />
              <span className="hidden sm:inline ml-1">Add Track</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Assessments */}
  <div>
    <SectionTitle
      num="7.3"
      title="Assessments"
      sub="Configure aptitude and technical tests for placement screening"
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {assessments.map((a) => (
        <div
          key={a.name}
          className="flex items-start sm:items-center gap-3 p-3 sm:p-4 bg-white border border-[--border] rounded-xl"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <ClipboardList size={15} className="text-amber-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#0F1C3F] truncate">
              {a.name}
            </p>

            <p className="text-[11px] sm:text-[11.5px] text-[#5A6A8A] leading-5">
              {a.duration} · {a.questions} questions ·{" "}
              <span
                className="font-mono"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {a.type}
              </span>
            </p>
          </div>

          <div className="shrink-0">
            <Toggle label="" defaultChecked={true} />
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Eligibility Rules */}
  <div>
    <SectionTitle
      num="7.4"
      title="Placement Eligibility Rules"
      sub="Define minimum criteria for students to appear in placements"
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-5">
      <Field
        label="Minimum CGPA"
        hint="Out of 10"
      >
        <Input
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={eligibilityCriteria.minCgpa}
          onChange={(e) =>
            setEligibilityCriteria((p) => ({
              ...p,
              minCgpa: e.target.value,
            }))
          }
          suffix="/ 10"
        />
      </Field>

      <Field label="Max Active Backlogs">
        <Input
          type="number"
          min="0"
          max="10"
          value={eligibilityCriteria.maxBacklogs}
          onChange={(e) =>
            setEligibilityCriteria((p) => ({
              ...p,
              maxBacklogs: e.target.value,
            }))
          }
          suffix="subjects"
        />
      </Field>

      <Field label="Min Attendance %">
        <Input
          type="number"
          min="0"
          max="100"
          value={eligibilityCriteria.attendance}
          onChange={(e) =>
            setEligibilityCriteria((p) => ({
              ...p,
              attendance: e.target.value,
            }))
          }
          suffix="%"
        />
      </Field>
    </div>

    <div className="space-y-2.5">
      {[
        {
          label: "Allow students to appear in multiple company drives",
        },
        {
          label:
            "Require CGPA approval for premium companies (CTC > ₹10 LPA)",
          defaultChecked: true,
        },
        {
          label:
            "Auto-notify eligible students when new job is posted",
          defaultChecked: true,
        },
        {
          label:
            "Block students with active disciplinary actions",
        },
      ].map((r, i) => (
        <div
          key={i}
          className="p-3 sm:p-0 rounded-lg sm:rounded-none bg-[#F8FAFB] sm:bg-transparent"
        >
          <Toggle
            label={r.label}
            defaultChecked={r.defaultChecked}
          />
        </div>
      ))}
    </div>
  </div>
</div>
  );
}

type DashWidget = {
  id: string;
  label: string;
  enabled: boolean;
  icon: React.ElementType;
};

export function Step8() {
  const dashboards: Array<{
    id: string;
    title: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    widgets: DashWidget[];
  }> = [
    {
      id: "student",
      title: "Student Dashboard",
      desc: "Personal portal for students",
      icon: GraduationCap,
      color: "bg-[#EBF1FA] text-[#1B3A6B]",
      widgets: [
        {
          id: "s1",
          label: "Placement Readiness Score",
          enabled: true,
          icon: TrendingUp,
        },
        {
          id: "s2",
          label: "Upcoming Company Drives",
          enabled: true,
          icon: Briefcase,
        },
        {
          id: "s3",
          label: "Career Roadmap Progress",
          enabled: true,
          icon: Target,
        },
        {
          id: "s4",
          label: "Notifications & Deadlines",
          enabled: true,
          icon: Bell,
        },
        {
          id: "s5",
          label: "Mock Test Results",
          enabled: false,
          icon: ClipboardList,
        },
        { id: "s6", label: "Resume Builder Status", enabled: true, icon: Info },
      ],
    },
    {
      id: "placement",
      title: "Placement Dashboard",
      desc: "Drives, recruiters, offers",
      icon: Briefcase,
      color: "bg-emerald-50 text-emerald-700",
      widgets: [
        {
          id: "p1",
          label: "Active Job Drives",
          enabled: true,
          icon: Briefcase,
        },
        { id: "p2", label: "Offer Letter Tracker", enabled: true, icon: Info },
        { id: "p3", label: "Company Pipeline", enabled: true, icon: Building },
        {
          id: "p4",
          label: "Student Shortlist View",
          enabled: true,
          icon: UserCheck,
        },
        {
          id: "p5",
          label: "Interview Schedule",
          enabled: true,
          icon: Calendar,
        },
        { id: "p6", label: "Salary Heatmap", enabled: false, icon: BarChart2 },
      ],
    },
    {
      id: "faculty",
      title: "Faculty Dashboard",
      desc: "Mentoring & coordination view",
      icon: Users,
      color: "bg-amber-50 text-amber-700",
      widgets: [
        {
          id: "f1",
          label: "Assigned Students Overview",
          enabled: true,
          icon: GraduationCap,
        },
        {
          id: "f2",
          label: "Assessment Submissions",
          enabled: true,
          icon: ClipboardList,
        },
        {
          id: "f3",
          label: "Mentor Meeting Tracker",
          enabled: false,
          icon: User,
        },
        {
          id: "f4",
          label: "Department Placements",
          enabled: true,
          icon: BarChart2,
        },
      ],
    },
    {
      id: "analytics",
      title: "Analytics Dashboard",
      desc: "Trends, stats, and insights",
      icon: PieChart,
      color: "bg-purple-50 text-purple-700",
      widgets: [
        {
          id: "a1",
          label: "Placement Rate Over Years",
          enabled: true,
          icon: TrendingUp,
        },
        {
          id: "a2",
          label: "Salary Distribution Chart",
          enabled: true,
          icon: BarChart2,
        },
        { id: "a3", label: "Top Recruiters by CTC", enabled: true, icon: Star },
        {
          id: "a4",
          label: "Dept-wise Comparison",
          enabled: true,
          icon: PieChart,
        },
        {
          id: "a5",
          label: "Student Funnel Analysis",
          enabled: false,
          icon: TrendingUp,
        },
      ],
    },
    {
      id: "reports",
      title: "Reports Dashboard",
      desc: "Exportable reports & summaries",
      icon: ClipboardList,
      color: "bg-slate-100 text-slate-600",
      widgets: [
        {
          id: "r1",
          label: "Placement Summary Report",
          enabled: true,
          icon: Info,
        },
        {
          id: "r2",
          label: "Student Progress Report",
          enabled: true,
          icon: GraduationCap,
        },
        {
          id: "r3",
          label: "Company Engagement Report",
          enabled: true,
          icon: Building,
        },
        {
          id: "r4",
          label: "NAAC/NBA Data Export",
          enabled: false,
          icon: Download,
        },
        {
          id: "r5",
          label: "Custom Report Builder",
          enabled: false,
          icon: Settings,
        },
      ],
    },
  ];

  const [activeDash, setActiveDash] = useState("student");
  const [widgetState, setWidgetState] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      dashboards.forEach((d) =>
        d.widgets.forEach((w) => {
          init[w.id] = w.enabled;
        }),
      );
      return init;
    },
  );

  const current = dashboards.find((d) => d.id === activeDash)!;

  return (
    <div className="space-y-6">
  <SectionTitle
    num="8.0"
    title="Dashboard Initialization"
    sub="Activate and configure each dashboard module"
  />

  {/* Dashboard selector */}
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
    {dashboards.map((d) => {
      const Icon = d.icon;
      const active = d.id === activeDash;

      const enabledCount = d.widgets.filter(
        (w) => widgetState[w.id]
      ).length;

      return (
        <button
          key={d.id}
          onClick={() => setActiveDash(d.id)}
          className={`flex flex-col items-center gap-2 p-3 sm:p-3.5 rounded-xl border-2 text-center transition-all ${
            active
              ? "border-[#1B3A6B] bg-[#EBF1FA]"
              : "border-[--border] bg-white hover:border-slate-300"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${d.color}`}
          >
            <Icon size={16} />
          </div>

          <div className="min-w-0 w-full">
            <p
              className={`text-[11px] sm:text-[11.5px] font-semibold leading-tight truncate ${
                active
                  ? "text-[#1B3A6B]"
                  : "text-[#0F1C3F]"
              }`}
            >
              {d.title}
            </p>

            <p className="text-[10px] sm:text-[10.5px] text-[#9AA5BE] mt-0.5">
              {enabledCount}/{d.widgets.length} widgets
            </p>
          </div>

          {active && (
            <div className="w-1.5 h-1.5 rounded-full bg-[#1B3A6B]" />
          )}
        </button>
      );
    })}
  </div>

  {/* Widget config */}
  <div className="bg-white border border-[--border] rounded-xl overflow-hidden">
    <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-[--border] flex items-start sm:items-center gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${current.color}`}
      >
        <current.icon size={15} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] sm:text-[13.5px] font-medium text-[#0F1C3F] truncate">
          {current.title}
        </p>

        <p className="text-[11px] sm:text-[12px] text-[#5A6A8A] line-clamp-2">
          {current.desc}
        </p>
      </div>

      <div className="shrink-0">
        <button
          onClick={() => {
            const allOn = current.widgets.every(
              (w) => widgetState[w.id]
            );

            setWidgetState((s) => {
              const n = { ...s };

              current.widgets.forEach((w) => {
                n[w.id] = !allOn;
              });

              return n;
            });
          }}
          className="text-[11px] sm:text-[12px] text-[#1B3A6B] font-medium hover:underline whitespace-nowrap"
        >
          {current.widgets.every((w) => widgetState[w.id])
            ? "Disable All"
            : "Enable All"}
        </button>
      </div>
    </div>

    <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
      {current.widgets.map((w) => {
        const Icon = w.icon;
        const on = widgetState[w.id];

        return (
          <div
            key={w.id}
            onClick={() =>
              setWidgetState((s) => ({
                ...s,
                [w.id]: !s[w.id],
              }))
            }
            className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl cursor-pointer border-2 transition-all ${
              on
                ? "border-[#1B3A6B]/20 bg-[#EBF1FA]/60"
                : "border-[--border] bg-[#F8FAFB] opacity-60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                on
                  ? "bg-[#1B3A6B]"
                  : "bg-slate-200"
              }`}
            >
              <Icon
                size={13}
                className={
                  on
                    ? "text-white"
                    : "text-slate-400"
                }
              />
            </div>

            <span className="text-[12px] sm:text-[13px] font-medium text-[#0F1C3F] flex-1 min-w-0">
              {w.label}
            </span>

            <div
              className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${
                on
                  ? "bg-[#1B3A6B]"
                  : "bg-slate-200"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  on
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Launch summary */}
  <div className="p-3 sm:p-5 bg-gradient-to-r from-[#1B3A6B] to-[#2a5298] rounded-xl text-white">
    <div className="flex items-start sm:items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        <LayoutDashboard
          size={18}
          className="text-white"
        />
      </div>

      <div className="min-w-0">
        <p className="font-semibold text-[14px]">
          Ready to Launch
        </p>

        <p className="text-white/60 text-[11px] sm:text-[12px]">
          All dashboards configured and ready for activation
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {dashboards.map((d) => {
        const enabled = d.widgets.filter(
          (w) => widgetState[w.id]
        ).length;

        const total = d.widgets.length;
        const Icon = d.icon;

        return (
          <div
            key={d.id}
            className="bg-white/10 rounded-xl p-3 text-center"
          >
            <Icon
              size={16}
              className="text-white/80 mx-auto mb-1"
            />

            <p className="text-[10px] sm:text-[10.5px] text-white/70 leading-tight truncate">
              {d.title.replace(" Dashboard", "")}
            </p>

            <p className="text-[12px] font-bold text-white mt-1">
              {enabled}/{total}
            </p>
          </div>
        );
      })}
    </div>
  </div>
</div>
  );
}

const PLAN_DETAILS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small colleges getting started",
    price: { monthly: 999, annual: 9999 },
    model: "Per Campus",
    icon: Building,
    iconBg: "bg-slate-100 text-slate-500",
    highlight: false,
    features: [
      { label: "Up to 500 students", included: true },
      { label: "1 campus", included: true },
      { label: "Basic placement portal", included: true },
      { label: "Email support (48h SLA)", included: true },
      { label: "Standard analytics", included: true },
      { label: "1 admin user", included: true },
      { label: "Custom branding", included: false },
      { label: "API access", included: false },
      { label: "Dedicated manager", included: false },
      { label: "Multi-campus", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "The most popular plan for growing institutions",
    price: { monthly: 2499, annual: 24999 },
    model: "Per Campus",
    icon: Star,
    iconBg: "bg-[#EBF1FA] text-[#1B3A6B]",
    highlight: true,
    features: [
      { label: "Up to 2,500 students", included: true },
      { label: "1 campus", included: true },
      { label: "Advanced placement tools", included: true },
      { label: "Priority support (8h SLA)", included: true },
      { label: "Detailed analytics", included: true },
      { label: "5 admin users", included: true },
      { label: "Custom branding", included: true },
      { label: "API access", included: false },
      { label: "Dedicated manager", included: false },
      { label: "Multi-campus", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For large universities with multiple campuses",
    price: { monthly: 5999, annual: 59999 },
    model: "Multi-Campus",
    icon: Zap,
    iconBg: "bg-amber-50 text-amber-600",
    highlight: false,
    features: [
      { label: "Unlimited students", included: true },
      { label: "Unlimited campuses", included: true },
      { label: "All placement tools", included: true },
      { label: "Dedicated support (2h SLA)", included: true },
      { label: "Advanced analytics + exports", included: true },
      { label: "Unlimited admin users", included: true },
      { label: "Custom branding", included: true },
      { label: "API access", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Multi-campus", included: true },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    tagline: "Tailored agreements for government & large chains",
    price: { monthly: null, annual: null },
    model: "Enterprise Agreement",
    icon: Globe,
    iconBg: "bg-purple-50 text-purple-600",
    highlight: false,
    features: [
      { label: "Negotiated student limits", included: true },
      { label: "Custom campus count", included: true },
      { label: "On-premise deployment option", included: true },
      { label: "White-label portal", included: true },
      { label: "Custom SLA", included: true },
      { label: "Dedicated infrastructure", included: true },
      { label: "NAAC/NBA data exports", included: true },
      { label: "Custom integrations", included: true },
      { label: "Dedicated CXO support", included: true },
      { label: "Multi-campus", included: true },
    ],
  },
];

const ADD_ONS = [
  {
    id: "sms",
    label: "SMS Notifications",
    desc: "Bulk SMS for drives & alerts",
    price: 1499,
    unit: "/ year",
  },
  {
    id: "resume",
    label: "AI Resume Builder",
    desc: "AI-powered resume generation",
    price: 2999,
    unit: "/ year",
  },
  {
    id: "mock",
    label: "Mock Interview Module",
    desc: "Video + AI feedback rounds",
    price: 3999,
    unit: "/ year",
  },
  {
    id: "naac",
    label: "NAAC Report Automation",
    desc: "Auto-generate NAAC data reports",
    price: 4999,
    unit: "/ year",
  },
  {
    id: "whitelabel",
    label: "White-label Branding",
    desc: "Remove EduConnect branding",
    price: 5999,
    unit: "/ year",
  },
];

export function Step9() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [selected, setSelected] = useState("professional");
  const [addons, setAddons] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [payMethod, setPayMethod] = useState<"online" | "bank" | "quotation">(
    "online",
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const plan = PLAN_DETAILS.find((p) => p.id === selected)!;
  const basePrice = plan.price[billing];
  const addonTotal = ADD_ONS.filter((a) => addons.includes(a.id)).reduce(
    (s, a) => s + a.price,
    0,
  );
  const discount = appliedCoupon ? 0.15 : 0;
  const subtotal = (basePrice ?? 0) + addonTotal;
  const discountAmt = Math.round(subtotal * discount);
  const total = subtotal - discountAmt;
  const gst = Math.round(total * 0.18);
  const grandTotal = total + gst;

  const toggleAddon = (id: string) =>
    setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const applyCoupon = () => {
    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    if (coupon.toUpperCase() === "INVALID") {
      setCouponError("Invalid or expired coupon code.");
      setAppliedCoupon("");
      return;
    }
    setAppliedCoupon(coupon.toUpperCase());
    setCouponError("");
  };

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 text-center">
  {/* Success Icon */}
  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 sm:mb-6">
    <CheckCircle2
      size={32}
      className="text-emerald-600 sm:w-10 sm:h-10"
    />
  </div>

  {/* Heading */}
  <h2
    className="text-[22px] sm:text-[26px] text-[#0F1C3F] mb-2 leading-tight"
    style={{ fontFamily: "var(--font-serif)" }}
  >
    Registration Complete!
  </h2>

  {/* Description */}
  <p className="text-[#5A6A8A] text-[13px] sm:text-[14px] max-w-md mb-7 sm:mb-8 leading-6">
    Your institution has been registered and your{" "}
    <strong className="text-[#0F1C3F]">{plan.name}</strong> plan is now
    active. An invoice has been sent to your registered email.
  </p>

  {/* Payment Summary */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg mb-7 sm:mb-8">
    {[
      {
        label: "Plan",
        value: plan.name,
      },
      {
        label: "Billing",
        value: billing === "annual" ? "Annual" : "Monthly",
      },
      {
        label: "Amount Paid",
        value: fmt(grandTotal),
      },
    ].map((s) => (
      <div
        key={s.label}
        className="bg-[#F2F5FC] rounded-xl p-3.5 sm:p-4 text-center"
      >
        <p className="text-[11px] sm:text-[11.5px] text-[#5A6A8A] mb-1">
          {s.label}
        </p>

        <p className="text-[13px] sm:text-[14px] font-semibold text-[#0F1C3F] truncate">
          {s.value}
        </p>
      </div>
    ))}
  </div>

  {/* Actions */}
  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
    <button
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white rounded-[10px] hover:bg-[#122748] transition-colors font-medium text-[13px] w-full sm:w-auto"
    >
      <LayoutDashboard size={15} />
      Go to Dashboard
    </button>

    <button
      className="flex items-center justify-center gap-2 px-5 py-2.5 border border-[--border] text-[#5A6A8A] rounded-[10px] hover:bg-[#F2F5FC] transition-colors font-medium text-[13px] w-full sm:w-auto"
    >
      <Download size={15} />
      Download Invoice
    </button>
  </div>
</div>
    );
  }

  return (
    <div className="space-y-8">
  <SectionTitle
    num="9.0"
    title="Subscription & Billing"
    sub="Choose a plan that fits your institution's size and needs"
  />

  {/* Billing toggle */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
    <div className="flex items-center gap-1 p-1 bg-[#EFF2FA] rounded-xl w-full sm:w-fit">
      {(["monthly", "annual"] as const).map((b) => (
        <button
          key={b}
          onClick={() => setBilling(b)}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-medium rounded-[10px] transition-all capitalize ${
            billing === b
              ? "bg-white text-[#1B3A6B] shadow-sm"
              : "text-[#5A6A8A]"
          }`}
        >
          {b}
        </button>
      ))}
    </div>

    {billing === "annual" && (
      <span className="w-fit text-[11px] sm:text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
        Save up to 17% with annual billing
      </span>
    )}
  </div>

  {/* Plan cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {PLAN_DETAILS.map((p) => {
      const Icon = p.icon;
      const price = p.price[billing];
      const isSelected = selected === p.id;

      return (
        <div
          key={p.id}
          onClick={() => setSelected(p.id)}
          className={`relative rounded-2xl border-2 p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md ${
            isSelected
              ? "border-[#1B3A6B] bg-[#EBF1FA]/60 shadow-md"
              : "border-[--border] bg-white hover:border-slate-300"
          }`}
        >
          {p.highlight && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-[10.5px] font-bold text-white bg-[#1B3A6B] px-3 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </span>
          )}

          {isSelected && (
            <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-5 h-5 rounded-full bg-[#1B3A6B] flex items-center justify-center">
              <Check size={11} className="text-white" />
            </div>
          )}

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${p.iconBg}`}
          >
            <Icon size={16} />
          </div>

          <p className="text-[14px] font-bold text-[#0F1C3F]">
            {p.name}
          </p>

          <p className="text-[11px] text-[#5A6A8A] mt-0.5 mb-3 leading-snug">
            {p.tagline}
          </p>

          <div className="mb-1">
            {price ? (
              <span
                className="text-[21px] sm:text-[22px] font-bold text-[#0F1C3F]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {fmt(price)}
              </span>
            ) : (
              <span
                className="text-[17px] sm:text-[18px] font-bold text-[#0F1C3F]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Contact Us
              </span>
            )}

            {price && (
              <span className="text-[11px] sm:text-[11.5px] text-[#5A6A8A] ml-1">
                / {billing === "annual" ? "year" : "month"}
              </span>
            )}
          </div>

          <p className="text-[10.5px] text-[#9AA5BE] mb-4">
            {p.model}
          </p>

          <div className="border-t border-[--border] pt-3 space-y-1.5">
            {p.features.slice(0, 5).map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-2 text-[11.5px]"
              >
                {f.included ? (
                  <Check
                    size={11}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                ) : (
                  <X
                    size={11}
                    className="text-slate-300 shrink-0 mt-0.5"
                  />
                )}

                <span
                  className={
                    f.included
                      ? "text-[#5A6A8A]"
                      : "text-[#C4CCDB] line-through"
                  }
                >
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>

  {/* Feature comparison */}
  <details className="group">
    <summary className="flex items-center gap-2 cursor-pointer text-[12.5px] sm:text-[13px] font-medium text-[#1B3A6B] select-none list-none">
      <ChevronDown
        size={15}
        className="transition-transform group-open:rotate-180 shrink-0"
      />
      View full feature comparison
    </summary>

    <div className="mt-4 overflow-x-auto rounded-xl border border-[--border]">
      <table className="w-full text-[12px] min-w-[600px]">
        <thead className="bg-[#F8FAFB] border-b border-[--border]">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-[#0F1C3F] whitespace-nowrap">
              Feature
            </th>

            {PLAN_DETAILS.map((p) => (
              <th
                key={p.id}
                className={`text-center px-4 py-3 font-semibold text-[11.5px] whitespace-nowrap ${
                  selected === p.id
                    ? "text-[#1B3A6B]"
                    : "text-[#5A6A8A]"
                }`}
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {PLAN_DETAILS[0].features.map((f, fi) => (
            <tr
              key={f.label}
              className={`border-b border-[--border] last:border-0 ${
                fi % 2 === 0 ? "bg-white" : "bg-[#F8FAFB]"
              }`}
            >
              <td className="px-4 py-2.5 text-[#5A6A8A] whitespace-nowrap">
                {f.label}
              </td>

              {PLAN_DETAILS.map((p) => (
                <td
                  key={p.id}
                  className="text-center px-4 py-2.5"
                >
                  {p.features[fi]?.included ? (
                    <CheckCircle2
                      size={14}
                      className="text-emerald-500 mx-auto"
                    />
                  ) : (
                    <X
                      size={14}
                      className="text-slate-300 mx-auto"
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>

  {/* Add-ons */}
  <div>
    <SectionTitle
      num="9.1"
      title="Add-ons"
      sub="Enhance your plan with optional modules"
    />

    <div className="grid grid-cols-1 gap-3">
      {ADD_ONS.map((a) => {
        const on = addons.includes(a.id);

        return (
          <div
            key={a.id}
            onClick={() => toggleAddon(a.id)}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border-2 cursor-pointer transition-all ${
              on
                ? "border-[#1B3A6B] bg-[#EBF1FA]/50"
                : "border-[--border] bg-white hover:border-slate-300"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                on ? "bg-[#1B3A6B]" : "bg-[#E8ECF5]"
              }`}
            >
              <Zap
                size={15}
                className={on ? "text-white" : "text-[#5A6A8A]"}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] sm:text-[13.5px] font-medium text-[#0F1C3F]">
                {a.label}
              </p>

              <p className="text-[11.5px] sm:text-[12px] text-[#5A6A8A] leading-5">
                {a.desc}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-left sm:text-right shrink-0">
                <p className="text-[13.5px] font-bold text-[#0F1C3F]">
                  {fmt(a.price)}
                </p>

                <p className="text-[11px] text-[#9AA5BE]">
                  {a.unit}
                </p>
              </div>

              <div
                className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
                  on ? "bg-[#1B3A6B]" : "bg-slate-200"
                }`}
                style={{ height: 22 }}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    on ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Coupon + Order summary + Payment */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
    {/* Left */}
    <div className="space-y-6">
      {/* Coupon */}
      <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5 space-y-3">
        <p className="text-[13.5px] font-medium text-[#0F1C3F]">
          Apply Coupon
        </p>

        <div className="flex gap-2">
          <input
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value.toUpperCase());
              setCouponError("");
            }}
            placeholder="e.g. LAUNCH25 · NAAC20 · EDU15"
            className={`${inputCls} flex-1 min-w-0`}
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
            }}
          />

          <button
            onClick={applyCoupon}
            className="px-3 sm:px-4 py-2 bg-[#1B3A6B] text-white text-[12px] sm:text-[13px] rounded-[10px] hover:bg-[#122748] transition-colors font-medium shrink-0"
          >
            Apply
          </button>
        </div>

        {couponError && (
          <div className="flex items-start gap-2 text-[12.5px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{couponError}</span>
          </div>
        )}

        {appliedCoupon && (
          <div className="flex items-start justify-between gap-3 text-[12px] sm:text-[12.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
            <div className="flex items-start gap-2 min-w-0">
              <Check size={13} className="shrink-0 mt-0.5" />
              <span>
                Coupon <strong>{appliedCoupon}</strong> applied — 15% off
              </span>
            </div>

            <button
              onClick={() => {
                setAppliedCoupon("");
                setCoupon("");
              }}
              className="text-emerald-600 hover:text-emerald-800 shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Payment method */}
      <div className="bg-white border border-[--border] rounded-xl p-4 sm:p-5 space-y-3">
        <p className="text-[13.5px] font-medium text-[#0F1C3F]">
          Payment Method
        </p>

        {[
          {
            id: "online",
            label: "Online Payment",
            sub: "Razorpay — UPI, Cards, Net Banking, Wallets",
            icon: CreditCard,
          },
          {
            id: "bank",
            label: "Bank Transfer / NEFT",
            sub: "Transfer to our account — invoice raised manually",
            icon: Building2,
          },
          {
            id: "quotation",
            label: "Request Quotation",
            sub: "Get a formal quote sent to your email first",
            icon: Info,
          },
        ].map((m) => {
          const Icon = m.icon;
          const active = payMethod === m.id;

          return (
            <div
              key={m.id}
              onClick={() =>
                setPayMethod(m.id as typeof payMethod)
              }
              className={`flex items-start sm:items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                active
                  ? "border-[#1B3A6B] bg-[#EBF1FA]/50"
                  : "border-[--border] bg-white hover:border-slate-300"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  active
                    ? "bg-[#1B3A6B]"
                    : "bg-[#E8ECF5]"
                }`}
              >
                <Icon
                  size={15}
                  className={
                    active
                      ? "text-white"
                      : "text-[#5A6A8A]"
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0F1C3F]">
                  {m.label}
                </p>

                <p className="text-[11px] sm:text-[11.5px] text-[#5A6A8A] leading-5">
                  {m.sub}
                </p>
              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 sm:mt-0 ${
                  active
                    ? "border-[#1B3A6B]"
                    : "border-slate-300"
                }`}
              >
                {active && (
                  <div className="w-2 h-2 rounded-full bg-[#1B3A6B]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Right: Order summary */}
    <div className="bg-white border border-[--border] rounded-xl overflow-hidden lg:sticky lg:top-[62px]">
      <div className="px-4 sm:px-5 py-4 border-b border-[--border] bg-[#F8FAFB]">
        <p className="text-[13.5px] font-semibold text-[#0F1C3F]">
          Order Summary
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {/* Plan line */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#0F1C3F]">
              {plan.name} Plan
            </p>

            <p className="text-[11.5px] text-[#5A6A8A]">
              {plan.model} ·{" "}
              {billing === "annual" ? "Annual" : "Monthly"}
            </p>
          </div>

          <p className="text-[13px] font-semibold text-[#0F1C3F] shrink-0">
            {basePrice ? fmt(basePrice) : "—"}
          </p>
        </div>

        {/* Add-on lines */}
        {ADD_ONS.filter((a) =>
          addons.includes(a.id)
        ).map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 text-[12.5px]"
          >
            <span className="text-[#5A6A8A] flex items-center gap-1.5 min-w-0">
              <Plus
                size={11}
                className="text-[#1B3A6B] shrink-0"
              />
              <span className="truncate">{a.label}</span>
            </span>

            <span className="text-[#0F1C3F] font-medium shrink-0">
              {fmt(a.price)}
            </span>
          </div>
        ))}

        {addons.length === 0 && (
          <p className="text-[11.5px] text-[#9AA5BE] italic">
            No add-ons selected
          </p>
        )}

        <div className="border-t border-[--border] pt-3 space-y-2">
          <div className="flex justify-between gap-4 text-[12.5px] text-[#5A6A8A]">
            <span>Subtotal</span>
            <span>{basePrice ? fmt(subtotal) : "—"}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between gap-4 text-[12.5px] text-emerald-600">
              <span>Discount (15%)</span>
              <span>− {fmt(discountAmt)}</span>
            </div>
          )}

          <div className="flex justify-between gap-4 text-[12.5px] text-[#5A6A8A]">
            <span>GST (18%)</span>
            <span>{basePrice ? fmt(gst) : "—"}</span>
          </div>
        </div>

        <div className="border-t border-[--border] pt-3 flex items-center justify-between gap-4">
          <span className="text-[13.5px] font-semibold text-[#0F1C3F]">
            Total
          </span>

          <span
            className="text-[20px] sm:text-[22px] font-bold text-[#0F1C3F]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {basePrice ? fmt(grandTotal) : "Custom"}
          </span>
        </div>

        {billing === "annual" && basePrice && (
          <div className="text-[11.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg text-center font-medium">
            You save {fmt(Math.round(basePrice / 10))} vs monthly billing
          </div>
        )}

        <button
          onClick={() => setShowSuccess(true)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-[10px] font-semibold text-[13px] sm:text-[13.5px] transition-all shadow-sm mt-2 ${
            selected === "custom" || payMethod === "quotation"
              ? "bg-[#1B3A6B] hover:bg-[#122748] text-white"
              : "bg-[#D97706] hover:bg-[#b45309] text-white"
          }`}
        >
          {payMethod === "quotation" ? (
            <>
              <Download size={15} />
              Request Quotation
            </>
          ) : selected === "custom" ? (
            <>
              <Mail size={15} />
              Contact Sales
            </>
          ) : (
            <>
              <CreditCard size={15} />
              {payMethod === "bank"
                ? "Confirm & Get Invoice"
                : "Pay Now"}
            </>
          )}
        </button>

        <p className="text-[10.5px] sm:text-[11px] text-[#9AA5BE] text-center leading-relaxed">
          GST invoice sent to your registered email. Secure checkout.
          Cancel anytime before renewal.
        </p>
      </div>
    </div>
  </div>
</div>
  );
}
