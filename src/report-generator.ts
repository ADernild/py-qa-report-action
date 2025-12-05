import type { Context } from "@actions/github/lib/context";
import {
  generateBanditSection,
  generatePytestSection,
  generateRuffSection,
  generateSummaryTable,
} from "./formatters";
import type { ParsedData } from "./types";

/**
 * Generates a complete markdown report from parsed code quality data.
 */
export function generateMarkdownReport(
  data: ParsedData,
  context: Context,
): string {
  const sections: string[] = [];

  sections.push("# 🔍 Code Quality Report\n");
  sections.push(generateSummaryTable(data));
  sections.push(generatePytestSection(data.pytest));
  sections.push(generateRuffSection(data.ruff, context));
  sections.push(generateBanditSection(data.bandit, context));

  return sections.join("\n");
}
