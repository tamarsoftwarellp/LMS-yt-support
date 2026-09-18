import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlignLeft,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Code2,
  Download,
  GraduationCap,
  HelpCircle,
  Layers,
  LogOut,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { adminDownload } from "../api/admin-lms";
import * as api from "../api/college-portal";

const field =
  "w-full px-3 py-2.5 bg-[#F8FAFD] border border-[#E3E8F2] rounded-xl text-[12px] outline-none focus:border-[#1B3A6B]";
type Tab =
  | "dashboard"
  | "profile"
  | "programs"
  | "students"
  | "batches"
  | "faculty"
  | "courses"
  | "progress"
  | "certificates"
  | "reports";
const NAV = [
  ["dashboard", "Dashboard", BarChart3],
  ["profile", "College Profile", Building2],
  ["programs", "Programs", GraduationCap],
  ["students", "Students", Users],
  ["batches", "Batches & Sections", Layers],
  ["faculty", "Faculty", Users],
  ["courses", "Course Allocation", BookOpen],
  ["progress", "Student Progress", Activity],
  ["certificates", "Certificates", Award],
  ["reports", "Reports", Download],
] as const;
const TAB_PATH: Record<Tab, string> = {
  dashboard: "/college-admin/dashboard",
  profile: "/college-admin/profile",
  programs: "/college-admin/programs",
  students: "/college-admin/students",
  batches: "/college-admin/batches",
  faculty: "/college-admin/faculty",
  courses: "/college-admin/courses",
  progress: "/college-admin/progress",
  certificates: "/college-admin/certificates",
  reports: "/college-admin/reports",
};
function tabFromPath(pathname: string): Tab {
  const match = (Object.entries(TAB_PATH) as [Tab, string][]).find(
    ([, path]) => pathname === path,
  );
  return match?.[0] || "dashboard";
}
function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-[12px] text-[#9AA5BE]">{text}</p>;
}
function Loading() {
  return (
    <div className="py-12 flex justify-center">
      <RefreshCw size={18} className="animate-spin text-[#1B3A6B]" />
    </div>
  );
}
function LoadFailure({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="p-5 border border-red-200 bg-red-50 rounded-xl text-[12px] text-red-700">
      {message}
      <button onClick={retry} className="ml-3 font-semibold underline">Try again</button>
    </div>
  );
}
function Title({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-[21px] font-semibold text-[#0F1C3F]">{title}</h2>
      <p className="text-[12px] text-[#5A6A8A] mt-1">{sub}</p>
    </div>
  );
}

function Dashboard() {
  const [x, setX] = useState<api.CollegeDashboard | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setError("");
    api.getCollegeDashboard().then(setX).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  if (error && !x) return <LoadFailure message={error} retry={load} />;
  if (!x) return <Loading />;
  const cards: [[string, string | number], ...[string, string | number][]] = [
    ["Students", x.student_count],
    ["Active Students", x.active_students],
    ["Programs", x.program_count],
    ["Faculty", x.faculty_count],
    ["Batches", x.batch_count],
    ["Course Allocations", x.course_allocations],
    ["Average Progress", `${x.average_progress}%`],
    ["Pending Evaluations", x.pending_evaluations],
    ["Certificates", x.certificates_issued],
  ];
  return (
    <div className="space-y-6">
      <Title
        title="College Dashboard"
        sub="Your institution's academic and learning overview."
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(([k, v]) => (
          <div
            key={k}
            className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#E3E8F2]"
          >
            <p className="text-[11px] text-[#5A6A8A]">{k}</p>
            <p className="text-[25px] font-bold mt-2 text-[#1B3A6B]">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
function Profile() {
  const [p, setP] = useState<api.InstitutionProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sensitive, setSensitive] = useState({
    college_name: "",
    contact_email: "",
    website_url: "",
  });
  const load = useCallback(() => {
    setLoadError("");
    api.getInstitutionProfile().then(setP).catch((e) => setLoadError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);
  if (loadError && !p) return <LoadFailure message={loadError} retry={load} />;
  if (!p) return <Loading />;
  const set = (k: keyof api.InstitutionProfile, v: string) =>
    setP({ ...p, [k]: v });
  const save = async () => {
    setBusy(true);
    try {
      setP(
        await api.updateInstitutionProfile({
          contact_name: p.contact_name || "",
          contact_phone: p.contact_phone || "",
          address: p.address,
        }),
      );
      toast.success("College profile updated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-5">
      <Title
        title="College Profile"
        sub="Official identity changes go to LMS Admin for approval."
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="p-3 bg-blue-50 rounded-xl">
          <small>College name</small>
          <b className="block">{p.name}</b>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl">
          <small>Status</small>
          <b className="block capitalize">{p.status}</b>
        </div>
        {[
          ["contact_name", "Contact person"],
          ["contact_phone", "Phone"],
          ["address", "Address"],
        ].map(([k, l]) => (
          <label key={k} className="text-[11px] font-semibold text-[#5A6A8A]">
            {l}
            <input
              className={`${field} mt-1`}
              value={String(p[k as keyof api.InstitutionProfile] || "")}
              onChange={(e) =>
                set(k as keyof api.InstitutionProfile, e.target.value)
              }
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={save}
          className="px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[12px] flex gap-2"
        >
          <Save size={14} />
          Save Basic Details
        </button>
        <label className="px-5 py-2.5 border rounded-xl text-[12px] cursor-pointer">
          Upload Logo
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  await api.uploadCollegeLogo(file);
                  await load();
                  toast.success("Logo uploaded");
                } catch (error) {
                  toast.error((error as Error).message);
                }
              }
            }}
          />
        </label>
      </div>
      <div className="p-4 bg-amber-50 rounded-xl space-y-3">
        <b className="text-[12px]">Request sensitive profile change</b>
        <div className="grid sm:grid-cols-3 gap-2">
          <input
            className={field}
            placeholder="New official name"
            value={sensitive.college_name}
            onChange={(e) =>
              setSensitive({ ...sensitive, college_name: e.target.value })
            }
          />
          <input
            className={field}
            placeholder="New contact email"
            value={sensitive.contact_email}
            onChange={(e) =>
              setSensitive({ ...sensitive, contact_email: e.target.value })
            }
          />
          <input
            className={field}
            placeholder="New website"
            value={sensitive.website_url}
            onChange={(e) =>
              setSensitive({ ...sensitive, website_url: e.target.value })
            }
          />
        </div>
        <button
          onClick={async () => {
            try {
              await api.requestCollegeProfileChange(sensitive);
              setSensitive({ college_name: "", contact_email: "", website_url: "" });
              toast.success("Approval request submitted");
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}
          className="text-[11px] text-amber-800 font-semibold"
        >
          Submit to LMS Admin
        </button>
      </div>
    </div>
  );
}
function Programs() {
  const [items, setItems] = useState<api.InstitutionProgram[]>([]);
  const load = () =>
    api
      .listInstitutionPrograms()
      .then(setItems)
      .catch((e) => toast.error(e.message));
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="space-y-5">
      <Title
        title="Programs"
        sub="Choose from LMS Admin's approved Program Master."
      />
      <div className="space-y-2">
        {items.map((x) => (
          <div
            className="p-4 border rounded-xl flex justify-between"
            key={x.id}
          >
            <div>
              <b>{x.name}</b>
              <p className="text-[11px] text-[#5A6A8A]">
                {x.student_count} students
              </p>
            </div>
            <button
              disabled={x.offered && x.student_count > 0}
              onClick={async () => {
                try {
                  if (x.offered) await api.removeInstitutionProgram(x.id);
                  else await api.addInstitutionProgram(x.id);
                  await load();
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
              className={`px-3 rounded-lg text-[11px] ${x.offered ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}
            >
              {x.offered ? "Offered" : "Add"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function Students() {
  const [items, setItems] = useState<api.InstitutionStudent[]>([]);
  const [q, setQ] = useState("");
  const [managed, setManaged] = useState<api.InstitutionStudent | null>(null);
  const [enrollments, setEnrollments] = useState<api.ManagedEnrollment[]>([]);
  const [batches, setBatches] = useState<api.CollegeBatch[]>([]);
  const load = useCallback(() =>
    api
      .listInstitutionStudents(q)
      .then(setItems)
      .catch((e) => toast.error(e.message)), [q]);
  useEffect(() => {
    api
      .listCollegeBatches()
      .then(setBatches)
      .catch(() => undefined);
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);
  return (
    <div className="space-y-5">
      <Title
        title="Students"
        sub="Search, bulk import, assign and manage your college's students."
      />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-gray-400" />
          <input
            className={`${field} pl-9`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or roll number"
          />
        </div>
        <label className="px-4 py-2.5 border rounded-xl text-[11px] cursor-pointer">
          Import CSV
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  const r = await api.importCollegeStudents(file);
                  toast.success(`${r.created} students imported`);
                  if (r.failed) toast.warning(`${r.failed} rows failed`);
                  await load();
                } catch (error) {
                  toast.error((error as Error).message);
                } finally {
                  e.target.value = "";
                }
              }
            }}
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-left text-[#5A6A8A]">
              {[
                "Student",
                "Program",
                "Batch / Section",
                "Enrollments",
                "Progress",
                "Actions",
              ].map((x) => (
                <th className="p-3" key={x}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="p-3">
                  <b>{x.full_name}</b>
                  <p>{x.email}</p>
                </td>
                <td>
                  {x.program_name}
                  <p>{x.current_year}</p>
                </td>
                <td>
                  <select
                    aria-label="Assign batch"
                    className="text-[10.5px] border rounded p-1 max-w-28"
                    value={x.batch_id || ""}
                    onChange={async (e) => {
                      try {
                        await api.updateCollegeStudent(x.id, {
                          college_batch_id: e.target.value || null,
                        });
                        await load();
                      } catch (error) {
                        toast.error((error as Error).message);
                      }
                    }}
                  >
                    <option value="">No batch</option>
                    {batches.filter((batch) => batch.program_id === x.program_id).map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Assign section"
                    className="text-[10.5px] border rounded p-1 ml-1 max-w-24"
                    value={x.section_id || ""}
                    onChange={async (e) => {
                      try {
                        await api.updateCollegeStudent(x.id, {
                          college_section_id: e.target.value || null,
                        });
                        await load();
                      } catch (error) {
                        toast.error((error as Error).message);
                      }
                    }}
                  >
                    <option value="">No section</option>
                    {batches
                      .filter((batch) => !x.batch_id || batch.id === x.batch_id)
                      .flatMap((batch) => batch.sections)
                      .map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                  </select>
                </td>
                <td>{x.enrollment_count}</td>
                <td>{x.progress_percentage}%</td>
                <td className="space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        await api.updateCollegeStudent(x.id, {
                          is_active: !x.is_active,
                        });
                        await load();
                      } catch (error) {
                        toast.error((error as Error).message);
                      }
                    }}
                    className={`px-2 py-1 rounded ${x.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                  >
                    {x.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const r = await api.initiateStudentPasswordReset(x.id);
                        await navigator.clipboard?.writeText(r.reset_token);
                        toast.success("One-time reset token copied");
                      } catch (error) {
                        toast.error((error as Error).message);
                      }
                    }}
                    className="text-blue-700"
                  >
                    Reset password
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setEnrollments(await api.listManagedStudentEnrollments(x.id));
                        setManaged(x);
                      } catch (error) {
                        toast.error((error as Error).message);
                      }
                    }}
                    className="text-emerald-700"
                  >
                    Manage courses
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!items.length && <Empty text="No students found" />}
      {managed && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg space-y-4">
            <div className="flex justify-between">
              <div>
                <b>{managed.full_name}</b>
                <p className="text-[11px] text-[#5A6A8A]">
                  Course enrollment control
                </p>
              </div>
              <button onClick={() => setManaged(null)}>✕</button>
            </div>
            {enrollments.map((row) => (
              <div
                key={row.course_id}
                className="p-3 border rounded-xl flex justify-between items-center"
              >
                <div>
                  <b className="text-[12px]">{row.course_title}</b>
                  <p className="text-[10.5px] capitalize">
                    {row.status} · {row.progress_percentage}%
                  </p>
                </div>
                <button
                  className="text-[11px] text-blue-700"
                  onClick={async () => {
                    try {
                      if (!row.enrollment_id) {
                        await api.enrollManagedStudent(managed.id, row.course_id);
                      } else {
                        await api.setManagedEnrollmentStatus(
                          managed.id,
                          row.enrollment_id,
                          row.status === "revoked",
                        );
                      }
                      setEnrollments(await api.listManagedStudentEnrollments(managed.id));
                    } catch (error) {
                      toast.error((error as Error).message);
                    }
                  }}
                >
                  {!row.enrollment_id
                    ? "Enroll"
                    : row.status === "revoked"
                      ? "Restore"
                      : "Revoke"}
                </button>
              </div>
            ))}
            {!enrollments.length && (
              <Empty text="No courses allocated to this program" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function Faculty() {
  const [items, setItems] = useState<api.CollegeFaculty[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    designation: "",
    department: "",
  });
  const [loadError, setLoadError] = useState("");
  const load = () => api.listCollegeFaculty().then(setItems).catch((error) => {
    setLoadError(error.message);
    throw error;
  });
  useEffect(() => {
    load().catch(() => undefined);
  }, []);
  if (loadError && !items.length)
    return <LoadFailure message={loadError} retry={() => { setLoadError(""); load().catch(() => undefined); }} />;
  const add = async () => {
    try {
      await api.addCollegeFaculty(form);
      setForm({
        full_name: "",
        email: "",
        mobile: "",
        designation: "",
        department: "",
      });
      await load();
      toast.success("Faculty invitation created");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="space-y-5">
      <Title
        title="Faculty"
        sub="Invite faculty and monitor section, course and evaluation workload."
      />
      <div className="grid sm:grid-cols-5 gap-2">
        {Object.keys(form).map((k) => (
          <input
            key={k}
            className={field}
            placeholder={k.replace("_", " ")}
            value={form[k as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
        ))}
      </div>
      <button
        onClick={add}
        disabled={!form.full_name || !form.email}
        className="px-4 py-2 bg-[#1B3A6B] text-white rounded-xl text-[12px]"
      >
        <Plus size={13} className="inline mr-1" />
        Invite Faculty
      </button>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((x) => (
          <div
            key={x.id}
            className="p-4 border rounded-xl flex justify-between"
          >
            <div>
              <b>{x.full_name}</b>
              <p className="text-[11px] text-[#5A6A8A]">
                {x.email} · {x.designation || "Faculty"}
              </p>
              <p className="text-[10.5px] mt-2">
                {x.section_count} sections · {x.course_count} courses ·{" "}
                {x.evaluations_completed} evaluations
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await api.setCollegeFacultyStatus(x.id, !x.is_active);
                  await load();
                } catch (error) {
                  toast.error((error as Error).message);
                }
              }}
              className="text-[11px]"
            >
              {x.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function Batches() {
  const [items, setItems] = useState<api.CollegeBatch[]>([]);
  const [programs, setPrograms] = useState<api.InstitutionProgram[]>([]);
  const [form, setForm] = useState({
    program_id: "",
    name: "",
    academic_year: "",
    capacity: 60,
  });
  const [loadError, setLoadError] = useState("");
  const load = () =>
    Promise.all([api.listCollegeBatches(), api.listInstitutionPrograms()]).then(
      ([a, b]) => {
        setItems(a);
        setPrograms(b.filter((x) => x.offered));
        setLoadError("");
      },
    ).catch((error) => { setLoadError(error.message); throw error; });
  useEffect(() => {
    load().catch(() => undefined);
  }, []);
  if (loadError && !items.length)
    return <LoadFailure message={loadError} retry={() => load().catch(() => undefined)} />;
  const add = async () => {
    try {
      await api.addCollegeBatch(form);
      setForm({ ...form, name: "" });
      await load();
      toast.success("Batch created");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="space-y-5">
      <Title
        title="Batches & Sections"
        sub="Organize students by academic year, batch and section."
      />
      <div className="grid sm:grid-cols-4 gap-2">
        <select
          className={field}
          value={form.program_id}
          onChange={(e) => setForm({ ...form, program_id: e.target.value })}
        >
          <option value="">Program</option>
          {programs.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <input
          className={field}
          placeholder="Batch name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className={field}
          placeholder="2026-27"
          value={form.academic_year}
          onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
        />
        <button
          onClick={add}
          className="bg-[#1B3A6B] text-white rounded-xl text-[12px]"
        >
          Create Batch
        </button>
      </div>
      {items.map((b) => (
        <div key={b.id} className="p-4 border rounded-xl">
          <div className="flex justify-between">
            <b>
              {b.name} · {b.program_name}
            </b>
            <span className="text-[11px]">
              {b.student_count}/{b.capacity} students
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {b.sections.map((s) => (
              <span
                className="px-3 py-1.5 bg-blue-50 rounded-lg text-[11px]"
                key={s.id}
              >
                {s.name} ({s.capacity})
              </span>
            ))}
            <button
              onClick={async () => {
                const name = prompt("Section name");
                if (name) {
                  try {
                    await api.addCollegeSection(b.id, { name, capacity: 30 });
                    await load();
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }
              }}
              className="px-3 py-1.5 border rounded-lg text-[11px]"
            >
              <Plus size={11} className="inline" /> Section
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
function Courses() {
  const [d, setD] = useState<api.CourseAllocationData | null>(null);
  const [programs, setPrograms] = useState<api.InstitutionProgram[]>([]);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ course_id: "", program_id: "" });
  const load = () =>
    Promise.all([
      api.loadCourseAllocations(),
      api.listInstitutionPrograms(),
    ]).then(([a, b]) => {
      setD(a);
      setPrograms(b.filter((x) => x.offered));
      setLoadError("");
    }).catch((error) => { setLoadError(error.message); throw error; });
  useEffect(() => {
    load().catch(() => undefined);
  }, []);
  if (loadError && !d)
    return <LoadFailure message={loadError} retry={() => load().catch(() => undefined)} />;
  if (!d) return <Loading />;
  return (
    <div className="space-y-5">
      <Title
        title="Course Allocation"
        sub="Allocate, deactivate and restore published LMS courses."
      />
      <div className="grid sm:grid-cols-3 gap-2">
        <select
          className={field}
          value={form.course_id}
          onChange={(e) => setForm({ ...form, course_id: e.target.value })}
        >
          <option value="">Published course</option>
          {d.catalog.map((x) => (
            <option key={x.id} value={x.id}>
              {x.title}
            </option>
          ))}
        </select>
        <select
          className={field}
          value={form.program_id}
          onChange={(e) => setForm({ ...form, program_id: e.target.value })}
        >
          <option value="">Program</option>
          {programs.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <button
          onClick={async () => {
            try {
              await api.addCourseAllocation(form);
              await load();
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
          className="bg-[#1B3A6B] text-white rounded-xl"
        >
          Allocate
        </button>
      </div>
      {d.allocations.map((x) => (
        <div
          className={`p-4 border rounded-xl flex justify-between ${x.is_active ? "" : "opacity-60"}`}
          key={x.id}
        >
          <div>
            <b>{x.course_title}</b>
            <p className="text-[11px]">
              {x.program_name} {x.batch_name ? `· ${x.batch_name}` : ""} ·{" "}
              {x.is_active ? "Active" : "Inactive"}
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                if (x.is_active) await api.removeCourseAllocation(x.id);
                else await api.restoreCourseAllocation(x.id);
                await load();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          >
            {x.is_active ? (
              <Trash2 size={14} className="text-red-500" />
            ) : (
              <span className="text-[11px] text-blue-700">Restore</span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
function Progress() {
  const [data, setData] = useState<api.CollegeProgressData | null>(null);
  const [openStudentId, setOpenStudentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [programId, setProgramId] = useState("all");
  const [batchId, setBatchId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api.loadCollegeProgress());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load progress");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const programs = useMemo(
    () =>
      Array.from(
        new Map(
          (data?.students || []).map((x) => [
            x.program_id,
            { id: x.program_id, name: x.program_name },
          ]),
        ).values(),
      ),
    [data],
  );
  const batches = useMemo(
    () =>
      Array.from(
        new Map(
          (data?.students || [])
            .filter((x) => x.batch_id && (programId === "all" || x.program_id === programId))
            .map((x) => [x.batch_id!, { id: x.batch_id!, name: x.batch_name! }]),
        ).values(),
      ),
    [data, programId],
  );
  const filteredStudents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data?.students || [])
      .filter((x) => {
        const matchesSearch =
          !term ||
          [x.student_name, x.student_email, x.roll_number, x.program_name]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term));
        const matchesProgram = programId === "all" || x.program_id === programId;
        const matchesBatch = batchId === "all" || x.batch_id === batchId;
        const complete = x.enrollments > 0 && x.completed === x.enrollments;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "at-risk" && x.at_risk) ||
          (statusFilter === "on-track" && x.enrollments > 0 && !x.at_risk && !complete) ||
          (statusFilter === "completed" && complete) ||
          (statusFilter === "not-started" && x.enrollments === 0);
        return matchesSearch && matchesProgram && matchesBatch && matchesStatus;
      })
      .sort((a, b) => Number(b.at_risk) - Number(a.at_risk) || a.student_name.localeCompare(b.student_name));
  }, [batchId, data, programId, query, statusFilter]);
  if (loading && !data) return <Loading />;
  if (!data)
    return (
      <div className="space-y-4">
        <Title title="Student Progress" sub="Track student learning and assessment performance." />
        <div className="p-5 border border-red-200 bg-red-50 rounded-xl text-[12px] text-red-700">
          {error || "Unable to load progress."}
          <button onClick={load} className="ml-3 font-semibold underline">Try again</button>
        </div>
      </div>
    );
  const summary = data.summary || {
    total_students: data.students.length,
    students_with_enrollments: data.students.filter((x) => x.enrollments).length,
    completed_students: data.students.filter((x) => x.enrollments && x.completed === x.enrollments).length,
    average_progress: data.students.length
      ? Math.round(data.students.reduce((sum, x) => sum + x.average_progress, 0) / data.students.length)
      : 0,
    at_risk_count: data.at_risk_count,
  };
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <Title title="Student Progress" sub="Monitor participation, course completion and students who need attention." />
        <button onClick={load} disabled={loading} className="p-2.5 border border-[#E3E8F2] rounded-xl text-[#5A6A8A] hover:text-[#1B3A6B] disabled:opacity-50" title="Refresh progress">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {error && <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[12px]">Showing the last loaded data. Refresh failed: {error}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Total students", summary.total_students, `${summary.students_with_enrollments} enrolled`],
          ["Average progress", `${summary.average_progress}%`, "Across enrolled students"],
          ["Need attention", summary.at_risk_count, "Below 40% progress"],
          ["Fully completed", summary.completed_students, "All enrolled courses"],
        ].map(([label, value, hint]) => (
          <div key={label} className="p-4 border border-[#E3E8F2] rounded-2xl bg-white">
            <p className="text-[11px] text-[#5A6A8A]">{label}</p>
            <p className="text-[23px] font-bold text-[#0F1C3F] mt-1">{value}</p>
            <p className="text-[10px] text-[#9AA5BE] mt-1">{hint}</p>
          </div>
        ))}
      </div>
      <div className="p-3 border border-[#E3E8F2] rounded-2xl bg-white grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <Search size={14} className="absolute left-3 top-3 text-[#9AA5BE]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email or roll no." className={`${field} pl-9`} />
        </label>
        <select value={programId} onChange={(e) => { setProgramId(e.target.value); setBatchId("all"); }} className={field}>
          <option value="all">All programs</option>
          {programs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className={field}>
          <option value="all">All batches</option>
          {batches.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={field}>
          <option value="all">All progress states</option>
          <option value="at-risk">Needs attention</option>
          <option value="on-track">In progress</option>
          <option value="completed">Fully completed</option>
          <option value="not-started">Not enrolled</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#0F1C3F]">{filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"}</p>
        {(query || programId !== "all" || batchId !== "all" || statusFilter !== "all") && (
          <button onClick={() => { setQuery(""); setProgramId("all"); setBatchId("all"); setStatusFilter("all"); }} className="text-[11px] text-[#1B3A6B] font-semibold">Clear filters</button>
        )}
      </div>
      {filteredStudents.map((x) => (
        <button
          key={x.student_id}
          onClick={() => setOpenStudentId(x.student_id)}
          className={`w-full text-left p-4 border rounded-2xl transition-colors hover:border-[#1B3A6B] ${x.at_risk ? "border-red-200 bg-red-50/60" : "border-[#E3E8F2] bg-white"}`}
        >
          <div className="flex justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <b className="text-[13px] text-[#0F1C3F]">{x.student_name}</b>
                {x.at_risk && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-bold">NEEDS ATTENTION</span>}
                {!x.is_active && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold">INACTIVE</span>}
              </div>
              <p className="text-[10.5px] text-[#7C8AA5] truncate mt-0.5">{x.student_email}{x.roll_number ? ` · ${x.roll_number}` : ""}</p>
            </div>
            <span className="text-[17px] font-bold text-[#0F1C3F] shrink-0">{x.average_progress}%</span>
          </div>
          <p className="text-[11px] text-[#5A6A8A] mt-3">
            {x.program_name} · {x.current_year} · {x.batch_name || "No batch"}{x.section_name ? ` · ${x.section_name}` : ""}
          </p>
          <p className="text-[10.5px] text-[#7C8AA5] mt-1">
            {x.completed}/{x.enrollments} courses completed · {x.evaluations_completed} assignments evaluated · Open for lesson details
          </p>
          <div className="h-2 bg-gray-100 rounded mt-3">
            <div
              className={`h-full rounded ${x.at_risk ? "bg-red-500" : "bg-emerald-500"}`}
              style={{ width: `${x.average_progress}%` }}
            />
          </div>
        </button>
      ))}
      {!filteredStudents.length && <Empty text={data.students.length ? "No students match these filters" : "No progress data available"} />}
      {openStudentId && (
        <StudentProgressDetailPanel
          studentId={openStudentId}
          onClose={() => setOpenStudentId(null)}
        />
      )}
    </div>
  );
}

const LESSON_TYPE_META: Record<
  api.StudentProgressLesson["lesson_type"],
  { label: string; icon: React.ElementType }
> = {
  video: { label: "Video", icon: Video },
  article: { label: "Article", icon: AlignLeft },
  quiz: { label: "Quiz", icon: HelpCircle },
  assignment: { label: "Assignment", icon: Paperclip },
  coding_test: { label: "Coding Test", icon: Code2 },
};

function StudentProgressDetailPanel({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<api.StudentProgressDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .loadStudentProgressDetail(studentId)
      .then(setDetail)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Unable to load progress"),
      );
  }, [studentId]);
  return (
    <div className="fixed inset-0 z-50 bg-[#071326]/70 p-5 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold">
            {detail?.student_name || "Student"} · Progress
          </h2>
          <button onClick={onClose} className="p-1.5 text-[#5A6A8A]">
            <X size={18} />
          </button>
        </div>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[12px]">
            {error}
          </div>
        )}
        {!detail && !error && <Loading />}
        {detail && !detail.courses.length && (
          <Empty text="Not enrolled in any course yet" />
        )}
        {detail?.courses.map((course) => (
          <div
            key={course.enrollment_id}
            className="border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className="p-3.5 bg-[#F8FAFD] flex items-center justify-between">
              <div>
                <b className="text-[13.5px]">{course.course_title}</b>
                <p className="text-[11px] text-[#5A6A8A] capitalize">
                  {course.status.replace("_", " ")}
                </p>
                <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold ${course.college_managed ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>
                  {course.college_managed ? "College course" : "Self-learning · read only"}
                </span>
              </div>
              <span className="text-[13px] font-semibold">
                {course.progress_percentage}%
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {course.lessons.map((lesson) => {
                const meta = LESSON_TYPE_META[lesson.lesson_type];
                const Icon = meta.icon;
                const done = lesson.status === "completed";
                return (
                  <div
                    key={lesson.lesson_id}
                    className="p-3 flex items-center gap-3"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}
                    >
                      {done ? <Check size={13} /> : <Icon size={12} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium truncate">
                        {lesson.title}
                      </p>
                      <p className="text-[10.5px] text-[#9AA5BE]">
                        {lesson.section_title} · {meta.label}
                        {lesson.lesson_type === "quiz" &&
                          lesson.quiz_best_percentage !== undefined &&
                          ` · Best score ${lesson.quiz_best_percentage}%${lesson.quiz_passed ? " (passed)" : ""}`}
                        {lesson.lesson_type === "assignment" &&
                          lesson.assignment_status &&
                          ` · ${lesson.assignment_status.replace("_", " ")}${lesson.assignment_marks_awarded !== undefined ? ` · ${lesson.assignment_marks_awarded} marks` : ""}`}
                        {lesson.lesson_type === "coding_test" &&
                          lesson.coding_attempts_used !== undefined &&
                          ` · ${lesson.coding_attempts_used} attempt${lesson.coding_attempts_used === 1 ? "" : "s"}${lesson.coding_passed ? " · passed" : ""}`}
                      </p>
                    </div>
                    {done && (
                      <CheckCircle2
                        size={15}
                        className="text-emerald-600 shrink-0"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Certificates() {
  const [d, setD] = useState<api.CollegeCertificates | null>(null);
  const [loadError, setLoadError] = useState("");
  const load = () => api.loadCollegeCertificates().then((value) => {
    setD(value);
    setLoadError("");
  }).catch((error) => { setLoadError(error.message); throw error; });
  useEffect(() => {
    load().catch(() => undefined);
  }, []);
  if (loadError && !d)
    return <LoadFailure message={loadError} retry={() => load().catch(() => undefined)} />;
  if (!d) return <Loading />;
  return (
    <div className="space-y-6">
      <Title
        title="Certificates"
        sub="View issued certificates and request certificates for eligible students."
      />
      <h3 className="font-semibold">Eligible students</h3>
      {d.eligible.map((x) => (
        <div
          className="p-3 border rounded-xl flex justify-between"
          key={x.enrollment_id}
        >
          <span>
            {x.student_name} · {x.course_title}
          </span>
          <button
            disabled={!!x.request_status}
            onClick={async () => {
              try {
                await api.requestCollegeCertificate(x.enrollment_id);
                await load();
                toast.success("Certificate request submitted");
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
            className="text-[11px] text-blue-700"
          >
            {x.request_status || "Request issuance"}
          </button>
        </div>
      ))}
      <h3 className="font-semibold">Issued certificates</h3>
      {d.issued.map((x) => (
        <div className="p-3 bg-emerald-50 rounded-xl" key={x.id}>
          {x.student_name} · {x.course_title} · <b>{x.status}</b>
        </div>
      ))}
    </div>
  );
}
function Reports() {
  const [d, setD] = useState<{
    programs: { name: string; students: number }[];
  } | null>(null);
  const [loadError, setLoadError] = useState("");
  const load = useCallback(() => {
    setLoadError("");
    api.loadCollegeReports().then(setD).catch((error) => setLoadError(error.message));
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  if (loadError && !d) return <LoadFailure message={loadError} retry={load} />;
  if (!d) return <Loading />;
  const kinds = [
    "students",
    "enrollments",
    "course-completion",
    "assessments",
    "certificates",
  ];
  return (
    <div className="space-y-6">
      <Title
        title="College Reports"
        sub="Granular CSV and PDF reports, always limited to your institution."
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {kinds.map((k) => (
          <div key={k} className="p-4 border rounded-xl">
            <b className="capitalize">{k.replace("-", " ")}</b>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() =>
                  adminDownload(
                    `/api/v1/admin/institution/reports/${k}.csv`,
                    `${k}.csv`,
                  ).catch((error) => toast.error(error.message))
                }
                className="text-[11px] text-blue-700"
              >
                Download CSV
              </button>
              <button
                onClick={() =>
                  adminDownload(
                    `/api/v1/admin/institution/reports/${k}.pdf`,
                    `${k}.pdf`,
                  ).catch((error) => toast.error(error.message))
                }
                className="text-[11px] text-red-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {d.programs.map((x) => (
          <div
            className="p-4 border rounded-xl flex justify-between"
            key={x.name}
          >
            <b>{x.name}</b>
            <span>{x.students} students</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InstitutionManagement({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>(() => tabFromPath(window.location.pathname));
  const navigateTab = (next: Tab) => {
    if (window.location.pathname !== TAB_PATH[next])
      window.history.pushState({}, "", TAB_PATH[next]);
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    if (
      window.location.pathname === "/college-admin" ||
      window.location.pathname === "/college-admin/"
    )
      window.history.replaceState({}, "", TAB_PATH.dashboard);
    const restore = () => setTab(tabFromPath(window.location.pathname));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const content: Record<Tab, React.ReactNode> = {
    dashboard: <Dashboard />,
    profile: <Profile />,
    programs: <Programs />,
    students: <Students />,
    batches: <Batches />,
    faculty: <Faculty />,
    courses: <Courses />,
    progress: <Progress />,
    certificates: <Certificates />,
    reports: <Reports />,
  };
  return (
    <div className="min-h-screen bg-[#F2F5FC] text-[#0F1C3F]">
      <Toaster richColors position="top-right" />
      <header className="bg-[#0F1F3B] text-white px-5 py-4 flex justify-between">
        <div>
          <b>EduConnect · College Admin</b>
          <p className="text-[10px] text-white/50">
            Institution-scoped management
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex gap-2 text-[12px] items-center"
        >
          <LogOut size={14} />
          Logout
        </button>
      </header>
      <div className="grid lg:grid-cols-[240px_1fr] max-w-[1500px] mx-auto">
        <div className="p-3 pb-0 lg:hidden">
          <select aria-label="College admin section" value={tab} onChange={(event) => navigateTab(event.target.value as Tab)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold shadow-sm">
            {NAV.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <aside className="hidden p-3 lg:block lg:min-h-[calc(100vh-64px)]">
          <nav className="bg-white rounded-2xl p-2 border">
            {NAV.map(([k, l, I]) => (
              <button
                key={k}
                onClick={() => navigateTab(k)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[12px] mb-1 ${tab === k ? "bg-[#1B3A6B] text-white" : "hover:bg-[#F4F7FC]"}`}
              >
                <I size={15} />
                {l}
              </button>
            ))}
          </nav>
        </aside>
        <main className="p-3 lg:p-6 min-w-0">
          <div className="bg-white rounded-2xl border p-5 lg:p-7 min-h-[75vh]">
            {content[tab]}
          </div>
        </main>
      </div>
    </div>
  );
}
