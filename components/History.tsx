"use client";

/* ════════ رابط: تاریخچه ════════ */

import { useApp } from "@/components/Store";
import { Btn } from "@/components/ui";
import { fa } from "@/lib/format";

export default function History() {
  const { weeks, wipe } = useApp();
  const ks = weeks.filter((w) => w.summary).map((w) => w.summary!.k);
  return (
    <>
      <h1>تاریخچه</h1>
      <div className="card">
        {!weeks.length ? (
          <p className="mut">هنوز هفته‌ای ثبت نشده.</p>
        ) : (
          <>
            <table>
              <tbody>
                <tr>
                  <th>هفته</th>
                  <th>حالت</th>
                  <th>فاز</th>
                  <th>K ٪</th>
                  <th>انرژی</th>
                  <th>L</th>
                  <th>بک‌لاگ</th>
                  <th>وضعیت</th>
                </tr>
                {weeks.slice(-12).map((w) => (
                  <tr key={w.n}>
                    <td>{fa(w.n)}</td>
                    <td>{w.mode === "exam" ? "آزمون" : "بدون"}</td>
                    <td>{fa(w.phase)}</td>
                    <td className="num">{w.summary ? fa(w.summary.k) + "٪" : "—"}</td>
                    <td className="num">{w.summary ? fa(w.summary.energy) : "—"}</td>
                    <td className="num">{w.summary ? fa(w.summary.lDays) + "/۷" : "—"}</td>
                    <td className="num">{w.summary ? fa(w.summary.backlogFinal) : "—"}</td>
                    <td>{w.closed ? "بسته" : "فعال"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ks.length > 0 && (
              <>
                <p className="mut" style={{ marginTop: 12 }}>
                  روند K هفته‌به‌هفته:
                </p>
                <div className="bars">
                  {ks.map((k, i) => (
                    <i key={i} style={{ height: Math.max(4, k) }} title={`${k}٪`} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="row">
        <Btn variant="dn" onClick={wipe}>
          پاک‌کردن همهٔ داده‌ها
        </Btn>
      </div>
    </>
  );
}
