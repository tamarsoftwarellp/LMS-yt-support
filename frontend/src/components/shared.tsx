import { useState, useRef, useCallback } from "react";
import {
  Info, X, Upload, FileText, RefreshCw, Check, ChevronDown,
  Building2, User, Mail, Settings, Users, GraduationCap, Target, LayoutDashboard, CreditCard
} from "lucide-react";

export const STEPS = [
  { id: 1, label: "Institution Details",    icon: Building2,       desc: "College info & address" },
  { id: 2, label: "Representative",         icon: User,            desc: "Contact persons" },
  { id: 3, label: "Verification",           icon: Mail,            desc: "OTP confirmation" },
  { id: 4, label: "Campus Configuration",   icon: Settings,        desc: "Academics & branding" },
  { id: 5, label: "Faculty Setup",          icon: Users,           desc: "Roles & permissions" },
  { id: 6, label: "Student Onboarding",     icon: GraduationCap,   desc: "Upload & activate" },
  { id: 7, label: "Career Configuration",   icon: Target,          desc: "Roles & eligibility" },
  { id: 8, label: "Dashboard Init",         icon: LayoutDashboard, desc: "Activate dashboards" },
  { id: 9, label: "Subscription & Billing", icon: CreditCard,      desc: "Plan & payment" },
];

export const inputCls = "w-full px-3 py-[9px] bg-[#EFF2FA] border-[1.5px] border-transparent rounded-[10px] text-[13.5px] text-[#0F1C3F] placeholder:text-[#9AA5BE] outline-none focus:border-[#1B3A6B] focus:bg-white transition-all";

export function SectionTitle({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-[--border]">
      <div className="flex items-baseline gap-3">
        <span className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-[#E8ECF5] text-[#5A6A8A]"
          style={{ fontFamily: "var(--font-mono)" }}>{num}</span>
        <h2 className="text-[17px] text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{title}</h2>
      </div>
      {sub && <p className="mt-1 text-[12.5px] text-[#5A6A8A] ml-11">{sub}</p>}
    </div>
  );
}

export function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#0F1C3F]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[11.5px] text-[#5A6A8A] flex items-center gap-1">
          <Info size={11} />{hint}
        </p>
      )}
    </div>
  );
}

export function Input({ icon: Icon, suffix, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; suffix?: string }) {
  return (
    <div className="flex">
      <div className="relative flex-1">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A]" />}
        <input {...props} className={`${inputCls} ${Icon ? "pl-9" : ""} ${suffix ? "rounded-r-none" : ""}`} />
      </div>
      {suffix && <span className="px-3 bg-[#E8ECF5] border-[1.5px] border-l-0 border-transparent rounded-r-[10px] text-[12.5px] text-[#5A6A8A] flex items-center">{suffix}</span>}
    </div>
  );
}

export function Select({ icon: Icon, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none" />}
      <select {...props} className={`${inputCls} ${Icon ? "pl-9" : ""} appearance-none pr-8 cursor-pointer`}>
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A8A] pointer-events-none" />
    </div>
  );
}

export function InfoBox({ variant = "blue", title, children }: { variant?: "blue" | "amber"; title?: string; children: React.ReactNode }) {
  const bg = variant === "blue" ? "bg-[#EBF1FA]" : "bg-amber-50 border border-amber-200";
  const iconColor = variant === "blue" ? "text-[#1B3A6B]" : "text-amber-600";
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${bg}`}>
      <Info size={15} className={`${iconColor} mt-0.5 shrink-0`} />
      <div className="text-[12.5px] text-[#5A6A8A] leading-relaxed">
        {title && <p className="font-medium text-[#0F1C3F] mb-0.5 text-[13px]">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function Tag({ children, onRemove, color = "blue" }: { children: React.ReactNode; onRemove?: () => void; color?: "blue" | "green" | "amber" }) {
  const colors = { blue: "bg-[#EBF1FA] text-[#1B3A6B]", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium ${colors[color]}`}>
      {children}
      {onRemove && <button onClick={onRemove} className="hover:opacity-70 transition-opacity"><X size={10} /></button>}
    </span>
  );
}

export function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/, "").slice(-1);
    const next = [...digits]; next[i] = d;
    onChange(next.join(""));
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };
  return (
    <div className="flex gap-2.5">
      {digits.map((d, i) => (
        <input key={i} ref={el => { inputs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
          value={d} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-[19px] font-semibold border-2 rounded-[10px] outline-none bg-white transition-colors"
          style={{ fontFamily: "var(--font-mono)", borderColor: d ? "#1B3A6B" : "#CBD5E1" }} />
      ))}
    </div>
  );
}

type UploadedFile = { name: string; size: number; status: "uploading" | "done" };

export function FileDropZone({ label, required, file, onFile, onRemove }: {
  label: string; required?: boolean; file?: UploadedFile; onFile: (f: UploadedFile) => void; onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const simulate = (f: File) => {
    onFile({ name: f.name, size: f.size, status: "uploading" });
    setTimeout(() => onFile({ name: f.name, size: f.size, status: "done" }), 1200);
  };
  const fmt = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`;
  return (
    <Field label={label} required={required}>
      {file ? (
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-blue-50 border border-blue-200 rounded-[10px]">
          <FileText size={16} className="text-[#1B3A6B] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-[#0F1C3F] truncate">{file.name}</p>
            <p className="text-[11px] text-[#5A6A8A]">{fmt(file.size)}</p>
          </div>
          {file.status === "uploading" ? <RefreshCw size={14} className="text-[#1B3A6B] animate-spin" /> : <Check size={14} className="text-emerald-600" />}
          <button onClick={onRemove} className="p-1 hover:bg-blue-100 rounded-md transition-colors"><X size={12} className="text-[#5A6A8A]" /></button>
        </div>
      ) : (
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) simulate(f); }, [])}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center gap-1.5 p-5 border-2 border-dashed rounded-[10px] cursor-pointer transition-all ${dragging ? "border-[#1B3A6B] bg-[#EBF1FA]" : "border-slate-200 bg-white hover:border-[#1B3A6B] hover:bg-[#EBF1FA]/50"}`}>
          <Upload size={18} className="text-[#5A6A8A]" />
          <p className="text-[12.5px] font-medium text-[#1B3A6B]">Click or drag &amp; drop</p>
          <p className="text-[11.5px] text-[#9AA5BE]">PDF, JPG, PNG — max 5 MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) simulate(f); }} />
        </div>
      )}
    </Field>
  );
}

export function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-[--border] rounded-xl">
      <span className="text-[13px] text-[#0F1C3F]">{label}</span>
      <button onClick={() => setOn(!on)} className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center px-0.5 ${on ? "bg-[#1B3A6B]" : "bg-slate-200"}`}
        style={{ height: "22px" }}>
        <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
