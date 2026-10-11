"use client";

/* ════════ رابط: اجرا و رصد ════════ */

import { useState } from "react";
import { useApp } from "@/components/Store";
import { Btn, Field } from "@/components/ui";
import { DAYS } from "@/lib/data";
import { fa } from "@/lib/format";
import type { Summary } from "@/lib/types";

function sumBox(s: Summary) {
  return (
    <>
      <table>
        <tbody>
          <tr>
            <th>K میانگین</th>
            <th>انرژی</th>
            <th>روزهای L</th>
            <th>بک‌لاگ پایانی</th>
          </tr>
          <tr>
            <td className="num">{fa(s.k)}٪</td>
            <td className="num">{fa(s.energy)}</td>
            <td className="num">
              {fa(s.lDays)}/۷
            </td>
            <td className="num">{fa(s.backlogFinal)}</td>
          </tr>
        </tbody>
      </table>
      {s.k < 60 && (
        <div className="vit warn">
          <span className="ic">!</span>
          <span>K زیر ۶۰٪ — اگر هفتهٔ قبل هم زیر ۶۰ بود، فرمانروا در مولد هفتهٔ بعد فعال می‌شود.</span>
        </div>
      )}
      {s.k >= 90 && (
        <div className="vit ok">
          <span className="ic">✓</span>
          <span>K بالای ۹۰٪ — هفتهٔ بعد ۱۰٪ می‌توانی اضافه کنی.</span>
        </div>
      )}
    </>
  );
}

export default function RunTracker() {
  const { draft, weeks, setTab, tset, makeSummary, closeWeek } = useApp();
  const w = weeks.find((x) => !x.closed);
  const [bkFinal, setBkFinal] = useState<string | null>(null);

  if (!w)
    return (
      <>
        <h1>اجرا و رصد</h1>
        <div className="card">
          <p>هفتهٔ فعالی در اجرا نیست. از «مولد روتین» روتین بساز و «شروع هفته» را بزن.</p>
          <Btn onClick={() => setTab("gen")}>برو به مولد</Btn>
        </div>
      </>
    );

  const bkValue = bkFinal ?? String(w.summary ? w.summary.backlogFinal : draft.status.backlog);

  return (
    <>
      <h1>اجرا و رصد — هفتهٔ {fa(w.n)}</h1>
      <p className="mut">
        هر شب ۳۰ ثانیه: L کامل شد؟ چند درصد K؟ انرژی؟ یک خط واقعیت. همین تعداد، جمع‌بندی پنجشنبه را
        می‌سازد.
      </p>
      <div className="card">
        <table>
          <tbody>
            <tr>
              <th>روز</th>
              <th>L کامل</th>
              <th>K ٪</th>
              <th>انرژی /۵</th>
              <th>یک خط واقعیت</th>
            </tr>
            {w.tracking.map((t, i) => (
              <tr key={DAYS[i].k}>
                <td>{DAYS[i].n}</td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    style={{ width: 20, height: 20, minHeight: 0 }}
                    checked={t.l}
                    onChange={(ev) => tset(i, "l", ev.target.checked)}
                  />
                </td>
                <td>
                  <input
                    className="n"
                    type="number"
                    min={0}
                    max={100}
                    value={t.k}
                    onChange={(ev) => tset(i, "k", ev.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="n"
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={t.e}
                    onChange={(ev) => tset(i, "e", ev.target.value)}
                  />
                </td>
                <td>
                  <input value={t.note || ""} onChange={(ev) => tset(i, "note", ev.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>جمع‌بندی هفتگی</h2>
        <Field label="بک‌لاگ فیزیک پایانی هفته (تست)">
          <input
            className="n"
            type="number"
            min={0}
            value={bkValue}
            onChange={(ev) => setBkFinal(ev.target.value)}
          />
        </Field>
        <div className="row">
          <Btn onClick={() => makeSummary(Math.max(0, parseInt(bkValue) || 0))}>
            محاسبهٔ جمع‌بندی
          </Btn>
          {w.summary && (
            <Btn variant="ok" onClick={closeWeek}>
              بستن هفته و ساخت پیش‌نویس هفتهٔ {fa(w.n + 1)}
            </Btn>
          )}
        </div>
        <div id="sumbox">{w.summary && sumBox(w.summary)}</div>
      </div>
    </>
  );
}
