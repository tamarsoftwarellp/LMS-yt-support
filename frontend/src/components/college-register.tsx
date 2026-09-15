import { useState } from "react";
import { ArrowLeft, Building2, Check, GraduationCap, Lock, Mail, MapPin, Phone, RefreshCw, User } from "lucide-react";
import { Field, Input } from "./shared";
import { registerInstitution } from "../api/institution";
import type { InstitutionRegisterPayload } from "../api/institution";

export function CollegeRegister({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [form, setForm] = useState<InstitutionRegisterPayload>({
    college_name: "", contact_name: "", contact_email: "", contact_phone: "", address: "",
    admin_full_name: "", admin_email: "", admin_mobile: "", admin_password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (key: keyof InstitutionRegisterPayload, value: string) => setForm(x => ({ ...x, [key]: value }));

  const submit = async () => {
    setError("");
    if (!form.college_name.trim() || !form.contact_name.trim() || !form.contact_email.trim() || !form.contact_phone.trim()) {
      setError("Please fill in the institution details."); return;
    }
    if (!form.admin_full_name.trim() || !form.admin_email.trim() || !form.admin_mobile.trim()) {
      setError("Please fill in the administrator details."); return;
    }
    if (form.admin_password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.admin_password !== confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try { await registerInstitution(form); setDone(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Registration failed. Please try again."); }
    finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB] px-4 py-10" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_4px_40px_rgba(27,58,107,0.1)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto"><Check size={26} className="text-emerald-600" /></div>
          <h1 className="text-[21px] text-[#0F1C3F] mt-5" style={{ fontFamily: "var(--font-serif)" }}>Registration submitted</h1>
          <p className="text-[13.5px] text-[#5A6A8A] mt-2 leading-relaxed">
            Thanks for registering <b>{form.college_name}</b>. Our team will review your details and approve your institution shortly.
            You'll be able to sign in as the institution admin once approved.
          </p>
          <button onClick={onLogin} className="mt-7 w-full py-3 bg-[#1B3A6B] text-white rounded-xl text-[13.5px] font-semibold">Go to Admin Login</button>
          <button onClick={onBack} className="mt-3 w-full py-2.5 text-[13px] text-[#5A6A8A] font-medium">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] px-4 py-10" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="w-full max-w-[560px] mx-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#5A6A8A] hover:text-[#1B3A6B] mb-4 font-medium"><ArrowLeft size={14} />Back</button>
        <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(27,58,107,0.1)] overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-[rgba(27,58,107,0.08)]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#1B3A6B] flex items-center justify-center"><GraduationCap size={18} className="text-white" /></div>
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#5A6A8A]" style={{ fontFamily: "var(--font-mono)" }}>EduConnect</span>
            </div>
            <h1 className="text-[22px] text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>Register your institution</h1>
            <p className="text-[13px] text-[#5A6A8A] mt-1 leading-relaxed">Get your college onboarded onto EduConnect. Our team reviews every registration before it goes live.</p>
          </div>
          <div className="p-8 space-y-6">
            {error && <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-[12.5px] font-medium">{error}</div>}

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA5BE] flex items-center gap-1.5"><Building2 size={12} />Institution details</p>
              <Field label="College / Institution name" required>
                <Input icon={Building2} value={form.college_name} onChange={e => set("college_name", e.target.value)} placeholder="e.g. Riverside Institute of Technology" />
              </Field>
              <Field label="Contact person" required>
                <Input icon={User} value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Full name" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Contact email" required><Input icon={Mail} type="email" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} placeholder="office@college.edu" /></Field>
                <Field label="Contact phone" required><Input icon={Phone} value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} placeholder="9876500000" /></Field>
              </div>
              <Field label="Address" hint="Optional">
                <Input icon={MapPin} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street, city, state" />
              </Field>
            </div>

            <div className="space-y-4 pt-2 border-t border-[--border]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA5BE] flex items-center gap-1.5 pt-4"><User size={12} />Institution admin account</p>
              <p className="text-[12px] text-[#5A6A8A] -mt-2">This will be your login once your institution is approved.</p>
              <Field label="Admin full name" required>
                <Input icon={User} value={form.admin_full_name} onChange={e => set("admin_full_name", e.target.value)} placeholder="Full name" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Admin email" required><Input icon={Mail} type="email" value={form.admin_email} onChange={e => set("admin_email", e.target.value)} placeholder="admin@college.edu" /></Field>
                <Field label="Admin mobile" required><Input icon={Phone} value={form.admin_mobile} onChange={e => set("admin_mobile", e.target.value)} placeholder="9876500000" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Password" required hint="At least 8 characters"><Input icon={Lock} type="password" value={form.admin_password} onChange={e => set("admin_password", e.target.value)} placeholder="••••••••" /></Field>
                <Field label="Confirm password" required><Input icon={Lock} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" /></Field>
              </div>
            </div>

            <button disabled={busy} onClick={submit} className="w-full py-3 bg-[#1B3A6B] text-white rounded-xl text-[13.5px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {busy ? <><RefreshCw size={15} className="animate-spin" />Submitting…</> : "Submit for Approval"}
            </button>
            <p className="text-[11.5px] text-[#9AA5BE] text-center">Already registered? <button onClick={onLogin} className="text-[#1B3A6B] font-semibold">Sign in</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
