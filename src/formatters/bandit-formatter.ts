import type { Context } from "@actions/github/lib/context";
import type { BanditIssue, ParsedData } from "../types";
import { createGitHubFileLink, formatLineRange } from "../utils";

const SEVERITY_ICONS = {
  HIGH: "🔴",
  MEDIUM: "🟡",
  LOW: "🟢",
} as const;

function formatBanditIssues(
  issues: BanditIssue[],
  severity: "HIGH" | "MEDIUM" | "LOW",
  context: Context,
  maxIssues: number = 3,
): string[] {
  if (issues.length === 0) return [];

  const lines: string[] = [];
  const icon = SEVERITY_ICONS[severity];
  const severityText = severity.charAt(0) + severity.slice(1).toLowerCase();

  lines.push(`### ${icon} ${severityText} Severity Issues\n`);

  const issuesToShow = issues.slice(0, maxIssues);

  for (const issue of issuesToShow) {
    lines.push(`**${issue.testName}** (${issue.testId})`);
    const lineRange = formatLineRange(issue.lineRange);
    const fileLink = createGitHubFileLink(issue.fileName, lineRange, context);
    lines.push(`- File: ${fileLink}`);
    lines.push(`- Issue: ${issue.issueText}`);
    lines.push(`- Confidence: ${issue.confidence}`);

    if (issue.code) {
      lines.push("```python");
      lines.push(issue.code.trim());
      lines.push("```");
    }
    lines.push("");
  }

  if (issues.length > maxIssues) {
    const remaining = issues.length - maxIssues;
    const pluralS = remaining !== 1 ? "s" : "";
    lines.push(
      `_...and ${remaining} more ${severity.toLowerCase()} severity issue${pluralS}_\n`,
    );
  }

  return lines;
}

export function generateBanditSection(
  bandit: ParsedData["bandit"],
  context: Context,
): string {
  if (!bandit) return "";

  const lines: string[] = [];

  lines.push("## 🔒 Bandit Security Scan\n");
  lines.push(`- **Total Issues**: ${bandit.totalIssues}`);
  lines.push(`- **High Severity**: 🔴 ${bandit.severityCounts.HIGH}`);
  lines.push(`- **Medium Severity**: 🟡 ${bandit.severityCounts.MEDIUM}`);
  lines.push(`- **Low Severity**: 🟢 ${bandit.severityCounts.LOW}\n`);

  // Show issues in priority order: HIGH, MEDIUM, LOW
  // Only show one severity level to keep report concise
  if (bandit.issuesBySeverity.HIGH.length > 0) {
    lines.push(
      ...formatBanditIssues(bandit.issuesBySeverity.HIGH, "HIGH", context),
    );
  } else if (bandit.issuesBySeverity.MEDIUM.length > 0) {
    lines.push(
      ...formatBanditIssues(bandit.issuesBySeverity.MEDIUM, "MEDIUM", context),
    );
  } else if (bandit.issuesBySeverity.LOW.length > 0) {
    lines.push(
      ...formatBanditIssues(bandit.issuesBySeverity.LOW, "LOW", context),
    );
  }

  return lines.join("\n");
}

export function getBanditStatus(bandit: ParsedData["bandit"]): {
  status: string;
  details: string;
} {
  if (!bandit) return { status: "", details: "" };

  const highIssues = bandit.severityCounts.HIGH;
  const mediumIssues = bandit.severityCounts.MEDIUM;
  const status =
    highIssues === 0 && mediumIssues === 0 ? "✅ PASSED" : "⚠️ ISSUES FOUND";
  const pluralS = bandit.totalIssues !== 1 ? "s" : "";
  const details = `${bandit.totalIssues} security issue${pluralS}`;

  return { status, details };
}
