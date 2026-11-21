export type AmbiguityKind =
  | "date_anchor"
  | "identifier_scope"
  | "term_conflict"
  | "aggregation"
  | "missing_definition";

export type Ambiguity = {
  id: string;
  kind: AmbiguityKind;
  title: string;
  whyItMatters: string;
  options: string[];
  recommended?: string;
  evidence: string[];
};

export type ConceptLink = {
  concept: string;
  glossaryTerm?: string;
  columns: string[];
  condition: string;
  exceptions: string[];
};

export type AnalysisDraft = {
  summary: string;
  concepts: ConceptLink[];
  ambiguities: Ambiguity[];
  assumedDefaults: string[];
  sourcesUsed: string[];
  mode: "live" | "demo";
};

export type ResearcherDecision = {
  ambiguityId: string;
  chosenOption: string;
  note?: string;
};

export type ValidationCheck = {
  id: string;
  name: string;
  description: string;
  sqlHint?: string;
  severity: "blocker" | "warning" | "info";
};

export type AnalysisSpec = {
  title: string;
  researchQuestion: string;
  population: string;
  measures: string[];
  filters: string[];
  dateAnchor: string;
  identifierScope: string;
  exclusions: string[];
  openQuestions: string[];
  sql: string;
  checks: ValidationCheck[];
  rationale: string[];
  mode: "live" | "demo";
};

export type AuditFinding = {
  id: string;
  checkId: string;
  status: "pass" | "fail" | "needs_review";
  title: string;
  detail: string;
  evidenceRows?: string[];
};

export type AuditReport = {
  summary: string;
  findings: AuditFinding[];
  intentDriftScore: number;
  nextActions: string[];
  mode: "live" | "demo";
};

export type ScholarHit = {
  title: string;
  url: string;
  description: string;
  date?: string;
  authors?: string[];
  journal?: string;
  citationCount?: number;
};

export type AnalyzeRequest = {
  researchQuestion: string;
  glossary: string;
  schema: string;
  includeScholar?: boolean;
};

export type ConfirmRequest = {
  researchQuestion: string;
  glossary: string;
  schema: string;
  draft: AnalysisDraft;
  decisions: ResearcherDecision[];
};

export type AuditRequest = {
  spec: AnalysisSpec;
  resultRowsCsv: string;
};
