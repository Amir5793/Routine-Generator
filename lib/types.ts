/* Shared types for مولد روتین — Weekly OS */

export type DayKey = "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";

export interface Quota {
  L: number;
  K: number;
}

export interface Status {
  k: string;
  energy: string;
  lDays: string;
  backlog: string;
  debts: { a: boolean; b: boolean; an: boolean };
  note: string;
}

export interface Events {
  asatide: boolean;
  asatideDay: "thu" | "wed" | "sat";
  asatideTime: string;
  holidays: Record<"sat" | "sun" | "mon" | "tue" | "wed", boolean>;
  schoolExam: boolean;
}

export interface Draft {
  n: number;
  phase: number;
  mode: "exam" | "regular";
  startDate: string;
  started: boolean;
  status: Status;
  events: Events;
  quotas: Record<string, Quota>;
  analysisChoice: string;
  sultanApplied: boolean;
  langCut: boolean;
}

export interface TrackRow {
  l: boolean;
  k: string;
  e: string;
  note: string;
}

export interface Summary {
  k: number;
  energy: number;
  lDays: number;
  backlogFinal: number;
}

export interface Week {
  n: number;
  mode: "exam" | "regular";
  phase: number;
  quotas: Record<string, Quota>;
  tracking: TrackRow[];
  summary: Summary | null;
  closed: boolean;
}

export interface ValidItem {
  ok: boolean;
  warn?: boolean;
  t: string;
}
