import { lazy, Suspense } from "react";

const Editor = lazy(() =>
  import("@monaco-editor/react").then((m) => ({ default: m.default })),
);

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  height = "320px",
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-slate-200"
      style={{ height }}
    >
      <Suspense
        fallback={
          <div
            className="flex items-center justify-center text-[12.5px] text-[#9AA5BE] bg-[#1e1e1e]"
            style={{ height }}
          >
            Loading editor…
          </div>
        }
      >
        <Editor
          height={height}
          language={language}
          theme="vs-dark"
          value={value}
          onChange={(next) => onChange(next || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
            tabSize: 2,
          }}
        />
      </Suspense>
    </div>
  );
}
