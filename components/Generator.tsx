"use client";

/* ════════ رابط: مولد روتین ════════ */

import { useApp } from "@/components/Store";
import { Btn, Vit } from "@/components/ui";
import StepStatus from "@/components/StepStatus";
import StepContextScreen from "@/components/StepContext";
import StepPrinciples from "@/components/StepPrinciples";
import StepQuotas from "@/components/StepQuotas";
import StepValidation from "@/components/StepValidation";
import StepDelivery from "@/components/StepDelivery";
import { STEPS } from "@/lib/data";
import { analysisLabel, validate } from "@/lib/engine";
import { fa } from "@/lib/format";

const STEP_SCREENS = [
  StepStatus,
  StepContextScreen,
  StepPrinciples,
  StepQuotas,
  StepValidation,
  StepDelivery,
];

export default function Generator() {
  const { draft, weeks, step, setStep } = useApp();
  const Screen = STEP_SCREENS[step - 1];

  const goStep = (i: number) => setStep(i);
  const next = () => {
    if (step === 3 && !analysisLabel(draft, weeks).txt) {
      alert("منبع تحلیل شنبه را انتخاب کن.");
      return;
    }
    if (step === 5 && validate(draft, weeks).some((x) => !x.ok)) {
      alert("اول همهٔ موارد قرمز گام ۵ را حل کن.");
      return;
    }
    setStep(step + 1);
  };

  return (
    <>
      <h1>مولد روتین هفتهٔ {fa(draft.n)}</h1>
      <p className="mut">
        فقط مقادیر متغیر را وارد کن؛ قفل‌ها، مهلت‌ها و جای‌گذاری‌ها از چارچوب محاسبه می‌شوند. خروجی:
        فایل Markdown روتین همین هفته.
      </p>
      {draft.started && (
        <Vit tone="warn" icon="!">
          این روتین شروع شده و در حال اجراست. تولید مجدد، روتین را بازنویسی می‌کند — رصد در تب «اجرا و
          رصد».
        </Vit>
      )}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <button
            key={s}
            className={`st ${step === i + 1 ? "on" : ""} ${step > i + 1 ? "done" : ""}`}
            onClick={() => goStep(i + 1)}
            type="button"
          >
            <span className="n">{step > i + 1 ? "✓" : fa(i + 1)}</span>
            {s}
          </button>
        ))}
      </div>
      <div className="card">
        <Screen />
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        {step > 1 && (
          <Btn variant="gh" onClick={() => goStep(step - 1)}>
            مرحلهٔ قبل
          </Btn>
        )}
        {step < 6 && <Btn onClick={next}>مرحلهٔ بعد</Btn>}
      </div>
    </>
  );
}
