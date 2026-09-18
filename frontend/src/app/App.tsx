import { useEffect, useState, lazy, Suspense } from "react";
import { HomePage } from "../components/home";
import { StudentLogin, AdminLogin, StudentRegister } from "../components/auth";
import { hasStudentSession, logoutStudent } from "../api/student-auth";
import { hasAdminSession, logoutAdmin } from "../api/admin-lms";
import { CertificateVerification } from "../components/certificate-verification";
import { getStaffRole } from "../api/super-admin";

// Lazily loaded: each of these pulls in a large, route-specific module
// that most visitors never touch in a given session, so keeping them
// out of the initial bundle is a straightforward win for first-load size.
const CollegeRegister = lazy(() =>
  import("../components/college-register").then((m) => ({ default: m.CollegeRegister })),
);
const StudentCareerPortal = lazy(() =>
  import("../components/student-career-portal").then((m) => ({ default: m.StudentCareerPortal })),
);
const LMSAdminSection = lazy(() =>
  import("../components/lms-admin").then((m) => ({ default: m.LMSAdminSection })),
);
const InstitutionManagement = lazy(() =>
  import("../components/institution-management").then((m) => ({ default: m.InstitutionManagement })),
);
const LMSModule = lazy(() =>
  import("../components/lms").then((m) => ({ default: m.LMSModule })),
);

function PageLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#F2F5FC] text-[13px] text-[#5A6A8A]">
      Loading…
    </div>
  );
}

function StaffRoleGuard({ required, onResolved, children }: { required: "lms_admin" | "college_admin"; onResolved: (role: "lms_admin" | "college_admin" | null) => void; children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    getStaffRole().then(({ role }) => {
      if (!active) return;
      if (role === required) setAllowed(true);
      else onResolved(role);
    }).catch(() => onResolved(null));
    return () => { active = false; };
  }, [required, onResolved]);
  if (!allowed) return <div className="min-h-screen grid place-items-center bg-[#F2F5FC] text-[13px] text-[#5A6A8A]">Verifying staff access…</div>;
  return <>{children}</>;
}

type Mode =
  | "home"
  | "college"
  | "student"
  | "student-login"
  | "admin-login"
  | "student-register"
  | "college-admin"
  | "lms"
  | "admin-lms"
  | "not-found";
const MODE_PATH: Record<Mode, string> = {
  home: "/",
  college: "/college",
  student: "/student/dashboard",
  "student-login": "/student/login",
  "admin-login": "/admin/login",
  "student-register": "/student/register",
  "college-admin": "/college-admin/dashboard",
  lms: "/lms/dashboard",
  "admin-lms": "/admin/dashboard",
  "not-found": "/404",
};
function modeFromPath(pathname: string): Mode {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const aliases: Record<string, Mode> = {
    "/auth/student/login": "student-login",
    "/auth/student/register": "student-register",
    "/auth/admin/login": "admin-login",
  };
  if (aliases[path]) return aliases[path];
  const exact = (Object.entries(MODE_PATH) as [Mode, string][]).find(
    ([, route]) => route === path,
  )?.[0];
  if (exact) return exact;
  const studentRoutes = new Set([
    "/student/dashboard", "/student/skills", "/student/career-goal",
    "/student/upload-resume", "/student/ats-resume", "/student/roadmap",
    "/student/certificates",
  ]);
  const collegeAdminRoutes = new Set([
    "/college-admin", "/college-admin/dashboard", "/college-admin/profile",
    "/college-admin/programs", "/college-admin/students", "/college-admin/batches",
    "/college-admin/faculty", "/college-admin/courses", "/college-admin/progress",
    "/college-admin/certificates", "/college-admin/reports",
  ]);
  const lmsRoutes = new Set([
    "/lms/dashboard", "/lms/my-courses", "/lms/catalog", "/lms/assignments",
    "/lms/progress", "/lms/certificates",
  ]);
  const adminRoutes = new Set([
    "/admin", "/admin/dashboard", "/admin/courses", "/admin/courses/new",
    "/admin/submissions", "/admin/certificates", "/admin/institution",
    "/admin/college-requests", "/super-admin",
  ]);
  if (studentRoutes.has(path)) return "student";
  if (collegeAdminRoutes.has(path)) return "college-admin";
  if (lmsRoutes.has(path) || /^\/lms\/courses\/[^/]+$/.test(path)) return "lms";
  if (adminRoutes.has(path) || /^\/admin\/courses\/[^/]+$/.test(path)) return "admin-lms";
  if (path.startsWith("/college")) return "college";
  return path === "/" ? "home" : "not-found";
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AppInner />
    </Suspense>
  );
}

