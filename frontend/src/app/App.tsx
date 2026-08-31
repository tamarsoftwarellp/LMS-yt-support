import { useEffect, useState } from "react";
import { CollegePortal } from "../components/portals";
import { StudentCareerPortal } from "../components/student-career-portal";
import { HomePage } from "../components/home";
import { FSDPage } from "../components/fsd";
import { StudentLogin, AdminLogin, StudentRegister } from "../components/auth";
import { SuperAdminPanel } from "../components/super-admin";
import { LMSAdminSection } from "../components/lms-admin";
import { ProjectPromptPage } from "../components/project-prompt";
import { LMSModule } from "../components/lms";
import { SRSPage } from "../components/srs";
import { hasStudentSession, logoutStudent } from "../api/student-auth";
import { hasAdminSession, logoutAdmin } from "../api/admin-lms";
import { CertificateVerification } from "../components/certificate-verification";

type Mode = "home" | "college" | "student" | "fsd" | "srs" | "student-login" | "admin-login" | "student-register" | "super-admin" | "project-prompt" | "lms" | "admin-lms";
const MODE_PATH:Record<Mode,string>={home:"/",college:"/college",student:"/student/dashboard",fsd:"/programs/full-stack-development",srs:"/resources/software-requirements","student-login":"/student/login","admin-login":"/admin/login","student-register":"/student/register","super-admin":"/super-admin","project-prompt":"/resources/project-prompt",lms:"/lms","admin-lms":"/admin/dashboard"};
function modeFromPath(pathname:string):Mode {
  const path=pathname.length>1?pathname.replace(/\/+$/,""):pathname;
  const aliases:Record<string,Mode>={"/auth/student/login":"student-login","/auth/student/register":"student-register","/auth/admin/login":"admin-login"};
  if(aliases[path])return aliases[path];
  const exact=(Object.entries(MODE_PATH) as [Mode,string][]).find(([,route])=>route===path)?.[0];
  if(exact)return exact;
  if(path.startsWith("/student/"))return "student";
  if(path==="/admin"||path.startsWith("/admin/"))return "admin-lms";
  if(path.startsWith("/super-admin"))return "super-admin";
  if(path.startsWith("/lms"))return "lms";
  if(path.startsWith("/college"))return "college";
  return "home";
}

export default function App() {
  const verificationToken=window.location.pathname.match(/^\/verify-certificate\/([^/]+)$/)?.[1];
  const [mode, setMode] = useState<Mode>(() => {
    if (window.location.pathname!=="/") return modeFromPath(window.location.pathname);
    if (hasStudentSession()) return "student";
    if (hasAdminSession()) return "admin-lms";
    return "home";
  });
  const navigate=(next:Mode,path=MODE_PATH[next])=>{if(window.location.pathname!==path)window.history.pushState({},"",path);setMode(next);window.scrollTo({top:0,behavior:"smooth"});};
  useEffect(()=>{const restore=()=>setMode(modeFromPath(window.location.pathname));window.addEventListener("popstate",restore);return()=>window.removeEventListener("popstate",restore);},[]);
  useEffect(()=>{const legacy:Record<string,string>={"/auth/student/login":MODE_PATH["student-login"],"/auth/student/register":MODE_PATH["student-register"],"/auth/admin/login":MODE_PATH["admin-login"]};const clean=window.location.pathname.length>1?window.location.pathname.replace(/\/+$/,""):window.location.pathname;const canonical=legacy[clean]||clean;if(canonical!==window.location.pathname)window.history.replaceState({},"",canonical);},[]);
  useEffect(()=>{const labels:Record<Mode,string>={home:"Home",college:"College Portal",student:"Student Portal",fsd:"Full Stack Development",srs:"Software Requirements","student-login":"Student Login","admin-login":"Admin Login","student-register":"Student Registration","super-admin":"Super Admin","project-prompt":"Project Prompt",lms:"Learning Management","admin-lms":"Admin LMS"};if(mode!=="student"&&mode!=="admin-lms")document.title=`${labels[mode]} | EduConnect`;},[mode]);

  if (verificationToken) return <CertificateVerification token={decodeURIComponent(verificationToken)} onHome={()=>navigate("home")}/>;
  if (mode === "lms")              return <LMSModule onBack={() => navigate("home")} />;
  if (mode === "project-prompt")   return <ProjectPromptPage onBack={() => navigate("home")} />;
  if (mode === "srs")              return <SRSPage onBack={() => navigate("fsd")} />;
  if (mode === "fsd")              return <FSDPage onBack={() => navigate("home")} onPrompt={() => navigate("project-prompt")} onSRS={() => navigate("srs")} />;
  if (mode === "student-login")    return <StudentLogin onBack={() => navigate("home")} onRegister={() => navigate("student-register")} onSuccess={() => navigate("student")} />;
  if (mode === "admin-login")      return <AdminLogin onBack={() => navigate("home")} onSuccess={() => navigate("admin-lms")} />;
  if (mode === "student-register") return <StudentRegister onBack={() => navigate("home")} onLogin={() => navigate("student-login")} onSuccess={() => navigate("student-login")} />;
  if (mode === "super-admin")      return <SuperAdminPanel onBack={() => navigate("home")} />;
  if (mode === "home")             return <HomePage onCollege={() => navigate("college")} onStudent={() => navigate("student")} onFSD={() => navigate("fsd")} onStudentLogin={() => navigate("student-login")} onAdminLogin={() => navigate("admin-login")} onStudentRegister={() => navigate("student-register")} onLMS={() => navigate("lms")} />;
  if (mode === "student") {
    if (!hasStudentSession()) return <StudentLogin onBack={() => navigate("home")} onRegister={() => navigate("student-register")} onSuccess={() => navigate("student")} />;
    return <StudentCareerPortal onLogout={async () => { await logoutStudent(); navigate("home"); }} />;
  }
  if (mode === "admin-lms") {
    if (!hasAdminSession()) return <AdminLogin onBack={() => navigate("home")} onSuccess={() => navigate("admin-lms")} />;
    const leaveAdmin=async()=>{await logoutAdmin();navigate("home");};
    return <LMSAdminSection onBack={leaveAdmin} onLogout={leaveAdmin} />;
  }
  return <CollegePortal onSwitch={() => navigate("student")} onHome={() => navigate("home")} />;
}
