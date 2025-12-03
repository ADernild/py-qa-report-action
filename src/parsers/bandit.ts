import * as core from "@actions/core";
import type { BanditData, BanditIssue } from "../types";
import { parseJsonFile } from "./base";

function parseBanditData(data: any): BanditData {
  const results = data.results || [];
  const severityCounts = { HIGH: 0, LOW: 0, MEDIUM: 0, UNDEFINED: 0 };
  const issuesBySeverity = {
    HIGH: [] as BanditIssue[],
    LOW: [] as BanditIssue[],
    MEDIUM: [] as BanditIssue[],
    UNDEFINED: [] as BanditIssue[],
  };

  for (const result of results) {
    const severity = (result.issue_severity ||
      "UNDEFINED") as keyof typeof severityCounts;
    severityCounts[severity] = (severityCounts[severity] || 0) + 1;

    const issue: BanditIssue = {
      code: result.code || "",
      confidence: result.issue_confidence || "",
      fileName: result.filename || "",
      issueText: result.issue_text || "",
      lineNumber: result.line_number || 0,
      lineRange: result.line_range || [result.line_number || 0],
      testId: result.test_id || "",
      testName: result.test_name || "",
    };

    if (issuesBySeverity[severity]) {
      issuesBySeverity[severity].push(issue);
    }
  }

  const summary: BanditData = {
    filesScanned: data.metrics?._totals?.loc || 0,
    issuesBySeverity,
    severityCounts,
    totalIssues: results.length,
  };

  core.info(`✅ Parsed bandit results: ${summary.totalIssues} issues found`);
  return summary;
}

export async function parseBandit(
  filepath: string,
): Promise<BanditData | null> {
  return parseJsonFile(filepath, "Bandit", parseBanditData);
}
