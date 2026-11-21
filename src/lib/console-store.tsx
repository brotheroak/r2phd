"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AnalysisDraft,
  AnalysisSpec,
  AuditReport,
  ResearcherDecision,
  ScholarHit,
} from "@/lib/types";

const STORAGE_KEY = "intentspec-console-v1";

type ConsoleState = {
  researchQuestion: string;
  glossary: string;
  schema: string;
  resultCsv: string;
  draft: AnalysisDraft | null;
  scholar: ScholarHit[];
  decisions: Record<string, ResearcherDecision>;
  spec: AnalysisSpec | null;
  report: AuditReport | null;
};

type ConsoleContextValue = ConsoleState & {
  hydrated: boolean;
  setResearchQuestion: (v: string) => void;
  setGlossary: (v: string) => void;
  setSchema: (v: string) => void;
  setResultCsv: (v: string) => void;
  setDraft: (v: AnalysisDraft | null) => void;
  setScholar: (v: ScholarHit[]) => void;
  setDecisions: (
    v:
      | Record<string, ResearcherDecision>
      | ((
          prev: Record<string, ResearcherDecision>,
        ) => Record<string, ResearcherDecision>),
  ) => void;
  setSpec: (v: AnalysisSpec | null) => void;
  setReport: (v: AuditReport | null) => void;
  patch: (partial: Partial<ConsoleState>) => void;
};

const ConsoleContext = createContext<ConsoleContextValue | null>(null);

const empty: ConsoleState = {
  researchQuestion: "",
  glossary: "",
  schema: "",
  resultCsv: "",
  draft: null,
  scholar: [],
  decisions: {},
  spec: null,
  report: null,
};

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsoleState>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsoleState;
        setState({ ...empty, ...parsed });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  const patch = useCallback((partial: Partial<ConsoleState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = useMemo<ConsoleContextValue>(
    () => ({
      ...state,
      hydrated,
      setResearchQuestion: (v) => patch({ researchQuestion: v }),
      setGlossary: (v) => patch({ glossary: v }),
      setSchema: (v) => patch({ schema: v }),
      setResultCsv: (v) => patch({ resultCsv: v }),
      setDraft: (v) => patch({ draft: v }),
      setScholar: (v) => patch({ scholar: v }),
      setDecisions: (v) =>
        setState((prev) => ({
          ...prev,
          decisions: typeof v === "function" ? v(prev.decisions) : v,
        })),
      setSpec: (v) => patch({ spec: v }),
      setReport: (v) => patch({ report: v }),
      patch,
    }),
    [state, hydrated, patch],
  );

  return (
    <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
  );
}

export function useConsoleStore() {
  const ctx = useContext(ConsoleContext);
  if (!ctx) {
    throw new Error("useConsoleStore는 콘솔 레이아웃 안에서만 쓸 수 있습니다.");
  }
  return ctx;
}
