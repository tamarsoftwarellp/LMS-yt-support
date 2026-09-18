import { useEffect, useState } from "react";
import { AlertCircle, Award, GraduationCap, ShieldCheck } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

interface CertificateData {
  is_valid: boolean;
  certificate_number: string;
  student_name: string;
  course_title: string;
  instructor_name?: string | null;
  enrolled_at: string;
  issued_at: string;
  status: string;
  revoked_at?: string | null;
  revocation_reason?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Presentational certificate — pure, no fetching. Reuse this anywhere */
/*  the data is already on hand (e.g. an admin preview) without the     */
/*  verification-page chrome around it.                                 */
/* ------------------------------------------------------------------ */

export function CertificateTemplate({ data }: { data: CertificateData }) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div
      id="certificate-canvas"
      className="relative w-full aspect-[1000/707] bg-[#FBF3D9] overflow-hidden rounded-md shadow-sm"
      style={{ fontFamily: "var(--font-sans, 'Outfit', sans-serif)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[6%] h-full bg-[#1B3A6B]" />
        <div className="absolute top-0 right-0 w-[6%] h-full bg-[#1B3A6B]" />
        <div className="absolute top-0 left-0 w-full h-[3%] bg-[#1B3A6B]" />
        <div className="absolute bottom-0 left-0 w-full h-[3%] bg-[#1B3A6B]" />
        <div className="absolute top-0 right-[6%] w-[26%] h-[4%] bg-[#D9A441]" />
        <div className="absolute bottom-0 left-0 w-[22%] h-[4%] bg-[#D9A441]" />
      </div>

      <div className="relative h-full flex flex-col items-center text-center px-[8%] py-[4%]">
        <div className="flex items-center gap-2 mt-2">
          <span className="w-8 h-8 rounded-lg bg-[#1B3A6B] text-white flex items-center justify-center">
            <Award size={16} />
          </span>
          <div className="text-left">
            <p className="text-[#1B3A6B] font-bold tracking-wide text-[13px] leading-none">
              EDUCONNECT
            </p>
            <p className="text-[#5A6A8A] text-[8px] leading-none mt-0.5">
              EduConnect Platform
            </p>
          </div>
        </div>

        <h1 className="text-[#1B3A6B] font-extrabold tracking-wide mt-4 leading-none text-[clamp(20px,4vw,40px)]">
          CERTIFICATE
        </h1>
        <p className="text-[#1B3A6B] text-[clamp(11px,1.6vw,18px)] mt-1">
          OF ACHIEVEMENT
        </p>

        <p className="text-[#1B3A6B] font-bold text-[clamp(9px,1.1vw,13px)] tracking-wide mt-4">
          THIS CERTIFICATE IS PRESENTED TO
        </p>

        <div className="mt-3 border-b-2 border-[#1B3A6B] pb-1 min-w-[55%]">
          <p className="text-[#0F1C3F] font-serif italic font-semibold text-[clamp(16px,2.6vw,30px)]">
            {data.student_name}
          </p>
        </div>

        <p className="italic font-semibold text-[#1B3A6B] mt-3 text-[clamp(10px,1.3vw,15px)]">
          From EduConnect Platform
        </p>

        <p className="text-[#0F1C3F] mt-2 max-w-[80%] text-[clamp(9px,1.2vw,14px)] leading-snug">
          In recognition of the effort and achievement in successfully
          completing the
          <span className="font-semibold"> {data.course_title} </span>
          program.
        </p>

        <div className="flex items-center gap-6 mt-3 text-[clamp(8px,1vw,12px)] text-[#1B3A6B] font-semibold">
          <span className="flex items-center gap-1">
            Enrolled{" "}
            <span className="border-b border-[#1B3A6B] px-2">
              {fmt(data.enrolled_at)}
            </span>
          </span>
          <span className="flex items-center gap-1">
            Completed{" "}
            <span className="border-b border-[#1B3A6B] px-2">
              {fmt(data.issued_at)}
            </span>
          </span>
        </div>

        <div className="flex items-end justify-between w-full mt-auto pt-4">
          <div className="text-left">
            <div className="border-b border-[#1B3A6B] w-32 mb-1" />
            <p className="text-[#0F1C3F] font-bold text-[clamp(8px,1vw,12px)]">
              {data.instructor_name || "—"}
            </p>
            <p className="text-[#5A6A8A] text-[clamp(7px,0.85vw,10px)]">
              Course Instructor
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#E9C46A] to-[#D9A441] border-2 border-[#B23A48] flex items-center justify-center">
              <Award size={20} className="text-[#1B3A6B]" />
            </div>
            <p className="text-[7px] text-[#5A6A8A] mt-1">
              {data.certificate_number}
            </p>
          </div>

          <div className="text-right">
            <div className="border-b border-[#1B3A6B] w-32 mb-1 ml-auto" />
            <p className="text-[#0F1C3F] font-bold text-[clamp(8px,1vw,12px)]">
              EduConnect
            </p>
            <p className="text-[#5A6A8A] text-[clamp(7px,0.85vw,10px)]">
              Platform Director
            </p>
          </div>
        </div>

        <p className="text-[6.5px] text-[#9AA5BE] mt-2">
          Issued on {fmt(data.issued_at)} · Verify at educonnect.app/verify-certificate/
          {data.certificate_number}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Public verification page — fetches by token from the real,        */
/*  unauthenticated verify endpoint and wraps the template above with  */
/*  the app chrome + not-found/revoked states.                         */
/* ------------------------------------------------------------------ */

export function CertificateVerification({
  token,
  onHome,
}: {
  token: string;
  onHome: () => void;
}) {
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/certificates/verify/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.detail || "Certificate not found");
        return body as CertificateData;
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Certificate not found"));
  }, [token]);

  return (
    <div
      className="min-h-screen bg-[#F2F5FC] flex flex-col"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <header className="bg-[#1B3A6B] text-white">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <GraduationCap size={18} />
            </span>
            <div>
              <p className="text-[14px] font-semibold">EduConnect</p>
              <p className="text-[10px] text-white/50">Certificate Verification</p>
            </div>
          </div>
          <button
            onClick={onHome}
            className="px-3 py-2 rounded-xl bg-white/10 text-[11px]"
          >
            Go to Home
          </button>
        </div>
      </header>
      <main className="flex-1 px-5 py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {!data && !error && (
            <div className="bg-white border border-[rgba(27,58,107,0.08)] rounded-3xl shadow-sm py-20 text-center text-[13px] text-[#5A6A8A]">
              Verifying certificate…
            </div>
          )}
          {error && (
            <div className="bg-white border border-[rgba(27,58,107,0.08)] rounded-3xl shadow-sm p-10 text-center">
              <span className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-600" />
              </span>
              <h1 className="text-[22px] font-semibold text-[#0F1C3F] mt-5">
                Certificate not found
              </h1>
              <p className="text-[13px] text-[#5A6A8A] mt-2">{error}</p>
            </div>
          )}
          {data && (
            <div className="space-y-4">
              <CertificateTemplate data={data} />
              {!data.is_valid && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[12.5px] text-center">
                  {data.revocation_reason ||
                    "This certificate has been revoked or superseded."}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="pb-8 text-center text-[10.5px] text-[#9AA5BE] flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} />
        Secure public verification
      </footer>
    </div>
  );
}
