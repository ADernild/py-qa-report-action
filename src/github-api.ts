import * as core from "@actions/core";
import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";

const COMMENT_IDENTIFIER = "<!-- py-qa-report-action -->";

export async function postOrUpdateComment(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  prNumber: number,
  body: string,
  updateExisting: boolean,
): Promise<number> {
  const commentBody = `${COMMENT_IDENTIFIER}\n${body}`;

  if (updateExisting) {
    const existingComment = await findExistingComment(
      octokit,
      context,
      prNumber,
    );

    if (existingComment) {
      core.info(`Updating existing comment #${existingComment.id}`);
      await octokit.rest.issues.updateComment({
        body: commentBody,
        comment_id: existingComment.id,
        owner: context.repo.owner,
        repo: context.repo.repo,
      });
      return existingComment.id;
    }
  }

  // Create new comment
  core.info("Creating new comment");
  const { data: comment } = await octokit.rest.issues.createComment({
    body: commentBody,
    issue_number: prNumber,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  return comment.id;
}

async function findExistingComment(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  prNumber: number,
): Promise<{ id: number } | null> {
  const { data: comments } = await octokit.rest.issues.listComments({
    issue_number: prNumber,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  for (const comment of comments) {
    if (comment.body?.includes(COMMENT_IDENTIFIER)) {
      return { id: comment.id };
    }
  }

  return null;
}
