import { useState } from "react";
import {
  LayoutDashboard, Building2, Users, BarChart2, CreditCard,
  ClipboardList, Settings, Bell, Search, ChevronRight, ArrowLeft,
  Check, X, AlertCircle, TrendingUp, TrendingDown, ArrowRight,
  Shield, RefreshCw, Download, Filter, MoreVertical, Eye,
  CheckCircle2, XCircle, Clock, Pause, GraduationCap, Globe,
  Mail, Phone, MapPin, Calendar, Zap, Star, Hash,
  ChevronDown, Plus, Trash2, ToggleLeft, ToggleRight,
  Activity, Flag, UserCheck, ExternalLink, Edit3, Info,
  PieChart, Sparkles, LogOut, User, Lock,
  BookOpen,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { LMSAdminSection } from "./lms-admin";

// ─── types ────────────────────────────────────────────────────────────────────
type AdminSection =
  | "dashboard" | "colleges" | "students" | "analytics"
  | "subscriptions" | "audit" | "settings" | "lms-admin";


type CollegeStatus = "active" | "pending" | "suspended" | "review";
type StudentStatus = "active" | "inactive" | "verified";
type PlanTier      = "Starter" | "Growth" | "Enterprise";

// ─── mock data ────────────────────────────────────────────────────────────────
const COLLEGES = [
  { id: "C001", name: "Rajiv Gandhi Institute of IT",    city: "Mumbai",      state: "Maharashtra", students: 1240, plan: "Enterprise" as PlanTier, status: "active" as CollegeStatus,    joined: "2024-03-12", revenue: 84000, placements: 91 },
  { id: "C002", name: "Hyderabad Institute of Tech.",    city: "Hyderabad",   state: "Telangana",   students: 870,  plan: "Growth" as PlanTier,     status: "active" as CollegeStatus,    joined: "2024-05-08", revenue: 42630, placements: 84 },
  { id: "C003", name: "Delhi Technical University",      city: "New Delhi",   state: "Delhi",       students: 2100, plan: "Enterprise" as PlanTier, status: "active" as CollegeStatus,    joined: "2023-11-01", revenue: 126000,placements: 88 },
  { id: "C004", name: "Anna University",                 city: "Chennai",     state: "Tamil Nadu",  students: 3400, plan: "Enterprise" as PlanTier, status: "active" as CollegeStatus,    joined: "2023-08-15", revenue: 204000,placements: 93 },
  { id: "C005", name: "BITS Pilani",                     city: "Pilani",      state: "Rajasthan",   students: 560,  plan: "Growth" as PlanTier,     status: "pending" as CollegeStatus,   joined: "2026-07-10", revenue: 0,     placements: 0  },
  { id: "C006", name: "Pune Institute of Computer Sci.", city: "Pune",        state: "Maharashtra", students: 430,  plan: "Starter" as PlanTier,    status: "active" as CollegeStatus,    joined: "2025-01-22", revenue: 0,     placements: 78 },
  { id: "C007", name: "Nirma University",                city: "Ahmedabad",   state: "Gujarat",     students: 980,  plan: "Growth" as PlanTier,     status: "review" as CollegeStatus,    joined: "2026-06-30", revenue: 0,     placements: 0  },
  { id: "C008", name: "Amrita School of Engineering",    city: "Coimbatore",  state: "Tamil Nadu",  students: 1560, plan: "Enterprise" as PlanTier, status: "suspended" as CollegeStatus, joined: "2024-09-14", revenue: 0,     placements: 72 },
];

const STUDENTS = [
  { id: "S001", name: "Arjun Shah",       email: "arjun.s@bits.edu",      college: "BITS Pilani",       dept: "CSE", year: "4th",   status: "verified" as StudentStatus, score: 87, placed: true },
  { id: "S002", name: "Priya Nair",       email: "priya.n@anna.edu",      college: "Anna University",   dept: "IT",  year: "3rd",   status: "active" as StudentStatus,   score: 74, placed: false },
  { id: "S003", name: "Rahul Verma",      email: "rahul.v@dtu.ac.in",     college: "Delhi Tech. Univ.", dept: "ECE", year: "4th",   status: "active" as StudentStatus,   score: 68, placed: false },
  { id: "S004", name: "Sneha Reddy",      email: "sneha.r@hyit.edu",      college: "Hyderabad IT",      dept: "CSE", year: "Alumni",status: "verified" as StudentStatus, score: 92, placed: true  },
  { id: "S005", name: "Karthik Menon",    email: "karthik.m@rgit.edu",    college: "RGIT Mumbai",       dept: "MCA", year: "2nd",   status: "inactive" as StudentStatus, score: 45, placed: false },
  { id: "S006", name: "Ananya Singh",     email: "ananya.s@pune-it.edu",  college: "Pune ICS",          dept: "CSE", year: "3rd",   status: "active" as StudentStatus,   score: 81, placed: false },
  { id: "S007", name: "Dev Patel",        email: "dev.p@nirma.edu",       college: "Nirma University",  dept: "IT",  year: "4th",   status: "active" as StudentStatus,   score: 76, placed: false },
  { id: "S008", name: "Meera Iyer",       email: "meera.i@amrita.edu",    college: "Amrita SOE",        dept: "CSE", year: "Alumni",status: "verified" as StudentStatus, score: 89, placed: true  },
];

const TRANSACTIONS = [
  { id: "TXN-8821", college: "Anna University",        plan: "Enterprise", amount: 12000, date: "2026-07-15", status: "paid"    },
  { id: "TXN-8820", college: "Delhi Technical Univ.",  plan: "Enterprise", amount: 12000, date: "2026-07-14", status: "paid"    },
  { id: "TXN-8819", college: "Hyderabad IT",           plan: "Growth",     amount: 3553,  date: "2026-07-12", status: "paid"    },
  { id: "TXN-8818", college: "RGIT Mumbai",            plan: "Enterprise", amount: 12000, date: "2026-07-10", status: "paid"    },
  { id: "TXN-8817", college: "Pune ICS",               plan: "Starter",    amount: 0,     date: "2026-07-08", status: "free"    },
  { id: "TXN-8816", college: "Nirma University",       plan: "Growth",     amount: 3553,  date: "2026-07-05", status: "pending" },
];

const AUDIT_LOGS = [
  { id: 1,  ts: "2026-07-16 14:32", actor: "super@educonnect.in",  action: "Approved college registration",      target: "BITS Pilani",           type: "college"  },
  { id: 2,  ts: "2026-07-16 13:15", actor: "super@educonnect.in",  action: "Suspended college account",          target: "Amrita SOE",            type: "college"  },
  { id: 3,  ts: "2026-07-16 11:50", actor: "system",               action: "Auto-flagged subscription overdue",  target: "Nirma University",      type: "billing"  },
  { id: 4,  ts: "2026-07-15 17:08", actor: "super@educonnect.in",  action: "Reset admin password",               target: "priya.tpo@hyit.edu",    type: "security" },
  { id: 5,  ts: "2026-07-15 15:44", actor: "super@educonnect.in",  action: "Updated plan tier",                  target: "Anna University → ENT", type: "billing"  },
  { id: 6,  ts: "2026-07-15 12:30", actor: "system",               action: "Scheduled maintenance window",       target: "Platform",              type: "system"   },
  { id: 7,  ts: "2026-07-14 10:11", actor: "super@educonnect.in",  action: "Exported student analytics",         target: "Q2 2026 Report",        type: "data"     },
  { id: 8,  ts: "2026-07-13 09:05", actor: "super@educonnect.in",  action: "Enabled feature flag",               target: "ai_roadmap_v2",         type: "system"   },
];

const GROWTH_DATA = [
  { month: "Jan", colleges: 820,  students: 48000, revenue: 390000 },
  { month: "Feb", colleges: 910,  students: 54000, revenue: 435000 },
  { month: "Mar", colleges: 980,  students: 61000, revenue: 470000 },
  { month: "Apr", colleges: 1050, students: 69000, revenue: 512000 },
  { month: "May", colleges: 1110, students: 76000, revenue: 548000 },
  { month: "Jun", colleges: 1170, students: 84000, revenue: 590000 },
  { month: "Jul", colleges: 1200, students: 91000, revenue: 624000 },
];

const PLACEMENT_DATA = [
  { month: "Jan", rate: 72 }, { month: "Feb", rate: 75 }, { month: "Mar", rate: 79 },
  { month: "Apr", rate: 81 }, { month: "May", rate: 85 }, { month: "Jun", rate: 88 }, { month: "Jul", rate: 92 },
];

const PLAN_DIST = [
  { name: "Enterprise", value: 38, color: "#1B3A6B" },
  { name: "Growth",     value: 44, color: "#D97706" },
  { name: "Starter",    value: 18, color: "#E8ECF5" },
];

// ─── nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { key: AdminSection; icon: React.ElementType; label: string; badge?: number }[] = [
  { key: "dashboard",     icon: LayoutDashboard, label: "Dashboard"       },
  { key: "colleges",      icon: Building2,       label: "Colleges",   badge: 2 },
  { key: "students",      icon: Users,           label: "Students"        },
  { key: "lms-admin",     icon: BookOpen,        label: "LMS Courses"     },
  { key: "analytics",     icon: BarChart2,       label: "Analytics"       },
  { key: "subscriptions", icon: CreditCard,      label: "Subscriptions"   },
  { key: "audit",         icon: ClipboardList,   label: "Audit Logs"      },
  { key: "settings",      icon: Settings,        label: "Settings"        },
];

