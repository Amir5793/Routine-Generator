"use client";

/* گام ۱ — وضعیت ورودی */

import { useApp } from "@/components/Store";
import { Check, Field } from "@/components/ui";

export default function StepStatus() {
  const { draft, setSt, setDeb } = useApp();
  const st = draft.status;
  return (
    <>
      <h2>وضعیت ورودی</h2>
      <p className="mut">اگر هفتهٔ قبل را بسته باشی، این مقادیر خودکار آمده‌اند؛ فقط تصحیح کن.</p>
      <div className="grid">
        <Field label="اجرای K هفتهٔ قبل (٪)">
          <input
            className="n"
            type="number"
            min={0}
            max={100}
            value={st.k}
            onChange={(ev) => setSt("k", ev.target.value)}
          />
        </Field>
        <Field label="انرژی میانگین (۱–۵)">
          <input
            className="n"
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={st.energy}
            onChange={(ev) => setSt("energy", ev.target.value)}
          />
        </Field>
        <Field label="روزهای L-کامل (۰–۷)">
          <input
            className="n"
            type="number"
            min={0}
            max={7}
            value={st.lDays}
            onChange={(ev) => setSt("lDays", ev.target.value)}
          />
        </Field>
        <Field label="بک‌لاگ فیزیک (تست)">
          <input
            className="n"
            type="number"
            min={0}
            value={st.backlog}
            onChange={(ev) => setSt("backlog", ev.target.value)}
          />
        </Field>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <Check id="da" label="مرور A جامانده" checked={st.debts.a} onChange={(v) => setDeb("a", v)} />
        <Check id="db" label="ضبط B جامانده" checked={st.debts.b} onChange={(v) => setDeb("b", v)} />
        <Check id="dn" label="تحلیل جامانده" checked={st.debts.an} onChange={(v) => setDeb("an", v)} />
      </div>
      <label className="fld">
        <span>یادداشت آزاد — یک خط واقعیت</span>
        <textarea rows={2} value={st.note} onChange={(ev) => setSt("note", ev.target.value)} />
      </label>
    </>
  );
}
