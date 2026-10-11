"use client";

/* گام ۵ — اعتبارسنجی */

import { useApp } from "@/components/Store";
import { Vit } from "@/components/ui";
import { validate } from "@/lib/engine";

export default function StepValidation() {
  const { draft, weeks } = useApp();
  const v = validate(draft, weeks);
  return (
    <>
      <h2>اعتبارسنجی</h2>
      <p className="mut">دروازهٔ قبل از تولید. موارد قرمز مانع تولید هستند.</p>
      {v.map((x, i) => (
        <Vit key={i} tone={x.ok ? (x.warn ? "warn" : "ok") : "bad"} icon={x.ok ? "✓" : "✗"}>
          {x.t}
        </Vit>
      ))}
    </>
  );
}
