import * as core from "@actions/core";
import type { ParsedData, ParseOptions } from "../types";
import { parseBandit } from "./bandit";
import { parsePytest } from "./pytest";
import { parseRuff } from "./ruff";

export async function parseReports(options: ParseOptions): Promise<ParsedData> {
  // Log which tools are being processed
  const tools = [];
  if (options.pytestFile) tools.push("pytest");
  if (options.banditFile) tools.push("bandit");
  if (options.ruffFile) tools.push("ruff");

  if (tools.length === 0) {
    core.warning(
      "No result files provided. At least one of pytest, bandit, or ruff results should be provided.",
    );
  } else {
    core.info(`Processing results from: ${tools.join(", ")}`);
  }

  const parsedData: ParsedData = {
    bandit: null,
    hasErrors: false,
    pytest: null,
    ruff: null,
  };

  if (options.pytestFile) {
    parsedData.pytest = await parsePytest(options.pytestFile);
    if (
      parsedData.pytest &&
      (parsedData.pytest.failed > 0 || parsedData.pytest.errors > 0)
    ) {
      parsedData.hasErrors = true;
    }
  }

  if (options.banditFile) {
    parsedData.bandit = await parseBandit(options.banditFile);
    if (
      parsedData.bandit &&
      (parsedData.bandit.severityCounts.HIGH > 0 ||
        parsedData.bandit.severityCounts.MEDIUM > 0)
    ) {
      parsedData.hasErrors = true;
    }
  }

  if (options.ruffFile) {
    parsedData.ruff = await parseRuff(options.ruffFile);
    if (parsedData.ruff && parsedData.ruff.totalIssues > 0) {
      parsedData.hasErrors = true;
    }
  }

  return parsedData;
}
