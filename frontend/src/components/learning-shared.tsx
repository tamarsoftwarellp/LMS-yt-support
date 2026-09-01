import { useEffect, useState } from "react";
import { AlertCircle, Award, Check } from "lucide-react";
import { loadStudentAssignment, loadStudentQuiz, saveAssignmentSubmission, startQuizAttempt, submitQuizAttempt } from "../api/student-career";
import type { Lesson } from "./course-player";

export function Notice({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <div className={`p-3.5 rounded-xl text-[12.5px] font-medium flex items-center gap-2 ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
      {error ? <AlertCircle size={14} /> : <Check size={14} />}
      {error || success}
    </div>
  );
}

export function LiveQuiz({ lesson, onPassed }: { lesson: Lesson; onPassed: () => void }) {
  const [quiz, setQuiz] = useState<Awaited<ReturnType<typeof loadStudentQuiz>> | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [attemptId, setAttemptId] = useState("");
  const [result, setResult] = useState<{ percentage: number; passed: boolean; earned_marks: number; total_marks: number } | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { loadStudentQuiz(lesson.id).then(setQuiz).catch(e => setError(e.message)); }, [lesson.id]);
  const start = async () => { if (!quiz) return; setBusy(true); setError(""); try { const attempt = await startQuizAttempt(quiz.id); setAttemptId(attempt.id); } catch (e) { setError(e instanceof Error ? e.message : "Unable to start quiz"); } finally { setBusy(false); } };
  const choose = (qid: string, oid: string, multiple: boolean) => setAnswers(current => { const selected = current[qid] || []; return { ...current, [qid]: multiple ? (selected.includes(oid) ? selected.filter(x => x !== oid) : [...selected, oid]) : [oid] }; });
  const submit = async () => { if (!attemptId) return; setBusy(true); setError(""); try { const value = await submitQuizAttempt(attemptId, Object.entries(answers).map(([question_id, selected_option_ids]) => ({ question_id, selected_option_ids }))); setResult(value); if (value.passed) onPassed(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit quiz"); } finally { setBusy(false); } };
  if (error && !quiz) return <Notice error={error} />;
  if (!quiz) return <div className="p-8 text-center text-[13px] text-[#5A6A8A]">Loading quiz…</div>;
  if (result) return <div className={`p-8 rounded-2xl text-center border ${result.passed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}><Award size={34} className={`mx-auto ${result.passed ? "text-emerald-600" : "text-red-500"}`} /><h3 className="text-[20px] font-bold mt-3">{result.passed ? "Quiz passed!" : "Keep learning and try again"}</h3><p className="text-[13px] mt-2">Score: {result.earned_marks}/{result.total_marks} · {result.percentage}%</p></div>;
  if (!attemptId) return <div className="p-6 bg-white rounded-2xl border border-slate-200"><h3 className="text-[17px] font-semibold">Quiz instructions</h3><p className="text-[13px] text-[#5A6A8A] mt-2">{quiz.instructions}</p><div className="flex gap-4 mt-4 text-[12px] text-[#5A6A8A]"><span>{quiz.questions.length} questions</span><span>Pass: {quiz.passing_percentage}%</span><span>{quiz.remaining_attempts} attempts left</span></div><button disabled={busy || quiz.remaining_attempts === 0} onClick={start} className="mt-5 px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[13px] font-semibold disabled:opacity-40">Start Quiz</button></div>;
  return <div className="space-y-4"><Notice error={error} />{quiz.questions.map((q, index) => <div key={q.id} className="p-5 bg-white rounded-2xl border border-slate-200"><p className="text-[13px] font-semibold">{index + 1}. {q.question_text} <span className="text-[#9AA5BE]">({q.marks} marks)</span></p><div className="space-y-2 mt-3">{q.options.map(o => <label key={o.id} className={`flex gap-3 p-3 rounded-xl border cursor-pointer ${(answers[q.id] || []).includes(o.id) ? "border-[#1B3A6B] bg-[#EBF1FA]" : "border-slate-200"}`}><input type={q.question_type === "multiple_choice" ? "checkbox" : "radio"} name={q.id} checked={(answers[q.id] || []).includes(o.id)} onChange={() => choose(q.id, o.id, q.question_type === "multiple_choice")} /><span className="text-[12.5px]">{o.option_text}</span></label>)}</div></div>)}<button disabled={busy} onClick={submit} className="w-full py-3 bg-[#1B3A6B] text-white rounded-xl text-[13.5px] font-semibold disabled:opacity-50">{busy ? "Submitting…" : "Submit Quiz"}</button></div>;
}

export function LiveAssignment({ lesson, onPassed }: { lesson: Lesson; onPassed: () => void }) {
  const [assignment, setAssignment] = useState<Awaited<ReturnType<typeof loadStudentAssignment>> | null>(null);
  const [text, setText] = useState(""); const [link, setLink] = useState(""); const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const load = () => loadStudentAssignment(lesson.id).then(value => { setAssignment(value); setText(value.latest_submission?.status === "draft" ? value.latest_submission.text_content || "" : ""); setLink(value.latest_submission?.status === "draft" ? value.latest_submission.link_url || "" : ""); if (value.latest_submission?.evaluation?.decision === "passed") onPassed(); }).catch(e => setError(e.message));
  useEffect(load, [lesson.id]);
  const save = async (status: "draft" | "submitted") => { if (!assignment) return; setBusy(true); setError(""); setSuccess(""); try { await saveAssignmentSubmission(assignment.id, { status, text, link, file }); setSuccess(status === "draft" ? "Draft saved." : "Assignment submitted for evaluation."); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to save assignment"); } finally { setBusy(false); } };
  if (error && !assignment) return <Notice error={error} />;
  if (!assignment) return <div className="p-8 text-center text-[13px]">Loading assignment…</div>;
  const latest = assignment.latest_submission; const evaluated = latest?.evaluation;
  return <div className="space-y-4"><Notice error={error} success={success} />
    <div className="p-5 bg-white rounded-2xl border border-slate-200"><h3 className="text-[17px] font-semibold">Assignment instructions</h3><p className="text-[13px] text-[#5A6A8A] mt-2 whitespace-pre-wrap">{assignment.instructions}</p>
      <div className="flex gap-4 mt-4 text-[12px] text-[#5A6A8A] flex-wrap"><span>Max marks: {assignment.maximum_marks}</span><span>Passing: {assignment.passing_marks}</span><span>{assignment.remaining_attempts} attempts left</span>{assignment.due_at && <span>Due: {new Date(assignment.due_at).toLocaleDateString()}</span>}</div></div>
    {evaluated ? <div className={`p-6 rounded-2xl text-center border ${evaluated.decision === "passed" ? "bg-emerald-50 border-emerald-200" : evaluated.decision === "resubmission_required" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
      <Award size={30} className={`mx-auto ${evaluated.decision === "passed" ? "text-emerald-600" : evaluated.decision === "resubmission_required" ? "text-amber-600" : "text-red-500"}`} />
      <h3 className="text-[16px] font-bold mt-3 capitalize">{evaluated.decision.replace("_", " ")}</h3>
      <p className="text-[13px] mt-2">Marks: {evaluated.marks_awarded}/{assignment.maximum_marks}</p>
      {evaluated.feedback && <p className="text-[12.5px] text-[#5A6A8A] mt-2">{evaluated.feedback}</p>}
    </div> : null}
    {(!evaluated || evaluated.decision === "resubmission_required") && assignment.remaining_attempts > 0 && <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
      <textarea className="w-full px-3.5 py-2.5 bg-[#EFF2FA] rounded-[10px] text-[13px] outline-none focus:border-[#1B3A6B] border-[1.5px] border-transparent" rows={4} placeholder="Text response (optional)" value={text} onChange={e => setText(e.target.value)} />
      <input className="w-full px-3.5 py-2.5 bg-[#EFF2FA] rounded-[10px] text-[13px] outline-none focus:border-[#1B3A6B] border-[1.5px] border-transparent" placeholder="Link (optional, https://…)" value={link} onChange={e => setLink(e.target.value)} />
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="text-[12.5px]" />
      <div className="flex gap-3"><button disabled={busy} onClick={() => save("draft")} className="px-4 py-2.5 border border-[#1B3A6B] text-[#1B3A6B] rounded-xl text-[12.5px] font-semibold disabled:opacity-50">Save Draft</button><button disabled={busy} onClick={() => save("submitted")} className="flex-1 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[12.5px] font-semibold disabled:opacity-50">{busy ? "Submitting…" : "Submit Assignment"}</button></div>
    </div>}
  </div>;
}
