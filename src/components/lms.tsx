import { useState } from "react";
import { CoursePlayer } from "./course-player";
import type { CourseData } from "./course-player";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  BarChart2,
  Award,
  ArrowLeft,
  Search,
  Play,
  CheckCircle2,
  Clock,
  Star,
  Users,
  ChevronRight,
  ChevronDown,
  Lock,
  Flame,
  Zap,
  TrendingUp,
  FileText,
  Download,
  Filter,
  Plus,
  Check,
  X,
  RefreshCw,
  Bell,
  BookMarked,
  Target,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Send,
  Sparkles,
  Circle,
  Video,
  AlignLeft,
  HelpCircle,
  Paperclip,
  Trophy,
  Activity,
  Calendar,
  ArrowRight,
  Shield,
  Menu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

// ─── types ────────────────────────────────────────────────────────────────────
type LMSSection =
  | "dashboard"
  | "my-courses"
  | "catalog"
  | "assignments"
  | "progress"
  | "certificates";
type LessonType = "video" | "article" | "quiz" | "assignment";
type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  completed: boolean;
  locked?: boolean;
  youtubeId?: string; // YouTube video ID that plays for this lesson
}
interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}
interface Course {
  id: string;
  title: string;
  category: string;
  level: CourseLevel;
  totalHours: string;
  lessonCount: number;
  rating: number;
  enrolled: number;
  instructor: string;
  description: string;
  skills: string[];
  sections: Section[];
  color: string;
  emoji: string;
  enrolledByUser?: boolean;
  progress?: number;
  lastLesson?: string;
}

