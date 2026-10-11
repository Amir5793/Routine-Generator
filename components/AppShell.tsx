"use client";

/* ════════ پوستهٔ برنامه: هدر، تب‌ها، فوتر ════════ */

import { AppProvider, toggleTheme, useApp } from "@/components/Store";
import Generator from "@/components/Generator";
import RunTracker from "@/components/RunTracker";
import History from "@/components/History";
import SWRegister from "@/components/SWRegister";

function Shell() {
  const { tab, setTab } = useApp();
  return (
    <>
      <header>
        <div className="hrow">
          <div className="brand">
            <span className="dot">ر</span>
            <span>مولد روتین — Weekly OS</span>
          </div>
          <nav className="tabs" aria-label="بخش‌ها">
            <button id="t-gen" className={`tab ${tab === "gen" ? "on" : ""}`} onClick={() => setTab("gen")} type="button">
              مولد روتین
            </button>
            <button id="t-run" className={`tab ${tab === "run" ? "on" : ""}`} onClick={() => setTab("run")} type="button">
              اجرا و رصد
            </button>
            <button id="t-his" className={`tab ${tab === "his" ? "on" : ""}`} onClick={() => setTab("his")} type="button">
              تاریخچه
            </button>
          </nav>
          <a
            className="tab"
            href={process.env.NEXT_PUBLIC_COMPANION_URL ?? "http://localhost:3000"}
            title="داشبورد هفتگی (Weekly OS)"
          >
            رفتن به weekly-os
          </a>
          <button className="tab" onClick={toggleTheme} type="button">
            تم روشن/تیره
          </button>
        </div>
      </header>
      <main id="app">{tab === "gen" ? <Generator /> : tab === "run" ? <RunTracker /> : <History />}</main>
      <footer>چارچوب ثابت؛ روتین متغیر — همهٔ داده‌ها فقط در همین مرورگر ذخیره می‌شوند.</footer>
      <SWRegister />
    </>
  );
}

export default function AppShell() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
