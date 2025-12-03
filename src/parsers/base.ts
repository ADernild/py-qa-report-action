import * as fs from "node:fs";
import * as core from "@actions/core";

export async function parseJsonFile<T>(
  filepath: string,
  toolName: string,
  parser: (data: any) => T,
): Promise<T | null> {
  if (!fs.existsSync(filepath)) {
    core.warning(`${toolName} results file not found: ${filepath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(filepath, "utf8");
    const data = JSON.parse(content);
    return parser(data);
  } catch (error) {
    core.error(`Failed to parse ${toolName} results: ${error}`);
    return null;
  }
}