// ─── mock data ────────────────────────────────────────────────────────────────
const COURSES: Course[] = [
  {
    id: "c1",
    title: "Full Stack Web Development",
    category: "Web Dev",
    level: "Intermediate",
    totalHours: "42h",
    lessonCount: 68,
    rating: 4.8,
    enrolled: 12400,
    instructor: "Rahul Mehta",
    color: "#1B3A6B",
    emoji: "🌐",
    description:
      "Master HTML, CSS, JavaScript, React, Node.js and PostgreSQL end-to-end.",
    skills: ["React", "Node.js", "PostgreSQL", "REST APIs", "Git"],
    enrolledByUser: true,
    progress: 62,
    lastLesson: "React Hooks Deep Dive",
    sections: [
      {
        id: "ch1",
        title: "Web Foundations",
        lessons: [
          {
            id: "l1",
            title: "How the Web Works",
            type: "video",
            duration: "12m",
            completed: true,
            youtubeId: "hJHvdBlSxug",
          },
          {
            id: "l2",
            title: "HTML Essentials",
            type: "video",
            duration: "18m",
            completed: true,
            youtubeId: "UB1O30fR-EE",
          },
          {
            id: "l3",
            title: "CSS Layouts",
            type: "article",
            duration: "10m",
            completed: true,
          },
          {
            id: "l4",
            title: "Chapter Quiz",
            type: "quiz",
            duration: "5m",
            completed: true,
          },
        ],
      },
      {
        id: "ch2",
        title: "JavaScript Mastery",
        lessons: [
          {
            id: "l5",
            title: "ES6+ Features",
            type: "video",
            duration: "22m",
            completed: true,
            youtubeId: "NCwa_xi0Uuc",
          },
          {
            id: "l6",
            title: "Async / Await",
            type: "video",
            duration: "15m",
            completed: true,
            youtubeId: "PoRJizFvM7s",
          },
          {
            id: "l7",
            title: "DOM Manipulation",
            type: "article",
            duration: "8m",
            completed: false,
          },
          {
            id: "l8",
            title: "JS Project",
            type: "assignment",
            duration: "45m",
            completed: false,
          },
        ],
      },
      {
        id: "ch3",
        title: "React Ecosystem",
        lessons: [
          {
            id: "l9",
            title: "React Hooks Deep Dive",
            type: "video",
            duration: "28m",
            completed: false,
            youtubeId: "TNhaISOUy6Q",
          },
          {
            id: "l10",
            title: "State Management",
            type: "video",
            duration: "20m",
            completed: false,
            locked: true,
            youtubeId: "35lXWvCuM8o",
          },
          {
            id: "l11",
            title: "Chapter Quiz",
            type: "quiz",
            duration: "5m",
            completed: false,
            locked: true,
          },
        ],
      },
      {
        id: "ch4",
        title: "Backend with Node.js",
        lessons: [
          {
            id: "l12",
            title: "Express Fundamentals",
            type: "video",
            duration: "25m",
            completed: false,
            locked: true,
          },
          {
            id: "l13",
            title: "REST API Design",
            type: "article",
            duration: "12m",
            completed: false,
            locked: true,
          },
          {
            id: "l14",
            title: "Database Integration",
            type: "video",
            duration: "30m",
            completed: false,
            locked: true,
          },
          {
            id: "l15",
            title: "Final Project",
            type: "assignment",
            duration: "2h",
            completed: false,
            locked: true,
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "Data Science with Python",
    category: "Data Science",
    level: "Beginner",
    totalHours: "36h",
    lessonCount: 54,
    rating: 4.7,
    enrolled: 9800,
    instructor: "Dr. Anita Sharma",
    color: "#7C3AED",
    emoji: "📊",
    description:
      "Learn Python, pandas, NumPy, matplotlib and machine learning basics.",
    skills: ["Python", "pandas", "NumPy", "Matplotlib", "Scikit-learn"],
    enrolledByUser: true,
    progress: 28,
    lastLesson: "Pandas DataFrames",
    sections: [
      {
        id: "ch1",
        title: "Python Basics",
        lessons: [
          {
            id: "l1",
            title: "Python Setup",
            type: "video",
            duration: "10m",
            completed: true,
          },
          {
            id: "l2",
            title: "Variables & Types",
            type: "video",
            duration: "14m",
            completed: true,
          },
          {
            id: "l3",
            title: "Control Flow",
            type: "article",
            duration: "12m",
            completed: false,
          },
        ],
      },
      {
        id: "ch2",
        title: "Data Manipulation",
        lessons: [
          {
            id: "l4",
            title: "Pandas DataFrames",
            type: "video",
            duration: "20m",
            completed: false,
          },
          {
            id: "l5",
            title: "Data Cleaning",
            type: "article",
            duration: "15m",
            completed: false,
            locked: true,
          },
          {
            id: "l6",
            title: "Chapter Quiz",
            type: "quiz",
            duration: "5m",
            completed: false,
            locked: true,
          },
        ],
      },
    ],
  },
  {
    id: "c3",
    title: "UI/UX Design Principles",
    category: "Design",
    level: "Beginner",
    totalHours: "20h",
    lessonCount: 32,
    rating: 4.9,
    enrolled: 7200,
    instructor: "Priya Iyer",
    color: "#D97706",
    emoji: "🎨",
    description:
      "Master design thinking, Figma, wireframing, and user research.",
    skills: [
      "Figma",
      "Wireframing",
      "Prototyping",
      "User Research",
      "Design Systems",
    ],
    enrolledByUser: false,
    progress: 0,
    sections: [],
  },
  {
    id: "c4",
    title: "Cloud Computing & AWS",
    category: "Cloud",
    level: "Advanced",
    totalHours: "50h",
    lessonCount: 80,
    rating: 4.6,
    enrolled: 5400,
    instructor: "Vikram Nair",
    color: "#059669",
    emoji: "☁️",
    description:
      "EC2, S3, Lambda, RDS, DevOps pipelines, and AWS certification prep.",
    skills: ["AWS", "EC2", "S3", "Lambda", "Docker", "CI/CD"],
    enrolledByUser: false,
    progress: 0,
    sections: [],
  },
  {
    id: "c5",
    title: "Machine Learning A–Z",
    category: "AI/ML",
    level: "Intermediate",
    totalHours: "60h",
    lessonCount: 92,
    rating: 4.8,
    enrolled: 14600,
    instructor: "Prof. Sanjay Gupta",
    color: "#DC2626",
    emoji: "🤖",
    description:
      "Supervised, unsupervised, and reinforcement learning with real datasets.",
    skills: [
      "Scikit-learn",
      "TensorFlow",
      "Keras",
      "PyTorch",
      "Feature Engineering",
    ],
    enrolledByUser: false,
    progress: 0,
    sections: [],
  },
  {
    id: "c6",
    title: "DSA & Competitive Programming",
    category: "CS Fundamentals",
    level: "Intermediate",
    totalHours: "38h",
    lessonCount: 60,
    rating: 4.7,
    enrolled: 11200,
    instructor: "Arjun Kapoor",
    color: "#0891B2",
    emoji: "⚡",
    description:
      "Arrays, trees, graphs, DP, and contest problem-solving strategies.",
    skills: [
      "Arrays",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Binary Search",
    ],
    enrolledByUser: true,
    progress: 15,
    lastLesson: "Binary Search Trees",
    sections: [
      {
        id: "ch1",
        title: "Foundations",
        lessons: [
          {
            id: "l1",
            title: "Big-O Notation",
            type: "video",
            duration: "16m",
            completed: true,
          },
          {
            id: "l2",
            title: "Arrays & Strings",
            type: "video",
            duration: "22m",
            completed: false,
          },
          {
            id: "l3",
            title: "Linked Lists",
            type: "article",
            duration: "14m",
            completed: false,
            locked: true,
          },
        ],
      },
    ],
  },
];

const ASSIGNMENTS = [
  {
    id: "a1",
    title: "Build a To-Do App with React",
    course: "Full Stack Web Development",
    due: "Jul 20, 2026",
    marks: 50,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a2",
    title: "EDA on Titanic Dataset",
    course: "Data Science with Python",
    due: "Jul 18, 2026",
    marks: 40,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a3",
    title: "Build a To-Do App with React",
    course: "Full Stack Web Development",
    due: "Jul 20, 2026",
    marks: 50,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a4",
    title: "EDA on Titanic Dataset",
    course: "Data Science with Python",
    due: "Jul 18, 2026",
    marks: 40,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a5",
    title: "EDA on Titanic Dataset",
    course: "Data Science with Python",
    due: "Jul 18, 2026",
    marks: 40,
    status: "pending",
    submitted: false,
    grade: null,
  },
   {
    id: "a6",
    title: "Build a To-Do App with React",
    course: "Full Stack Web Development",
    due: "Jul 20, 2026",
    marks: 50,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a7",
    title: "EDA on Titanic Dataset",
    course: "Data Science with Python",
    due: "Jul 18, 2026",
    marks: 40,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a8",
    title: "Build a To-Do App with React",
    course: "Full Stack Web Development",
    due: "Jul 20, 2026",
    marks: 50,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a9",
    title: "EDA on Titanic Dataset",
    course: "Data Science with Python",
    due: "Jul 18, 2026",
    marks: 40,
    status: "pending",
    submitted: false,
    grade: null,
  },
  {
    id: "a10",
    title: "EDA on Titanic Dataset",
    course: "Data Science with Python",
    due: "Jul 18, 2026",
    marks: 40,
    status: "pending",
    submitted: false,
    grade: null,
  },





  {
    id: "a11",
    title: "Binary Search Implementation",
    course: "DSA & Competitive Prog.",
    due: "Jul 15, 2026",
    marks: 30,
    status: "submitted",
    submitted: true,
    grade: null,
  },
  {
    id: "a12",
    title: "Binary Search Implementation",
    course: "DSA & Competitive Prog.",
    due: "Jul 15, 2026",
    marks: 30,
    status: "submitted",
    submitted: true,
    grade: null,
  },
  {
    id: "a13",
    title: "Binary Search Implementation",
    course: "DSA & Competitive Prog.",
    due: "Jul 15, 2026",
    marks: 30,
    status: "submitted",
    submitted: true,
    grade: null,
  },
  {
    id: "a14",
    title: "Binary Search Implementation",
    course: "DSA & Competitive Prog.",
    due: "Jul 15, 2026",
    marks: 30,
    status: "submitted",
    submitted: true,
    grade: null,
  },
  {
    id: "a15",
    title: "Binary Search Implementation",
    course: "DSA & Competitive Prog.",
    due: "Jul 15, 2026",
    marks: 30,
    status: "submitted",
    submitted: true,
    grade: null,
  },
  {
    id: "a16",
    title: "Binary Search Implementation",
    course: "DSA & Competitive Prog.",
    due: "Jul 15, 2026",
    marks: 30,
    status: "submitted",
    submitted: true,
    grade: null,
  },


  {
    id: "a4",
    title: "JavaScript DOM Project",
    course: "Full Stack Web Development",
    due: "Jul 10, 2026",
    marks: 40,
    status: "graded",
    submitted: true,
    grade: 36,
  },
  {
    id: "a5",
    title: "Python Variables Quiz Project",
    course: "Data Science with Python",
    due: "Jul 05, 2026",
    marks: 20,
    status: "graded",
    submitted: true,
    grade: 18,
  },
];

const CERTS = [
  {
    id: "cert1",
    title: "JavaScript Fundamentals",
    issuer: "EduConnect",
    date: "Jun 12, 2026",
    skills: ["JavaScript", "ES6", "DOM"],
    color: "#1B3A6B",
  },
  {
    id: "cert2",
    title: "Python for Data Analysis",
    issuer: "EduConnect",
    date: "May 28, 2026",
    skills: ["Python", "pandas", "NumPy"],
    color: "#7C3AED",
  },
  {
    id: "cert3",
    title: "Git & Version Control",
    issuer: "EduConnect",
    date: "Apr 15, 2026",
    skills: ["Git", "GitHub", "Branching"],
    color: "#059669",
  },
];

const ACTIVITY_DATA = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 90 },
  { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 120 },
  { day: "Fri", minutes: 75 },
  { day: "Sat", minutes: 150 },
  { day: "Sun", minutes: 60 },
];

const SKILL_RADAR = [
  { skill: "React", level: 72 },
  { skill: "Python", level: 45 },
  { skill: "Node.js", level: 60 },
  { skill: "DSA", level: 38 },
  { skill: "SQL", level: 55 },
  { skill: "Git", level: 85 },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Web Dev",
  "Data Science",
  "AI/ML",
  "Design",
  "Cloud",
  "CS Fundamentals",
];
const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

const lessonIcon: Record<LessonType, React.ElementType> = {
  video: PlayCircle,
  article: AlignLeft,
  quiz: HelpCircle,
  assignment: Paperclip,
};
const levelColor: Record<CourseLevel, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-red-50 text-red-600 border-red-200",
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}

function ProgressRing({
  value,
  size = 44,
  color = "#1B3A6B",
}: {
  value: number;
  size?: number;
  color?: string;
}) {
  const r = (size - 8) / 2,
    circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E8ECF5"
        strokeWidth={5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - value / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        fontSize={size < 40 ? 9 : 11}
        fontWeight="700"
        fill={color}
        fontFamily="DM Mono, monospace"
      >
        {value}%
      </text>
    </svg>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function LMSDashboard({
  onCourse,
  onSection,
}: {
  onCourse: (c: Course) => void;
  onSection: (s: LMSSection) => void;
}) {
  const enrolled = COURSES.filter((c) => c.enrolledByUser);
  const totalMins = ACTIVITY_DATA.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#0A1629] to-[#1B3A6B] rounded-2xl p-4 sm:p-5 lg:p-6 text-white relative overflow-hidden">
        <div
          className="absolute right-0 top-0 w-32 sm:w-48 h-full opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="min-w-0">
            <p className="text-white/60 text-[11.5px] sm:text-[12.5px] mb-1">
              Welcome back, Arjun 👋
            </p>

            <h2
              className="text-[19px] sm:text-[21px] lg:text-[22px] font-bold leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Continue your learning streak
            </h2>

            <p className="text-white/60 text-[12px] sm:text-[13px] mt-1 leading-relaxed">
              You've learned{" "}
              <span className="text-amber-400 font-bold">
                {Math.round(totalMins / 60)}h {totalMins % 60}m
              </span>{" "}
              this week. Keep it up!
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
              <Flame size={17} className="text-amber-400 shrink-0" />

              <div>
                <p
                  className="text-[18px] sm:text-[20px] font-bold text-amber-400"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  14
                </p>
                <p className="text-[9px] sm:text-[10px] text-amber-300/70 leading-none">
                  day streak
                </p>
              </div>
            </div>

            <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
              <Zap size={17} className="text-emerald-400 shrink-0" />

              <div>
                <p
                  className="text-[18px] sm:text-[20px] font-bold text-emerald-400"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  2,840
                </p>
                <p className="text-[9px] sm:text-[10px] text-white/50 leading-none">
                  XP points
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Courses Enrolled",
            value: enrolled.length,
            icon: BookOpen,
            color: "#1B3A6B",
          },
          {
            label: "Lessons Completed",
            value: 42,
            icon: CheckCircle2,
            color: "#059669",
          },
          {
            label: "Hours Learned",
            value: `${Math.round(totalMins / 60)}h`,
            icon: Clock,
            color: "#D97706",
          },
          {
            label: "Certificates",
            value: CERTS.length,
            icon: Award,
            color: "#7C3AED",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-3 sm:p-4 shadow-sm flex items-center gap-2.5 sm:gap-3 min-w-0"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: k.color + "18" }}
            >
              <k.icon
                size={17}
                className="sm:hidden"
                style={{ color: k.color }}
              />
              <k.icon
                size={18}
                className="hidden sm:block"
                style={{ color: k.color }}
              />
            </div>

            <div className="min-w-0">
              <p
                className="text-[19px] sm:text-[22px] font-bold text-[#0F1C3F] truncate"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {k.value}
              </p>

              <p className="text-[10px] sm:text-[11.5px] text-[#5A6A8A] truncate">
                {k.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Continue learning */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
            <p className="text-[13px] sm:text-[14px] font-bold text-[#0F1C3F]">
              Continue Learning
            </p>

            <button
              onClick={() => onSection("my-courses")}
              className="text-[11px] sm:text-[12px] text-[#1B3A6B] font-medium hover:underline flex items-center gap-1 shrink-0"
            >
              All Courses <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {enrolled.map((c) => (
              <button
                key={c.id}
                onClick={() => onCourse(c)}
                className="w-full flex items-center gap-2.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl hover:bg-[#F4F7FC] transition-colors border border-[rgba(27,58,107,0.07)] text-left min-w-0"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
                  style={{ background: c.color + "18" }}
                >
                  {c.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] sm:text-[13.5px] font-semibold text-[#0F1C3F] truncate">
                    {c.title}
                  </p>

                  <p className="text-[10.5px] sm:text-[11.5px] text-[#5A6A8A] truncate">
                    Next: {c.lastLesson}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#F1F3F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${c.progress}%`,
                          background: c.color,
                        }}
                      />
                    </div>

                    <span
                      className="text-[10px] sm:text-[11px] font-semibold shrink-0"
                      style={{ color: c.color }}
                    >
                      {c.progress}%
                    </span>
                  </div>
                </div>

                <ChevronRight size={15} className="text-[#9AA5BE] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Activity chart */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-4 sm:p-5 shadow-sm min-w-0">
          <p className="text-[13px] sm:text-[14px] font-bold text-[#0F1C3F] mb-1">
            This Week
          </p>

          <p className="text-[11px] sm:text-[12px] text-[#5A6A8A] mb-3">
            Minutes learned per day
          </p>

          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={ACTIVITY_DATA}
                margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
              >
                <CartesianGrid
                  key="grid"
                  strokeDasharray="3 3"
                  stroke="#F1F3F9"
                />

                <XAxis
                  key="x"
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#9AA5BE" }}
                />

                <YAxis key="y" tick={{ fontSize: 10, fill: "#9AA5BE" }} />

                <Tooltip
                  key="tip"
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid #E8ECF5",
                  }}
                  formatter={(v) => [`${v}m`, "Time"]}
                />

                <Bar
                  key="minutes"
                  dataKey="minutes"
                  fill="#1B3A6B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[rgba(27,58,107,0.06)] flex items-center justify-between">
            <span className="text-[11px] sm:text-[12px] text-[#5A6A8A]">
              Total
            </span>

            <span
              className="text-[13px] sm:text-[14px] font-bold text-[#1B3A6B]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {Math.floor(totalMins / 60)}h {totalMins % 60}m
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Upcoming deadlines */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
            <p className="text-[13px] sm:text-[14px] font-bold text-[#0F1C3F]">
              Upcoming Deadlines
            </p>

            <button
              onClick={() => onSection("assignments")}
              className="text-[11px] sm:text-[12px] text-[#1B3A6B] font-medium hover:underline shrink-0"
            >
              View All
            </button>
          </div>

          {ASSIGNMENTS.filter((a) => a.status === "pending").map((a, i) => (
            <div
              key={a.id}
              className={`flex items-start gap-2.5 sm:gap-3 py-3 ${
                i < 1 ? "border-b border-[rgba(27,58,107,0.06)]" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardList size={14} className="text-red-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-[13px] font-semibold text-[#0F1C3F] truncate">
                  {a.title}
                </p>

                <p className="text-[10.5px] sm:text-[11.5px] text-[#5A6A8A] truncate">
                  {a.course}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[11px] sm:text-[12px] font-semibold text-red-500 whitespace-nowrap">
                  {a.due}
                </p>

                <p className="text-[10px] sm:text-[11px] text-[#9AA5BE] whitespace-nowrap">
                  {a.marks} marks
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent achievements */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-4 sm:p-5 shadow-sm">
          <p className="text-[13px] sm:text-[14px] font-bold text-[#0F1C3F] mb-3 sm:mb-4">
            Recent Achievements
          </p>

          <div className="space-y-2 sm:space-y-2.5">
            {[
              {
                icon: "🔥",
                title: "14-Day Streak!",
                desc: "Keep learning every day",
                color: "#D97706",
              },
              {
                icon: "⚡",
                title: "Speed Learner",
                desc: "Completed 3 lessons in one day",
                color: "#7C3AED",
              },
              {
                icon: "🏆",
                title: "Quiz Master",
                desc: "Scored 100% on JavaScript Quiz",
                color: "#059669",
              },
              {
                icon: "📜",
                title: "Certificate Earned",
                desc: "Git & Version Control",
                color: "#1B3A6B",
              },
            ].map((a) => (
              <div
                key={a.title}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-[#F8FAFB]"
              >
                <span className="text-lg sm:text-xl shrink-0">{a.icon}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0F1C3F] truncate">
                    {a.title}
                  </p>

                  <p className="text-[10px] sm:text-[11px] text-[#5A6A8A] truncate">
                    {a.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MY COURSES ───────────────────────────────────────────────────────────────
function MyCourses({ onCourse }: { onCourse: (c: Course) => void }) {
  const enrolled = COURSES.filter((c) => c.enrolledByUser);
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">(
    "all",
  );

  const filtered = enrolled.filter((c) => {
    if (filter === "in-progress")
      return (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100;
    if (filter === "completed") return (c.progress ?? 0) === 100;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="min-w-0">
          <h2
            className="text-[18px] sm:text-[20px] font-bold text-[#0F1C3F]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            My Courses
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#5A6A8A]">
            {enrolled.length} enrolled courses
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 p-1 bg-white border border-[rgba(27,58,107,0.1)] rounded-xl w-full sm:w-fit mb-4 sm:mb-5 overflow-x-auto">
        {(["all", "in-progress", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[11.5px] sm:text-[12.5px] font-medium capitalize transition-all whitespace-nowrap
          ${
            filter === f
              ? "bg-[#1B3A6B] text-white"
              : "text-[#5A6A8A] hover:bg-[#F4F6FB]"
          }`}
          >
            {f === "in-progress"
              ? "In Progress"
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] shadow-sm overflow-hidden hover:shadow-md transition-shadow min-w-0"
          >
            {/* card header */}
            <div
              className="h-24 sm:h-28 flex items-center justify-center text-4xl sm:text-5xl relative"
              style={{
                background: `linear-gradient(135deg, ${c.color}22, ${c.color}44)`,
              }}
            >
              {c.emoji}

              <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 max-w-[45%]">
                <Badge label={c.level} cls={levelColor[c.level]} />
              </div>
            </div>

            <div className="p-3.5 sm:p-4">
              <p className="text-[13.5px] sm:text-[14.5px] font-bold text-[#0F1C3F] mb-0.5 line-clamp-1">
                {c.title}
              </p>

              <p className="text-[11.5px] sm:text-[12px] text-[#5A6A8A] mb-3 truncate">
                by {c.instructor}
              </p>

              <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] sm:text-[11.5px] text-[#5A6A8A]">
                      Progress
                    </span>

                    <span
                      className="text-[10.5px] sm:text-[11.5px] font-bold ml-2 shrink-0"
                      style={{ color: c.color }}
                    >
                      {c.progress}%
                    </span>
                  </div>

                  <div className="h-1.5 sm:h-2 bg-[#F1F3F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${c.progress}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  <ProgressRing
                    value={c.progress ?? 0}
                    size={40}
                    color={c.color}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 text-[10.5px] sm:text-[11.5px] text-[#5A6A8A] mb-3 flex-wrap">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Clock size={11} />
                  {c.totalHours}
                </span>

                <span className="flex items-center gap-1 whitespace-nowrap">
                  <BookOpen size={11} />
                  {c.lessonCount} lessons
                </span>
              </div>

              {c.lastLesson && (
                <p className="text-[10.5px] sm:text-[11.5px] text-[#5A6A8A] mb-3 truncate">
                  <span className="font-medium text-[#0F1C3F]">Next:</span>{" "}
                  {c.lastLesson}
                </p>
              )}

              <button
                onClick={() => onCourse(c)}
                className="w-full py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold text-white rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-colors"
                style={{ background: c.color }}
              >
                <Play size={13} /> Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CATALOG ─────────────────────────────────────────────────────────────────
function CourseCatalog({ onCourse }: { onCourse: (c: Course) => void }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [level, setLevel] = useState<"" | CourseLevel>("");
  const [enrolledIds, setEnrolledIds] = useState<string[]>(
    COURSES.filter((c) => c.enrolledByUser).map((c) => c.id),
  );

  const filtered = COURSES.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || c.category === cat;
    const matchLevel = !level || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="min-w-0">
          <h2
            className="text-[18px] sm:text-[20px] font-bold text-[#0F1C3F]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Course Catalog
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#5A6A8A]">
            {COURSES.length} courses available
          </p>
        </div>
      </div>

      {/* search + filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA5BE]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full pl-9 pr-3 py-2 sm:py-2 bg-white border border-[rgba(27,58,107,0.15)] rounded-xl text-[12px] sm:text-[13px] text-[#0F1C3F] placeholder:text-[#9AA5BE] outline-none focus:border-[#1B3A6B]"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            className="w-full sm:w-auto pl-3 pr-8 py-2 bg-white border border-[rgba(27,58,107,0.15)] rounded-xl text-[12px] sm:text-[13px] text-[#5A6A8A] outline-none focus:border-[#1B3A6B] appearance-none cursor-pointer"
          >
            <option value="">All Levels</option>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA5BE] pointer-events-none"
          />
        </div>
      </div>

      {/* category pills */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-4 sm:mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-all border whitespace-nowrap
          ${
            cat === c
              ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
              : "bg-white text-[#5A6A8A] border-[rgba(27,58,107,0.15)] hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
          }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const isEnrolled = enrolledIds.includes(c.id);

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] shadow-sm overflow-hidden hover:shadow-md transition-all group min-w-0"
            >
              <div
                className="h-24 sm:h-28 flex items-center justify-center text-3xl sm:text-4xl relative"
                style={{
                  background: `linear-gradient(135deg, ${c.color}1a, ${c.color}33)`,
                }}
              >
                {c.emoji}

                <div className="absolute top-2.5 right-2.5 max-w-[45%]">
                  <Badge label={c.level} cls={levelColor[c.level]} />
                </div>

                {isEnrolled && (
                  <div className="absolute top-2.5 left-2.5 max-w-[45%]">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-[9.5px] sm:text-[10.5px] font-semibold rounded-full whitespace-nowrap">
                      <Check size={9} />
                      Enrolled
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5 sm:p-4">
                <p className="text-[13px] sm:text-[13.5px] font-bold text-[#0F1C3F] mb-0.5 line-clamp-2 leading-snug">
                  {c.title}
                </p>

                <p className="text-[11px] sm:text-[11.5px] text-[#5A6A8A] mb-2 truncate">
                  by {c.instructor}
                </p>

                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[10.5px] sm:text-[11.5px] text-amber-600 font-semibold whitespace-nowrap">
                    <Star size={10} fill="currentColor" />
                    {c.rating}
                  </span>

                  <span className="text-[#CBD5E1]">·</span>

                  <span className="flex items-center gap-1 text-[10.5px] sm:text-[11.5px] text-[#5A6A8A] whitespace-nowrap">
                    <Users size={10} />
                    {(c.enrolled / 1000).toFixed(1)}k
                  </span>

                  <span className="text-[#CBD5E1]">·</span>

                  <span className="flex items-center gap-1 text-[10.5px] sm:text-[11.5px] text-[#5A6A8A] whitespace-nowrap">
                    <Clock size={10} />
                    {c.totalHours}
                  </span>
                </div>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  {c.skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-[#EBF1FA] text-[#1B3A6B] text-[9.5px] sm:text-[10.5px] rounded-full font-medium"
                    >
                      {s}
                    </span>
                  ))}

                  {c.skills.length > 3 && (
                    <span className="text-[9.5px] sm:text-[10.5px] text-[#9AA5BE]">
                      +{c.skills.length - 3}
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    isEnrolled
                      ? onCourse(c)
                      : setEnrolledIds((ids) => [...ids, c.id])
                  }
                  className={`w-full py-2 text-[11.5px] sm:text-[12.5px] font-semibold rounded-xl transition-colors ${
                    isEnrolled
                      ? "text-white flex items-center justify-center gap-1.5"
                      : "border-2 text-[#1B3A6B] border-[#1B3A6B] hover:bg-[#EBF1FA]"
                  }`}
                  style={isEnrolled ? { background: c.color } : {}}
                >
                  {isEnrolled ? (
                    <>
                      <Play size={12} />
                      Continue
                    </>
                  ) : (
                    "Enroll Free"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── COURSE PLAYER ADAPTER ──────────────────────────────────────────────────
function CoursePlayerAdapter({
  course,
  onBack,
}: {
  course: Course;
  onBack: () => void;
}) {
  const courseData: CourseData = {
    id: course.id,
    title: course.title,
    instructor: course.instructor,
    color: course.color,
    emoji: course.emoji,
    totalHours: course.totalHours,
    rating: course.rating,
    enrolled: course.enrolled,
    description: course.description,
    skills: course.skills,
    progress: course.progress,
    sections: course.sections.map((s) => ({
      ...s,
      lessons: s.lessons.map((l) => ({
        ...l,
        duration: l.duration.replace("m", "").replace("h", ""),
        youtubeId: l.youtubeId,
      })),
    })),
  };
  return <CoursePlayer course={courseData} onBack={onBack} />;
}

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
function AssignmentsSection() {
  const [tab, setTab] = useState<"pending" | "submitted" | "graded">("pending");
  const filtered = ASSIGNMENTS.filter((a) => a.status === tab);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h2
            className="text-[18px] sm:text-[20px] font-bold text-[#0F1C3F]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Assignments
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#5A6A8A]">
            {ASSIGNMENTS.filter((a) => a.status === "pending").length} pending
            submissions
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white border border-[rgba(27,58,107,0.1)] rounded-xl w-full sm:w-fit mb-4 sm:mb-5 overflow-x-auto">
        {" "}
        {(["pending", "submitted", "graded"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[11.5px] sm:text-[12.5px] font-medium capitalize transition-all whitespace-nowrap
              ${tab === t ? "bg-[#1B3A6B] text-white" : "text-[#5A6A8A] hover:bg-[#F4F6FB]"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold
              ${tab === t ? "bg-white/20 text-white" : "bg-[#EBF1FA] text-[#1B3A6B]"}`}
            >
              {ASSIGNMENTS.filter((a) => a.status === t).length}
            </span>
          </button>
        ))}
      </div>

      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-5">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="
            w-full min-w-0
            bg-white
            rounded-2xl
            border border-[rgba(27,58,107,0.1)]
            p-3.5 sm:p-4 lg:p-5
            shadow-sm
            flex flex-col
            gap-3
            transition-all
            hover:shadow-md
          "
              >
                {/* Top section */}
                <div className="flex items-start gap-3 min-w-0">
                  {/* Assignment Icon */}
                  <div
                    className={`
                w-10 h-10
                sm:w-11 sm:h-11
                rounded-xl
                flex items-center justify-center
                shrink-0
                ${
                  a.status === "graded"
                    ? "bg-emerald-50"
                    : a.status === "submitted"
                      ? "bg-blue-50"
                      : "bg-amber-50"
                }
              `}
                  >
                    <ClipboardList
                      size={17}
                      className={
                        a.status === "graded"
                          ? "text-emerald-600"
                          : a.status === "submitted"
                            ? "text-blue-600"
                            : "text-amber-600"
                      }
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="
                  text-[13px]
                  sm:text-[14px]
                  lg:text-[14.5px]
                  font-bold
                  text-[#0F1C3F]
                  leading-snug
                  break-words
                  line-clamp-2
                "
                    >
                      {a.title}
                    </p>

                    <p
                      className="
                  text-[11.5px]
                  sm:text-[12px]
                  lg:text-[12.5px]
                  text-[#5A6A8A]
                  mt-1
                  leading-snug
                  break-words
                  line-clamp-2
                "
                    >
                      {a.course}
                    </p>
                  </div>
                </div>

                {/* Assignment information */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span
                    className="
                flex items-center gap-1
                text-[10.5px]
                sm:text-[11px]
                lg:text-[12px]
                text-[#5A6A8A]
                whitespace-nowrap
              "
                  >
                    <Calendar size={11} className="shrink-0" />
                    <span>Due {a.due}</span>
                  </span>

                  <span
                    className="
                flex items-center gap-1
                text-[10.5px]
                sm:text-[11px]
                lg:text-[12px]
                text-[#5A6A8A]
                whitespace-nowrap
              "
                  >
                    <Target size={11} className="shrink-0" />
                    <span>{a.marks} marks</span>
                  </span>

                  {a.status === "graded" && a.grade !== null && (
                    <span
                      className="
                  flex items-center gap-1
                  text-[10.5px]
                  sm:text-[11px]
                  lg:text-[12px]
                  font-semibold
                  text-emerald-600
                  whitespace-nowrap
                "
                    >
                      <CheckCircle2 size={11} className="shrink-0" />
                      <span>
                        {a.grade}/{a.marks} scored
                      </span>
                    </span>
                  )}
                </div>

                {/* Bottom action */}
                <div className="w-full pt-1">
                  {a.status === "pending" && (
                    <button
                      className="
                  w-full
                  min-h-[38px]
                  sm:min-h-[40px]
                  px-4
                  py-2
                  bg-[#1B3A6B]
                  text-white
                  text-[11.5px]
                  sm:text-[12px]
                  lg:text-[12.5px]
                  font-semibold
                  rounded-xl
                  hover:bg-[#152d54]
                  active:scale-[0.99]
                  transition-all
                  flex items-center justify-center gap-1.5
                "
                    >
                      <Send size={12} />
                      <span>Submit</span>
                    </button>
                  )}

                  {a.status === "submitted" && (
                    <div
                      className="
                  w-full
                  min-h-[38px]
                  sm:min-h-[40px]
                  px-3
                  py-2
                  bg-blue-50
                  text-blue-700
                  text-[11px]
                  sm:text-[12px]
                  font-semibold
                  rounded-xl
                  border border-blue-200
                  flex items-center justify-center
                  text-center
                "
                    >
                      Under Review
                    </div>
                  )}

                  {a.status === "graded" && (
                    <div
                      className={`
                  w-full
                  min-h-[38px]
                  sm:min-h-[40px]
                  px-3
                  py-2
                  text-[11px]
                  sm:text-[12px]
                  font-semibold
                  rounded-xl
                  border
                  flex items-center justify-center
                  ${
                    a.grade! / a.marks >= 0.8
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }
                `}
                    >
                      {Math.round((a.grade! / a.marks) * 100)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-12 sm:py-16 px-4 text-[#9AA5BE]">
            <ClipboardList size={32} className="mx-auto mb-3 opacity-40" />

            <p className="text-[13px] sm:text-[14px] font-medium">
              No {tab} assignments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function ProgressSection() {
  const enrolled = COURSES.filter((c) => c.enrolledByUser);

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-[18px] sm:text-[20px] font-bold text-[#0F1C3F]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Learning Progress
        </h2>
        <p className="text-[12px] sm:text-[13px] text-[#5A6A8A]">
          Your activity and skill growth overview
        </p>
      </div>

      {/* summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "This Week",
            value: "9h 30m",
            icon: Clock,
            color: "#1B3A6B",
          },
          {
            label: "Avg. Daily",
            value: "81 min",
            icon: Activity,
            color: "#7C3AED",
          },
          {
            label: "Completion Rate",
            value: "68%",
            icon: TrendingUp,
            color: "#059669",
          },
          {
            label: "Current Streak",
            value: "14 days",
            icon: Flame,
            color: "#D97706",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-3 sm:p-4 shadow-sm flex items-center gap-3 min-w-0"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: k.color + "18" }}
            >
              <k.icon size={18} style={{ color: k.color }} />
            </div>
            <div>
              <p
                className="text-[16px] sm:text-[18px] font-bold text-[#0F1C3F]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {k.value}
              </p>
              <p className="text-[11px] sm:text-[11.5px] text-[#5A6A8A]">
                {k.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Daily activity */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-3 sm:p-5 shadow-sm min-w-0">
          <p className="text-[14px] font-bold text-[#0F1C3F] mb-1">
            Daily Learning Activity
          </p>
          <p className="text-[12px] text-[#5A6A8A] mb-4">
            Minutes spent learning — this week
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={ACTIVITY_DATA}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="lms-actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                key="grid"
                strokeDasharray="3 3"
                stroke="#F1F3F9"
              />
              <XAxis
                key="x"
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9AA5BE" }}
              />
              <YAxis key="y" tick={{ fontSize: 11, fill: "#9AA5BE" }} />
              <Tooltip
                key="tip"
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v) => [`${v}m`, "Time"]}
              />
              <Area
                key="minutes"
                type="monotone"
                dataKey="minutes"
                stroke="#1B3A6B"
                strokeWidth={2}
                fill="url(#lms-actGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skill radar */}
        <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-3 sm:p-5 shadow-sm overflow-hidden">
          <p className="text-[13px] sm:text-[14px] font-bold text-[#0F1C3F] mb-1">
            Skill Proficiency
          </p>
          <p className="text-[11px] sm:text-[12px] text-[#5A6A8A] mb-2">
            Based on lessons completed
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={SKILL_RADAR}>
              <PolarGrid key="polar-grid" stroke="#E8ECF5" />
              <PolarAngleAxis
                key="polar-angle"
                dataKey="skill"
                tick={{ fontSize: 11, fill: "#5A6A8A" }}
              />
              <Radar
                key="level"
                dataKey="level"
                stroke="#1B3A6B"
                fill="#1B3A6B"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip
                key="tip"
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v) => [`${v}%`, "Level"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course progress */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-3 sm:p-5 shadow-sm min-w-0">
        <p className="text-[13px] sm:text-[14px] font-bold text-[#0F1C3F] mb-4">
          Course Progress Breakdown
        </p>
        <div className="space-y-4">
          {enrolled.map((c) => {
            const total = c.sections
              .flatMap((ch) => ch.lessons)
              .filter((l) => !l.locked).length;
            const done = c.sections
              .flatMap((ch) => ch.lessons)
              .filter((l) => l.completed).length;
            return (
              <div key={c.id}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 min-w-0">
                  <span className="text-lg sm:text-xl shrink-0">{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] sm:text-[13px] font-semibold text-[#0F1C3F] truncate min-w-0">
                        {c.title}
                      </p>
                      <span
                        className="text-[11px] sm:text-[12px] font-bold ml-2 sm:ml-3 shrink-0"
                        style={{ color: c.color }}
                      >
                        {c.progress}%
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-[11.5px] text-[#9AA5BE]">
                      {done}/{total} lessons · {c.totalHours} total
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-[#F1F3F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.progress}%`, background: c.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning heatmap */}
      <div className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] p-3 sm:p-5 shadow-sm min-w-0">
        <p className="text-[13px] sm:text-[14px] font-bold text-[#0F1C3F] mb-4">
          Activity Calendar — July 2026
        </p>
        <div className="flex gap-1 flex-wrap max-w-full">
          {Array.from({ length: 31 }, (_, i) => {
            const intensity = [
              0, 1, 2, 1, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 3, 1,
              2, 0, 1, 3, 2, 1, 0, 2, 1,
            ][i];
            const colors = [
              "#F1F3F9",
              "#BFCFE8",
              "#7FA3CF",
              "#1B3A6B",
              "#0A1629",
            ];
            return (
              <div
                key={i}
                title={`Jul ${i + 1}: ${intensity * 30}min`}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[8px] sm:text-[9px] text-white/60 cursor-pointer hover:ring-2 hover:ring-[#1B3A6B] transition-all shrink-0"
                style={{ background: colors[intensity] }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
          <span className="text-[11px] sm:text-[11.5px] text-[#9AA5BE]">
            Less
          </span>
          {["#F1F3F9", "#BFCFE8", "#7FA3CF", "#1B3A6B", "#0A1629"].map((c) => (
            <div
              key={c}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded shrink-0"
              style={{ background: c }}
            />
          ))}
          <span className="text-[11px] sm:text-[11.5px] text-[#9AA5BE]">
            More
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────
function CertificatesSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h2
            className="text-[18px] sm:text-[20px] font-bold text-[#0F1C3F]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Certificates
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#5A6A8A]">
            {CERTS.length} certificates earned
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2  md:grid-cols-3 gap-4 sm:gap-5">
        {CERTS.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-2xl border border-[rgba(27,58,107,0.1)] shadow-sm overflow-hidden"
          >
            {/* cert header */}
            <div
              className="relative h-32 sm:h-36 flex flex-col items-center justify-center px-4 sm:px-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${cert.color}, ${cert.color}cc)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #fff 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full  bg-white/20 border-2 border-white/40 flex items-center justify-center mb-2">
                <Trophy size={20} className="text-white sm:hidden" />
                <Trophy size={22} className="text-white hidden sm:block" />
              </div>
              <p className="text-[13px] font-bold text-white leading-tight">
                {cert.title}
              </p>
              <p className="text-[11px] text-white/70 mt-0.5">
                Certificate of Completion
              </p>
              <div className="absolute top-3 right-3">
                <Shield size={14} className="text-white/50" />
              </div>
            </div>
            {/* cert body */}
            <div className="p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11.5px] text-[#9AA5BE]">Issued by</p>
                  <p className="text-[12px] sm:text-[13px] font-semibold text-[#0F1C3F] break-words">
                    {cert.issuer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11.5px] text-[#9AA5BE]">Date</p>
                  <p className="text-[12px] sm:text-[13px] font-semibold text-[#0F1C3F] whitespace-nowrap">
                    {cert.date}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3 sm:mb-4 px-4">
                {cert.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-[#EBF1FA] text-[#1B3A6B] text-[11px] rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex flex-col xl:flex-row gap-2">
                <button className="flex-1 py-2 sm:py-2 border border-[rgba(27,58,107,0.15)] rounded-xl text-[12.5px] font-medium text-[#5A6A8A] hover:bg-[#F4F6FB] transition-colors flex items-center justify-center gap-1.5">
                  <Download size={12} /> Download
                </button>
                <button className="flex-1 py-2 sm:py-2 border border-[rgba(27,58,107,0.15)] rounded-xl text-[12.5px] font-medium text-[#5A6A8A] hover:bg-[#F4F6FB] transition-colors flex items-center justify-center gap-1.5">
                  <ArrowRight size={12} /> Share
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* locked placeholder */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-[rgba(27,58,107,0.15)] p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[220px] sm:min-h-[240px]">
          <div className="w-12 h-12 rounded-full bg-[#F4F6FB] flex items-center justify-center">
            <Lock size={20} className="text-[#9AA5BE]" />
          </div>
          <p className="text-[13.5px] font-semibold text-[#5A6A8A]">
            Next Certificate
          </p>
          <p className="text-[11.5px] sm:text-[12px] text-[#9AA5BE] leading-relaxed max-w-[180px] sm:max-w-[160px]">
            Complete Full Stack Web Development to unlock
          </p>
          <div className="w-full max-w-[180px] sm:max-w-[140px]">
            <div className="flex justify-between text-[11px] text-[#9AA5BE] mb-1">
              <span>Progress</span>
              <span>62%</span>
            </div>
            <div className="h-1.5 bg-[#F1F3F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B3A6B] rounded-full"
                style={{ width: "62%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAV config ───────────────────────────────────────────────────────────────
const LMS_NAV: {
  key: LMSSection;
  icon: React.ElementType;
  label: string;
  badge?: number;
}[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "my-courses", icon: BookOpen, label: "My Courses", badge: 3 },
  { key: "catalog", icon: BookMarked, label: "Catalog" },
  { key: "assignments", icon: ClipboardList, label: "Assignments", badge: 2 },
  { key: "progress", icon: BarChart2, label: "Progress" },
  { key: "certificates", icon: Award, label: "Certificates" },
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export function LMSModule({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState<LMSSection>("dashboard");
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openCourse = (c: Course) => {
    if (c.sections.length === 0) return;
    setActiveCourse(c);
  };

  const screenMap: Record<LMSSection, React.ReactNode> = {
    dashboard: <LMSDashboard onCourse={openCourse} onSection={setSection} />,
    "my-courses": <MyCourses onCourse={openCourse} />,
    catalog: <CourseCatalog onCourse={openCourse} />,
    assignments: <AssignmentsSection />,
    progress: <ProgressSection />,
    certificates: <CertificatesSection />,
  };

  return (
    <div
      className="h-screen flex flex-col bg-[#F2F5FC] overflow-hidden"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* ── header ── */}
      <header className="shrink-0 bg-white border-b border-[rgba(27,58,107,0.1)] z-50 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!activeCourse && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#5A6A8A] hover:text-[#1B3A6B] hover:bg-[#EBF1FA] rounded-xl transition-all"
              >
                {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            )}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[9px] bg-[#1B3A6B] flex items-center justify-center">
              <GraduationCap size={17} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] sm:text-[15px] font-bold text-[#0F1C3F]">
                EduConnect
              </span>
              <span className="px-2.5 py-0.5 bg-[#EBF1FA] text-[#1B3A6B] text-[11px] font-bold rounded-full border border-[rgba(27,58,107,0.2)]">
                LMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
            {/* streak pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50border border-amber-200 rounded-full">
              <Flame size={13} className="text-amber-500" />
              <span className="text-[12px] font-bold text-amber-700">
                14 day streak
              </span>
            </div>
            {/* xp */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <Zap size={12} className="text-emerald-600" />
              <span className="text-[12px] font-bold text-emerald-700">
                2,840 XP
              </span>
            </div>
            {/* bell */}
            <button className="relative p-2 text-[#5A6A8A] hover:text-[#1B3A6B] hover:bg-[#EBF1FA] rounded-xl transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            {/* avatar */}
            <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-[rgba(27,58,107,0.1)]">
              <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-[11px] font-bold">
                AS
              </div>
              <div className="hidden lg:block">
                <p className="text-[12.5px] font-semibold text-[#0F1C3F] leading-none">
                  Arjun Shah
                </p>
                <p className="text-[10.5px] text-[#9AA5BE] mt-0.5">
                  B.Tech CSE · 4th Year
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-[12px]font-medium text-[#5A6A8A] hover:text-[#1B3A6B] hover:bg-[#EBF1FA] rounded-xl transition-all"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── sidebar ── */}
        {!activeCourse && (
          <aside
            className={`fixed lg:sticky top-[57px] left-0 z-50 lg:z-auto w-[min(82vw,280px)] sm:w-[280px] lg:w-[210px] h-[calc(100vh-57px)] bg-white border-r border-[rgba(27,58,107,0.08)] flex-shrink-0 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <nav className="flex-1 p-3 sm:p-4 lg:p-3 space-y-0.5 overflow-y-auto">
              {LMS_NAV.map((item) => {
                const active = item.key === section;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSection(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-xl text-left transition-all
                      ${active ? "bg-[#EBF1FA] text-[#1B3A6B]" : "text-[#5A6A8A] hover:text-[#1B3A6B] hover:bg-[#F4F7FC]"}`}
                  >
                    <item.icon
                      size={16}
                      className={active ? "text-[#1B3A6B]" : ""}
                    />
                    <span className="text-[13px] font-medium flex-1">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center
                        ${active ? "bg-[#1B3A6B] text-white" : "bg-[#EBF1FA] text-[#1B3A6B]"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <div className="w-1 h-4 rounded-full bg-[#1B3A6B] shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* quick stats */}
            <div className="p-3 border-t border-[rgba(27,58,107,0.08)] space-y-2">
              <p className="text-[10px] font-semibold text-[#9AA5BE] uppercase tracking-wider px-1">
                Today's Goal
              </p>
              <div className="px-3 py-2.5 bg-[#F4F7FC] rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11.5px] text-[#5A6A8A]">
                    Daily target
                  </span>
                  <span className="text-[11.5px] font-bold text-[#1B3A6B]">
                    45 / 60 min
                  </span>
                </div>
                <div className="h-1.5 bg-[#E8ECF5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1B3A6B] rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── content ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {activeCourse ? (
            <CoursePlayerAdapter
              course={activeCourse}
              onBack={() => setActiveCourse(null)}
            />
          ) : (
            <>
              {/* breadcrumb */}
              <div className="sticky top-0 z-10 bg-[#F2F5FC]/90 backdrop-blur-sm border-b border-[rgba(27,58,107,0.06)] px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 flex items-center gap-2">
                <span className="text-[11px] sm:text-[12px] text-[#9AA5BE]">
                  Learning
                </span>
                <ChevronRight size={12} className="text-[#CBD5E1]" />
                <span className="text-[11px] sm:text-[12px] font-semibold text-[#1B3A6B] capitalize">
                  {section.replace("-", " ")}
                </span>
              </div>
              <div className="px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-7">
                {" "}
                {screenMap[section]}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
