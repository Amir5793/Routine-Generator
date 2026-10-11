"use client";

/* گام ۴ — سهمیه‌ها و بار */

import { useApp } from "@/components/Store";
import { Btn } from "@/components/ui";
import { SACRIFICE, SUBJECTS } from "@/lib/data";
import { capacity, loads, sultanTriggered, totK, totL } from "@/lib/engine";
import { fa } from "@/lib/format";

function loadBox(draft: Parameters<typeof loads>[0]) {
  const { L, K } = loads(draft);
  const cap = capacity(draft);
  const p = Math.min(150, Math.round((K / (cap * 0.8)) * 100));
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span>
          بار K: <b>{fa(Math.round(K))}</b> دقیقه از ظرفیت <b>{fa(Math.round(cap))}</b>′
        </span>
        <span>
          سقف ۸۰٪: <b>{fa(Math.round(cap * 0.8))}</b>′
        </span>
      </div>
      <div className="meter">
        <i
          style={{
            width: `${Math.min(100, p)}%`,
            background: p > 100 ? "var(--bad)" : p > 85 ? "var(--warn)" : undefined,
          }}
        />
      </div>
      <p className="mut">
        بار L: {fa(Math.round(L))}′ · اشغال سقف: {fa(p)}٪{" "}
        {p > 100 ? "— بیش از حد!" : p > 85 ? "— نزدیک سقف" : "— مناسب"}
      </p>
    </>
  );
}

export default function StepQuotas() {
  const { draft, setQ, copyLast, scaleQ, applySultan, weeks } = useApp();
  return (
    <>
      <h2>سهمیه‌ها (L / K)</h2>
      <p className="mut">
        L = لازم (عقد)، K = کافی (هدف). اعداد پیشنهادی‌اند؛ بار باید زیر ۸۰٪ ظرفیت بماند.
      </p>
      <div id="loadbox">{loadBox(draft)}</div>
      <table>
        <tbody>
          <tr>
            <th>درس</th>
            <th>L</th>
            <th>K</th>
          </tr>
          {SUBJECTS.map((s) => {
            const q = draft.quotas[s.id];
            return (
              <tr key={s.id}>
                <td>{s.n}</td>
                <td>
                  <input
                    className="n"
                    type="number"
                    min={0}
                    value={q.L}
                    onChange={(ev) => setQ(s.id, "L", ev.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="n"
                    type="number"
                    min={0}
                    value={q.K}
                    onChange={(ev) => setQ(s.id, "K", ev.target.value)}
                  />
                </td>
              </tr>
            );
          })}
          <tr>
            <th>جمع</th>
            <th className="num">{fa(totL(draft))}</th>
            <th className="num">{fa(totK(draft))}</th>
          </tr>
        </tbody>
      </table>
      <div className="row" style={{ marginTop: 12 }}>
        <Btn variant="gh" onClick={copyLast}>
          کپی سهمیه‌های هفتهٔ قبل
        </Btn>
        {draft.events.schoolExam && (
          <Btn variant="gh" onClick={() => scaleQ(0.6)}>
            بار سبک ۶۰٪ (امتحان مدرسه)
          </Btn>
        )}
        {sultanTriggered(weeks) && !draft.sultanApplied && (
          <Btn variant="dn" onClick={applySultan}>
            اعمال فرمانروا (−۲۰٪)
          </Btn>
        )}
      </div>
      <p className="mut" style={{ marginTop: 12 }}>
        ترتیب قربانی‌ها (پیش‌فرض؛ در فایل خروجی قابل ویرایش): {SACRIFICE.join(" ← ")}
      </p>
    </>
  );
}
