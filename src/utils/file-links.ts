import * as core from "@actions/core";
import type { Context } from "@actions/github/lib/context";

/**
 * Converts an absolute file path to a relative path within the repository.
 * Handles GitHub Actions runner path structure: /home/runner/work/{repo}/{repo}/{files}
 */
export function getRelativePath(fileName: string, context: Context): string {
  let cleanPath = fileName;

  // Handle absolute paths (Unix or Windows style)
  if (cleanPath.startsWith("/") || /^[A-Za-z]:/.test(cleanPath)) {
    const repoName = context.repo.repo;

    // GitHub Actions runner path structure: /home/runner/work/{repo}/{repo}/{files}
    // We need to remove everything up to and including the second occurrence of repo name
    const workDirPattern = new RegExp(`/work/${repoName}/${repoName}/(.+)$`);
    const match = cleanPath.match(workDirPattern);

    if (match?.[1]) {
      cleanPath = match[1];
    } else {
      // Fallback: try to find any occurrence of /repo-name/ and take what's after
      const parts = cleanPath.split("/");
      const lastRepoIndex = parts.lastIndexOf(repoName);

      if (lastRepoIndex !== -1 && lastRepoIndex < parts.length - 1) {
        cleanPath = parts.slice(lastRepoIndex + 1).join("/");
      } else {
        core.warning(`Could not determine relative path for: ${fileName}`);
        cleanPath = parts[parts.length - 1]; // Just use filename as last resort
      }
    }
  } else if (cleanPath.startsWith("./")) {
    cleanPath = cleanPath.slice(2);
  }

  return cleanPath;
}

/**
 * Creates a markdown link to a file on GitHub with line numbers.
 */
export function createGitHubFileLink(
  fileName: string,
  lineRange: string,
  context: Context,
): string {
  const { owner, repo } = context.repo;
  const sha = context.payload.pull_request?.head.sha || context.sha;
  const cleanPath = getRelativePath(fileName, context);

  const url = `https://github.com/${owner}/${repo}/blob/${sha}/${cleanPath}#L${lineRange}`;
  return `[${cleanPath}:${lineRange}](${url})`;
}
