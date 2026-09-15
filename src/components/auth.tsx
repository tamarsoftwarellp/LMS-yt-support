import { useState } from "react";
import { loginWithGoogle } from "../auth/google";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Building2,
  AlertCircle,
  Sparkles,
  Hash,
  RefreshCw,
  ChevronDown,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";
import { inputCls } from "./shared";

// ─── tiny helpers ────────────────────────────────────────────────────────────

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F4F6FB] px-4 py-10"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_4px_40px_rgba(27,58,107,0.1)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function AuthHeader({
  icon: Icon,
  badge,
  title,
  sub,
}: {
  icon: React.ElementType;
  badge?: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="px-8 pt-8 pb-6 border-b border-[rgba(27,58,107,0.08)]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <span
            className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#5A6A8A]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            EduConnect
          </span>
          {badge && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
      <h1
        className="text-[22px] text-[#0F1C3F]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h1>
      <p className="text-[13px] text-[#5A6A8A] mt-1 leading-relaxed">{sub}</p>
    </div>
  );
}

function PwdInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock
        size={13}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
      />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Password"}
        className={`${inputCls} pl-9 pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] hover:text-[#1B3A6B] transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-[rgba(27,58,107,0.1)]" />
      <span className="text-[11.5px] text-[#9AA5BE]">{label}</span>
      <div className="flex-1 h-px bg-[rgba(27,58,107,0.1)]" />
    </div>
  );
}

// function SocialBtn({ icon, label }: { icon: string; label: string }) {
//   return (
//     <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-[rgba(27,58,107,0.15)] rounded-xl text-[13px] font-medium text-[#0F1C3F] hover:bg-[#F4F6FB] transition-colors">
//       <span className="text-base">{icon}</span>
//       {label}
//     </button>
//   );
// }

function SocialBtn({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="...">
      {icon} {label}
    </button>
  );
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block text-[12.5px] font-medium text-[#0F1C3F] mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-[12.5px] text-red-600">
      <AlertCircle size={13} className="shrink-0" />
      {msg}
    </div>
  );
}

// ─── OTP inline ──────────────────────────────────────────────────────────────

function OTPRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs: React.RefObject<HTMLInputElement>[] = Array.from(
    { length: 6 },
    () => ({ current: null }),
  );
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/, "").slice(-1);
    const nx = [...digits];
    nx[i] = d;
    onChange(nx.join(""));
    if (d && i < 5) refs[i + 1].current?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      refs[i - 1].current?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          className="w-11 h-12 text-center text-[18px] font-semibold rounded-xl outline-none transition-all"
          style={{
            fontFamily: "var(--font-mono)",
            border: `2px solid ${d ? "#1B3A6B" : "#CBD5E1"}`,
            background: d ? "#EBF1FA" : "white",
          }}
        />
      ))}
    </div>
  );
}

// ─── STUDENT LOGIN ───────────────────────────────────────────────────────────

export function StudentLogin({
  onBack,
  onRegister,
  onSuccess,
}: {
  onBack: () => void;
  onRegister: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const sendOtp = () => {
    if (!phone.trim()) {
      setError("Please enter your registered mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1200);
  };

  const submit = () => {
    setError("");
    if (tab === "password") {
      if (!email || !pwd) {
        setError("Please fill in all required fields.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1600);
    } else {
      if (!otpSent) {
        sendOtp();
        return;
      }
      if (otp.length < 6) {
        setError("Enter the 6-digit OTP sent to your mobile.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1400);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        icon={GraduationCap}
        title="Student Sign In"
        sub="Access your career portal, roadmap, and placement dashboard."
      />

      <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7 space-y-4 sm:space-y-5">
        {/* tab toggle */}
        <div className="flex w-full gap-1 p-1 bg-[#F4F6FB] rounded-xl">
          {(["password", "otp"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
                setOtpSent(false);
                setOtp("");
              }}
              className={`flex-1 py-2.5 sm:py-2 text-[11.5px] sm:text-[12.5px] font-semibold rounded-lg transition-all ${tab === t ? "bg-white text-[#1B3A6B] shadow-sm" : "text-[#5A6A8A] hover:text-[#1B3A6B]"}`}
            >
              {t === "password" ? "Email & Password" : "Mobile OTP"}
            </button>
          ))}
        </div>
        {error && <ErrorMsg msg={error} />}
        {tab === "password" ? (
          <>
            <div>
              <FieldLabel label="Email Address" required />
              <div className="relative">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <FieldLabel label="Password" required />
                <button className="text-[10.5px] sm:text-[11.5px] text-[#1B3A6B] hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <PwdInput value={pwd} onChange={setPwd} />
            </div>
            <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none">
              <button
                onClick={() => setRemember(!remember)}
                className={`w-4.5 h-4.5 rounded flex items-center justify-center border-2 transition-all ${remember ? "bg-[#1B3A6B] border-[#1B3A6B]" : "border-slate-300"}`}
                style={{ width: "18px", height: "18px" }}
              >
                {remember && <Check size={10} className="text-white" />}
              </button>
              <span className="text-[11.5px] sm:text-[12.5px] text-[#5A6A8A]">
                Remember me for 30 days
              </span>
            </label>
          </>
        ) : (
          <>
            <div>
              <FieldLabel label="Registered Mobile Number" required />
              <div className="flex w-full gap-2">
                <div className="flex items-center gap-1 px-2.5 sm:px-3 bg-[#EFF2FA] border-[1.5px] border-transparent rounded-[10px] text-[12px] sm:text-[13px] text-[#0F1C3F] shrink-0">
                  🇮🇳 +91
                </div>
                <div className="relative flex-1 min-w-0">
                  <Phone
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile number"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
            </div>
            {otpSent && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FieldLabel label="Enter 6-digit OTP" required />
                  <button
                    onClick={() => {
                      setOtp("");
                      setOtpSent(false);
                    }}
                    className="text-[11.5px] text-[#1B3A6B] hover:underline"
                  >
                    Resend
                  </button>
                </div>
                <OTPRow value={otp} onChange={setOtp} />
                <p className="text-center text-[10.5px] sm:text-[11.5px] text-[#5A6A8A]">
                  OTP sent to +91 {phone}
                </p>
              </div>
            )}
          </>
        )}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 sm:py-3 bg-[#1B3A6B] hover:bg-[#152d54] text-white rounded-xl text-[13px] sm:text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <LogIn size={15} />
          )}
          {loading
            ? "Signing in…"
            : tab === "otp" && !otpSent
              ? "Send OTP"
              : "Sign In"}
        </button>
        <Divider label="or continue with" />
        {/* <div className="flex flex-col sm:flex-row gap-3">
          <SocialBtn icon="🔵" label="Google" />
          <SocialBtn icon="💼" label="LinkedIn" />
        </div> */}
        <div className="flex gap-3 w-full">
          <div className="flex-1 min-w-0 px-6 bg-gray">
            <SocialBtn
              icon="🔵"
              label="Google"
              onClick={async () => {
                const user = await loginWithGoogle();

                if (user) {
                  onSuccess();
                }
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <SocialBtn
              icon="📧"
              label="Email"
              onClick={async () => {
                const user = await loginWithGoogle();

                if (user) {
                  onSuccess();
                }
              }}
            />
          </div>
        </div>

        <p className="text-center text-[11.5px] sm:text-[12.5px] text-[#5A6A8A] leading-relaxed">
          New to EduConnect?{" "}
          <button
            onClick={onRegister}
            className="text-[#1B3A6B] font-semibold hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>

      <div className="px-2 sm:px-6 md:px-8 pb-5 sm:pb-6">
        <button
          onClick={onBack}
          className="flex items-center  gap-1.5 text-[11px] sm:text-[12px] text-[#9AA5BE] hover:text-[#5A6A8A] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Home
        </button>
      </div>
    </AuthCard>
  );
}

// ─── ADMIN LOGIN ─────────────────────────────────────────────────────────────

const DEMO_ROLES = [
  "Platform Super Admin",
  "College Admin",
  "Placement Officer",
  "Faculty Coordinator",
];

export function AdminLogin({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!email || !pwd || !role) {
      setError("All fields are required.");
      return;
    }
    if (twoFA && otp.length < 6) {
      setError("Enter the 6-digit authenticator code.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!twoFA) {
        setTwoFA(true);
      } else {
        onSuccess();
      }
    }, 1500);
  };

  return (
    <AuthCard>
      <AuthHeader
        icon={ShieldCheck}
        badge="Admin"
        title="Admin Sign In"
        sub="Secure access for institution administrators, placement officers, and faculty."
      />

      {/* security notice */}
      <div className="mx-8 mt-6 flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <ShieldCheck size={14} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[12px] text-amber-700 leading-relaxed">
          This portal is for authorised personnel only. All login attempts are
          logged and monitored.
        </p>
      </div>

      <div className="px-8 py-7 space-y-5">
        {error && <ErrorMsg msg={error} />}

        {!twoFA ? (
          <>
            <div>
              <FieldLabel label="Admin Role" required />
              <div className="relative">
                <ShieldCheck
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`${inputCls} pl-9 appearance-none pr-8 cursor-pointer`}
                >
                  <option value="">Select your role</option>
                  {DEMO_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                />
              </div>
            </div>

            {role === "College Admin" ||
            role === "Placement Officer" ||
            role === "Faculty Coordinator" ? (
              <div>
                <FieldLabel label="Institution" required />
                <div className="relative">
                  <Building2
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                  />
                  <select
                    className={`${inputCls} pl-9 appearance-none pr-8 cursor-pointer`}
                  >
                    <option>Select your institution</option>
                    <option>Rajiv Gandhi Institute of IT, Mumbai</option>
                    <option>Hyderabad Institute of Technology</option>
                    <option>Delhi Technical University</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                  />
                </div>
              </div>
            ) : null}

            <div>
              <FieldLabel label="Email Address" required />
              <div className="relative">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel label="Password" required />
                <button className="text-[11.5px] text-[#1B3A6B] hover:underline font-medium">
                  Reset password
                </button>
              </div>
              <PwdInput
                value={pwd}
                onChange={setPwd}
                placeholder="Admin password"
              />
            </div>

            {/* security badges */}
            <div className="flex gap-2 flex-wrap">
              {["256-bit SSL", "IP Allowlist", "Audit Log", "2FA Required"].map(
                (b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#EBF1FA] text-[#1B3A6B] text-[10.5px] font-medium rounded-full"
                  >
                    <Check size={9} />
                    {b}
                  </span>
                ),
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1B3A6B] flex items-center justify-center">
                <ShieldCheck size={22} className="text-white" />
              </div>
              <p className="text-[14px] font-semibold text-[#0F1C3F]">
                Two-Factor Authentication
              </p>
              <p className="text-[12.5px] text-[#5A6A8A] text-center leading-relaxed">
                Enter the 6-digit code from your authenticator app
                <br />
                (Google Authenticator / Authy)
              </p>
            </div>
            <OTPRow value={otp} onChange={setOtp} />
            <p className="text-center text-[11.5px] text-[#9AA5BE]">
              Code resets every 30 seconds
            </p>
            <button
              onClick={() => setTwoFA(false)}
              className="w-full text-center text-[12px] text-[#5A6A8A] hover:text-[#1B3A6B]"
            >
              ← Back to credentials
            </button>
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 bg-[#1B3A6B] hover:bg-[#152d54] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <ShieldCheck size={15} />
          )}
          {loading
            ? twoFA
              ? "Verifying…"
              : "Checking credentials…"
            : twoFA
              ? "Verify & Sign In"
              : "Continue to 2FA"}
        </button>

        <p className="text-center text-[11.5px] text-[#9AA5BE]">
          Having trouble?{" "}
          <button className="text-[#1B3A6B] hover:underline font-medium">
            Contact IT Support
          </button>
        </p>
      </div>

      <div className="px-8 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] text-[#9AA5BE] hover:text-[#5A6A8A] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Home
        </button>
      </div>
    </AuthCard>
  );
}

// ─── STUDENT REGISTRATION ────────────────────────────────────────────────────

type RegStep = "details" | "verify" | "college" | "done";

const STEP_LABELS: Record<RegStep, string> = {
  details: "Personal Details",
  verify: "Verify Identity",
  college: "College & Course",
  done: "All Set!",
};

const STEP_ORDER: RegStep[] = ["details", "verify", "college", "done"];

export function StudentRegister({
  onBack,
  onLogin,
  onSuccess,
}: {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<RegStep>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // step 2 — verify
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // step 3 — college
  const [college, setCollege] = useState("");
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [terms, setTerms] = useState(false);

  const curIdx = STEP_ORDER.indexOf(step);

  const next = () => {
    setError("");
    if (step === "details") {
      if (!name || !email || !phone || !pwd) {
        setError("Please fill all required fields.");
        return;
      }
      if (pwd.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (pwd !== confirmPwd) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep("verify");
      }, 1000);
    } else if (step === "verify") {
      if (!emailVerified || !phoneVerified) {
        setError("Please verify both email and mobile.");
        return;
      }
      setStep("college");
    } else if (step === "college") {
      if (!college || !dept || !year) {
        setError("Please fill all required fields.");
        return;
      }
      if (!terms) {
        setError("Please accept the terms and conditions.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep("done");
      }, 1400);
    } else {
      onSuccess();
    }
  };

  const verifyCode = (which: "email" | "phone") => {
    if (which === "email" && emailOtp.length === 6) setEmailVerified(true);
    if (which === "phone" && phoneOtp.length === 6) setPhoneVerified(true);
  };

  return (
    <AuthCard>
      <AuthHeader
        icon={UserPlus}
        title="Create Student Account"
        sub="Join 4.8L+ students building AI-powered careers with EduConnect."
      />

      {/* stepper */}
      <div className="flex items-center px-8 pt-5 pb-2 gap-0">
        {STEP_ORDER.filter((s) => s !== "done").map((s, i) => {
          const done = curIdx > i;
          const active = s === step;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all
                ${done ? "bg-emerald-500 text-white" : active ? "bg-[#1B3A6B] text-white" : "bg-[#EFF2FA] text-[#9AA5BE]"}`}
              >
                {done ? <Check size={12} /> : i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${done ? "bg-emerald-400" : "bg-[#EFF2FA]"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="px-8 text-[11px] font-medium text-[#5A6A8A] mb-1">
        {step !== "done" ? STEP_LABELS[step] : ""}
      </p>

      <div className="px-8 py-5 space-y-4">
        {error && <ErrorMsg msg={error} />}

        {/* ── step 1: personal details ── */}
        {step === "details" && (
          <>
            <div>
              <FieldLabel label="Full Name" required />
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="As per college records"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <FieldLabel label="Email Address" required />
              <div className="relative">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@email.com"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <FieldLabel label="Mobile Number" required />
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-[#EFF2FA] border-[1.5px] border-transparent rounded-[10px] text-[13px] text-[#0F1C3F] whitespace-nowrap">
                  🇮🇳 +91
                </div>
                <div className="relative flex-1">
                  <Phone
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/, "").slice(0, 10))
                    }
                    placeholder="10-digit number"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
            </div>
            <div>
              <FieldLabel label="Create Password" required />
              <PwdInput
                value={pwd}
                onChange={setPwd}
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <FieldLabel label="Confirm Password" required />
              <PwdInput
                value={confirmPwd}
                onChange={setConfirmPwd}
                placeholder="Re-enter password"
              />
              {confirmPwd && pwd !== confirmPwd && (
                <p className="text-[11.5px] text-red-500 mt-1 flex items-center gap-1">
                  <X size={10} />
                  Passwords do not match
                </p>
              )}
              {confirmPwd && pwd === confirmPwd && pwd.length >= 8 && (
                <p className="text-[11.5px] text-emerald-600 mt-1 flex items-center gap-1">
                  <Check size={10} />
                  Passwords match
                </p>
              )}
            </div>

            <Divider label="or sign up with" />
            <div className="flex gap-3">
              <SocialBtn icon="🔵" label="Google" />
              <SocialBtn icon="💼" label="LinkedIn" />
            </div>
          </>
        )}

        {/* ── step 2: verify ── */}
        {step === "verify" && (
          <div className="space-y-5">
            {/* email otp */}
            <div
              className={`p-4 rounded-xl border-2 transition-all ${emailVerified ? "border-emerald-400 bg-emerald-50" : "border-[rgba(27,58,107,0.12)] bg-white"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail
                    size={14}
                    className={
                      emailVerified ? "text-emerald-600" : "text-[#1B3A6B]"
                    }
                  />
                  <span className="text-[13px] font-semibold text-[#0F1C3F]">
                    Verify Email
                  </span>
                </div>
                {emailVerified ? (
                  <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
                    <Check size={12} />
                    Verified
                  </span>
                ) : (
                  <span className="text-[11px] text-[#5A6A8A]">{email}</span>
                )}
              </div>
              {!emailVerified && (
                <div className="space-y-2">
                  <OTPRow value={emailOtp} onChange={setEmailOtp} />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => verifyCode("email")}
                      className="px-4 py-1.5 bg-[#1B3A6B] text-white text-[12px] font-semibold rounded-lg hover:bg-[#152d54] transition-colors"
                    >
                      Verify Code
                    </button>
                    <button className="text-[11.5px] text-[#1B3A6B] hover:underline">
                      Resend
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* phone otp */}
            <div
              className={`p-4 rounded-xl border-2 transition-all ${phoneVerified ? "border-emerald-400 bg-emerald-50" : "border-[rgba(27,58,107,0.12)] bg-white"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Phone
                    size={14}
                    className={
                      phoneVerified ? "text-emerald-600" : "text-[#1B3A6B]"
                    }
                  />
                  <span className="text-[13px] font-semibold text-[#0F1C3F]">
                    Verify Mobile
                  </span>
                </div>
                {phoneVerified ? (
                  <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
                    <Check size={12} />
                    Verified
                  </span>
                ) : (
                  <span className="text-[11px] text-[#5A6A8A]">
                    +91 {phone}
                  </span>
                )}
              </div>
              {!phoneVerified && (
                <div className="space-y-2">
                  <OTPRow value={phoneOtp} onChange={setPhoneOtp} />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => verifyCode("phone")}
                      className="px-4 py-1.5 bg-[#1B3A6B] text-white text-[12px] font-semibold rounded-lg hover:bg-[#152d54] transition-colors"
                    >
                      Verify Code
                    </button>
                    <button className="text-[11.5px] text-[#1B3A6B] hover:underline">
                      Resend
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── step 3: college ── */}
        {step === "college" && (
          <>
            <div>
              <FieldLabel label="College / Institution" required />
              <div className="relative">
                <Building2
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                />
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className={`${inputCls} pl-9 appearance-none pr-8 cursor-pointer`}
                >
                  <option value="">Search or select your college</option>
                  <option>Rajiv Gandhi Institute of IT, Mumbai</option>
                  <option>Hyderabad Institute of Technology</option>
                  <option>Delhi Technical University</option>
                  <option>Anna University, Chennai</option>
                  <option>BITS Pilani</option>
                  <option>Other / Not listed</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                />
              </div>
            </div>
            <div>
              <FieldLabel label="Department / Branch" required />
              <div className="relative">
                <GraduationCap
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                />
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className={`${inputCls} pl-9 appearance-none pr-8 cursor-pointer`}
                >
                  <option value="">Select department</option>
                  <option>Computer Science & Engineering</option>
                  <option>Information Technology</option>
                  <option>Electronics & Communication</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>MBA / Management</option>
                  <option>MCA</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Current Year" required />
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  >
                    <option value="">Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Alumni</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <FieldLabel label="Roll / Reg. Number" />
                <div className="relative">
                  <Hash
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]"
                  />
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="Optional"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
              <button
                onClick={() => setTerms(!terms)}
                className={`mt-0.5 rounded flex items-center justify-center border-2 shrink-0 transition-all ${terms ? "bg-[#1B3A6B] border-[#1B3A6B]" : "border-slate-300"}`}
                style={{ width: "18px", height: "18px" }}
              >
                {terms && <Check size={10} className="text-white" />}
              </button>
              <span className="text-[12px] text-[#5A6A8A] leading-relaxed">
                I agree to the{" "}
                <button className="text-[#1B3A6B] font-medium hover:underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-[#1B3A6B] font-medium hover:underline">
                  Privacy Policy
                </button>
                . I confirm the information provided is accurate.
              </span>
            </label>
          </>
        )}

        {/* ── done ── */}
        {step === "done" && (
          <div className="flex flex-col items-center py-4 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
              <Check size={30} className="text-white" />
            </div>
            <div>
              <h3
                className="text-[18px] font-semibold text-[#0F1C3F]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Welcome to EduConnect!
              </h3>
              <p className="text-[13px] text-[#5A6A8A] mt-1 leading-relaxed">
                Your account is ready. Start your AI-powered career journey
                right now.
              </p>
            </div>
            <div className="w-full space-y-2">
              {[
                { icon: "✅", text: "Email verified" },
                { icon: "✅", text: "Mobile verified" },
                { icon: "✅", text: "College profile linked" },
              ].map((i) => (
                <div
                  key={i.text}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 rounded-xl text-[12.5px] text-emerald-700 font-medium"
                >
                  <span>{i.icon}</span>
                  {i.text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#EBF1FA] rounded-xl text-[12px] text-[#1B3A6B] font-medium">
              <Sparkles size={13} />
              AI Assessment unlocked — complete your profile to begin
            </div>
          </div>
        )}

        {/* footer nav */}
        <div className="flex items-center gap-3 pt-1">
          {step !== "details" && step !== "done" && (
            <button
              onClick={() => setStep(STEP_ORDER[curIdx - 1])}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-[rgba(27,58,107,0.15)] rounded-xl text-[13px] font-medium text-[#5A6A8A] hover:bg-[#F4F6FB] transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
          <button
            onClick={next}
            disabled={loading}
            className="flex-1 py-2.5 bg-[#1B3A6B] hover:bg-[#152d54] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : step === "done" ? (
              <ArrowRight size={15} />
            ) : (
              <ArrowRight size={15} />
            )}
            {loading
              ? "Please wait…"
              : step === "college"
                ? "Create Account"
                : step === "done"
                  ? "Go to My Portal"
                  : "Continue"}
          </button>
        </div>

        {step === "details" && (
          <p className="text-center text-[12.5px] text-[#5A6A8A]">
            Already have an account?{" "}
            <button
              onClick={onLogin}
              className="text-[#1B3A6B] font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        )}
      </div>

      {step === "details" && (
        <div className="px-8 pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-[#9AA5BE] hover:text-[#5A6A8A] transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Home
          </button>
        </div>
      )}
    </AuthCard>
  );
}
