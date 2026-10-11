"use client";

/* گام ۲ — زمینهٔ هفته */

import { useApp } from "@/components/Store";
import { Check, Field, Vit } from "@/components/ui";
import { PHASE_NAMES } from "@/lib/data";
import { dayName } from "@/lib/data";
import { fa } from "@/lib/format";

const HOL_DAYS = ["sat", "sun", "mon", "tue", "wed"] as const;
const ASATIDE_DAYS = ["thu", "wed", "sat"] as const;

export default function StepContext() {
  const { draft, setDr, setEv, setHol } = useApp();
  const e = draft.events;
  const sug = draft.mode === "exam" && Number(draft.status.backlog) > 25;
  return (
    <>
      <h2>زمینهٔ هفته</h2>
      <div className="grid">
        <Field label="فاز">
          <select
            value={draft.phase}
            onChange={(ev) => setDr("phase", Number(ev.target.value))}
          >
            {PHASE_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                فاز {fa(i + 1)} — {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="حالت هفته">
          <select
            value={draft.mode}
            onChange={(ev) => setDr("mode", ev.target.value as "exam" | "regular")}
          >
            <option value="exam">هفتهٔ آزمون ماز (جمعه)</option>
            <option value="regular">هفتهٔ بدون آزمون ماز</option>
          </select>
        </Field>
        <Field label="تاریخ شروع هفته (اختیاری)">
          <input
            value={draft.startDate}
            placeholder="مثلاً شنبه ۱۸ مهر ۱۴۰۵"
            onChange={(ev) => setDr("startDate", ev.target.value)}
          />
        </Field>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <Check
          id="as"
          label="آزمون اساتید این هفته دارم"
          checked={e.asatide}
          onChange={(v) => setEv("asatide", v)}
        />
        <Check
          id="se"
          label="هفتهٔ امتحان مدرسه است"
          checked={e.schoolExam}
          onChange={(v) => setEv("schoolExam", v)}
        />
      </div>
      {e.asatide && (
        <div className="grid">
          <Field label="روز آزمون اساتید">
            <select
              value={e.asatideDay}
              onChange={(ev) => setEv("asatideDay", ev.target.value as "thu" | "wed" | "sat")}
            >
              {ASATIDE_DAYS.map((d) => (
                <option key={d} value={d}>
                  {dayName(d)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ساعت">
            <input value={e.asatideTime} onChange={(ev) => setEv("asatideTime", ev.target.value)} />
          </Field>
        </div>
      )}
      <p className="mut" style={{ margin: "12px 0 4px" }}>
        تعطیلی مدرسه (اگر هست):
      </p>
      <div className="row">
        {HOL_DAYS.map((k) => (
          <Check
            key={k}
            id={`h-${k}`}
            label={dayName(k)}
            checked={e.holidays[k]}
            onChange={(v) => setHol(k, v)}
          />
        ))}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <Check
          id="lc"
          label="حذف زبان C این هفته"
          checked={draft.langCut}
          onChange={(v) => setDr("langCut", v)}
        />
      </div>
      {sug && !draft.langCut && (
        <Vit tone="warn" icon="!">
          پیشنهاد: هفتهٔ آزمون + بک‌لاگ {fa(draft.status.backlog)}تایی → حذف زبان C (طبق تعریف C در
          چارچوب).
        </Vit>
      )}
      {e.schoolExam && (
        <Vit tone="warn" icon="!">
          هفتهٔ امتحان مدرسه: در گام ۴ دکمهٔ «بار سبک ۶۰٪» را بزن.
        </Vit>
      )}
    </>
  );
}
