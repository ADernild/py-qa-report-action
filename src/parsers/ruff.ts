import * as core from "@actions/core";
import type { RuffData } from "../types";
import { parseJsonFile } from "./base";

function parseRuffData(data: any): RuffData {
  const issuesByCode: Record<string, any> = {};
  const filesWithIssues = new Set<string>();
  let fixableCount = 0;

  for (const issue of data) {
    const code = issue.code || "UNKNOWN";

    if (!issuesByCode[code]) {
      issuesByCode[code] = {
        count: 0,
        instances: [],
        message: issue.message || "",
      };
    }

    issuesByCode[code].count++;
    filesWithIssues.add(issue.filename || "");

    if (issue.fix && issue.fix.applicability === "safe") {
      fixableCount++;
    }

    issuesByCode[code].instances.push({
      endLocation: issue.end_location || { column: 0, row: 0 },
      fileName: issue.filename || "",
      fix: issue.fix || null,
      location: issue.location || { column: 0, row: 0 },
      message: issue.message || "",
      noqa_row: issue.noqa_row,
      url: issue.url || undefined,
    });
  }

  const summary: RuffData = {
    filesAffected: filesWithIssues.size,
    fixableCount,
    issuesByCode,
    totalIssues: data.length,
  };

  core.info(
    `✅ Parsed ruff results: ${summary.totalIssues} issues found (${fixableCount} safe fixes available)`,
  );
  return summary;
}

export async function parseRuff(filepath: string): Promise<RuffData | null> {
  return parseJsonFile(filepath, "Ruff", parseRuffData);
}
