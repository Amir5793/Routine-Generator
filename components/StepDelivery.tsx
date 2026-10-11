"use client";

/* گام ۶ — تحویل */

import { useApp } from "@/components/Store";
import { Btn, Vit } from "@/components/ui";
import { validate } from "@/lib/engine";
import { buildMD } from "@/lib/md";

export default function StepDelivery() {
  const { draft, weeks, startWeek } = useApp();
  const ok = !validate(draft, weeks).some((x) => !x.ok);
  const md = buildMD(draft, weeks);

  const doDownload = () => {
    const b = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `Routine-W${String(draft.n).padStart(2, "0")}-${draft.mode === "exam" ? "exam" : "regular"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const doCopy = () => {
    navigator.clipboard.writeText(md).then(() => alert("روتین کپی شد."));
  };

  return (
    <>
      <h2>تحویل</h2>
      {!ok && (
        <Vit tone="bad" icon="✗">
          اعتبارسنجی ناکام — به گام ۵ برگرد.
        </Vit>
      )}
      <div className="row noprint">
        <Btn onClick={doDownload} disabled={!ok}>
          دانلود فایل روتین (MD)
        </Btn>
        <Btn variant="gh" onClick={doCopy}>
          کپی متن
        </Btn>
        <Btn variant="ok" onClick={startWeek} disabled={!ok}>
          شروع هفته (فعال‌سازی رصد)
        </Btn>
        <Btn variant="gh" onClick={() => window.print()}>
          چاپ
        </Btn>
      </div>
      <pre id="md">{md}</pre>
    </>
  );
}
