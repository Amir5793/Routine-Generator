/* Small presentational primitives shared by all screens (same class names as the HTML). */

import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="fld">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Check({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="chk" htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Vit({
  tone,
  icon,
  children,
}: {
  tone: "ok" | "bad" | "warn";
  icon: string;
  children: ReactNode;
}) {
  return (
    <div className={`vit ${tone}`}>
      <span className="ic">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export function Btn({
  onClick,
  variant = "",
  disabled,
  children,
}: {
  onClick?: () => void;
  variant?: "" | "gh" | "dn" | "ok";
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button className={`btn ${variant}`} onClick={onClick} disabled={disabled} type="button">
      {children}
    </button>
  );
}
