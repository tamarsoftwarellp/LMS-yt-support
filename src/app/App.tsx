import { useState } from "react";
import { CollegePortal, StudentPortal } from "../components/portals";
import { HomePage } from "../components/home";
import { FSDPage } from "../components/fsd";
import { StudentLogin, AdminLogin, StudentRegister } from "../components/auth";
import { SuperAdminPanel } from "../components/super-admin";
import { ProjectPromptPage } from "../components/project-prompt";
import { LMSModule } from "../components/lms";
import { SRSPage } from "../components/srs";

type Mode = "home" | "college" | "student" | "fsd" | "srs" | "student-login" | "admin-login" | "student-register" | "super-admin" | "project-prompt" | "lms";

export default function App() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode === "lms")              return <LMSModule onBack={() => setMode("home")} />;
  if (mode === "project-prompt")   return <ProjectPromptPage onBack={() => setMode("home")} />;
  if (mode === "srs")              return <SRSPage onBack={() => setMode("fsd")} />;
  if (mode === "fsd")              return <FSDPage onBack={() => setMode("home")} onPrompt={() => setMode("project-prompt")} onSRS={() => setMode("srs")} />;
  if (mode === "student-login")    return <StudentLogin onBack={() => setMode("home")} onRegister={() => setMode("student-register")} onSuccess={() => setMode("student")} />;
  if (mode === "admin-login")      return <AdminLogin onBack={() => setMode("home")} onSuccess={() => setMode("super-admin")} />;
  if (mode === "student-register") return <StudentRegister onBack={() => setMode("home")} onLogin={() => setMode("student-login")} onSuccess={() => setMode("student")} />;
  if (mode === "super-admin")      return <SuperAdminPanel onBack={() => setMode("home")} />;
  if (mode === "home")             return <HomePage onCollege={() => setMode("college")} onStudent={() => setMode("student")} onFSD={() => setMode("fsd")} onStudentLogin={() => setMode("student-login")} onAdminLogin={() => setMode("admin-login")} onStudentRegister={() => setMode("student-register")} onLMS={() => setMode("lms")} />;
  if (mode === "student")          return <StudentPortal onSwitch={() => setMode("college")} onHome={() => setMode("home")} onLMS={() => setMode("lms")} />;
  return <CollegePortal onSwitch={() => setMode("student")} onHome={() => setMode("home")} />;
}
