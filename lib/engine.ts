/* ════════ موتور محاسبه (منطق خالص، بدون UI) ════════
   Ported 1:1 from the original HTML global functions. */

import type { Draft, ValidItem, Week } from "./types";
import { CAP, MPT, SUBJECTS, dayName } from "./data";
import { fa as fa_ } from "./format";

export function newDraft(n: number, weeks: Week[]): Draft {
  const last = weeks[weeks.length - 1] || null;
  const s = last && last.summary;
  return {
    n,
    phase: last ? last.phase : 1,
    mode: last ? (last.mode === "exam" ? "regular" : "exam") : "exam",
    startDate: "",
    started: false,
    status: {
      k: s ? String(s.k) : "",
      energy: s ? String(s.energy) : "",
      lDays: s ? String(s.lDays) : "",
      backlog: s ? String(s.backlogFinal) : "0",
      debts: { a: false, b: false, an: false },
      note: "",
    },
    events: {
      asatide: false,
      asatideDay: "thu",
      asatideTime: "09:00–12:00",
      holidays: { sat: false, sun: false, mon: false, tue: false, wed: false },
      schoolExam: false,
    },
    quotas: Object.fromEntries(SUBJECTS.map((x) => [x.id, { L: x.def[0], K: x.def[1] }])),
    analysisChoice: "",
    sultanApplied: false,
    langCut: false,
  };
}

export function prevMode(draft: Draft, weeks: Week[]): "exam" | "regular" | null {
  const p = weeks.find((w) => w.n === draft.n - 1);
  return p ? p.mode : null;
}

export function analysisLabel(draft: Draft, weeks: Week[]): { auto: boolean; txt: string } {
  const pm = prevMode(draft, weeks);
  if (pm === "exam") return { auto: true, txt: "آزمون ماز جمعهٔ قبل" };
  return { auto: false, txt: draft.analysisChoice || "" };
}

export function sultanTriggered(weeks: Week[]): boolean {
  const c = weeks.filter((w) => w.closed && w.summary);
  if (c.length < 2) return false;
  const [a, b] = c.slice(-2);
  return a.summary!.k < 60 && b.summary!.k < 60;
}

export function loads(draft: Draft): { L: number; K: number } {
  let L = 0,
    K = 0;
  for (const s of SUBJECTS) {
    const q = draft.quotas[s.id];
    L += Number(q.L) * MPT[s.cat];
    K += Number(q.K) * MPT[s.cat];
  }
  return { L: L * 1.3, K: K * 1.3 };
}

export function capacity(draft: Draft): number {
  let t = 0;
  for (const [k, sc] of Object.entries(CAP)) {
    t += sc[0] + sc[1];
    if (draft.events.holidays[k as keyof typeof draft.events.holidays]) {
      t = t - sc[0] + 120;
    }
  }
  if (draft.events.schoolExam) t *= 0.6;
  return t;
}

export function totL(draft: Draft): number {
  return SUBJECTS.reduce((a, s) => a + Number(draft.quotas[s.id].L), 0);
}

export function totK(draft: Draft): number {
  return SUBJECTS.reduce((a, s) => a + Number(draft.quotas[s.id].K), 0);
}

/* ════════ اعتبارسنجی ════════ */
export function validate(draft: Draft, weeks: Week[]): ValidItem[] {
  const v: ValidItem[] = [];
  const { K } = loads(draft);
  const cap = capacity(draft);
  v.push({
    ok: K <= cap * 0.8,
    t: `بار K: ${fa_(Math.round(K))}′ از ظرفیت ${fa_(Math.round(cap))}′ — سقف ۸۰٪ = ${fa_(Math.round(cap * 0.8))}′`,
  });
  const bad = SUBJECTS.filter((s) => Number(draft.quotas[s.id].K) < Number(draft.quotas[s.id].L));
  if (bad.length)
    v.push({ ok: false, t: "K نباید از L کمتر باشد: " + bad.map((s) => s.n).join("، ") });
  const a = analysisLabel(draft, weeks);
  v.push({
    ok: !!a.txt,
    t: a.txt
      ? `منبع تحلیل شنبه: ${a.txt}${a.auto ? " (خودکار از حالت هفتهٔ قبل)" : ""}`
      : "منبع تحلیل شنبه مشخص نیست — در گام ۳ انتخاب کن",
  });
  v.push({ ok: true, t: "هر کلاس A یک مرور ≤۴۸ ساعته دارد (جدول گام ۳)" });
  v.push({ ok: true, t: "هر ضبط B جای و مهلت دارد (جدول گام ۳)" });
  v.push({
    ok: true,
    t: "خواب 23:30–06:30، ۸ ساعت جمعه و ورزش چهارشنبه محفوظند (تضمین ساختاری)",
  });
  if (sultanTriggered(weeks))
    v.push(
      draft.sultanApplied
        ? { ok: true, t: "فرمانروا اعمال شد (−۲۰٪ سهمیه‌ها)" }
        : {
            ok: false,
            t: "قاعدهٔ فرمانروا فعال است (دو هفتهٔ متوالی K<۶۰٪) — در گام ۴ اعمالش کن",
          },
    );
  const hol = Object.entries(draft.events.holidays).filter(([, x]) => x);
  if (hol.length)
    v.push({
      ok: true,
      warn: true,
      t: `تعطیلی ${hol.map(([k]) => dayName(k)).join("، ")} — تخصیص زنگ‌های مدرسهٔ این روزها طبق قاعدهٔ جابه‌جایی به اسلات باز می‌رود (در فایل خروجی اعمال و قابل ویرایش است)`,
    });
  return v;
}

