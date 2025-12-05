import type { Context } from "@actions/github/lib/context";
import type { ParsedData } from "../types";
import { createGitHubFileLink } from "../utils";

export function generateRuffSection(
  ruff: ParsedData["ruff"],
  context: Context,
): string {
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
      const pluralS = info.count !== 1 ? "s" : "";
      const occurrences = `${info.count} occurrence${pluralS}`;
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
        const fileLink = createGitHubFileLink(
          instance.fileName,
          lineRange,
          context,
        );
        lines.push(`- ${fileLink}`);
      }

      if (info.instances.length > maxInstances) {
        const remaining = info.instances.length - maxInstances;
        const pluralS = remaining !== 1 ? "s" : "";
        lines.push(`- _...and ${remaining} more instance${pluralS}_`);
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
  if (!ruff) return { status: "", details: "" };

  const status = ruff.totalIssues === 0 ? "✅ PASSED" : "⚠️ ISSUES FOUND";
  const pluralS = ruff.totalIssues !== 1 ? "s" : "";
  const details = `${ruff.totalIssues} linting issue${pluralS}`;

  return { status, details };
}
