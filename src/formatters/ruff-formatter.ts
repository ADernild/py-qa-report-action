import type { Context } from "@actions/github/lib/context";
import type { ParsedData, RuffIssue } from "../types";
import { createGitHubFileLink, pluralize } from "../utils";

function formatFixInfo(issue: RuffIssue): string[] {
  if (!issue.fix) return [];

  const lines: string[] = [];
  const applicabilityIcon = issue.fix.applicability === "safe" ? "✅" : "⚠️";

  lines.push(
    `  - ${applicabilityIcon} **Fix available** (${issue.fix.applicability})`,
  );

  if (issue.fix.message) {
    lines.push(`    - ${issue.fix.message}`);
  }

  if (issue.fix.edits && issue.fix.edits.length > 0) {
    const edit = issue.fix.edits[0];
    lines.push("    ```python");
    lines.push(edit.content);
    lines.push("    ```");
  }

  return lines;
}

export function generateRuffSection(
  ruff: ParsedData["ruff"],
  context: Context,
): string {
  if (!ruff) return "";

  const lines: string[] = [];

  lines.push("## 🔧 Ruff Linting Results\n");
  lines.push(`- **Total Issues**: ${ruff.totalIssues}`);
  lines.push(`- **Files Affected**: ${ruff.filesAffected}\n`);

  if (ruff.fixableCount > 0) {
    lines.push(
      `- **Auto-fixable**: 🔧 ${ruff.fixableCount} ${pluralize(ruff.fixableCount, "issue")}`,
    );
  }

  lines.push("");

  if (Object.keys(ruff.issuesByCode).length > 0) {
    lines.push("### Issues by Type\n");

    const sortedIssues = Object.entries(ruff.issuesByCode)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    for (const [code, info] of sortedIssues) {
      const occurrences = `${info.count} ${pluralize(info.count, "occurrence")}`;
      const url = info.instances[0]?.url;
      const codeLink = url ? `[${code}](${url})` : `**${code}**`;

      const safeFixableInCode = info.instances.filter(
        (i: RuffIssue) => i.fix && i.fix.applicability === "safe",
      ).length;
      const fixableNote =
        safeFixableInCode > 0 ? ` - ${safeFixableInCode} fixable` : "";
      lines.push(`#### ${codeLink} (${occurrences}${fixableNote})`);
      lines.push(`${info.message}\n`);

      // Show up to 3 instances with file locations
      const maxInstances = 3;
      const instancesToShow = info.instances.slice(0, maxInstances);

      for (const instance of instancesToShow) {
        const startRow = instance.location.row;
        const endRow = instance.endLocation.row;
        const lineRange =
          startRow === endRow ? `${startRow}` : `${startRow}-${endRow}`;
        const fileLink = createGitHubFileLink(
          instance.fileName,
          lineRange,
          context,
        );
        lines.push(`- ${fileLink}`);

        const fixInfo = formatFixInfo(instance);
        lines.push(...fixInfo);
      }

      if (info.instances.length > maxInstances) {
        const remaining = info.instances.length - maxInstances;
        lines.push(
          `- _...and ${remaining} more instance${pluralize(remaining, "instance")}_`,
        );
      }

      lines.push("");
    }
  }

  return lines.join("\n");
}

export function getRuffStatus(ruff: ParsedData["ruff"]): {
  status: string;
  details: string;
} {
  if (!ruff) return { details: "", status: "" };

  const status = ruff.totalIssues === 0 ? "✅ PASSED" : "⚠️ ISSUES FOUND";
  const details = `${ruff.totalIssues} linting ${pluralize(ruff.totalIssues, "issue")}`;

  return { details, status };
}
