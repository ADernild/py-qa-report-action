import type { ParsedData } from "../types";
import { getPytestStatus } from "./pytest-formatter";
import { getBanditStatus } from "./bandit-formatter";
import { getRuffStatus } from "./ruff-formatter";

export function generateSummaryTable(data: ParsedData): string {
  const rows: string[] = [];

  rows.push("## 📊 Summary\n");
  rows.push("| Tool | Status | Details |");
  rows.push("|------|--------|---------|");

  if (data.pytest) {
    const { status, details } = getPytestStatus(data.pytest);
    rows.push(`| pytest | ${status} | ${details} |`);
  }

  if (data.bandit) {
    const { status, details } = getBanditStatus(data.bandit);
    rows.push(`| bandit | ${status} | ${details} |`);
  }

  if (data.ruff) {
    const { status, details } = getRuffStatus(data.ruff);
    rows.push(`| ruff | ${status} | ${details} |`);
  }

  rows.push("");
  return rows.join("\n");
}
