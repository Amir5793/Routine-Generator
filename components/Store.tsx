"use client";

/* ════════ فروشگاه وضعیت (Context + localStorage) ════════
   جایگزین state سراسری/متغیرهای گلوبال نسخهٔ HTML. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Draft, Quota, Status, Week } from "@/lib/types";
import { DAYS, K_D, K_T, K_W, SUBJECTS } from "@/lib/data";
import { load, save } from "@/lib/format";
import { newDraft } from "@/lib/engine";

type Tab = "gen" | "run" | "his";

interface AppCtx {
  draft: Draft;
  weeks: Week[];
  tab: Tab;
  step: number;
  ready: boolean;
  setTab: (t: Tab) => void;
  setStep: (n: number) => void;
  setSt: (k: keyof Status, v: string) => void;
  setDeb: (k: "a" | "b" | "an", v: boolean) => void;
  setDr: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  setEv: <K extends keyof Draft["events"]>(k: K, v: Draft["events"][K]) => void;
  setHol: (k: "sat" | "sun" | "mon" | "tue" | "wed", v: boolean) => void;
  setQ: (id: string, f: keyof Quota, v: string) => void;
  applySultan: () => void;
  scaleQ: (f: number) => void;
  copyLast: () => void;
  startWeek: () => void;
  tset: (i: number, k: "l" | "k" | "e" | "note", v: boolean | string) => void;
  makeSummary: (backlogFinal: number) => void;
  closeWeek: () => void;
  wipe: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [draft, setDraft] = useState<Draft>(() => newDraft(1, []));
  const [tab, setTab] = useState<Tab>("gen");
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);

  /* بارگذاری اولیه از localStorage (پس از هیدریشن، برای SSR امن) */
  useEffect(() => {
    const w = load<Week[]>(K_W, []);
    const n = w.length
      ? Math.max(...w.map((x) => x.n)) + (w.some((x) => !x.closed) ? 0 : 1)
      : 1;
    const d = load<Draft | null>(K_D, null) ?? newDraft(n, w);
    setWeeks(w);
    setDraft(d);
    setReady(true);
  }, []);

  /* پایدارسازی */
  useEffect(() => {
    if (ready) save(K_W, weeks);
  }, [weeks, ready]);
  useEffect(() => {
    if (ready) save(K_D, draft);
  }, [draft, ready]);

  const setSt = useCallback(
    (k: keyof Status, v: string) => setDraft((d) => ({ ...d, status: { ...d.status, [k]: v } })),
    [],
  );
  const setDeb = useCallback(
    (k: "a" | "b" | "an", v: boolean) =>
      setDraft((d) => ({ ...d, status: { ...d.status, debts: { ...d.status.debts, [k]: v } } })),
    [],
  );
  const setDr = useCallback(
    <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v })),
    [],
  );
  const setEv = useCallback(
    <K extends keyof Draft["events"]>(k: K, v: Draft["events"][K]) =>
      setDraft((d) => ({ ...d, events: { ...d.events, [k]: v } })),
    [],
  );
  const setHol = useCallback(
    (k: "sat" | "sun" | "mon" | "tue" | "wed", v: boolean) =>
      setDraft((d) => ({
        ...d,
        events: { ...d.events, holidays: { ...d.events.holidays, [k]: v } },
      })),
    [],
  );
  const setQ = useCallback(
    (id: string, f: keyof Quota, v: string) =>
      setDraft((d) => ({
        ...d,
        quotas: { ...d.quotas, [id]: { ...d.quotas[id], [f]: Math.max(0, parseInt(v) || 0) } },
      })),
    [],
  );

  const applySultan = useCallback(
    () =>
      setDraft((d) => ({
        ...d,
        sultanApplied: true,
        quotas: Object.fromEntries(
          SUBJECTS.map((s) => [
            s.id,
            { L: Math.round(d.quotas[s.id].L * 0.8), K: Math.round(d.quotas[s.id].K * 0.8) },
          ]),
        ),
      })),
    [],
  );
  const scaleQ = useCallback(
    (f: number) =>
      setDraft((d) => ({
        ...d,
        quotas: Object.fromEntries(
          SUBJECTS.map((s) => [
            s.id,
            { L: Math.round(d.quotas[s.id].L * f), K: Math.round(d.quotas[s.id].K * f) },
          ]),
        ),
      })),
    [],
  );
  const copyLast = useCallback(() => {
    const c = weeks.filter((w) => w.closed && w.quotas).pop();
    if (!c) {
      alert("هفتهٔ بسته‌ای برای کپی نیست.");
      return;
    }
    setDraft((d) => ({
      ...d,
      quotas: Object.fromEntries(
        SUBJECTS.map((s) => [
          s.id,
          c.quotas[s.id] ? { ...c.quotas[s.id] } : { L: s.def[0], K: s.def[1] },
        ]),
      ),
    }));
  }, [weeks]);

  const startWeek = useCallback(() => {
    setWeeks((ws) => {
      const rec: Week = {
        n: draft.n,
        mode: draft.mode,
        phase: draft.phase,
        quotas: draft.quotas,
        tracking: DAYS.map(() => ({ l: false, k: "", e: "", note: "" })),
        summary: null,
        closed: false,
      };
      const i = ws.findIndex((w) => w.n === draft.n);
      const nextWs = [...ws];
      if (i >= 0) nextWs[i] = rec;
      else nextWs.push(rec);
      return nextWs;
    });
    setDraft((d) => ({ ...d, started: true }));
    setTab("run");
  }, [draft.n, draft.mode, draft.phase, draft.quotas]);

  const tset = useCallback(
    (i: number, k: "l" | "k" | "e" | "note", v: boolean | string) =>
      setWeeks((ws) =>
        ws.map((w) =>
          w.closed
            ? w
            : { ...w, tracking: w.tracking.map((t, j) => (j === i ? { ...t, [k]: v } : t)) },
        ),
      ),
    [],
  );

  const makeSummary = useCallback(
    (backlogFinal: number) =>
      setWeeks((ws) =>
        ws.map((w) => {
          if (w.closed) return w;
          const ks = w.tracking.map((t) => parseFloat(t.k)).filter((x) => !isNaN(x));
          const es = w.tracking.map((t) => parseFloat(t.e)).filter((x) => !isNaN(x));
          return {
            ...w,
            summary: {
              k: ks.length ? Math.round(ks.reduce((a, b) => a + b, 0) / ks.length) : 0,
              energy: es.length ? +(es.reduce((a, b) => a + b, 0) / es.length).toFixed(1) : 0,
              lDays: w.tracking.filter((t) => t.l).length,
              backlogFinal: Math.max(0, backlogFinal || 0),
            },
          };
        }),
      ),
    [],
  );

  const closeWeek = useCallback(() => {
    const w = weeks.find((x) => !x.closed);
    if (!w) return;
    if (!w.summary) {
      alert("اول جمع‌بندی را محاسبه کن.");
      return;
    }
    const closedWeeks = weeks.map((x) => (x.n === w.n ? { ...x, closed: true } : x));
    setWeeks(closedWeeks);
    setDraft(newDraft(w.n + 1, closedWeeks));
    setStep(1);
    setTab("gen");
  }, [weeks]);

  const wipe = useCallback(() => {
    if (confirm("همهٔ هفته‌ها و پیش‌نویس پاک شود؟ برگشت‌پذیر نیست.")) {
      setWeeks([]);
      setDraft(newDraft(1, []));
      save(K_T, "light");
    }
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      draft,
      weeks,
      tab,
      step,
      ready,
      setTab,
      setStep,
      setSt,
      setDeb,
      setDr,
      setEv,
      setHol,
      setQ,
      applySultan,
      scaleQ,
      copyLast,
      startWeek,
      tset,
      makeSummary,
      closeWeek,
      wipe,
    }),
    [
      draft,
      weeks,
      tab,
      step,
      ready,
      setSt,
      setDeb,
      setDr,
      setEv,
      setHol,
      setQ,
      applySultan,
      scaleQ,
      copyLast,
      startWeek,
      tset,
      makeSummary,
      closeWeek,
      wipe,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function toggleTheme() {
  if (typeof document === "undefined") return;
  const h = document.documentElement;
  const d = h.getAttribute("data-theme") === "dark";
  h.setAttribute("data-theme", d ? "light" : "dark");
  save(K_T, d ? "light" : "dark");
}
