import { useEffect, useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CertificateData {
  certificate_number: string;
  student_name: string;
  course_title: string;
  conducted_from: string; // ISO date
  conducted_to: string; // ISO date
  issued_at: string; // ISO date
  issuer_name?: string; // e.g. institution/company name
  issuer_signatory_1_name?: string;
  issuer_signatory_1_title?: string;
  issuer_signatory_2_name?: string;
  issuer_signatory_2_title?: string;
}

/* ------------------------------------------------------------------ */
/*  Presentational certificate — pure, no fetching                    */
/*  Reuse this anywhere you already have the data (e.g. admin preview, */
/*  bulk-issue screen, PDF export) without needing the wrapper below.  */
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
      {/* corner frame accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[6%] h-full bg-[#1B3A6B]" />
        <div className="absolute top-0 right-0 w-[6%] h-full bg-[#1B3A6B]" />
        <div className="absolute top-0 left-0 w-full h-[3%] bg-[#1B3A6B]" />
        <div className="absolute bottom-0 left-0 w-full h-[3%] bg-[#1B3A6B]" />
        <div className="absolute top-0 right-[6%] w-[26%] h-[4%] bg-[#D9A441]" />
        <div className="absolute bottom-0 left-0 w-[22%] h-[4%] bg-[#D9A441]" />
      </div>

      <div className="relative h-full flex flex-col items-center text-center px-[8%] py-[4%]">
        {/* brand */}
        <div className="flex items-center gap-2 mt-2">
          <span className="w-8 h-8 rounded-lg bg-[#1B3A6B] text-white flex items-center justify-center">
            <Award size={16} />
          </span>
          <div className="text-left">
            <p className="text-[#1B3A6B] font-bold tracking-wide text-[13px] leading-none">
              EDUCONNECT
            </p>
            <p className="text-[#5A6A8A] text-[8px] leading-none mt-0.5">
              {data.issuer_name || "EduConnect Platform"}
            </p>
          </div>
        </div>

        {/* title */}
        <h1 className="text-[#1B3A6B] font-extrabold tracking-wide mt-4 leading-none text-[clamp(20px,4vw,40px)]">
          CERTIFICATE
        </h1>
        <p className="text-[#1B3A6B] text-[clamp(11px,1.6vw,18px)] mt-1">
          OF ACHIEVEMENT
        </p>

        <p className="text-[#1B3A6B] font-bold text-[clamp(9px,1.1vw,13px)] tracking-wide mt-4">
          THIS CERTIFICATE IS PRESENTED TO
        </p>

        {/* student name — from logged-in user */}
        <div className="mt-3 border-b-2 border-[#1B3A6B] pb-1 min-w-[55%]">
          <p className="text-[#0F1C3F] font-serif italic font-semibold text-[clamp(16px,2.6vw,30px)]">
            {data.student_name}
          </p>
        </div>

        <p className="italic font-semibold text-[#1B3A6B] mt-3 text-[clamp(10px,1.3vw,15px)]">
          From {data.issuer_name || "EduConnect Platform"}
        </p>

        {/* course — from student's enrollment */}
        <p className="text-[#0F1C3F] mt-2 max-w-[80%] text-[clamp(9px,1.2vw,14px)] leading-snug">
          In recognition of the effort and achievement in successfully
          completing the
          <span className="font-semibold"> {data.course_title} </span>
          program.
        </p>

        {/* dates */}
        <div className="flex items-center gap-6 mt-3 text-[clamp(8px,1vw,12px)] text-[#1B3A6B] font-semibold">
          <span className="flex items-center gap-1">
            Conducted From{" "}
            <span className="border-b border-[#1B3A6B] px-2">
              {fmt(data.conducted_from)}
            </span>
          </span>
          <span className="flex items-center gap-1">
            To{" "}
            <span className="border-b border-[#1B3A6B] px-2">
              {fmt(data.conducted_to)}
            </span>
          </span>
        </div>

        {/* signatures + seal */}
        <div className="flex items-end justify-between w-full mt-auto pt-4">
          <div className="text-left">
            <div className="border-b border-[#1B3A6B] w-32 mb-1" />
            <p className="text-[#0F1C3F] font-bold text-[clamp(8px,1vw,12px)]">
              {data.issuer_signatory_1_name || "—"}
            </p>
            <p className="text-[#5A6A8A] text-[clamp(7px,0.85vw,10px)]">
              {data.issuer_signatory_1_title || "Authorized Signatory"}
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
              {data.issuer_signatory_2_name || "—"}
            </p>
            <p className="text-[#5A6A8A] text-[clamp(7px,0.85vw,10px)]">
              {data.issuer_signatory_2_title || "Authorized Signatory"}
            </p>
          </div>
        </div>

        <p className="text-[6.5px] text-[#9AA5BE] mt-2">
          Issued on {fmt(data.issued_at)} · Verify at educonnect.app/verify/
          {data.certificate_number}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wrapper — pulls the name from the logged-in user and the course   */
/*  from that student's enrollment, then renders the template above.  */
/*                                                                      */
/*  Adjust the two endpoint paths to whatever your backend actually    */
/*  exposes — these are the natural fits given your existing routes:   */
/*   GET /api/v1/users/me            -> { full_name, ... }             */
/*   GET /api/v1/enrollments/me      -> { course_title, batch_id, ... }*/
/*  If you already have this data in an AuthContext / query cache,     */
/*  skip this wrapper and pass the fields straight into                */
/*  <CertificateTemplate data={...} /> instead.                        */
/* ------------------------------------------------------------------ */

export function MyCertificate({ token }: { token: string }) {
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/api/v1/users/me`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/api/v1/enrollments/me`, { headers }).then((r) =>
        r.json(),
      ),
      fetch(`${API_URL}/api/v1/certificates/me`, { headers }).then((r) =>
        r.json(),
      ),
    ])
      .then(([user, enrollment, certificate]) => {
        setData({
          certificate_number: certificate.certificate_number,
          student_name: user.full_name,
          course_title: enrollment.course_title,
          conducted_from: enrollment.start_date,
          conducted_to: enrollment.end_date,
          issued_at: certificate.issued_at,
          issuer_name: certificate.issuer_name,
          issuer_signatory_1_name: certificate.issuer_signatory_1_name,
          issuer_signatory_1_title: certificate.issuer_signatory_1_title,
          issuer_signatory_2_name: certificate.issuer_signatory_2_name,
          issuer_signatory_2_title: certificate.issuer_signatory_2_title,
        });
      })
      .catch(() =>
        setError("Couldn't load your certificate. Please try again later."),
      );
  }, [token]);

  if (error) {
    return (
      <p className="text-center text-[13px] text-red-600 py-10">{error}</p>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[#5A6A8A] text-[13px]">
        <Loader2 size={16} className="animate-spin" /> Loading your certificate…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <CertificateTemplate data={data} />
      <div className="flex justify-center mt-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B3A6B] text-white text-[12px] font-medium"
        >
          <Download size={14} /> Download / Print
        </button>
      </div>
    </div>
  );
}
