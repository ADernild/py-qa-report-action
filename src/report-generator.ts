import type { BanditIssue, ParsedData } from "./types";

export function generateMarkdownReport(data: ParsedData): string {
  const sections: string[] = [];

  sections.push("# 🔍 Code Quality Report\n");
  sections.push(generateSummaryTable(data));
  sections.push(generatePytestSection(data.pytest));
  sections.push(generateBanditSection(data.bandit));
  sections.push(generateRuffSection(data.ruff));

  return sections.join("\n");
}

function generateSummaryTable(data: ParsedData): string {
  const rows: string[] = [];

  rows.push("## 📊 Summary\n");
  rows.push("| Tool | Status | Details |");
  rows.push("|------|--------|---------|");

  if (data.pytest) {
    const status =
      data.pytest.failed === 0 && data.pytest.errors === 0
        ? "✅ PASSED"
        : "❌ FAILED";
    const details = `${data.pytest.passed}/${data.pytest.total} passed`;
    rows.push(`| pytest | ${status} | ${details} |`);
  }

  if (data.bandit) {
    const highIssues = data.bandit.severityCounts.HIGH;
    const mediumIssues = data.bandit.severityCounts.MEDIUM;
    const status =
      highIssues === 0 && mediumIssues === 0 ? "✅ PASSED" : "⚠️ ISSUES FOUND";
    const details = `${data.bandit.totalIssues} security issue${data.bandit.totalIssues !== 1 ? "s" : ""}`;
    rows.push(`| bandit | ${status} | ${details} |`);
  }

  if (data.ruff) {
    const status = data.ruff.totalIssues === 0 ? "✅ PASSED" : "⚠️ ISSUES FOUND";
    const details = `${data.ruff.totalIssues} linting issue${data.ruff.totalIssues !== 1 ? "s" : ""}`;
    rows.push(`| ruff | ${status} | ${details} |`);
  }

  rows.push("");
  return rows.join("\n");
}

function generatePytestSection(pytest: ParsedData["pytest"]): string {
  if (!pytest) return "";

  const lines: string[] = [];

  lines.push("## 🧪 Pytest Results\n");
  lines.push(`- **Total Tests**: ${pytest.total}`);
  lines.push(`- **Passed**: ✅ ${pytest.passed}`);
  lines.push(`- **Failed**: ❌ ${pytest.failed}`);
  lines.push(`- **Skipped**: ⏭️ ${pytest.skipped}`);
  lines.push(`- **Errors**: 🔥 ${pytest.errors}`);
  lines.push(`- **Duration**: ⏱️ ${pytest.duration.toFixed(2)}s\n`);

  if (pytest.failures.length > 0) {
    lines.push("### ❌ Failed Tests\n");
    const maxFailures = 5;
    const failuresToShow = pytest.failures.slice(0, maxFailures);

    for (const failure of failuresToShow) {
      lines.push(`**${failure.name}**`);
      lines.push("```");
      const message = failure.message.substring(0, 500);
      lines.push(message);
      if (failure.message.length > 500) {
        lines.push("...(truncated)");
      }
      lines.push("```\n");
    }

    if (pytest.failures.length > maxFailures) {
      lines.push(
        `_...and ${pytest.failures.length - maxFailures} more failure${pytest.failures.length - maxFailures !== 1 ? "s" : ""}_\n`,
      );
    }
  }

  return lines.join("\n");
}

function formatLineRange(lineRange: number[]): string {
  if (lineRange.length === 0) return "";
  if (lineRange.length === 1) return `${lineRange[0]}`;

  const first = lineRange[0];
  const last = lineRange[lineRange.length - 1];

  // If consecutive range, show as "10-12"
  if (last - first + 1 === lineRange.length) {
    return `${first}-${last}`;
  }

  // Otherwise show all lines
  return lineRange.join(", ");
}

function formatBanditIssues(
  issues: BanditIssue[],
  severity: "HIGH" | "MEDIUM" | "LOW",
  maxIssues: number = 3,
): string[] {
  if (issues.length === 0) return [];

  const lines: string[] = [];
  const icons = { HIGH: "🔴", LOW: "🟢", MEDIUM: "🟡" };

  lines.push(
    `### ${icons[severity]} ${severity.charAt(0) + severity.slice(1).toLowerCase()} Severity Issues\n`,
  );

  const issuesToShow = issues.slice(0, maxIssues);

  for (const issue of issuesToShow) {
    lines.push(`**${issue.testName}** (${issue.testId})`);
    const lineRange = formatLineRange(issue.lineRange);
    lines.push(`- File: \`${issue.fileName}:${lineRange}\``);
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
    lines.push(
      `_...and ${issues.length - maxIssues} more ${severity.toLowerCase()} severity issue${issues.length - maxIssues !== 1 ? "s" : ""}_\n`,
    );
  }

  return lines;
}

function generateBanditSection(bandit: ParsedData["bandit"]): string {
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
    lines.push(...formatBanditIssues(bandit.issuesBySeverity.HIGH, "HIGH"));
  } else if (bandit.issuesBySeverity.MEDIUM.length > 0) {
    lines.push(...formatBanditIssues(bandit.issuesBySeverity.MEDIUM, "MEDIUM"));
  } else if (bandit.issuesBySeverity.LOW.length > 0) {
    lines.push(...formatBanditIssues(bandit.issuesBySeverity.LOW, "LOW"));
  }

  return lines.join("\n");
}

function generateRuffSection(ruff: ParsedData["ruff"]): string {
  if (!ruff) return "";

  const lines: string[] = [];

  lines.push("## 🔧 Ruff Linting Results\n");
  lines.push(`- **Total Issues**: ${ruff.totalIssues}`);
  lines.push(`- **Files Affected**: ${ruff.filesAffected}\n`);

  if (Object.keys(ruff.issuesByCode).length > 0) {
    lines.push("### Issues by Type\n");

    const sortedIssues = Object.entries(ruff.issuesByCode)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    for (const [code, info] of sortedIssues) {
      const occurrences = `${info.count} occurrence${info.count !== 1 ? "s" : ""}`;
      const url = info.instances[0]?.url;
      const codeLink = url ? `[${code}](${url})` : `**${code}**`;

      lines.push(`#### ${codeLink} (${occurrences})`);
      lines.push(`${info.message}\n`);

      // Show up to 3 instances with file locations
      const maxInstances = 3;
      const instancesToShow = info.instances.slice(0, maxInstances);

      for (const instance of instancesToShow) {
        const startRow = instance.location.row;
        const endRow = instance.endLocation.row;
        const lineRange =
          startRow === endRow ? `${startRow}` : `${startRow}-${endRow}`;

        lines.push(`- \`${instance.fileName}:${lineRange}\``);
      }

      if (info.instances.length > maxInstances) {
        lines.push(
          `- _...and ${info.instances.length - maxInstances} more instance${info.instances.length - maxInstances !== 1 ? "s" : ""}_`,
        );
      }

      lines.push("");
    }
  }

  return lines.join("\n");
}
