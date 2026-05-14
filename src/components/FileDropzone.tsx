import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, X, FileQuestion } from "lucide-react";

export interface PreparedFile {
  name: string;
  type: string;
  size: number;
  data_base64?: string;
  text?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const i = s.indexOf("base64,");
      resolve(i >= 0 ? s.slice(i + 7) : s);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function prepare(file: File): Promise<PreparedFile> {
  const base: PreparedFile = { name: file.name, type: file.type || "application/octet-stream", size: file.size };
  // Text-ish
  if (file.type.startsWith("text/") || /\.(txt|md|eml|csv|html?)$/i.test(file.name)) {
    try {
      base.text = await file.text();
      return base;
    } catch {}
  }
  // Image — send base64 to Gemini vision
  if (file.type.startsWith("image/")) {
    base.data_base64 = await fileToBase64(file);
    return base;
  }
  // PDF and other binaries — send filename only; AI will reason from name + other docs
  // (We avoid heavy PDF parsers in the worker runtime.)
  return base;
}

const ACCEPT = "image/*,application/pdf,.pdf,.txt,.eml,.md,.csv,.html,.htm";

function fileIcon(type: string, name: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
  if (type === "application/pdf" || /\.pdf$/i.test(name)) return <FileText className="h-4 w-4" />;
  if (type.startsWith("text/")) return <FileText className="h-4 w-4" />;
  return <FileQuestion className="h-4 w-4" />;
}

export function FileDropzone({
  files,
  onChange,
  disabled,
}: {
  files: PreparedFile[];
  onChange: (next: PreparedFile[]) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const accept = useCallback(
    async (incoming: FileList | File[]) => {
      setBusy(true);
      const arr = Array.from(incoming).slice(0, 15 - files.length);
      const prepared = await Promise.all(arr.map(prepare));
      onChange([...files, ...prepared]);
      setBusy(false);
    },
    [files, onChange]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (disabled) return;
          if (e.dataTransfer.files?.length) accept(e.dataTransfer.files);
        }}
        onClick={() => !disabled && ref.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed bg-surface/60 px-8 py-14 text-center transition-all ${
          drag ? "border-primary bg-primary/5" : "border-border-strong hover:border-foreground/40"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="absolute inset-0 -z-0 bg-aurora opacity-50 transition-opacity group-hover:opacity-80" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="rounded-xl border border-border bg-surface p-3 shadow-soft">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drop your insurance chaos here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDFs, screenshots, photos, emails, renewal notices, WhatsApp shots — anything insurance-related
            </p>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
            {busy ? "Reading files…" : "Click or drag · up to 15 files"}
          </p>
        </div>
        <input
          ref={ref}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files && accept(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                {fileIcon(f.type, f.name)}
              </span>
              <span className="min-w-0 flex-1 truncate" title={f.name}>
                {f.name}
              </span>
              <span className="text-[11px] text-muted-foreground">{Math.max(1, Math.round(f.size / 1024))} KB</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, j) => j !== i))}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
