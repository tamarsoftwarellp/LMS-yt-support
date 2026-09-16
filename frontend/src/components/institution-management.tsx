import { useEffect, useState } from "react";
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Download,
  GraduationCap,
  Layers,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
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
  useEffect(() => {
    api
      .getCollegeDashboard()
      .then(setX)
      .catch((e) => toast.error(e.message));
  }, []);
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
  const [sensitive, setSensitive] = useState({
    college_name: "",
    contact_email: "",
    website_url: "",
  });
  useEffect(() => {
    api
      .getInstitutionProfile()
      .then(setP)
      .catch((e) => toast.error(e.message));
  }, []);
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
                await api.uploadCollegeLogo(file);
                toast.success("Logo uploaded");
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
            await api.requestCollegeProfileChange(sensitive);
            toast.success("Approval request submitted");
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
  const load = () =>
    api
      .listInstitutionStudents(q)
      .then(setItems)
      .catch((e) => toast.error(e.message));
  useEffect(() => {
    api
      .listCollegeBatches()
      .then(setBatches)
      .catch(() => undefined);
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);
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
                const r = await api.importCollegeStudents(file);
                toast.success(`${r.created} students imported`);
                if (r.failed) toast.warning(`${r.failed} rows failed`);
                await load();
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
                      await api.updateCollegeStudent(x.id, {
                        college_batch_id: e.target.value || null,
                      });
                      await load();
                    }}
                  >
                    <option value="">No batch</option>
                    {batches.map((batch) => (
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
                      await api.updateCollegeStudent(x.id, {
                        college_section_id: e.target.value || null,
                      });
                      await load();
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
                      await api.updateCollegeStudent(x.id, {
                        is_active: !x.is_active,
                      });
                      await load();
                    }}
                    className={`px-2 py-1 rounded ${x.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                  >
                    {x.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={async () => {
                      const r = await api.initiateStudentPasswordReset(x.id);
                      await navigator.clipboard?.writeText(r.reset_token);
                      toast.success("One-time reset token copied");
                    }}
                    className="text-blue-700"
                  >
                    Reset password
                  </button>
                  <button
                    onClick={async () => {
                      setManaged(x);
                      setEnrollments(
                        await api.listManagedStudentEnrollments(x.id),
                      );
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
                    if (!row.enrollment_id) {
                      await api.enrollManagedStudent(managed.id, row.course_id);
                    } else {
                      await api.setManagedEnrollmentStatus(
                        managed.id,
                        row.enrollment_id,
                        row.status === "revoked",
                      );
                    }
                    setEnrollments(
                      await api.listManagedStudentEnrollments(managed.id),
                    );
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
  const load = () => api.listCollegeFaculty().then(setItems);
  useEffect(() => {
    load();
  }, []);
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
                await api.setCollegeFacultyStatus(x.id, !x.is_active);
                await load();
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
  const load = () =>
    Promise.all([api.listCollegeBatches(), api.listInstitutionPrograms()]).then(
      ([a, b]) => {
        setItems(a);
        setPrograms(b.filter((x) => x.offered));
      },
    );
  useEffect(() => {
    load();
  }, []);
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
                  await api.addCollegeSection(b.id, { name, capacity: 30 });
                  await load();
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
  const [form, setForm] = useState({ course_id: "", program_id: "" });
  const load = () =>
    Promise.all([
      api.loadCourseAllocations(),
      api.listInstitutionPrograms(),
    ]).then(([a, b]) => {
      setD(a);
      setPrograms(b.filter((x) => x.offered));
    });
  useEffect(() => {
    load();
  }, []);
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
  useEffect(() => {
    api.loadCollegeProgress().then(setData);
  }, []);
  if (!data) return <Loading />;
  return (
    <div className="space-y-5">
      <Title
        title="Student Progress"
        sub={`${data.at_risk_count} at-risk students · grouped by program, batch and section.`}
      />
      <div className="grid sm:grid-cols-3 gap-2">
        {data.groups.map((g) => (
          <div className="p-3 bg-blue-50 rounded-xl" key={`${g.type}-${g.id}`}>
            <b>{g.name}</b>
            <p className="text-[10.5px] capitalize">
              {g.type} · {g.students} students · {g.average_progress}% avg ·{" "}
              {g.at_risk_students} at risk
            </p>
          </div>
        ))}
      </div>
      {data.students.map((x) => (
        <div
          className={`p-4 border rounded-xl ${x.at_risk ? "border-red-300 bg-red-50" : ""}`}
          key={x.student_id}
        >
          <div className="flex justify-between">
            <b>
              {x.student_name}
              {x.at_risk && (
                <span className="ml-2 text-red-600 text-[10px]">AT RISK</span>
              )}
            </b>
            <span>{x.average_progress}%</span>
          </div>
          <p className="text-[11px] text-[#5A6A8A]">
            {x.program_name} · {x.batch_name || "No batch"} · {x.completed}/
            {x.enrollments} completed · {x.evaluations_completed} evaluations
          </p>
          <div className="h-2 bg-gray-100 rounded mt-3">
            <div
              className="h-full bg-emerald-500 rounded"
              style={{ width: `${x.average_progress}%` }}
            />
          </div>
        </div>
      ))}
      {!data.students.length && <Empty text="No progress data available" />}
    </div>
  );
}
function Certificates() {
  const [d, setD] = useState<api.CollegeCertificates | null>(null);
  const load = () => api.loadCollegeCertificates().then(setD);
  useEffect(() => {
    load();
  }, []);
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
              await api.requestCollegeCertificate(x.enrollment_id);
              await load();
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
  useEffect(() => {
    api.loadCollegeReports().then(setD);
  }, []);
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
          <div className="p-4 border rounded-xl">
            <b className="capitalize">{k.replace("-", " ")}</b>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() =>
                  adminDownload(
                    `/api/v1/admin/institution/reports/${k}.csv`,
                    `${k}.csv`,
                  )
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
                  )
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
        <aside className="p-3 lg:min-h-[calc(100vh-64px)]">
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
