import { useEffect, useState } from "react";
import {
  Building2, Check, Clock, LayoutDashboard, LogOut,
  Mail, MapPin, Phone, RefreshCw, Search, ShieldCheck, Users, X, XCircle,
} from "lucide-react";
import {
  approveInstitution, getCurrentSuperAdmin, getInstitution, listInstitutions, reactivateInstitution, rejectInstitution, suspendInstitution,
} from "../api/super-admin";
import type { Institution, InstitutionDetail } from "../api/super-admin";

type Tab = "pending" | "active" | "suspended" | "rejected" | "all";
const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pending" }, { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" }, { key: "rejected", label: "Rejected" }, { key: "all", label: "All" },
];
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700", active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700", rejected: "bg-slate-100 text-slate-600",
};

function ReasonPrompt({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-[#071326]/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#0F1C3F]">{title}</h3>
        <textarea autoFocus rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason…" className="w-full p-3 border border-[--border] rounded-xl text-[13px] outline-none focus:border-[#1B3A6B]" />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-[12.5px] text-[#5A6A8A] font-semibold">Cancel</button>
          <button disabled={reason.trim().length < 3} onClick={() => onConfirm(reason.trim())} className="px-4 py-2 bg-[#1B3A6B] text-white rounded-xl text-[12.5px] font-semibold disabled:opacity-40">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function InstitutionDrawer({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [item, setItem] = useState<InstitutionDetail | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [prompt, setPrompt] = useState<"reject" | "suspend" | null>(null);
  const load = () => getInstitution(id).then(setItem).catch(e => setError(e instanceof Error ? e.message : "Unable to load institution"));
  useEffect(() => { load(); }, [id]);
  const run = async (action: () => Promise<unknown>) => { setBusy(true); setError(""); try { await action(); await load(); onChanged(); } catch (e) { setError(e instanceof Error ? e.message : "Action failed"); } finally { setBusy(false); } };
  return (
    <div className="fixed inset-0 z-50 bg-[#071326]/60 flex justify-end">
      <div className="w-full max-w-md h-full bg-white overflow-y-auto p-6 space-y-5">
        <div className="flex items-start justify-between"><h2 className="text-[19px] font-bold text-[#0F1C3F]">{item?.name || "Loading…"}</h2><button onClick={onClose} className="p-1.5 text-[#9AA5BE] hover:text-[#0F1C3F]"><X size={18} /></button></div>
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12.5px]">{error}</div>}
        {!item ? <div className="py-10 flex justify-center"><RefreshCw size={16} className="animate-spin text-[#9AA5BE]" /></div> : <>
          <span className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-semibold capitalize ${STATUS_STYLE[item.status]}`}>{item.status}</span>
          <div className="space-y-2.5 text-[13px]">
            <p className="flex items-center gap-2 text-[#0F1C3F]"><Users size={14} className="text-[#9AA5BE]" />{item.contact_name}</p>
            <p className="flex items-center gap-2 text-[#5A6A8A]"><Mail size={14} className="text-[#9AA5BE]" />{item.contact_email}</p>
            <p className="flex items-center gap-2 text-[#5A6A8A]"><Phone size={14} className="text-[#9AA5BE]" />{item.contact_phone}</p>
            {item.address && <p className="flex items-center gap-2 text-[#5A6A8A]"><MapPin size={14} className="text-[#9AA5BE]" />{item.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F8FAFD] rounded-xl border border-[--border] text-center"><p className="text-[19px] font-bold text-[#1B3A6B]">{item.student_count}</p><p className="text-[10.5px] text-[#5A6A8A]">Students</p></div>
            <div className="p-3 bg-[#F8FAFD] rounded-xl border border-[--border] text-center"><p className="text-[19px] font-bold text-[#1B3A6B]">{item.admin_count}</p><p className="text-[10.5px] text-[#5A6A8A]">Admins</p></div>
          </div>
          {item.rejected_reason && <div className="p-3 bg-red-50 rounded-xl text-[12px] text-red-700"><b>Rejected:</b> {item.rejected_reason}</div>}

          <div className="flex gap-2 flex-wrap">
            {item.status === "pending" && <>
              <button disabled={busy} onClick={() => run(() => approveInstitution(id))} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[12.5px] font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"><Check size={14} />Approve</button>
              <button disabled={busy} onClick={() => setPrompt("reject")} className="flex-1 py-2.5 border border-red-200 text-red-700 rounded-xl text-[12.5px] font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"><XCircle size={14} />Reject</button>
            </>}
            {item.status === "active" && <button disabled={busy} onClick={() => setPrompt("suspend")} className="flex-1 py-2.5 border border-red-200 text-red-700 rounded-xl text-[12.5px] font-semibold disabled:opacity-50">Suspend Institution</button>}
            {item.status === "suspended" && <button disabled={busy} onClick={() => run(() => reactivateInstitution(id))} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[12.5px] font-semibold disabled:opacity-50">Reactivate</button>}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA5BE] mb-2">History</p>
            <div className="space-y-2">
              {item.history.map((h, i) => (
                <div key={i} className="p-3 bg-[#F8FAFD] rounded-xl border border-[--border]">
                  <div className="flex justify-between"><span className="text-[12px] font-semibold capitalize text-[#0F1C3F]">{h.action}</span><span className="text-[10.5px] text-[#9AA5BE]">{new Date(h.created_at).toLocaleString()}</span></div>
                  {h.reason && <p className="text-[11.5px] text-[#5A6A8A] mt-1">{h.reason}</p>}
                  {h.performed_by_name && <p className="text-[10.5px] text-[#9AA5BE] mt-1">by {h.performed_by_name}</p>}
                </div>
              ))}
            </div>
          </div>
        </>}
      </div>
      {prompt && item && <ReasonPrompt title={prompt === "reject" ? "Reject institution" : "Suspend institution"} onCancel={() => setPrompt(null)}
        onConfirm={reason => { setPrompt(null); run(() => (prompt === "reject" ? rejectInstitution(id, reason) : suspendInstitution(id, reason))); }} />}
    </div>
  );
}

function InstitutionsView({ onOpen, refresh }: { onOpen: (id: string) => void; refresh: number }) {
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = () => { setLoading(true); setError(""); listInstitutions(tab === "all" ? undefined : tab, search).then(setItems).catch(e => setError(e instanceof Error ? e.message : "Unable to load institutions")).finally(() => setLoading(false)); };
  useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer); }, [tab, search, refresh]);
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold ${tab === t.key ? "bg-[#1B3A6B] text-white" : "bg-[#EFF2FA] text-[#5A6A8A]"}`}>{t.label}</button>)}</div>
        <div className="relative w-full sm:w-64"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search institutions…" className="w-full pl-9 pr-3 py-2 bg-white border border-[--border] rounded-xl text-[12.5px] outline-none focus:border-[#1B3A6B]" /></div>
      </div>
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12.5px]">{error}</div>}
      {loading ? <div className="py-16 flex justify-center"><RefreshCw size={16} className="animate-spin text-[#9AA5BE]" /></div>
        : items.length ? <div className="grid sm:grid-cols-2 gap-3">{items.map(item => (
          <button key={item.id} onClick={() => onOpen(item.id)} className="p-4 bg-white border border-[--border] rounded-2xl text-left hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start gap-2"><div className="w-9 h-9 rounded-lg bg-[#EBF1FA] flex items-center justify-center shrink-0"><Building2 size={16} className="text-[#1B3A6B]" /></div><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_STYLE[item.status]}`}>{item.status}</span></div>
            <p className="text-[13.5px] font-semibold text-[#0F1C3F] mt-2.5">{item.name}</p>
            <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{item.contact_name}</p>
            <p className="text-[10.5px] text-[#9AA5BE] mt-2 flex items-center gap-1"><Clock size={10} />{new Date(item.created_at).toLocaleDateString()} · {item.student_count} students</p>
          </button>
        ))}</div> : <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl"><Building2 size={26} className="mx-auto text-[#9AA5BE]" /><p className="mt-3 text-[13px] text-[#5A6A8A]">No institutions in this view.</p></div>}
    </div>
  );
}

export function SuperAdminPanel({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { getCurrentSuperAdmin().then(setAdmin).catch(() => undefined); }, []);
  return (
    <div className="min-h-screen bg-[#F2F5FC]" style={{ fontFamily: "var(--font-sans)" }}>
      <header className="bg-[#0F1F3B] text-white sticky top-0 z-40"><div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center"><ShieldCheck size={17} /></div><div><p className="font-semibold text-[14px] leading-none">EduConnect</p><span className="inline-block mt-0.5 px-2 py-0.5 bg-white/10 text-[9.5px] font-bold rounded-full">SUPER ADMIN</span></div></div>
        <div className="flex items-center gap-3"><span className="hidden sm:block text-[12px] text-white/60">{admin?.email}</span><button onClick={onLogout} className="p-2 text-white/60 hover:text-white"><LogOut size={15} /></button></div>
      </div></header>
      <div className="px-3 sm:px-6 py-5 sm:py-7 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-5"><LayoutDashboard size={20} className="text-[#1B3A6B]" /><h1 className="text-[19px] text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>Institutions</h1></div>
        <InstitutionsView onOpen={setOpenId} refresh={refresh} />
      </div>
      {openId && <InstitutionDrawer id={openId} onClose={() => setOpenId(null)} onChanged={() => setRefresh(x => x + 1)} />}
    </div>
  );
}
