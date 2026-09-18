import { useEffect, useState } from "react";
import {
  Check,
  Download,
  ExternalLink,
  FileCheck2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { studentDownload } from "../api/student-auth";
import {
  generateAtsResume,
  getGeneratedResume,
  listGeneratedResumes,
  loadResumeBuilder,
  saveResumeBuilder,
  updateGeneratedResume,
} from "../api/student-career";
import type {
  GeneratedResume,
  ResumeBuilderData,
  ResumeContent,
  ResumeEntry,
} from "../api/student-career";
import { toast } from "sonner";

/* ---------------------------------- shared tokens ---------------------------------- */

const input =
  "w-full px-3.5 py-2.5 bg-[#EFF2FA] border-[1.5px] border-transparent rounded-[10px] text-[13px] text-[#0F1C3F] outline-none focus:border-[#1B3A6B] focus:bg-white transition-colors";
const label = "block text-[11px] font-semibold text-[#5A6A8A] mb-1.5";
const blank = (): ResumeEntry => ({
  title: "",
  subtitle: "",
  start_date: "",
  end_date: "",
  location: "",
  description: "",
  bullets: [],
  technologies: [],
  url: "",
});

/* ---------------------------------- left-side form entries ---------------------------------- */

function Entries({
  label: sectionLabel,
  items,
  onChange,
}: {
  label: string;
  items: ResumeEntry[];
  onChange: (x: ResumeEntry[]) => void;
}) {
  const set = (i: number, key: keyof ResumeEntry, value: unknown) =>
    onChange(items.map((x, n) => (n === i ? { ...x, [key]: value } : x)));
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#0F1C3F]">{sectionLabel}</h3>
        <button
          type="button"
          onClick={() => onChange([...items, blank()])}
          className="flex items-center gap-1 text-[11.5px] font-semibold text-[#1B3A6B]"
        >
          <Plus size={13} />
          Add
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-[11.5px] text-[#8792AB] italic">
          Nothing added yet — it'll show up in your preview once you do.
        </p>
      )}
      {items.map((x, i) => (
        <div key={i} className="p-4 rounded-xl border border-[#E3E8F2] bg-[#FBFCFE] space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className={input}
              value={x.title}
              placeholder={sectionLabel === "Education" ? "Degree / qualification" : "Title"}
              onChange={(e) => set(i, "title", e.target.value)}
            />
            <input
              className={input}
              value={x.subtitle || ""}
              placeholder={sectionLabel === "Education" ? "College / university" : "Company / organization"}
              onChange={(e) => set(i, "subtitle", e.target.value)}
            />
            <input
              className={input}
              value={x.start_date || ""}
              placeholder="Start date"
              onChange={(e) => set(i, "start_date", e.target.value)}
            />
            <input
              className={input}
              value={x.end_date || ""}
              placeholder="End date / Present"
              onChange={(e) => set(i, "end_date", e.target.value)}
            />
          </div>
          <textarea
            className={input}
            rows={2}
            value={(x.bullets || []).join("\n")}
            placeholder="Achievements / details — one bullet per line"
            onChange={(e) =>
              set(
                i,
                "bullets",
                e.target.value.split("\n").map((v) => v.trim()).filter(Boolean),
              )
            }
          />
          <div className="flex gap-3">
            <input
              className={input}
              value={(x.technologies || []).join(", ")}
              placeholder="Skills / technologies, comma separated"
              onChange={(e) =>
                set(i, "technologies", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))
              }
            />
            <button
              type="button"
              aria-label={`Remove ${sectionLabel}`}
              onClick={() => onChange(items.filter((_, n) => n !== i))}
              className="px-3 text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------------------------- resume preview (right side) ---------------------------------- */

function ResumeHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold text-[#1B3A6B] tracking-[0.04em] pb-1.5 mb-2.5 border-b border-[#E3E8F2]">
      {children}
    </h4>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-[11.5px] text-[#A7B0C4] italic">{text}</p>;
}

function ResumeEntryRow({ entry }: { entry: ResumeEntry }) {
  const dates = [entry.start_date, entry.end_date].filter(Boolean).join(" — ");
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-[13px] font-semibold text-[#0F1C3F]">{entry.title || "Untitled"}</p>
        {dates && <span className="text-[10.5px] text-[#8792AB] whitespace-nowrap">{dates}</span>}
      </div>
      {entry.subtitle && <p className="text-[12px] text-[#3E4C6D] italic">{entry.subtitle}</p>}
      {(entry.bullets || []).length > 0 && (
        <ul className="mt-1 space-y-0.5 text-[11.5px] text-[#33405C] list-disc list-outside pl-4">
          {entry.bullets!.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {(entry.technologies || []).length > 0 && (
        <p className="mt-1 text-[10.5px] text-[#5A6A8A]">{entry.technologies!.join(" · ")}</p>
      )}
    </div>
  );
}

/** Live, read-only preview built straight from the profile — updates as the person types on the left. */
function DraftPreview({ data }: { data: ResumeBuilderData }) {
  const { auto, profile } = data;
  const links = [
    profile.linkedin_url && { label: "LinkedIn", url: profile.linkedin_url },
    profile.github_url && { label: "GitHub", url: profile.github_url },
    profile.portfolio_url && { label: "Portfolio", url: profile.portfolio_url },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div className="p-7 sm:p-8">
      <div className="pb-4 mb-5 border-b-2 border-[#0F1C3F]">
        <h2 className="text-[24px] text-[#0F1C3F] leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
          {auto.full_name || "Your name"}
        </h2>
        {profile.headline && <p className="mt-1 text-[13px] text-[#1B3A6B] font-medium">{profile.headline}</p>}
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#5A6A8A]">
          {auto.email && <span>{auto.email}</span>}
          {profile.location && <span>{profile.location}</span>}
          {links.map((l) => (
            <span key={l.label} className="flex items-center gap-0.5 text-[#1B3A6B]">
              <ExternalLink size={10} /> {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <section>
          <ResumeHeading>Summary</ResumeHeading>
          {profile.professional_summary ? (
            <p className="text-[12px] text-[#33405C] leading-relaxed">{profile.professional_summary}</p>
          ) : (
            <EmptyHint text="Write a few lines about yourself on the left to see them here." />
          )}
        </section>

        {auto.skills.length > 0 && (
          <section>
            <ResumeHeading>Skills</ResumeHeading>
            <div className="flex flex-wrap gap-1.5">
              {auto.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-[#EFF2FA] text-[10.5px] text-[#1B3A6B]">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <ResumeHeading>Experience</ResumeHeading>
          {profile.experiences.length > 0 ? (
            profile.experiences.map((e, i) => <ResumeEntryRow key={i} entry={e} />)
          ) : (
            <EmptyHint text="Add your experience on the left to see it appear here." />
          )}
        </section>

        <section>
          <ResumeHeading>Projects</ResumeHeading>
          {profile.projects.length > 0 ? (
            profile.projects.map((e, i) => <ResumeEntryRow key={i} entry={e} />)
          ) : (
            <EmptyHint text="Add a project on the left to see it appear here." />
          )}
        </section>

        <section>
          <ResumeHeading>Education</ResumeHeading>
          {profile.educations.length > 0 ? (
            profile.educations.map((e, i) => <ResumeEntryRow key={i} entry={e} />)
          ) : (
            <EmptyHint text="Add your education on the left to see it appear here." />
          )}
        </section>

        {profile.certifications.length > 0 && (
          <section>
            <ResumeHeading>Certifications</ResumeHeading>
            {profile.certifications.map((e, i) => (
              <ResumeEntryRow key={i} entry={e} />
            ))}
          </section>
        )}

        {(profile.achievements.length > 0 || profile.languages.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-5">
            {profile.achievements.length > 0 && (
              <section>
                <ResumeHeading>Achievements</ResumeHeading>
                <ul className="space-y-0.5 text-[11.5px] text-[#33405C] list-disc list-outside pl-4">
                  {profile.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </section>
            )}
            {profile.languages.length > 0 && (
              <section>
                <ResumeHeading>Languages</ResumeHeading>
                <p className="text-[11.5px] text-[#33405C]">{profile.languages.join(", ")}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Read-only preview of an AI-generated version — display only, matches the draft's look. Edit its
 *  wording from the "Polish this version" panel on the left, not here. */
function GeneratedPreview({ current }: { current: GeneratedResume }) {
  const content = current.content!;
  return (
    <div className="p-7 sm:p-8 space-y-5">
      <section>
        <ResumeHeading>Summary</ResumeHeading>
        {content.professional_summary ? (
          <p className="text-[12px] text-[#33405C] leading-relaxed">{content.professional_summary}</p>
        ) : (
          <EmptyHint text="Add a summary on the left to see it here." />
        )}
      </section>

      {content.skills.length > 0 && (
        <section>
          <ResumeHeading>Skills</ResumeHeading>
          <div className="flex flex-wrap gap-1.5">
            {content.skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-[#EFF2FA] text-[10.5px] text-[#1B3A6B]">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <ResumeHeading>Experience</ResumeHeading>
        {content.experiences.length > 0 ? (
          content.experiences.map((e, i) => <ResumeEntryRow key={i} entry={e} />)
        ) : (
          <EmptyHint text="Add experience on the left to see it here." />
        )}
      </section>

      <section>
        <ResumeHeading>Projects</ResumeHeading>
        {content.projects.length > 0 ? (
          content.projects.map((e, i) => <ResumeEntryRow key={i} entry={e} />)
        ) : (
          <EmptyHint text="Add a project on the left to see it here." />
        )}
      </section>
    </div>
  );
}

/* ---------------------------------- main component ---------------------------------- */

export function AtsResumeBuilder() {
  const [data, setData] = useState<ResumeBuilderData | null>(null);
  const [versions, setVersions] = useState<GeneratedResume[]>([]);
  const [current, setCurrent] = useState<GeneratedResume | null>(null);
  const [showDraft, setShowDraft] = useState(true);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
  useEffect(() => {
    if (message) toast.success(message);
  }, [message]);

  const load = async () => {
    const [builder, list] = await Promise.all([loadResumeBuilder(), listGeneratedResumes()]);
    setData(builder);
    setTarget((t) => t || builder.profile.headline || list[0]?.target_role || "");
    setVersions(list);
    if (list[0]) {
      setCurrent(await getGeneratedResume(list[0].id));
    }
    // Always land on the live draft, since it's the one that always matches what's on the left.
  };
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const profile = (key: keyof ResumeBuilderData["profile"], value: unknown) => {
    setData((x) => (x ? { ...x, profile: { ...x.profile, [key]: value } } : x));
    if (key === "headline" && typeof value === "string") setTarget(value);
  };

  const save = async () => {
    if (!data) return;
    setBusy("save");
    setError("");
    try {
      setData(await saveResumeBuilder(data.profile));
      setMessage("Resume information saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setBusy("");
    }
  };

  const generate = async () => {
    if (!data) return;
    if (target.trim().length < 2) {
      setError("Target role is required, for example Backend Developer.");
      setMessage("");
      return;
    }
    setBusy("generate");
    setError("");
    try {
      await saveResumeBuilder(data.profile);
      const result = await generateAtsResume(target.trim());
      setCurrent(result);
      setShowDraft(false);
      setVersions(await listGeneratedResumes());
      setMessage("ATS-friendly resume generated. Review and edit before downloading.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy("");
    }
  };

  const updateContent = (key: keyof ResumeContent, value: unknown) =>
    setCurrent((x) => (x && x.content ? { ...x, content: { ...x.content, [key]: value } } : x));

  const saveGenerated = async () => {
    if (!current?.content) return;
    setBusy("resume");
    setError("");
    try {
      const result = await updateGeneratedResume(current.id, current.title, current.content);
      setCurrent(result);
      setVersions(await listGeneratedResumes());
      setMessage("Resume updated and ATS score recalculated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update resume");
    } finally {
      setBusy("");
    }
  };

  const selectVersion = async (v: GeneratedResume) => {
    setCurrent(await getGeneratedResume(v.id));
    setShowDraft(false);
  };

  if (!data)
    return (
      <div className="py-16 flex justify-center gap-2 text-[13px] text-[#5A6A8A]">
        <RefreshCw size={15} className="animate-spin" />
        Loading resume builder…
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[21px] text-[#0F1C3F]" style={{ fontFamily: "var(--font-serif)" }}>
          ATS Resume Builder
        </h2>
        <p className="text-[13px] text-[#5A6A8A] mt-1">
          Fill in your details on the left — your resume takes shape on the right as you go.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* ---------- left: data entry ---------- */}
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#EBF1FA] grid sm:grid-cols-3 gap-3 text-[11.5px]">
            <span>
              <b>Name:</b> {data.auto.full_name}
            </span>
            <span>
              <b>Email:</b> {data.auto.email}
            </span>
            <span>
              <b>Skills synced:</b> {data.auto.skills.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[11.5px] text-emerald-800">
            <Check size={14} className="text-emerald-600 shrink-0" />
            Courses you complete on the LMS are automatically added to your Certifications below.
          </div>

          {data.auto.uploaded_resume?.sync_status === "synced" && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-[11.5px] text-blue-900">
              <FileCheck2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Data imported from {data.auto.uploaded_resume.file_name}</p>
                <p className="mt-0.5 text-blue-700">
                  {data.auto.uploaded_resume.imported_entries} section entries and{" "}
                  {data.auto.uploaded_resume.imported_fields.length} profile fields were auto-filled. Review and
                  edit them before generating.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Professional headline</label>
                <input
                  className={input}
                  value={data.profile.headline || ""}
                  placeholder="e.g. Backend Developer"
                  onChange={(e) => profile("headline", e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Location</label>
                <input
                  className={input}
                  value={data.profile.location || ""}
                  placeholder="City, State"
                  onChange={(e) => profile("location", e.target.value)}
                />
              </div>
              <div>
                <label className={label}>LinkedIn URL</label>
                <input
                  className={input}
                  value={data.profile.linkedin_url || ""}
                  onChange={(e) => profile("linkedin_url", e.target.value)}
                />
              </div>
              <div>
                <label className={label}>GitHub URL</label>
                <input
                  className={input}
                  value={data.profile.github_url || ""}
                  onChange={(e) => profile("github_url", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Portfolio URL</label>
                <input
                  className={input}
                  value={data.profile.portfolio_url || ""}
                  onChange={(e) => profile("portfolio_url", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={label}>About you</label>
              <textarea
                className={input}
                rows={4}
                value={data.profile.professional_summary || ""}
                placeholder="Facts only — AI will polish the wording when you generate"
                onChange={(e) => profile("professional_summary", e.target.value)}
              />
            </div>
          </div>

          <Entries label="Education" items={data.profile.educations} onChange={(x) => profile("educations", x)} />
          <Entries label="Experience" items={data.profile.experiences} onChange={(x) => profile("experiences", x)} />
          <Entries label="Projects" items={data.profile.projects} onChange={(x) => profile("projects", x)} />
          <Entries
            label="Certifications"
            items={data.profile.certifications}
            onChange={(x) => profile("certifications", x)}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Achievements</label>
              <textarea
                className={input}
                rows={3}
                value={data.profile.achievements.join("\n")}
                placeholder="One per line"
                onChange={(e) => profile("achievements", e.target.value.split("\n").filter(Boolean))}
              />
            </div>
            <div>
              <label className={label}>Languages</label>
              <textarea
                className={input}
                rows={3}
                value={data.profile.languages.join("\n")}
                placeholder="One per line"
                onChange={(e) => profile("languages", e.target.value.split("\n").filter(Boolean))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={!!busy}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#1B3A6B] text-[#1B3A6B] rounded-xl text-[12px] font-semibold disabled:opacity-50"
            >
              <Save size={14} />
              {busy === "save" ? "Saving…" : "Save Information"}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#1B3A6B] text-white">
            <label className="block text-[11px] font-semibold text-white/75 mb-2">
              Target role <span className="text-amber-300">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="flex-1 px-4 py-3 rounded-xl text-[#0F1C3F] text-[13px]"
                value={target}
                placeholder="e.g. Backend Developer"
                onChange={(e) => {
                  setTarget(e.target.value);
                  setError("");
                }}
              />
              <button
                disabled={!!busy}
                onClick={generate}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#D97706] rounded-xl text-[12.5px] font-semibold disabled:opacity-50"
              >
                <Sparkles size={15} />
                {busy === "generate" ? "Generating…" : "Generate ATS Resume"}
              </button>
            </div>
            <p className="text-[10.5px] text-white/55 mt-2">
              Your professional headline is used automatically. You can change the target role here. AI improves
              wording only and will not invent facts.
            </p>
          </div>

          {versions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-[#0F1C3F]">Generated versions</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setShowDraft(true)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    showDraft ? "bg-[#1B3A6B] text-white" : "bg-[#EFF2FA] text-[#5A6A8A]"
                  }`}
                >
                  Live draft
                </button>
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVersion(v)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      !showDraft && current?.id === v.id ? "bg-[#1B3A6B] text-white" : "bg-[#EFF2FA] text-[#5A6A8A]"
                    }`}
                  >
                    <Sparkles size={11} />v{v.version} · {v.target_role}
                  </button>
                ))}
              </div>

              {!showDraft && current?.content && (
                <>
                  <div className="p-4 rounded-xl border border-[#E3E8F2] flex flex-wrap items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full border-[4px] border-emerald-500 flex items-center justify-center text-[14px] font-bold text-[#0F1C3F]">
                      {current.ats?.score || 0}
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <p className="text-[12.5px] font-semibold text-[#0F1C3F]">
                        ATS score · Grade {current.ats?.grade}
                      </p>
                      <p className="text-[11px] text-[#5A6A8A]">
                        Version {current.version} · {current.target_role}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        studentDownload(
                          `/api/v1/students/me/resumes/${current.id}/download`,
                          `resume-v${current.version}.pdf`,
                        ).catch(() => toast.error("Download failed"))
                      }
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-[12px] font-semibold"
                    >
                      <Download size={14} />
                      Download PDF
                    </button>
                  </div>

                  {current.ats?.issues?.length ? (
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-[12px] font-semibold text-amber-800">How to improve</p>
                      {current.ats.issues.map((x) => (
                        <p key={x} className="text-[11.5px] text-amber-700 mt-1">
                          • {x}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 text-emerald-700 text-[12px]">
                      <Check size={15} />
                      No critical ATS issues found.
                    </div>
                  )}

                  <div className="space-y-3 p-4 rounded-xl border border-[#E3E8F2]">
                    <h4 className="text-[13px] font-semibold text-[#0F1C3F]">Polish this version</h4>
                    <p className="text-[11px] text-[#8792AB]">
                      Editing here updates the preview on the right. This won't change your saved profile
                      information above.
                    </p>
                    <div>
                      <label className={label}>Summary</label>
                      <textarea
                        className={input}
                        rows={4}
                        value={current.content.professional_summary}
                        onChange={(e) => updateContent("professional_summary", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={label}>Skills</label>
                      <input
                        className={input}
                        value={current.content.skills.join(", ")}
                        onChange={(e) =>
                          updateContent(
                            "skills",
                            e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                          )
                        }
                      />
                    </div>
                    <Entries
                      label="Experience"
                      items={current.content.experiences}
                      onChange={(x) => updateContent("experiences", x)}
                    />
                    <Entries
                      label="Projects"
                      items={current.content.projects}
                      onChange={(x) => updateContent("projects", x)}
                    />
                  </div>

                  <button
                    onClick={saveGenerated}
                    disabled={!!busy}
                    className="w-full py-3 bg-[#1B3A6B] text-white rounded-xl text-[12.5px] font-semibold disabled:opacity-50"
                  >
                    {busy === "resume" ? "Saving…" : "Save Edits & Recalculate ATS Score"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ---------- right: resume template only, display-only, never editable ---------- */}
        <div className="lg:sticky lg:top-6 rounded-2xl border border-[#E3E8F2] bg-white shadow-[0_1px_3px_rgba(15,28,63,0.06)] overflow-hidden">
          {showDraft || !current?.content ? <DraftPreview data={data} /> : <GeneratedPreview current={current} />}
        </div>
      </div>
    </div>
  );
}