// ─── small shared pieces ──────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, change, color }: {
  icon: React.ElementType; label: string; value: string; change?: string; color: string;
}) {
  const pos = change?.startsWith("+");
  return (
    <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 flex items-start gap-4 shadow-sm">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "1a" }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#5A6A8A] mb-0.5">{label}</p>
        <p className="text-[24px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
        {change && (
          <p className={`text-[11.5px] font-medium flex items-center gap-1 mt-0.5 ${pos ? "text-emerald-600" : "text-red-500"}`}>
            {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{change} this month
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CollegeStatus | StudentStatus | string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: "Active",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border-amber-200"       },
    suspended: { label: "Suspended", cls: "bg-red-50 text-red-600 border-red-200"             },
    review:    { label: "In Review", cls: "bg-blue-50 text-blue-700 border-blue-200"          },
    inactive:  { label: "Inactive",  cls: "bg-slate-100 text-slate-500 border-slate-200"      },
    verified:  { label: "Verified",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    paid:      { label: "Paid",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    free:      { label: "Free",      cls: "bg-slate-100 text-slate-500 border-slate-200"      },
    pending_txn: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200"       },
  };
  const key = status === "pending" && true ? status : status;
  const cfg = map[key] ?? map["active"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: PlanTier }) {
  const map: Record<PlanTier, string> = {
    Enterprise: "bg-[#EBF1FA] text-[#1B3A6B] border-[#c5d4e8]",
    Growth:     "bg-amber-50 text-amber-700 border-amber-200",
    Starter:    "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[plan]}`}>
      {plan === "Enterprise" && <Star size={9} />}{plan}
    </span>
  );
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-[20px] text-[#0F1C3F] font-bold" style={{ fontFamily: "var(--font-serif)" }}>{title}</h2>
        {sub && <p className="text-[13px] text-[#5A6A8A] mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── screens ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const pending = COLLEGES.filter(c => c.status === "pending" || c.status === "review");
  return (
    <div className="space-y-6">
      <SectionHeader title="Platform Overview" sub="Real-time metrics across all institutions — July 2026" />

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={Building2}     label="Total Colleges"  value="1,200"  change="+28"  color="#1B3A6B" />
        <KPICard icon={Users}         label="Total Students"  value="4.84L"  change="+7,200" color="#7C3AED" />
        <KPICard icon={TrendingUp}    label="Placement Rate"  value="92%"    change="+4%"  color="#059669" />
        <KPICard icon={CreditCard}    label="MRR"             value="₹6.24L" change="+₹34k" color="#D97706" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Growth chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-[#0F1C3F]">Student Growth</p>
            <span className="text-[11.5px] text-[#5A6A8A]">Jan – Jul 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={GROWTH_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sa-sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B3A6B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F1F3F9" />
              <XAxis key="x" dataKey="month" tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <YAxis key="y" tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <Tooltip key="tip" contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8ECF5" }} />
              <Area key="students" type="monotone" dataKey="students" stroke="#1B3A6B" strokeWidth={2} fill="url(#sa-sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <p className="text-[14px] font-semibold text-[#0F1C3F] mb-4">Plan Distribution</p>
          <ResponsiveContainer width="100%" height={130}>
            <RPieChart>
              <Pie data={PLAN_DIST} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                {PLAN_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {PLAN_DIST.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-[#5A6A8A]">{d.name}</span>
                </div>
                <span className="font-semibold text-[#0F1C3F]">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-600" />
            <p className="text-[14px] font-semibold text-amber-800">{pending.length} Colleges Awaiting Approval</p>
          </div>
          <div className="space-y-2">
            {pending.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF1FA] flex items-center justify-center">
                    <Building2 size={14} className="text-[#1B3A6B]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#0F1C3F]">{c.name}</p>
                    <p className="text-[11.5px] text-[#5A6A8A]">{c.city}, {c.state} · {c.students} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <button className="px-3 py-1.5 bg-emerald-500 text-white text-[12px] font-semibold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                    <Check size={11} />Approve
                  </button>
                  <button className="px-3 py-1.5 bg-white border border-red-200 text-red-500 text-[12px] font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1">
                    <X size={11} />Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
        <p className="text-[14px] font-semibold text-[#0F1C3F] mb-4">Recent Activity</p>
        <div className="space-y-0">
          {AUDIT_LOGS.slice(0, 5).map((log, i) => (
            <div key={log.id} className={`flex items-start gap-3 py-3 ${i < 4 ? "border-b border-[rgba(27,58,107,0.06)]" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                ${log.type === "security" ? "bg-red-50" : log.type === "billing" ? "bg-amber-50" : log.type === "college" ? "bg-blue-50" : "bg-slate-100"}`}>
                {log.type === "security" ? <Shield size={13} className="text-red-500" /> :
                 log.type === "billing"  ? <CreditCard size={13} className="text-amber-600" /> :
                 log.type === "college"  ? <Building2 size={13} className="text-[#1B3A6B]" /> :
                 <Activity size={13} className="text-[#5A6A8A]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-[#0F1C3F]">{log.action}</p>
                <p className="text-[11.5px] text-[#5A6A8A]">{log.target}</p>
              </div>
              <p className="text-[11px] text-[#9AA5BE] shrink-0" style={{ fontFamily: "var(--font-mono)" }}>{log.ts.split(" ")[1]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollegesSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CollegeStatus>("all");
  const [selected, setSelected] = useState<typeof COLLEGES[0] | null>(null);

  const filtered = COLLEGES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-[13px] text-[#5A6A8A] hover:text-[#1B3A6B] mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Colleges
        </button>
        {/* College detail */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF1FA] flex items-center justify-center">
                  <Building2 size={24} className="text-[#1B3A6B]" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <StatusBadge status={selected.status} />
                    <PlanBadge plan={selected.plan} />
                    <span className="text-[11.5px] text-[#5A6A8A] flex items-center gap-1"><MapPin size={11} />{selected.city}, {selected.state}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.status === "pending" && (
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-[13px] font-semibold rounded-xl hover:bg-emerald-600 transition-colors">
                    <Check size={13} />Approve
                  </button>
                )}
                {selected.status === "active" && (
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-[13px] font-semibold rounded-xl hover:bg-red-100 transition-colors">
                    <Pause size={13} />Suspend
                  </button>
                )}
                {selected.status === "suspended" && (
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[13px] font-semibold rounded-xl hover:bg-emerald-100 transition-colors">
                    <Check size={13} />Reinstate
                  </button>
                )}
                <button className="flex items-center gap-1.5 px-4 py-2 border border-[rgba(27,58,107,0.15)] text-[13px] font-medium text-[#5A6A8A] rounded-xl hover:bg-[#F4F6FB] transition-colors">
                  <Edit3 size={13} />Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(27,58,107,0.08)]">
              {[
                { label: "Total Students", value: selected.students.toLocaleString(), icon: Users },
                { label: "Placement Rate", value: selected.placements ? selected.placements + "%" : "—",  icon: TrendingUp },
                { label: "Annual Revenue", value: selected.revenue ? "₹" + (selected.revenue / 1000).toFixed(0) + "k" : "Free", icon: CreditCard },
                { label: "Member Since",   value: selected.joined, icon: Calendar },
              ].map(m => (
                <div key={m.label} className="bg-[#F8FAFB] rounded-xl p-4">
                  <m.icon size={14} className="text-[#5A6A8A] mb-1.5" />
                  <p className="text-[18px] font-bold text-[#0F1C3F]">{m.value}</p>
                  <p className="text-[11.5px] text-[#5A6A8A]">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
              <p className="text-[14px] font-semibold text-[#0F1C3F] mb-4">Contact Information</p>
              <div className="space-y-3">
                {[
                  { icon: User,  label: "Primary Contact", value: "Dr. V. Ramesh, TPO"  },
                  { icon: Mail,  label: "Email",           value: "tpo@college.edu"       },
                  { icon: Phone, label: "Phone",           value: "+91 98765 43210"       },
                  { icon: Globe, label: "Website",         value: "www.college.edu"       },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3">
                    <r.icon size={13} className="text-[#5A6A8A] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#9AA5BE]">{r.label}</p>
                      <p className="text-[13px] font-medium text-[#0F1C3F]">{r.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
              <p className="text-[14px] font-semibold text-[#0F1C3F] mb-4">Subscription</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-xl">
                  <span className="text-[13px] text-[#5A6A8A]">Current Plan</span>
                  <PlanBadge plan={selected.plan} />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-xl">
                  <span className="text-[13px] text-[#5A6A8A]">Next Billing</span>
                  <span className="text-[13px] font-medium text-[#0F1C3F]">Aug 01, 2026</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-xl">
                  <span className="text-[13px] text-[#5A6A8A]">Student Limit</span>
                  <span className="text-[13px] font-medium text-[#0F1C3F]">{selected.plan === "Enterprise" ? "Unlimited" : selected.plan === "Growth" ? "1,000" : "200"}</span>
                </div>
                <button className="w-full py-2.5 text-[13px] font-semibold text-[#1B3A6B] bg-[#EBF1FA] rounded-xl hover:bg-[#dce6f5] transition-colors">
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="College Management" sub={`${COLLEGES.length} institutions registered`}
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-[13px] font-semibold rounded-xl hover:bg-[#152d54] transition-colors">
            <Plus size={14} />Add College
          </button>
        }
      />

      {/* filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search colleges…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-[rgba(27,58,107,0.15)] rounded-xl text-[13px] text-[#0F1C3F] placeholder:text-[#9AA5BE] outline-none focus:border-[#1B3A6B]" />
        </div>
        <div className="flex gap-1.5 p-1 bg-white border border-[rgba(27,58,107,0.1)] rounded-xl">
          {(["all", "active", "pending", "review", "suspended"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all
                ${filter === f ? "bg-[#1B3A6B] text-white" : "text-[#5A6A8A] hover:bg-[#F4F6FB]"}`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-[rgba(27,58,107,0.15)] rounded-xl text-[12.5px] text-[#5A6A8A] hover:bg-[#F4F6FB] transition-colors">
          <Download size={13} />Export
        </button>
      </div>

      {/* table */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(27,58,107,0.08)] bg-[#F8FAFB]">
              {["Institution", "Location", "Students", "Plan", "Status", "Revenue", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#9AA5BE] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} className={`border-b border-[rgba(27,58,107,0.05)] hover:bg-[#F8FAFB] transition-colors ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#EBF1FA] flex items-center justify-center shrink-0">
                      <Building2 size={13} className="text-[#1B3A6B]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0F1C3F]">{c.name}</p>
                      <p className="text-[11px] text-[#9AA5BE]">{c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#5A6A8A]">{c.city}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#0F1C3F]">{c.students.toLocaleString()}</td>
                <td className="px-4 py-3.5"><PlanBadge plan={c.plan} /></td>
                <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#0F1C3F]">
                  {c.revenue > 0 ? "₹" + (c.revenue / 1000).toFixed(0) + "k" : <span className="text-[#9AA5BE]">Free</span>}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSelected(c)}
                      className="p-1.5 hover:bg-[#EBF1FA] rounded-lg transition-colors text-[#5A6A8A] hover:text-[#1B3A6B]">
                      <Eye size={14} />
                    </button>
                    {c.status === "pending" || c.status === "review" ? (
                      <button className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors text-[#5A6A8A] hover:text-emerald-600">
                        <CheckCircle2 size={14} />
                      </button>
                    ) : c.status === "active" ? (
                      <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-[#5A6A8A] hover:text-red-500">
                        <Pause size={14} />
                      </button>
                    ) : (
                      <button className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors text-[#5A6A8A] hover:text-emerald-600">
                        <Check size={14} />
                      </button>
                    )}
                    <button className="p-1.5 hover:bg-[#F4F6FB] rounded-lg transition-colors text-[#9AA5BE]">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsSection() {
  const [search, setSearch] = useState("");
  const filtered = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.college.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader title="Student Management" sub={`${STUDENTS.length.toLocaleString()}+ students across all institutions`}
        action={
          <button className="flex items-center gap-1.5 px-4 py-2 border border-[rgba(27,58,107,0.15)] text-[13px] font-medium text-[#5A6A8A] rounded-xl hover:bg-[#F4F6FB] transition-colors">
            <Download size={13} />Export CSV
          </button>
        }
      />

      {/* search + filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-[rgba(27,58,107,0.15)] rounded-xl text-[13px] text-[#0F1C3F] placeholder:text-[#9AA5BE] outline-none focus:border-[#1B3A6B]" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[rgba(27,58,107,0.15)] rounded-xl text-[12.5px] text-[#5A6A8A] hover:bg-[#F4F6FB] transition-colors">
          <Filter size={13} />Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(27,58,107,0.08)] bg-[#F8FAFB]">
              {["Student", "College", "Department", "Year", "Score", "Status", "Placed"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#9AA5BE] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={`border-b border-[rgba(27,58,107,0.05)] hover:bg-[#F8FAFB] transition-colors ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0F1C3F]">{s.name}</p>
                      <p className="text-[11px] text-[#9AA5BE]">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#5A6A8A]">{s.college}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#5A6A8A]">{s.dept}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#5A6A8A]">{s.year}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 bg-[#F1F3F9] rounded-full overflow-hidden" style={{ width: 48 }}>
                      <div className="h-full rounded-full" style={{ width: s.score + "%", background: s.score >= 80 ? "#059669" : s.score >= 60 ? "#D97706" : "#EF4444" }} />
                    </div>
                    <span className="text-[12px] font-semibold text-[#0F1C3F]">{s.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3.5">
                  {s.placed
                    ? <span className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600"><CheckCircle2 size={13} />Placed</span>
                    : <span className="text-[12px] text-[#9AA5BE]">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-5">
      <SectionHeader title="Platform Analytics" sub="Aggregated performance across all institutions — 2026" />

      <div className="grid grid-cols-2 gap-5">
        {/* College growth */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <p className="text-[14px] font-semibold text-[#0F1C3F] mb-1">College Onboarding</p>
          <p className="text-[12px] text-[#5A6A8A] mb-4">Monthly new registrations</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={GROWTH_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F1F3F9" />
              <XAxis key="x" dataKey="month" tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <YAxis key="y" tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <Tooltip key="tip" contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8ECF5" }} />
              <Bar key="colleges" dataKey="colleges" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Placement rate */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <p className="text-[14px] font-semibold text-[#0F1C3F] mb-1">Placement Rate Trend</p>
          <p className="text-[12px] text-[#5A6A8A] mb-4">Platform-wide % over time</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={PLACEMENT_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F1F3F9" />
              <XAxis key="x" dataKey="month" tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <YAxis key="y" domain={[65, 100]} tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <Tooltip key="tip" contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8ECF5" }} formatter={v => v + "%"} />
              <Line key="rate" type="monotone" dataKey="rate" stroke="#D97706" strokeWidth={2.5} dot={{ r: 4, fill: "#D97706" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <p className="text-[14px] font-semibold text-[#0F1C3F] mb-1">Monthly Revenue (₹)</p>
          <p className="text-[12px] text-[#5A6A8A] mb-4">Cumulative MRR growth</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={GROWTH_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sa-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D97706" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F1F3F9" />
              <XAxis key="x" dataKey="month" tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <YAxis key="y" tick={{ fontSize: 11, fill: "#9AA5BE" }} tickFormatter={v => "₹" + (v / 1000).toFixed(0) + "k"} />
              <Tooltip key="tip" contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8ECF5" }} formatter={v => "₹" + v.toLocaleString()} />
              <Area key="revenue" type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2} fill="url(#sa-rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <p className="text-[14px] font-semibold text-[#0F1C3F] mb-4">Top Metrics — Jul 2026</p>
          <div className="space-y-3">
            {[
              { label: "Avg. Readiness Score",    value: "74.3", unit: "/ 100", color: "#1B3A6B" },
              { label: "AI Assessments Run",       value: "91,200", unit: "",  color: "#7C3AED" },
              { label: "CVs Generated",            value: "38,400", unit: "",  color: "#D97706" },
              { label: "Roadmaps Created",         value: "29,700", unit: "",  color: "#059669" },
              { label: "Avg. Time to Placement",   value: "42",     unit: " days", color: "#DC2626" },
              { label: "Returning Users (30d)",    value: "68%",    unit: "",  color: "#0891B2" },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between py-2.5 border-b border-[rgba(27,58,107,0.05)] last:border-0">
                <span className="text-[13px] text-[#5A6A8A]">{m.label}</span>
                <span className="text-[15px] font-bold" style={{ color: m.color, fontFamily: "var(--font-mono)" }}>
                  {m.value}<span className="text-[12px] font-normal text-[#9AA5BE]">{m.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionsSection() {
  return (
    <div className="space-y-5">
      <SectionHeader title="Subscriptions & Billing" sub="Revenue tracking and plan management" />

      {/* revenue KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard icon={CreditCard}  label="Monthly Revenue"  value="₹6.24L" change="+₹34k"  color="#1B3A6B" />
        <KPICard icon={TrendingUp}  label="Annual Run Rate"  value="₹74.9L" change="+18%"   color="#059669" />
        <KPICard icon={Users}       label="Paying Colleges"  value="892"    change="+31"    color="#D97706" />
      </div>

      {/* plan breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { plan: "Starter",    count: 308,  pct: 26, revenue: 0,        color: "#9AA5BE" },
          { plan: "Growth",     count: 528,  pct: 44, revenue: 1876224,  color: "#D97706" },
          { plan: "Enterprise", count: 364,  pct: 30, revenue: 5225000,  color: "#1B3A6B" },
        ].map(p => (
          <div key={p.plan} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <PlanBadge plan={p.plan as PlanTier} />
              <span className="text-[11px] text-[#9AA5BE]">{p.pct}% of colleges</span>
            </div>
            <p className="text-[24px] font-bold text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>{p.count}</p>
            <p className="text-[12px] text-[#5A6A8A]">colleges</p>
            <div className="mt-3 pt-3 border-t border-[rgba(27,58,107,0.06)]">
              <p className="text-[13px] font-semibold text-[#0F1C3F]">
                {p.revenue > 0 ? "₹" + (p.revenue / 100000).toFixed(2) + "L" : "Free tier"}
              </p>
              <p className="text-[11.5px] text-[#9AA5BE]">monthly contribution</p>
            </div>
          </div>
        ))}
      </div>

      {/* recent transactions */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[rgba(27,58,107,0.08)] flex items-center justify-between">
          <p className="text-[14px] font-semibold text-[#0F1C3F]">Recent Transactions</p>
          <button className="flex items-center gap-1.5 text-[12.5px] text-[#1B3A6B] font-medium hover:underline">
            View All <ArrowRight size={12} />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(27,58,107,0.06)] bg-[#F8FAFB]">
              {["Transaction ID", "Institution", "Plan", "Amount", "Date", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#9AA5BE] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((t, i) => (
              <tr key={t.id} className={`border-b border-[rgba(27,58,107,0.05)] hover:bg-[#F8FAFB] transition-colors ${i === TRANSACTIONS.length - 1 ? "border-b-0" : ""}`}>
                <td className="px-4 py-3.5 text-[12.5px] font-mono text-[#5A6A8A]">{t.id}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#0F1C3F]">{t.college}</td>
                <td className="px-4 py-3.5"><PlanBadge plan={t.plan as PlanTier} /></td>
                <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0F1C3F]">
                  {t.amount > 0 ? "₹" + t.amount.toLocaleString() : <span className="text-[#9AA5BE]">Free</span>}
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#5A6A8A]">{t.date}</td>
                <td className="px-4 py-3.5"><StatusBadge status={t.status === "pending" ? "pending" : t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditSection() {
  const [typeFilter, setTypeFilter] = useState("all");
  const types = ["all", "college", "billing", "security", "system", "data"];
  const filtered = typeFilter === "all" ? AUDIT_LOGS : AUDIT_LOGS.filter(l => l.type === typeFilter);

  const typeIcon: Record<string, React.ElementType> = {
    college: Building2, billing: CreditCard, security: Shield,
    system: Settings, data: Download,
  };
  const typeColor: Record<string, string> = {
    college: "bg-blue-50 text-[#1B3A6B]", billing: "bg-amber-50 text-amber-600",
    security: "bg-red-50 text-red-500",   system: "bg-slate-100 text-[#5A6A8A]",
    data: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div>
      <SectionHeader title="Audit Logs" sub="Complete activity trail for compliance and security"
        action={
          <button className="flex items-center gap-1.5 px-4 py-2 border border-[rgba(27,58,107,0.15)] text-[13px] font-medium text-[#5A6A8A] rounded-xl hover:bg-[#F4F6FB] transition-colors">
            <Download size={13} />Export Logs
          </button>
        }
      />

      <div className="flex gap-1.5 p-1 bg-white border border-[rgba(27,58,107,0.1)] rounded-xl mb-4 w-fit">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all
              ${typeFilter === t ? "bg-[#1B3A6B] text-white" : "text-[#5A6A8A] hover:bg-[#F4F6FB]"}`}>
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] overflow-hidden shadow-sm">
        {filtered.map((log, i) => {
          const Icon = typeIcon[log.type] ?? Activity;
          const colorCls = typeColor[log.type] ?? "bg-slate-100 text-[#5A6A8A]";
          return (
            <div key={log.id} className={`flex items-center gap-4 px-5 py-4 ${i < filtered.length - 1 ? "border-b border-[rgba(27,58,107,0.06)]" : ""} hover:bg-[#F8FAFB] transition-colors`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#0F1C3F]">{log.action}</p>
                <p className="text-[12px] text-[#5A6A8A]">
                  <span className="font-medium text-[#0F1C3F]">{log.actor}</span> → {log.target}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] font-medium text-[#5A6A8A]" style={{ fontFamily: "var(--font-mono)" }}>{log.ts.split(" ")[1]}</p>
                <p className="text-[11px] text-[#9AA5BE]">{log.ts.split(" ")[0]}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold capitalize border shrink-0 ${colorCls} border-current border-opacity-20`}>
                {log.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsSection() {
  const [flags, setFlags] = useState<Record<string, boolean>>({
    ai_career_assessment:  true,
    ai_roadmap_v2:         true,
    cv_public_link:        true,
    bulk_student_upload:   true,
    skill_verification:    true,
    placement_matching:    false,
    sms_notifications:     true,
    email_digest:          true,
    maintenance_mode:      false,
    beta_features:         false,
  });

  const toggle = (key: string) => setFlags(f => ({ ...f, [key]: !f[key] }));

  const featureGroups = [
    {
      label: "AI Features",
      items: [
        { key: "ai_career_assessment", label: "AI Career Assessment",  desc: "Personalised career-fit scoring engine" },
        { key: "ai_roadmap_v2",        label: "AI Roadmap v2",          desc: "4-phase learning path generator" },
        { key: "placement_matching",   label: "Placement Matching",     desc: "Auto-match students with job listings" },
      ],
    },
    {
      label: "Platform Features",
      items: [
        { key: "cv_public_link",       label: "CV Public Link",         desc: "Allow students to share CV via URL" },
        { key: "bulk_student_upload",  label: "Bulk CSV Upload",        desc: "Colleges can bulk-import students" },
        { key: "skill_verification",   label: "Skill Verification",     desc: "Proctored skill test module" },
      ],
    },
    {
      label: "Notifications",
      items: [
        { key: "sms_notifications",    label: "SMS Alerts",             desc: "OTP and placement alerts via SMS" },
        { key: "email_digest",         label: "Weekly Email Digest",    desc: "Activity summary to TPOs every Monday" },
      ],
    },
    {
      label: "System",
      items: [
        { key: "maintenance_mode",     label: "Maintenance Mode",       desc: "Show maintenance banner platform-wide" },
        { key: "beta_features",        label: "Beta Features",          desc: "Expose unreleased features to testers" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Platform Settings" sub="Feature flags, notifications, and global configuration" />

      {/* General config */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
        <p className="text-[14px] font-semibold text-[#0F1C3F] mb-4">General Configuration</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Platform Name",     value: "EduConnect" },
            { label: "Support Email",     value: "support@educonnect.in" },
            { label: "Default Timezone",  value: "Asia/Kolkata (IST)" },
            { label: "Platform Version",  value: "v4.2.1" },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-[11.5px] font-medium text-[#5A6A8A]">{f.label}</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F8FAFB] border border-[rgba(27,58,107,0.1)] rounded-xl">
                <span className="text-[13px] text-[#0F1C3F] flex-1">{f.value}</span>
                <Edit3 size={12} className="text-[#9AA5BE] hover:text-[#5A6A8A] cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature flags */}
      {featureGroups.map(group => (
        <div key={group.label} className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-5 shadow-sm">
          <p className="text-[14px] font-semibold text-[#0F1C3F] mb-4">{group.label}</p>
          <div className="space-y-0">
            {group.items.map((item, i) => {
              const on = flags[item.key];
              return (
                <div key={item.key}
                  className={`flex items-center justify-between py-3.5 ${i < group.items.length - 1 ? "border-b border-[rgba(27,58,107,0.06)]" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${on ? "bg-emerald-500" : "bg-[#CBD5E1]"}`} />
                    <div>
                      <p className="text-[13px] font-semibold text-[#0F1C3F]">{item.label}</p>
                      <p className="text-[12px] text-[#5A6A8A]">{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => toggle(item.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 flex items-center px-0.5
                      ${on ? "bg-[#1B3A6B]" : "bg-slate-200"}`}>
                    <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[20px]" : "translate-x-0"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <p className="text-[14px] font-semibold text-red-800 mb-3 flex items-center gap-2"><AlertCircle size={15} />Danger Zone</p>
        <div className="space-y-2">
          {[
            { label: "Clear All Cache",          desc: "Purge CDN and in-memory caches. Takes ~30s to repopulate." },
            { label: "Reset Demo Data",           desc: "Wipe demo institutions and students. Irreversible." },
            { label: "Force Password Reset (All)",desc: "Require all admin users to reset passwords on next login." },
          ].map(a => (
            <div key={a.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100">
              <div>
                <p className="text-[13px] font-semibold text-[#0F1C3F]">{a.label}</p>
                <p className="text-[12px] text-[#5A6A8A]">{a.desc}</p>
              </div>
              <button className="px-3 py-1.5 bg-red-500 text-white text-[12px] font-semibold rounded-lg hover:bg-red-600 transition-colors">
                Execute
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── main layout ──────────────────────────────────────────────────────────────
export function SuperAdminPanel({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);

  const NOTIFICATIONS = [
    { icon: Building2, msg: "BITS Pilani is awaiting approval",       time: "10m ago", dot: true  },
    { icon: AlertCircle, msg: "Nirma Univ. subscription overdue",     time: "2h ago",  dot: true  },
    { icon: Shield,    msg: "Failed login attempt from 203.x.x.x",   time: "5h ago",  dot: false },
    { icon: Check,     msg: "Anna Univ. payment confirmed ₹12,000",   time: "1d ago",  dot: false },
  ];

  const screenMap: Record<AdminSection, React.ReactNode> = {
    dashboard:     <Dashboard />,
    colleges:      <CollegesSection />,
    students:      <StudentsSection />,
    "lms-admin":   <LMSAdminSection />,
    analytics:     <AnalyticsSection />,
    subscriptions: <SubscriptionsSection />,
    audit:         <AuditSection />,
    settings:      <SettingsSection />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F5FC]" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── top bar ── */}
      <header className="bg-[#0A1629] border-b border-white/10 sticky top-0 z-50">
        <div className="px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[9px] bg-white/10 flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-[14px] leading-none">EduConnect</p>
                <p className="text-white/40 text-[10px] mt-0.5 font-medium tracking-wider uppercase">Super Admin</p>
              </div>
            </div>
            <div className="h-5 w-px bg-white/15" />
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-amber-300">Platform Admin Access</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[rgba(27,58,107,0.12)] shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[rgba(27,58,107,0.08)] flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#0F1C3F]">Notifications</p>
                    <button onClick={() => setNotifOpen(false)} className="text-[#9AA5BE] hover:text-[#5A6A8A]"><X size={14} /></button>
                  </div>
                  {NOTIFICATIONS.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFB] transition-colors border-b border-[rgba(27,58,107,0.05)] last:border-0">
                      <n.icon size={14} className={`mt-0.5 shrink-0 ${n.dot ? "text-[#1B3A6B]" : "text-[#9AA5BE]"}`} />
                      <div className="flex-1">
                        <p className={`text-[12.5px] ${n.dot ? "font-semibold text-[#0F1C3F]" : "text-[#5A6A8A]"}`}>{n.msg}</p>
                        <p className="text-[11px] text-[#9AA5BE]">{n.time}</p>
                      </div>
                      {n.dot && <div className="w-2 h-2 rounded-full bg-[#1B3A6B] shrink-0 mt-1" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/15">
              <div className="w-8 h-8 rounded-full bg-[#1B3A6B] border-2 border-amber-400 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">SA</span>
              </div>
              <div className="hidden lg:block">
                <p className="text-[12.5px] font-semibold text-white leading-none">Super Admin</p>
                <p className="text-[10.5px] text-white/40 mt-0.5">super@educonnect.in</p>
              </div>
            </div>

            <button onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-xl transition-all">
              <ArrowLeft size={13} />Exit
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── sidebar ── */}
        <aside className="w-[220px] bg-[#0F1F3B] border-r border-white/5 flex-shrink-0 flex flex-col sticky top-[57px] h-[calc(100vh-57px)]">
          <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
            {NAV_ITEMS.map(item => {
              const active = item.key === section;
              return (
                <button key={item.key} onClick={() => setSection(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                    ${active ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}>
                  <item.icon size={16} className={active ? "text-white" : ""} />
                  <span className="text-[13px] font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {active && <div className="w-1 h-4 rounded-full bg-white/60" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/5">
            <button onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">
              <LogOut size={15} />
              <span className="text-[13px] font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── content ── */}
        <main className="flex-1 overflow-y-auto">
          {/* breadcrumb bar */}
          <div className="sticky top-0 z-10 bg-[#F2F5FC]/90 backdrop-blur-sm border-b border-[rgba(27,58,107,0.08)] px-8 py-3 flex items-center gap-2">
            <span className="text-[12px] text-[#9AA5BE]">Admin</span>
            <ChevronRight size={12} className="text-[#CBD5E1]" />
            <span className="text-[12px] font-semibold text-[#1B3A6B] capitalize">
              {section === "lms-admin" ? "LMS Courses" : section}
            </span>
          </div>

          <div className="px-8 py-7">
            {screenMap[section]}
          </div>
        </main>
      </div>
    </div>
  );
}
