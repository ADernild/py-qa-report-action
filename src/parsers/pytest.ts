import * as core from "@actions/core";
import type { PytestData } from "../types";
import { parseJsonFile } from "./base";

function parsePytestData(data: any): PytestData {
  const summary: PytestData = {
    duration: data.duration || 0,
    errors: data.summary?.error || 0,
    failed: data.summary?.failed || 0,
    failures: [],
    passed: data.summary?.passed || 0,
    skipped: data.summary?.skipped || 0,
    total: data.summary?.total || 0,
  };

  // Extract failure details
  if (data.tests && Array.isArray(data.tests)) {
    for (const test of data.tests) {
      if (test.outcome === "failed" || test.outcome === "error") {
        summary.failures.push({
          message: test.call?.longrepr || "No details available",
          name: test.nodeid || "Unknown",
        });
      }
    }
  }

  core.info(
    `✅ Parsed pytest results: ${summary.passed}/${summary.total} passed`,
  );
  return summary;
}

export async function parsePytest(
  filepath: string,
): Promise<PytestData | null> {
  return parseJsonFile(filepath, "Pytest", parsePytestData);
}
