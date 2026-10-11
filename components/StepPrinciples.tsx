"use client";

/* گام ۳ — اصول چهارگانه */

import { useApp } from "@/components/Store";
import { Vit } from "@/components/ui";
import { ANALYSIS_OPTIONS, BREC, REVIEWS } from "@/lib/data";
import { analysisLabel, prevMode, sultanTriggered } from "@/lib/engine";

export default function StepPrinciples() {
  const { draft, weeks, setDr } = useApp();
  const a = analysisLabel(draft, weeks);
  const pm = prevMode(draft, weeks);
  return (
    <>
      <h2>اصول چهارگانه — جای‌گذاری خودکار</h2>
      <p className="mut">
        این جدول‌ها از چارچوب محاسبه می‌شوند و ثابت‌اند؛ فقط مرور کن.{" "}
        {pm ? `هفتهٔ قبل ${pm === "exam" ? "آزمون ماز داشت" : "آزمون ماز نداشت"}.` : ""}
      </p>
      <p className="mut">
        <b>مرور کلاس‌های A (اصل ۲ — سقف ۴۸ ساعت):</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th>کلاس</th>
            <th>پایان</th>
            <th>مهلت مرور</th>
            <th>جای مرور</th>
          </tr>
          {REVIEWS.map((r, i) => (
            <tr key={i}>
              <td>
                {r[0]} {r[1]}
              </td>
              <td className="num">{r[2]}</td>
              <td className="num">{r[3]}</td>
              <td>{r[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mut" style={{ marginTop: 12 }}>
        <b>ضبط‌های B (اصل ۱ — پیش از جلسهٔ بعدی):</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th>درس</th>
            <th>پخش</th>
            <th>مهلت</th>
            <th>جای تماشا</th>
          </tr>
          {BREC.map((r, i) => (
            <tr key={i}>
              <td>{r[0]}</td>
              <td className="num">{r[1]}</td>
              <td>{r[2]}</td>
              <td>{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {a.auto ? (
        <Vit tone="ok" icon="✓">
          <b>منبع تحلیل شنبه (خودکار):</b> {a.txt}
        </Vit>
      ) : (
        <label className="fld" style={{ marginTop: 12 }}>
          <span>منبع تحلیل شنبه (اصل ۳ — هفتهٔ قبل آزمون ماز نداشت)</span>
          <select value={draft.analysisChoice} onChange={(ev) => setDr("analysisChoice", ev.target.value)}>
            <option value="">— انتخاب کن —</option>
            {ANALYSIS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      )}
      <Vit tone="ok" icon="✓">
        <b>قاعدهٔ یک روز اختلال (اصل ۴):</b> C حذف ← B به مهلت بعدی ← A و خواب محفوظ ← جبران در
        پنجشنبه/جمعه با ظرفیت واقعی.
      </Vit>
      {Object.values(draft.events.holidays).some(Boolean) && (
        <Vit tone="warn" icon="!">
          تعطیلی داری — هر جای‌گذاری که روی روز تعطلی می‌افتد، طبق نردبان به اولین اسلات بازِ قبل از
          مهلت منتقل می‌شود (در فایل خروجی همین‌طور درج شده).
        </Vit>
      )}
      {sultanTriggered(weeks) && (
        <Vit tone="warn" icon="!">
          فرمانروا فعال است — در گام ۴ اعمال کن.
        </Vit>
      )}
    </>
  );
}