function AppInner() {
  const verificationToken = window.location.pathname.match(
    /^\/verify-certificate\/([^/]+)$/,
  )?.[1];
  const [mode, setMode] = useState<Mode>(() => {
    if (window.location.pathname !== "/")
      return modeFromPath(window.location.pathname);
    if (hasStudentSession()) return "student";
    if (hasAdminSession()) return "admin-lms";
    return "home";
  });
  const navigate = (next: Mode, path = MODE_PATH[next]) => {
    if (window.location.pathname !== path)
      window.history.pushState({}, "", path);
    setMode(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    const restore = () => setMode(modeFromPath(window.location.pathname));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  useEffect(() => {
    const legacy: Record<string, string> = {
      "/auth/student/login": MODE_PATH["student-login"],
      "/auth/student/register": MODE_PATH["student-register"],
      "/auth/admin/login": MODE_PATH["admin-login"],
    };
    const clean =
      window.location.pathname.length > 1
        ? window.location.pathname.replace(/\/+$/, "")
        : window.location.pathname;
    const canonical = legacy[clean] || clean;
    if (canonical !== window.location.pathname)
      window.history.replaceState({}, "", canonical);
  }, []);
  useEffect(() => {
    const labels: Record<Mode, string> = {
      home: "Home",
      college: "Register Institution",
      student: "Student Portal",
      "student-login": "Student Login",
      "admin-login": "Admin Login",
      "student-register": "Student Registration",
      "college-admin": "College Admin",
      lms: "Learning Management",
      "admin-lms": "Admin LMS",
      "not-found": "Page not found",
    };
    if (mode !== "student" && mode !== "admin-lms")
      document.title = `${labels[mode]} | EduConnect`;
  }, [mode]);

  if (verificationToken)
    return (
      <CertificateVerification
        token={decodeURIComponent(verificationToken)}
        onHome={() => navigate("home")}
      />
    );
  if (mode === "lms") {
    if (!hasStudentSession())
      return (
        <StudentLogin
          onBack={() => navigate("home")}
          onRegister={() => navigate("student-register")}
          onSuccess={() => navigate("lms")}
        />
      );
    return (
      <LMSModule
        onBack={() => navigate("student")}
        onLogout={async () => {
          await logoutStudent();
          navigate("home");
        }}
      />
    );
  }
  if (mode === "student-login")
    return (
      <StudentLogin
        onBack={() => navigate("home")}
        onRegister={() => navigate("student-register")}
        onSuccess={() => navigate("student")}
      />
    );
  if (mode === "not-found")
    return <div className="min-h-screen grid place-items-center bg-[#F2F5FC] px-5"><div className="max-w-md text-center"><p className="text-[12px] font-bold uppercase tracking-widest text-[#9AA5BE]">404</p><h1 className="mt-3 text-[32px] font-bold text-[#0F1C3F]">Page not found</h1><p className="mt-3 text-[14px] leading-6 text-[#5A6A8A]">This address is not part of your EduConnect workspace.</p><button onClick={() => navigate("home")} className="mt-6 rounded-xl bg-[#1B3A6B] px-5 py-3 text-[14px] font-semibold text-white">Return home</button></div></div>;
  if (mode === "admin-login")
    return (
      <AdminLogin
        onBack={() => navigate("home")}
        onSuccess={(role) =>
          navigate(role === "lms_admin" ? "admin-lms" : "college-admin")
        }
      />
    );
  if (mode === "student-register")
    return (
      <StudentRegister
        onBack={() => navigate("home")}
        onLogin={() => navigate("student-login")}
        onSuccess={() => navigate("student-login")}
      />
    );
  if (mode === "college-admin") {
    if (!hasAdminSession())
      return (
        <AdminLogin
          onBack={() => navigate("home")}
          onSuccess={(role) => navigate(role === "lms_admin" ? "admin-lms" : "college-admin")}
        />
      );
    const leaveCollegeAdmin = async () => {
      await logoutAdmin();
      navigate("home");
    };
    return <StaffRoleGuard required="college_admin" onResolved={(role)=>navigate(role === "lms_admin" ? "admin-lms" : "admin-login")}><InstitutionManagement onClose={leaveCollegeAdmin} /></StaffRoleGuard>;
  }
  if (mode === "home")
    return (
      <HomePage
        onCollege={() => navigate("college")}
        onStudentLogin={() => navigate("student-login")}
        onAdminLogin={() => navigate("admin-login")}
        onStudentRegister={() => navigate("student-register")}
      />
    );
  if (mode === "student") {
    if (!hasStudentSession())
      return (
        <StudentLogin
          onBack={() => navigate("home")}
          onRegister={() => navigate("student-register")}
          onSuccess={() => navigate("student")}
        />
      );
    return (
      <StudentCareerPortal
        onLogout={async () => {
          await logoutStudent();
          navigate("home");
        }}
        onOpenLMS={(courseId) =>
          navigate("lms", courseId ? `/lms/courses/${courseId}` : undefined)
        }
      />
    );
  }
  if (mode === "admin-lms") {
    if (!hasAdminSession())
      return (
        <AdminLogin
          onBack={() => navigate("home")}
          onSuccess={(role) => navigate(role === "lms_admin" ? "admin-lms" : "college-admin")}
        />
      );
    const leaveAdmin = async () => {
      await logoutAdmin();
      navigate("home");
    };
    return <StaffRoleGuard required="lms_admin" onResolved={(role)=>navigate(role === "college_admin" ? "college-admin" : "admin-login")}><LMSAdminSection onBack={leaveAdmin} onLogout={leaveAdmin} /></StaffRoleGuard>;
  }
  return (
    <CollegeRegister
      onBack={() => navigate("home")}
      onLogin={() => navigate("admin-login")}
    />
  );
}
