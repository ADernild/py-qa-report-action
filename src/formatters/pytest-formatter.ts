import type { ParsedData } from "../types";

export function generatePytestSection(pytest: ParsedData["pytest"]): string {
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
      const remaining = pytest.failures.length - maxFailures;
      const pluralS = remaining !== 1 ? "s" : "";
      lines.push(`_...and ${remaining} more failure${pluralS}_\n`);
    }
  }

  return lines.join("\n");
}

export function getPytestStatus(pytest: ParsedData["pytest"]): {
  status: string;
  details: string;
} {
  if (!pytest) return { status: "", details: "" };

  const status =
    pytest.failed === 0 && pytest.errors === 0 ? "✅ PASSED" : "❌ FAILED";
  const details = `${pytest.passed}/${pytest.total} passed`;

  return { status, details };
}
