import { useEffect, useState } from "react";
import { Building2, Check, GraduationCap, Mail, MapPin, Phone, Plus, RefreshCw, Save, Search, Trash2, Users, X } from "lucide-react";
import {
  addInstitutionProgram, getInstitutionProfile, listInstitutionPrograms, listInstitutionStudents,
  removeInstitutionProgram, updateInstitutionProfile,
} from "../api/college-portal";
import type { InstitutionProfile, InstitutionProgram, InstitutionStudent } from "../api/college-portal";

const input = "w-full px-3.5 py-2.5 bg-[#F8FAFD] border border-[--border] rounded-xl text-[13px] text-[#0F1C3F] outline-none focus:border-[#1B3A6B]";
type Tab = "profile" | "programs" | "students";

function ProfileTab({ profile, onUpdated }: { profile: InstitutionProfile; onUpdated: (p: InstitutionProfile) => void }) {
  const [form, setForm] = useState({ contact_name: profile.contact_name || "", contact_email: profile.contact_email || "", contact_phone: profile.contact_phone || "", address: profile.address || "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [saved, setSaved] = useState(false);
  const save = async () => { setBusy(true); setError(""); setSaved(false); try { onUpdated(await updateInstitutionProfile(form)); setSaved(true); } catch (e) { setError(e instanceof Error ? e.message : "Unable to save"); } finally { setBusy(false); } };
  return <div className="space-y-4">
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="p-3 bg-[#F8FAFD] rounded-xl border border-[--border]"><p className="text-[10.5px] text-[#9AA5BE]">Institution name</p><p className="text-[13.5px] font-semibold text-[#0F1C3F] mt-0.5">{profile.name}</p></div>
      <div className="p-3 bg-[#F8FAFD] rounded-xl border border-[--border]"><p className="text-[10.5px] text-[#9AA5BE]">Status</p><p className="text-[13.5px] font-semibold text-emerald-700 capitalize mt-0.5">{profile.status}</p></div>
    </div>
    {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12.5px]">{error}</div>}
    {saved && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-[12.5px] flex items-center gap-2"><Check size={14} />Saved successfully.</div>}
    <label className="block text-[11px] font-semibold text-[#5A6A8A]">Contact person<input className={`${input} mt-1.5`} value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></label>
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="block text-[11px] font-semibold text-[#5A6A8A]">Contact email<input className={`${input} mt-1.5`} value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} /></label>
      <label className="block text-[11px] font-semibold text-[#5A6A8A]">Contact phone<input className={`${input} mt-1.5`} value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></label>
    </div>
    <label className="block text-[11px] font-semibold text-[#5A6A8A]">Address<input className={`${input} mt-1.5`} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
    <button disabled={busy} onClick={save} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[12.5px] font-semibold disabled:opacity-50"><Save size={14} />{busy ? "Saving…" : "Save Changes"}</button>
  </div>;
}

function ProgramsTab() {
  const [items, setItems] = useState<InstitutionProgram[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [busy, setBusy] = useState("");
  const load = () => listInstitutionPrograms().then(setItems).catch(e => setError(e instanceof Error ? e.message : "Unable to load programs")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const toggle = async (program: InstitutionProgram) => {
    setBusy(program.id); setError("");
    try { if (program.offered) await removeInstitutionProgram(program.id); else await addInstitutionProgram(program.id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to update program"); }
    finally { setBusy(""); }
  };
  if (loading) return <div className="py-10 flex justify-center"><RefreshCw size={16} className="animate-spin text-[#9AA5BE]" /></div>;
  return <div className="space-y-3">
    {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12.5px]">{error}</div>}
    <p className="text-[12px] text-[#5A6A8A]">Toggle which programs your institution offers. Students can only register under an offered program.</p>
    <div className="space-y-2">{items.map(p => (
      <div key={p.id} className="flex items-center justify-between p-3.5 bg-[#F8FAFD] border border-[--border] rounded-xl">
        <div><p className="text-[13px] font-semibold text-[#0F1C3F]">{p.name}</p>{p.offered && <p className="text-[10.5px] text-[#9AA5BE]">{p.student_count} students enrolled</p>}</div>
        <button disabled={busy === p.id || (p.offered && p.student_count > 0)} onClick={() => toggle(p)}
          className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 disabled:opacity-50 ${p.offered ? "bg-emerald-50 text-emerald-700" : "bg-[#EFF2FA] text-[#5A6A8A]"}`}>
          {p.offered ? <><Check size={12} />Offered</> : <><Plus size={12} />Add</>}
        </button>
      </div>
    ))}</div>
    {!items.length && <p className="text-[12.5px] text-[#9AA5BE] text-center py-8">No programs configured on the platform yet.</p>}
  </div>;
}

function StudentsTab() {
  const [items, setItems] = useState<InstitutionStudent[]>([]); const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { setLoading(true); const timer = setTimeout(() => { listInstitutionStudents(search).then(setItems).catch(e => setError(e instanceof Error ? e.message : "Unable to load students")).finally(() => setLoading(false)); }, 250); return () => clearTimeout(timer); }, [search]);
  return <div className="space-y-3">
    <div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or roll number…" className={`${input} pl-9`} /></div>
    {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12.5px]">{error}</div>}
    {loading ? <div className="py-10 flex justify-center"><RefreshCw size={16} className="animate-spin text-[#9AA5BE]" /></div>
      : items.length ? <div className="space-y-2 max-h-[50vh] overflow-y-auto">{items.map((s, i) => (
        <div key={i} className="p-3.5 bg-[#F8FAFD] border border-[--border] rounded-xl flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-[13px] font-semibold text-[#0F1C3F] truncate">{s.full_name}</p><p className="text-[11px] text-[#5A6A8A] truncate">{s.email} · {s.program_name} · {s.current_year}</p></div>
          {s.roll_number && <span className="text-[10.5px] text-[#9AA5BE] shrink-0">{s.roll_number}</span>}
        </div>
      ))}</div> : <p className="text-[12.5px] text-[#9AA5BE] text-center py-8">No students found.</p>}
  </div>;
}

export function InstitutionManagement({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<InstitutionProfile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getInstitutionProfile().then(setProfile).catch(e => setError(e instanceof Error ? e.message : "Unable to load institution")); }, []);
  return (
    <div className="fixed inset-0 z-50 bg-[#071326]/70 p-4 sm:p-5 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-[#F2F5FC] rounded-2xl overflow-hidden">
        <div className="p-5 bg-[#0F1F3B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Building2 size={18} /></span><div><p className="text-[10px] uppercase tracking-widest text-white/50">Admin LMS</p><h2 className="text-[19px] font-semibold mt-0.5">{profile?.name || "Institution"}</h2></div></div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-xl"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12.5px]">{error}</div>}
          <div className="flex gap-1.5">
            {[{ key: "profile" as const, label: "Profile", icon: Building2 }, { key: "programs" as const, label: "Programs", icon: GraduationCap }, { key: "students" as const, label: "Students", icon: Users }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 ${tab === t.key ? "bg-[#1B3A6B] text-white" : "bg-white text-[#5A6A8A] border border-[--border]"}`}><t.icon size={13} />{t.label}</button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.08)] p-5">
            {!profile ? <div className="py-10 flex justify-center"><RefreshCw size={16} className="animate-spin text-[#9AA5BE]" /></div>
              : tab === "profile" ? <ProfileTab profile={profile} onUpdated={setProfile} />
              : tab === "programs" ? <ProgramsTab />
              : <StudentsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
