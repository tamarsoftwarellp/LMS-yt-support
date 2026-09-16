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
const FSDPage = lazy(() =>
  import("../components/fsd").then((m) => ({ default: m.FSDPage })),
);
const LMSAdminSection = lazy(() =>
  import("../components/lms-admin").then((m) => ({ default: m.LMSAdminSection })),
);
const InstitutionManagement = lazy(() =>
  import("../components/institution-management").then((m) => ({ default: m.InstitutionManagement })),
);
const ProjectPromptPage = lazy(() =>
  import("../components/project-prompt").then((m) => ({ default: m.ProjectPromptPage })),
);
const LMSModule = lazy(() =>
  import("../components/lms").then((m) => ({ default: m.LMSModule })),
);
const SRSPage = lazy(() =>
  import("../components/srs").then((m) => ({ default: m.SRSPage })),
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
  | "fsd"
  | "srs"
  | "student-login"
  | "admin-login"
  | "student-register"
  | "college-admin"
  | "project-prompt"
  | "lms"
  | "admin-lms";
const MODE_PATH: Record<Mode, string> = {
  home: "/",
  college: "/college",
  student: "/student/dashboard",
  fsd: "/programs/full-stack-development",
  srs: "/resources/software-requirements",
  "student-login": "/student/login",
  "admin-login": "/admin/login",
  "student-register": "/student/register",
  "college-admin": "/college-admin/dashboard",
  "project-prompt": "/resources/project-prompt",
  lms: "/lms/dashboard",
  "admin-lms": "/admin/dashboard",
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
  if (path.startsWith("/student/")) return "student";
  if (path === "/admin" || path.startsWith("/admin/")) return "admin-lms";
  if (path.startsWith("/college-admin")) return "college-admin";
  if (path.startsWith("/super-admin")) return "admin-lms";
  if (path.startsWith("/lms")) return "lms";
  if (path.startsWith("/college")) return "college";
  return "home";
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
      fsd: "Full Stack Development",
      srs: "Software Requirements",
      "student-login": "Student Login",
      "admin-login": "Admin Login",
      "student-register": "Student Registration",
      "college-admin": "College Admin",
      "project-prompt": "Project Prompt",
      lms: "Learning Management",
      "admin-lms": "Admin LMS",
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
  if (mode === "project-prompt")
    return <ProjectPromptPage onBack={() => navigate("home")} />;
  if (mode === "srs") return <SRSPage onBack={() => navigate("fsd")} />;
  if (mode === "fsd")
    return (
      <FSDPage
        onBack={() => navigate("home")}
        onPrompt={() => navigate("project-prompt")}
        onSRS={() => navigate("srs")}
      />
    );
  if (mode === "student-login")
    return (
      <StudentLogin
        onBack={() => navigate("home")}
        onRegister={() => navigate("student-register")}
        onSuccess={() => navigate("student")}
      />
    );
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
        onStudent={() => navigate("student")}
        onFSD={() => navigate("fsd")}
        onStudentLogin={() => navigate("student-login")}
        onAdminLogin={() => navigate("admin-login")}
        onStudentRegister={() => navigate("student-register")}
        onLMS={() => navigate("lms")}
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
