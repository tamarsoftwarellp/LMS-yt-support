import { useState } from "react";
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

type Mode = "home" | "college" | "student" | "fsd" | "srs" | "student-login" | "admin-login" | "student-register" | "super-admin" | "project-prompt" | "lms" | "admin-lms";

export default function App() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode === "lms")              return <LMSModule onBack={() => setMode("home")} />;
  if (mode === "project-prompt")   return <ProjectPromptPage onBack={() => setMode("home")} />;
  if (mode === "srs")              return <SRSPage onBack={() => setMode("fsd")} />;
  if (mode === "fsd")              return <FSDPage onBack={() => setMode("home")} onPrompt={() => setMode("project-prompt")} onSRS={() => setMode("srs")} />;
  if (mode === "student-login")    return <StudentLogin onBack={() => setMode("home")} onRegister={() => setMode("student-register")} onSuccess={() => setMode("student")} />;
  if (mode === "admin-login")      return <AdminLogin onBack={() => setMode("home")} onSuccess={() => setMode("admin-lms")} />;
  if (mode === "student-register") return <StudentRegister onBack={() => setMode("home")} onLogin={() => setMode("student-login")} onSuccess={() => setMode("student-login")} />;
  if (mode === "super-admin")      return <SuperAdminPanel onBack={() => setMode("home")} />;
  if (mode === "home")             return <HomePage onCollege={() => setMode("college")} onStudent={() => setMode("student")} onFSD={() => setMode("fsd")} onStudentLogin={() => setMode("student-login")} onAdminLogin={() => setMode("admin-login")} onStudentRegister={() => setMode("student-register")} onLMS={() => setMode("lms")} />;
  if (mode === "student") {
    if (!hasStudentSession()) return <StudentLogin onBack={() => setMode("home")} onRegister={() => setMode("student-register")} onSuccess={() => setMode("student")} />;
    return <StudentCareerPortal onLogout={async () => { await logoutStudent(); setMode("home"); }} />;
  }
  if (mode === "admin-lms") {
    if (!hasAdminSession()) return <AdminLogin onBack={() => setMode("home")} onSuccess={() => setMode("admin-lms")} />;
    return <LMSAdminSection onBack={async () => { await logoutAdmin(); setMode("home"); }} />;
  }
  return <CollegePortal onSwitch={() => setMode("student")} onHome={() => setMode("home")} />;
}


