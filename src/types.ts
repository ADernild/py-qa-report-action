export interface PytestData {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  duration: number;
  failures: Array<{
    name: string;
    message: string;
  }>;
}

export interface BanditIssue {
  testId: string;
  testName: string;
  fileName: string;
  lineNumber: number;
  lineRange: number[];
  code: string;
  issueText: string;
  confidence: string;
}

export interface BanditData {
  totalIssues: number;
  severityCounts: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    UNDEFINED: number;
  };
  issuesBySeverity: {
    HIGH: BanditIssue[];
    MEDIUM: BanditIssue[];
    LOW: BanditIssue[];
    UNDEFINED: BanditIssue[];
  };
  filesScanned: number;
}

export interface RuffFix {
  applicability: string;
  message: string | null;
  edits: Array<{
    content: string;
    location: {
      row: number;
      column: number;
    };
    end_location: {
      row: number;
      column: number;
    };
  }>;
}

export interface RuffIssue {
  fileName: string;
  location: {
    row: number;
    column: number;
  };
  endLocation: {
    row: number;
    column: number;
  };
  message: string;
  url?: string;
  fix?: RuffFix;
  noqa_row?: number;
}

export interface RuffIssueGroup {
  count: number;
  message: string;
  instances: RuffIssue[];
}

export interface RuffData {
  totalIssues: number;
  filesAffected: number;
  issuesByCode: Record<string, RuffIssueGroup>;
  fixableCount: number;
}

export interface ParsedData {
  pytest: PytestData | null;
  bandit: BanditData | null;
  ruff: RuffData | null;
  hasErrors: boolean;
}

export interface ParseOptions {
  pytestFile: string;
  banditFile: string;
  ruffFile: string;
}
