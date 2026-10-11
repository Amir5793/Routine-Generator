"use client";

/* ════════ ثبت Service Worker + به‌روزرسانی بی‌دردسر ════════ */

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing) return; // جلوگیری از حلقهٔ reload
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          // اگر نسخهٔ جدیدتر منتظر است، همین حالا فعالش کن
          if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
          reg.addEventListener("updatefound", () => {
            const nw = reg.installing;
            if (!nw) return;
            nw.addEventListener("statechange", () => {
              if (nw.state === "installed" && navigator.serviceWorker.controller)
                nw.postMessage({ type: "SKIP_WAITING" });
            });
          });
        })
        .catch(() => {
          /* ثبت نشد — برنامه عادی کار می‌کند */
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);

    // چک کردن نسخهٔ جدید هنگام برگشت به تب
    const onVisible = () => {
      if (document.visibilityState === "visible")
        navigator.serviceWorker.getRegistration().then((r) => r?.update().catch(() => {}));
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
