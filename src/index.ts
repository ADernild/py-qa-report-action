import * as core from "@actions/core";
import * as github from "@actions/github";
import { postOrUpdateComment } from "./github-api";
import { parseReports } from "./parsers";
import { generateMarkdownReport } from "./report-generator";

async function run(): Promise<void> {
  try {
    // Get inputs
    const token = core.getInput("github-token", { required: true });
    const pytestResults = core.getInput("pytest-results");
    const banditResults = core.getInput("bandit-results");
    const ruffResults = core.getInput("ruff-results");
    const failOnErrors = core.getInput("fail-on-errors") === "true";
    const updateComment = core.getInput("update-comment") === "true";

    // Validate that we're in a PR context
    const context = github.context;
    if (!context.payload.pull_request) {
      core.warning("This action only works on pull_request events");
      return;
    }

    const prNumber = context.payload.pull_request.number;

    core.info("Starting code quality report generation...");
    core.info(`PR Number: ${prNumber}`);

    // Parse all reports
    const parsedData = await parseReports({
      banditFile: banditResults,
      pytestFile: pytestResults,
      ruffFile: ruffResults,
    });

    // Generate markdown report
    const markdownReport = generateMarkdownReport(parsedData);

    // Post or update comment
    const octokit = github.getOctokit(token);
    const commentId = await postOrUpdateComment(
      octokit,
      context,
      prNumber,
      markdownReport,
      updateComment,
    );

    // Set outputs
    core.setOutput("comment-id", commentId);
    core.setOutput("has-errors", parsedData.hasErrors);

    if (parsedData.pytest) {
      core.setOutput("pytest-passed", parsedData.pytest.passed);
      core.setOutput("pytest-failed", parsedData.pytest.failed);
    }

    if (parsedData.bandit) {
      core.setOutput("bandit-issues", parsedData.bandit.totalIssues);
    }

    if (parsedData.ruff) {
      core.setOutput("ruff-issues", parsedData.ruff.totalIssues);
    }

    core.info("✅ Report generated and posted successfully!");

    // Fail if requested and errors were found
    if (failOnErrors && parsedData.hasErrors) {
      core.setFailed("Code quality issues found!");
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
