import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  CheckCircle2, Lock, ChevronDown, Check, Clock, ChevronLeft, ChevronRight,
  FileText, HelpCircle, Paperclip, Video, AlignLeft, List, MessageSquare,
  BookOpen, Download, Star, Users, ThumbsUp, Send, X,
  Settings, Maximize2, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
export type LessonType = "video" | "article" | "quiz" | "assignment";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string; // numeric string, e.g. "12"
  completed: boolean;
  locked?: boolean;
  isPreview?: boolean;
  youtubeId?: string; // YouTube video ID for this lesson, e.g. "dQw4w9WgXcQ"
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseData {
  id: string;
  title: string;
  instructor: string;
  color: string;
  emoji: string;
  totalHours: string;
  rating: number;
  enrolled: number;
  description: string;
  skills: string[];
  sections: Section[];
  progress?: number;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const lessonIcon: Record<LessonType, React.ElementType> = {
  video: Video,
  article: AlignLeft,
  quiz: HelpCircle,
  assignment: Paperclip,
};

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── YOUTUBE IFRAME API LOADER ─────────────────────────────────────────────────
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      resolve();
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return ytApiPromise;
}

// ─── VIDEO PLAYER (YouTube-backed, module-wise) ────────────────────────────────
function VideoPlayer({ lesson, color, onEnded }: { lesson: Lesson; color: string; onEnded?: () => void }) {
  const totalSecsFallback = (parseInt(lesson.duration) || 10) * 60;
  const [current, setCurrent] = useState(0);
  const [totalSecs, setTotalSecs] = useState(totalSecsFallback);
  const [playing, setPlaying] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [ready, setReady] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  // create the YT player once, then swap videos by id as the lesson changes
  useEffect(() => {
    let cancelled = false;
    if (!lesson.youtubeId) return;

    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current) return;

      if (!playerRef.current) {
        playerRef.current = new window.YT.Player(hostRef.current, {
          videoId: lesson.youtubeId,
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: (e: any) => {
              setReady(true);
              e.target.setVolume(volume);
              setTotalSecs(e.target.getDuration() || totalSecsFallback);
            },
            onStateChange: (e: any) => {
              const YT = window.YT.PlayerState;
              if (e.data === YT.PLAYING) setPlaying(true);
              if (e.data === YT.PAUSED) setPlaying(false);
              if (e.data === YT.ENDED) {
                setPlaying(false);
                onEndedRef.current?.();
              }
            },
          },
        });
      } else {
        playerRef.current.loadVideoById(lesson.youtubeId);
        setCurrent(0);
        setPlaying(false);
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.youtubeId]);

  // clean up the player on unmount
  useEffect(() => {
    return () => { playerRef.current?.destroy?.(); playerRef.current = null; };
  }, []);

  // poll current time / buffered % while playing
  useEffect(() => {
    if (playing && ready) {
      pollRef.current = setInterval(() => {
        const p = playerRef.current;
        if (!p) return;
        setCurrent(p.getCurrentTime?.() ?? 0);
        setTotalSecs(p.getDuration?.() || totalSecsFallback);
        const buf = p.getVideoLoadedFraction?.();
        if (typeof buf === "number") setBuffered(buf * 100);
      }, 500);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [playing, ready, totalSecsFallback]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  };

  const skip = (delta: number) => {
    const p = playerRef.current;
    if (!p) return;
    const next = Math.max(0, Math.min(totalSecs, p.getCurrentTime() + delta));
    p.seekTo(next, true);
    setCurrent(next);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    const p = playerRef.current;
    if (!rect || !p) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * totalSecs;
    p.seekTo(target, true);
    setCurrent(target);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    playerRef.current?.setVolume(v);
    if (v > 0 && muted) { setMuted(false); playerRef.current?.unMute(); }
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    muted ? p.unMute() : p.mute();
    setMuted(!muted);
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    playerRef.current?.setPlaybackRate(s);
  };

  const pct = totalSecs ? (current / totalSecs) * 100 : 0;
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="relative bg-black rounded-xl overflow-hidden group">
      {/* video canvas */}
      <div className="relative aspect-video" style={{ background: `linear-gradient(135deg, #0a0a0a 0%, #111827 100%)` }}>
        {lesson.youtubeId ? (
          <>
            {/* real YouTube iframe, native controls hidden — driven entirely by the bar below */}
            <div ref={hostRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            {/* click-through overlay for the center play button when paused */}
            {!playing && (
              <button onClick={togglePlay}
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                <span className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/30 flex items-center justify-center transition-all hover:scale-110">
                  <Play size={26} className="text-white ml-1" fill="white" />
                </span>
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Video size={28} className="text-white/30 mb-2" />
            <p className="text-white/40 text-[12px]">No video linked to this lesson yet</p>
          </div>
        )}
        {/* title overlay */}
        <p className="absolute bottom-14 left-4 text-white/60 text-[13px] font-medium drop-shadow pointer-events-none">{lesson.title}</p>
      </div>

      {/* controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* seek bar */}
        <div ref={barRef} className="relative h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer" onClick={seek}>
          <div className="absolute h-full bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
          <div className="absolute h-full rounded-full transition-none" style={{ width: `${pct}%`, background: color }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg -ml-1.5 transition-none"
            style={{ left: `${pct}%` }} />
        </div>

        <div className="flex items-center gap-3">
          {/* prev/play/next */}
          <button className="text-white/70 hover:text-white transition-colors" onClick={() => skip(-10)}>
            <SkipBack size={16} />
          </button>
          <button className="text-white hover:scale-110 transition-transform" onClick={togglePlay}>
            {playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>
          <button className="text-white/70 hover:text-white transition-colors" onClick={() => skip(10)}>
            <SkipForward size={16} />
          </button>

          {/* time */}
          <span className="text-white/70 text-[12px] font-mono ml-1">{fmt(current)} / {fmt(totalSecs)}</span>

          <div className="flex-1" />

          {/* volume */}
          <div className="relative">
            <button className="text-white/70 hover:text-white transition-colors" onClick={() => setShowVolume(!showVolume)}>
              {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            {showVolume && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/90 rounded-xl p-3 shadow-xl border border-white/10">
                <input type="range" min={0} max={100} value={muted ? 0 : volume}
                  onChange={e => changeVolume(+e.target.value)}
                  className="h-20 cursor-pointer" style={{ writingMode: "vertical-lr", direction: "rtl" }} />
                <button onClick={toggleMute} className="mt-2 text-white/60 hover:text-white text-[10px] block w-full text-center">
                  {muted ? "Unmute" : "Mute"}
                </button>
              </div>
            )}
          </div>

          {/* speed */}
          <div className="relative">
            <button className="text-white/70 hover:text-white text-[12px] font-bold transition-colors px-1" onClick={() => setShowSpeed(!showSpeed)}>
              {speed}x
            </button>
            {showSpeed && (
              <div className="absolute bottom-8 right-0 bg-black/90 rounded-xl overflow-hidden shadow-xl border border-white/10">
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => { changeSpeed(s); setShowSpeed(false); }}
                    className={`block w-full px-4 py-2 text-[12px] text-left transition-colors hover:bg-white/10 ${speed === s ? "text-white font-bold" : "text-white/70"}`}>
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="text-white/70 hover:text-white transition-colors">
            <Settings size={14} />
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTES TAB ────────────────────────────────────────────────────────────────
function NotesTab({ lessonTitle }: { lessonTitle: string }) {
  const [notes, setNotes] = useState([
    { id: "n1", time: "2:15", text: "Key concept: hooks allow functional components to manage state." },
    { id: "n2", time: "8:40", text: "Remember to always call hooks at the top level, never inside loops." },
  ]);
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    setNotes(n => [...n, { id: Date.now().toString(), time: "0:00", text: draft.trim() }]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <textarea value={draft} onChange={e => setDraft(e.target.value)}
          placeholder={`Add a note for "${lessonTitle}"…`}
          rows={3}
          className="flex-1 resize-none text-[13px] text-[#0F1C3F] bg-[#F8FAFB] border border-[rgba(27,58,107,0.15)] rounded-xl p-3 outline-none focus:border-[#1B3A6B] transition-colors placeholder:text-[#9AA5BE]" />
        <button onClick={add} className="self-end px-4 py-2 bg-[#1B3A6B] text-white text-[12px] font-semibold rounded-xl hover:bg-[#152d54] transition-colors">
          Save
        </button>
      </div>
      {notes.map(n => (
        <div key={n.id} className="flex gap-3 p-3 bg-white rounded-xl border border-[rgba(27,58,107,0.1)] group">
          <span className="shrink-0 text-[11px] font-bold text-[#1B3A6B] bg-[#EBF1FA] px-2 py-0.5 rounded-md mt-0.5 h-fit">{n.time}</span>
          <p className="text-[13px] text-[#374151] flex-1">{n.text}</p>
          <button onClick={() => setNotes(ns => ns.filter(x => x.id !== n.id))} className="opacity-0 group-hover:opacity-100 text-[#9AA5BE] hover:text-red-400 transition-all">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Q&A TAB ──────────────────────────────────────────────────────────────────
function QATab() {
  const [q, setQ] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: "q1", user: "Priya S.", avatar: "PS", time: "2 days ago",
      text: "Can you explain when to use useCallback vs useMemo?",
      likes: 14, answered: true,
      answer: "useCallback memoizes a function reference; useMemo memoizes the result of calling a function. Use useCallback when passing callbacks to child components to prevent re-renders, and useMemo for expensive computations.",
    },
    {
      id: "q2", user: "Rahul M.", avatar: "RM", time: "5 hours ago",
      text: "Why does the dependency array matter in useEffect?",
      likes: 7, answered: false, answer: "",
    },
  ]);

  const ask = () => {
    if (!q.trim()) return;
    setQuestions(qs => [{ id: Date.now().toString(), user: "You", avatar: "YO", time: "just now", text: q.trim(), likes: 0, answered: false, answer: "" }, ...qs]);
    setQ("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask a question…"
          onKeyDown={e => e.key === "Enter" && ask()}
          className="flex-1 text-[13px] bg-[#F8FAFB] border border-[rgba(27,58,107,0.15)] rounded-xl px-3 py-2.5 outline-none focus:border-[#1B3A6B] transition-colors placeholder:text-[#9AA5BE]" />
        <button onClick={ask} className="px-4 py-2.5 bg-[#1B3A6B] text-white rounded-xl hover:bg-[#152d54] transition-colors">
          <Send size={14} />
        </button>
      </div>

      {questions.map(item => (
        <div key={item.id} className="bg-white rounded-xl border border-[rgba(27,58,107,0.1)] p-4 space-y-3">
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-[10px] font-bold shrink-0">{item.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12.5px] font-semibold text-[#0F1C3F]">{item.user}</span>
                <span className="text-[11px] text-[#9AA5BE]">{item.time}</span>
              </div>
              <p className="text-[13px] text-[#374151]">{item.text}</p>
            </div>
            <button className="flex items-center gap-1 text-[11.5px] text-[#5A6A8A] hover:text-[#1B3A6B] transition-colors self-start">
              <ThumbsUp size={12} /> {item.likes}
            </button>
          </div>
          {item.answered && (
            <div className="ml-9 p-3 bg-[#F4F7FC] rounded-lg border-l-2 border-[#1B3A6B]">
              <p className="text-[11.5px] font-semibold text-[#1B3A6B] mb-1">Instructor reply</p>
              <p className="text-[12.5px] text-[#374151]">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ course }: { course: CourseData }) {
  return (
    <div className="space-y-5">
      {/* instructor card */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[rgba(27,58,107,0.1)]">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0" style={{ background: course.color }}>
          {course.instructor.split(" ").map(w => w[0]).join("").slice(0, 2)}
        </div>
        <div>
          <p className="text-[13.5px] font-bold text-[#0F1C3F]">{course.instructor}</p>
          <p className="text-[12px] text-[#5A6A8A]">Course Instructor</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[11.5px] text-amber-600"><Star size={11} fill="currentColor" />{course.rating}</span>
            <span className="flex items-center gap-1 text-[11.5px] text-[#5A6A8A]"><Users size={11} />{course.enrolled.toLocaleString()} students</span>
          </div>
        </div>
      </div>

      {/* description */}
      <div className="bg-white rounded-xl border border-[rgba(27,58,107,0.1)] p-4">
        <p className="text-[13.5px] font-bold text-[#0F1C3F] mb-2">About this course</p>
        <p className="text-[13px] text-[#5A6A8A] leading-relaxed">{course.description}</p>
      </div>

      {/* what you'll learn */}
      <div className="bg-white rounded-xl border border-[rgba(27,58,107,0.1)] p-4">
        <p className="text-[13.5px] font-bold text-[#0F1C3F] mb-3">What you will learn</p>
        <div className="grid grid-cols-2 gap-2">
          {course.skills.map(s => (
            <div key={s} className="flex items-start gap-2 text-[12.5px] text-[#374151]">
              <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RESOURCES TAB ────────────────────────────────────────────────────────────
function ResourcesTab() {
  const files = [
    { name: "Lesson Slides.pdf", size: "2.4 MB", icon: FileText },
    { name: "Starter Code.zip", size: "890 KB", icon: Paperclip },
    { name: "Cheatsheet.pdf",   size: "340 KB", icon: FileText },
  ];
  return (
    <div className="space-y-2">
      {files.map(f => (
        <div key={f.name} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[rgba(27,58,107,0.1)] hover:border-[#1B3A6B]/30 transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1FA] flex items-center justify-center shrink-0">
            <f.icon size={14} className="text-[#1B3A6B]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#0F1C3F] truncate">{f.name}</p>
            <p className="text-[11px] text-[#9AA5BE]">{f.size}</p>
          </div>
          <Download size={14} className="text-[#9AA5BE] group-hover:text-[#1B3A6B] transition-colors" />
        </div>
      ))}
    </div>
  );
}

// ─── ARTICLE VIEW ─────────────────────────────────────────────────────────────
function ArticleView({ lesson }: { lesson: Lesson }) {
  const sections = [
    { heading: "Introduction", body: `Understanding ${lesson.title} is foundational for building modern applications. The concepts covered here are used in virtually every production system you'll encounter in your career.` },
    { heading: "Core Concepts", body: "At its heart, this module is about understanding how data flows through a system. We'll explore the key primitives and how they compose into larger patterns." },
    { heading: "Practical Example", body: "Let's look at a real-world implementation. Notice how the principles we discussed translate directly into working code. Try typing this out rather than copy-pasting — the muscle memory matters." },
    { heading: "Summary", body: "You've now covered the fundamentals. The next lesson builds directly on what you've learned here, so make sure you're comfortable before moving on." },
  ];
  return (
    <div className="bg-white rounded-xl border border-[rgba(27,58,107,0.1)] p-6 space-y-5">
      {sections.map(s => (
        <div key={s.heading}>
          <p className="text-[15px] font-bold text-[#0F1C3F] mb-2">{s.heading}</p>
          <p className="text-[13.5px] text-[#5A6A8A] leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

// ─── QUIZ VIEW ────────────────────────────────────────────────────────────────
const QUIZ_BANK = [
  { q: "What is the correct way to declare a React functional component?", options: ["function MyComp() { return <div/>; }", "class MyComp extends Component {}", "const MyComp = class {}", "React.create('MyComp')"], correct: 0 },
  { q: "Which hook replaces componentDidMount in functional components?", options: ["useState", "useEffect", "useRef", "useMemo"], correct: 1 },
  { q: "What does the dependency array in useEffect control?", options: ["Component props", "When the effect re-runs", "Render count", "Component children"], correct: 1 },
];

function QuizView({ onComplete }: { onComplete: () => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ_BANK.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const score = submitted ? answers.filter((a, i) => a === QUIZ_BANK[i].correct).length : 0;

  return (
    <div className="space-y-5">
      {QUIZ_BANK.map((q, qi) => (
        <div key={qi} className="bg-white rounded-xl border border-[rgba(27,58,107,0.1)] p-5">
          <p className="text-[13.5px] font-semibold text-[#0F1C3F] mb-3">{qi + 1}. {q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const isCorrect = oi === q.correct;
              return (
                <button key={oi} disabled={submitted} onClick={() => setAnswers(a => { const n = [...a]; n[qi] = oi; return n; })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-[13px] text-left transition-all
                    ${submitted && isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800" :
                      submitted && chosen && !isCorrect ? "border-red-300 bg-red-50 text-red-600" :
                      chosen ? "border-[#1B3A6B] bg-[#EBF1FA] text-[#1B3A6B]" :
                      "border-[rgba(27,58,107,0.12)] hover:border-[#1B3A6B]/40"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
                    ${chosen ? "bg-[#1B3A6B] text-white" : "bg-[#EFF2FA] text-[#5A6A8A]"}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                  {submitted && isCorrect && <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button disabled={answers.some(a => a === null)}
          onClick={() => setSubmitted(true)}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-40 transition-colors text-[14px]">
          Submit Quiz
        </button>
      ) : (
        <div className={`p-4 rounded-xl border-2 text-center ${score === QUIZ_BANK.length ? "border-emerald-400 bg-emerald-50" : score >= 2 ? "border-amber-400 bg-amber-50" : "border-red-300 bg-red-50"}`}>
          <p className="text-[16px] font-bold mb-1">{score}/{QUIZ_BANK.length} correct</p>
          <p className="text-[13px] text-[#5A6A8A] mb-3">{score === QUIZ_BANK.length ? "Perfect score! 🎉" : score >= 2 ? "Good effort — review incorrect answers." : "Review the material and try again."}</p>
          <button onClick={onComplete} className="px-6 py-2 bg-[#1B3A6B] text-white text-[13px] font-semibold rounded-xl hover:bg-[#152d54] transition-colors">
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ASSIGNMENT VIEW ──────────────────────────────────────────────────────────
function AssignmentView({ lesson }: { lesson: Lesson }) {
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const simulate = () => {
    setUploading(true);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setUploading(false); return 100; }
        return p + 8;
      });
    }, 120);
  };

  return (
    <div className="bg-white rounded-xl border border-[rgba(27,58,107,0.1)] p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-bold text-[#0F1C3F]">{lesson.title}</p>
          <p className="text-[12.5px] text-[#5A6A8A] mt-0.5">Estimated time: {lesson.duration}m</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11.5px] font-semibold rounded-xl border border-amber-200">50 marks</span>
      </div>

      <div className="p-4 bg-[#F8FAFB] rounded-xl border border-[rgba(27,58,107,0.08)]">
        <p className="text-[13px] font-semibold text-[#0F1C3F] mb-2">Instructions</p>
        <p className="text-[13px] text-[#5A6A8A] leading-relaxed">
          Build a complete project applying the concepts from this module. Your submission will be reviewed by the instructor. Follow the rubric carefully and ensure your code is well-commented and organized.
        </p>
      </div>

      <div>
        <p className="text-[12.5px] font-semibold text-[#0F1C3F] mb-2">Submit Your Work</p>
        <input ref={fileRef} type="file" className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (f) { setUploaded(f.name); simulate(); }
        }} />
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[rgba(27,58,107,0.2)] rounded-xl p-6 text-center hover:border-[#1B3A6B] transition-colors cursor-pointer">
          <Paperclip size={20} className="text-[#5A6A8A] mx-auto mb-2" />
          <p className="text-[13px] font-medium text-[#1B3A6B]">{uploaded || "Upload your project files"}</p>
          <p className="text-[11.5px] text-[#9AA5BE]">ZIP, PDF, or GitHub URL · Max 50MB</p>
        </div>
        {uploading && (
          <div className="mt-2">
            <div className="h-1.5 bg-[#F1F3F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#1B3A6B] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11px] text-[#9AA5BE] mt-1">Uploading… {progress}%</p>
          </div>
        )}
        {!uploading && progress === 100 && (
          <p className="text-[12px] text-emerald-600 font-medium mt-2 flex items-center gap-1.5"><CheckCircle2 size={13} /> File uploaded successfully</p>
        )}
      </div>

      <button disabled={progress < 100}
        className="w-full py-2.5 bg-amber-500 text-white text-[13.5px] font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
        <Send size={14} /> Submit Assignment
      </button>
    </div>
  );
}

// ─── MAIN COURSE PLAYER ───────────────────────────────────────────────────────
export function CoursePlayer({ course, onBack }: { course: CourseData; onBack: () => void }) {
  const allLessons = course.sections.flatMap(s => s.lessons);
  const firstIncomplete = allLessons.find(l => !l.completed && !l.locked) ?? allLessons[0];
  const [activeLesson, setActiveLesson] = useState<Lesson>(firstIncomplete);
  const [expanded, setExpanded] = useState<string[]>(course.sections.map(s => s.id));
  const [completedIds, setCompletedIds] = useState<string[]>(allLessons.filter(l => l.completed).map(l => l.id));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "qa" | "resources">("overview");

  const total = allLessons.filter(l => !l.locked).length;
  const done = completedIds.length;
  const pct = Math.round((done / total) * 100);

  const allUnlocked = allLessons.filter(l => !l.locked);
  const curIdx = allUnlocked.findIndex(l => l.id === activeLesson.id);

  const markDone = () => {
    if (!completedIds.includes(activeLesson.id)) {
      setCompletedIds(ids => [...ids, activeLesson.id]);
    }
    if (curIdx < allUnlocked.length - 1) setActiveLesson(allUnlocked[curIdx + 1]);
  };

  const Icon = lessonIcon[activeLesson.type];

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a1a]" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-[300px]" : "w-0"} bg-[#1a1a1a] border-r border-white/10 flex flex-col shrink-0 overflow-hidden transition-all duration-200`}>
        <div className="p-4 border-b border-white/10">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white/80 transition-colors mb-3">
            <ArrowLeft size={13} /> Back to courses
          </button>
          <p className="text-[13px] font-bold text-white line-clamp-2 leading-snug">{course.title}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: course.color }} />
            </div>
            <span className="text-[11px] font-semibold text-white/60">{pct}%</span>
          </div>
          <p className="text-[11px] text-white/40 mt-0.5">{done}/{total} completed</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {course.sections.map((sec, si) => {
            const secDone = sec.lessons.filter(l => completedIds.includes(l.id)).length;
            const isOpen = expanded.includes(sec.id);
            return (
              <div key={sec.id}>
                <button onClick={() => setExpanded(ex => isOpen ? ex.filter(e => e !== sec.id) : [...ex, sec.id])}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                  <ChevronDown size={13} className={`text-white/40 transition-transform shrink-0 ${isOpen ? "" : "-rotate-90"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/80 leading-snug">
                      <span className="text-white/30 mr-1">S{si + 1}.</span>{sec.title}
                    </p>
                    <p className="text-[10.5px] text-white/30 mt-0.5">{secDone}/{sec.lessons.length} • {sec.lessons.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0)}m</p>
                  </div>
                </button>

                {isOpen && sec.lessons.map((lesson, li) => {
                  const LIcon = lessonIcon[lesson.type];
                  const isDone = completedIds.includes(lesson.id);
                  const isActive = lesson.id === activeLesson.id;
                  return (
                    <button key={lesson.id} disabled={!!lesson.locked}
                      onClick={() => !lesson.locked && setActiveLesson(lesson)}
                      className={`w-full flex items-start gap-2.5 px-4 py-2.5 transition-colors text-left
                        ${isActive ? "bg-white/10 border-l-2 border-l-white/60" : "hover:bg-white/5 border-l-2 border-l-transparent"}
                        ${lesson.locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border
                        ${isDone ? "bg-emerald-500 border-emerald-500" : isActive ? "border-white/60" : "border-white/20"}`}>
                        {isDone ? <Check size={8} className="text-white" /> :
                          lesson.locked ? <Lock size={8} className="text-white/40" /> :
                          <LIcon size={8} className="text-white/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11.5px] leading-snug ${isActive ? "text-white font-semibold" : isDone ? "text-white/60" : "text-white/50"}`}>
                          {si + 1}.{li + 1} {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/30 flex items-center gap-0.5"><Clock size={8} />{lesson.duration}m</span>
                          {lesson.isPreview && <span className="text-[9.5px] text-amber-400 font-medium">Preview</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F2F5FC]">
        {/* top nav */}
        <div className="bg-[#0A1629] px-4 py-2.5 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60 hover:text-white transition-colors">
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
          <div className="flex items-center gap-1.5 text-[12px] text-white/50 flex-1 min-w-0">
            <span className="text-white/30">{course.emoji}</span>
            <span className="truncate text-white/60">{course.title}</span>
            <ChevronRight size={11} className="text-white/30 shrink-0" />
            <span className="truncate text-white/80 font-medium">{activeLesson.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button disabled={curIdx === 0} onClick={() => curIdx > 0 && setActiveLesson(allUnlocked[curIdx - 1])}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] text-white/60 hover:text-white border border-white/10 hover:border-white/30 rounded-lg disabled:opacity-30 transition-colors">
              <ChevronLeft size={12} /> Prev
            </button>
            <button disabled={curIdx >= allUnlocked.length - 1} onClick={() => curIdx < allUnlocked.length - 1 && setActiveLesson(allUnlocked[curIdx + 1])}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] text-white/60 hover:text-white border border-white/10 hover:border-white/30 rounded-lg disabled:opacity-30 transition-colors">
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[820px] mx-auto px-6 py-6">
            {/* lesson header */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
                ${activeLesson.type === "video" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  activeLesson.type === "quiz" ? "bg-purple-50 text-purple-700 border-purple-200" :
                  activeLesson.type === "assignment" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-slate-100 text-slate-600 border-slate-200"}`}>
                <Icon size={10} />
                {activeLesson.type.charAt(0).toUpperCase() + activeLesson.type.slice(1)}
              </span>
              {activeLesson.type === "video" && (
                <span className="text-[12px] text-[#9AA5BE] flex items-center gap-1"><Clock size={11} />{activeLesson.duration}m</span>
              )}
            </div>
            <h2 className="text-[22px] font-bold text-[#0F1C3F] mb-4 leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
              {activeLesson.title}
            </h2>

            {/* lesson content */}
            {activeLesson.type === "video" && <VideoPlayer lesson={activeLesson} color={course.color} onEnded={markDone} />}
            {activeLesson.type === "article" && <ArticleView lesson={activeLesson} />}
            {activeLesson.type === "quiz" && <QuizView onComplete={markDone} />}
            {activeLesson.type === "assignment" && <AssignmentView lesson={activeLesson} />}

            {/* mark complete */}
            {activeLesson.type !== "quiz" && (
              completedIds.includes(activeLesson.id) ? (
                <div className="mt-5 flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-[13.5px] font-semibold">
                  <CheckCircle2 size={16} /> Lesson completed!
                </div>
              ) : (
                <button onClick={markDone}
                  className="mt-5 w-full py-3 text-white text-[14px] font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: course.color }}>
                  <Check size={16} /> Mark as Complete & Continue
                </button>
              )
            )}

            {/* tabs */}
            <div className="mt-8 border-b border-[rgba(27,58,107,0.1)]">
              <div className="flex gap-1">
                {([
                  { key: "overview", label: "Overview", icon: BookOpen },
                  { key: "notes", label: "Notes", icon: List },
                  { key: "qa", label: "Q&A", icon: MessageSquare },
                  { key: "resources", label: "Resources", icon: Download },
                ] as const).map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors
                      ${activeTab === tab.key ? "border-[#1B3A6B] text-[#1B3A6B]" : "border-transparent text-[#5A6A8A] hover:text-[#1B3A6B]"}`}>
                    <tab.icon size={13} />{tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              {activeTab === "overview" && <OverviewTab course={course} />}
              {activeTab === "notes" && <NotesTab lessonTitle={activeLesson.title} />}
              {activeTab === "qa" && <QATab />}
              {activeTab === "resources" && <ResourcesTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}