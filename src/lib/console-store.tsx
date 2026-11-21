"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ClarifyBrief, ClarifyDomain } from "@/lib/clarify";
import type {
  AnalysisDraft,
  AnalysisSpec,
  AuditReport,
  ResearcherDecision,
  ScholarHit,
} from "@/lib/types";

const STORAGE_KEY = "intentspec-console-v4";

type ChoiceMap = Record<string, { chosenOptions: string[]; note?: string }>;

type ConsoleState = {
  researchQuestion: string;
  glossary: string;
  schema: string;
  resultCsv: string;
  candidateSql: string;
  linkedTables: string[];
  draft: AnalysisDraft | null;
  scholar: ScholarHit[];
  decisions: Record<string, ResearcherDecision>;
  spec: AnalysisSpec | null;
  report: AuditReport | null;
  intentLocked: boolean;
  lockedAt: string | null;
  clarifyDomain: ClarifyDomain;
  clarifyQuestion: string;
  clarifyBrief: ClarifyBrief | null;
  clarifyDecisions: ChoiceMap;
  clarifyLocked: boolean;
  clarifyLockedAt: string | null;
};

type ConsoleContextValue = ConsoleState & {
  hydrated: boolean;
  setResearchQuestion: (v: string) => void;
  setGlossary: (v: string) => void;
  setSchema: (v: string) => void;
  setResultCsv: (v: string) => void;
  setCandidateSql: (v: string) => void;
  setLinkedTables: (v: string[]) => void;
  setIntentLocked: (v: boolean, lockedAt?: string | null) => void;
  setClarifyDomain: (v: ClarifyDomain) => void;
  setClarifyQuestion: (v: string) => void;
  setClarifyBrief: (v: ClarifyBrief | null) => void;
  setClarifyDecisions: (
    v: ChoiceMap | ((prev: ChoiceMap) => ChoiceMap),
  ) => void;
  setClarifyLocked: (v: boolean, lockedAt?: string | null) => void;
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
  candidateSql: "",
  linkedTables: [],
  draft: null,
  scholar: [],
  decisions: {},
  spec: null,
  report: null,
  intentLocked: false,
  lockedAt: null,
  clarifyDomain: "everyday",
  clarifyQuestion: "",
  clarifyBrief: null,
  clarifyDecisions: {},
  clarifyLocked: false,
  clarifyLockedAt: null,
};

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsoleState>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ConsoleState>;
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
    setState((prev) => {
      let changed = false;
      for (const key of Object.keys(partial) as (keyof ConsoleState)[]) {
        if (prev[key] !== partial[key]) {
          changed = true;
          break;
        }
      }
      if (!changed) return prev;
      return { ...prev, ...partial };
    });
  }, []);

  const setResearchQuestion = useCallback(
    (v: string) => patch({ researchQuestion: v }),
    [patch],
  );
  const setGlossary = useCallback((v: string) => patch({ glossary: v }), [patch]);
  const setSchema = useCallback((v: string) => patch({ schema: v }), [patch]);
  const setResultCsv = useCallback(
    (v: string) => patch({ resultCsv: v }),
    [patch],
  );
  const setCandidateSql = useCallback(
    (v: string) => patch({ candidateSql: v }),
    [patch],
  );
  const setLinkedTables = useCallback(
    (v: string[]) => patch({ linkedTables: v }),
    [patch],
  );
  const setIntentLocked = useCallback(
    (v: boolean, lockedAt: string | null = null) =>
      patch({ intentLocked: v, lockedAt: v ? lockedAt : null }),
    [patch],
  );
  const setClarifyDomain = useCallback(
    (v: ClarifyDomain) => patch({ clarifyDomain: v }),
    [patch],
  );
  const setClarifyQuestion = useCallback(
    (v: string) => patch({ clarifyQuestion: v }),
    [patch],
  );
  const setClarifyBrief = useCallback(
    (v: ClarifyBrief | null) => patch({ clarifyBrief: v }),
    [patch],
  );
  const setClarifyDecisions = useCallback(
    (v: ChoiceMap | ((prev: ChoiceMap) => ChoiceMap)) => {
      setState((prev) => ({
        ...prev,
        clarifyDecisions:
          typeof v === "function" ? v(prev.clarifyDecisions) : v,
        clarifyLocked: false,
        clarifyLockedAt: null,
      }));
    },
    [],
  );
  const setClarifyLocked = useCallback(
    (v: boolean, lockedAt: string | null = null) =>
      patch({
        clarifyLocked: v,
        clarifyLockedAt: v ? lockedAt : null,
      }),
    [patch],
  );
  const setDraft = useCallback(
    (v: AnalysisDraft | null) => patch({ draft: v }),
    [patch],
  );
  const setScholar = useCallback(
    (v: ScholarHit[]) => patch({ scholar: v }),
    [patch],
  );
  const setDecisions = useCallback(
    (
      v:
        | Record<string, ResearcherDecision>
        | ((
            prev: Record<string, ResearcherDecision>,
          ) => Record<string, ResearcherDecision>),
    ) => {
      setState((prev) => ({
        ...prev,
        decisions: typeof v === "function" ? v(prev.decisions) : v,
        intentLocked: false,
        lockedAt: null,
        spec: null,
        report: null,
      }));
    },
    [],
  );
  const setSpec = useCallback(
    (v: AnalysisSpec | null) => patch({ spec: v }),
    [patch],
  );
  const setReport = useCallback(
    (v: AuditReport | null) => patch({ report: v }),
    [patch],
  );

  const value = useMemo<ConsoleContextValue>(
    () => ({
      ...state,
      hydrated,
      setResearchQuestion,
      setGlossary,
      setSchema,
      setResultCsv,
      setCandidateSql,
      setLinkedTables,
      setIntentLocked,
      setClarifyDomain,
      setClarifyQuestion,
      setClarifyBrief,
      setClarifyDecisions,
      setClarifyLocked,
      setDraft,
      setScholar,
      setDecisions,
      setSpec,
      setReport,
      patch,
    }),
    [
      state,
      hydrated,
      setResearchQuestion,
      setGlossary,
      setSchema,
      setResultCsv,
      setCandidateSql,
      setLinkedTables,
      setIntentLocked,
      setClarifyDomain,
      setClarifyQuestion,
      setClarifyBrief,
      setClarifyDecisions,
      setClarifyLocked,
      setDraft,
      setScholar,
      setDecisions,
      setSpec,
      setReport,
      patch,
    ],
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
