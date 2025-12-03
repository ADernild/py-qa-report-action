import * as core from "@actions/core";
import type { RuffData } from "../types";
import { parseJsonFile } from "./base";

function parseRuffData(data: any): RuffData {
  const issuesByCode: Record<string, any> = {};
  const filesWithIssues = new Set<string>();

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

    issuesByCode[code].instances.push({
      fileName: issue.filename || "",
      fix: issue.fix || null,
      location: issue.location || { column: 0, row: 0 },
      endLocation: issue.end_location || { column: 0, row: 0 },
      message: issue.message || "",
      url: issue.url || undefined,
    });
  }

  const summary: RuffData = {
    filesAffected: filesWithIssues.size,
    issuesByCode,
    totalIssues: data.length,
  };

  core.info(`✅ Parsed ruff results: ${summary.totalIssues} issues found`);
  return summary;
}

export async function parseRuff(filepath: string): Promise<RuffData | null> {
  return parseJsonFile(filepath, "Ruff", parseRuffData);
}
