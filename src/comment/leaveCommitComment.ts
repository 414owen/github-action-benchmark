import * as github from '@actions/github';
import * as core from '@actions/core';
import { benchmarkStartTag, wrapBodyWithBenchmarkTags } from './benchmarkCommentTags';

export async function leaveCommitComment(
    repoOwner: string,
    repoName: string,
    commitId: string,
    body: string,
    commentId: string,
    token: string,
) {
    core.debug('leaveCommitComment start');
    const client = github.getOctokit(token);
    const response = await client.rest.repos.createCommitComment({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        commit_sha: commitId,
        body: wrapBodyWithBenchmarkTags(commentId, body),
    });
    console.log(`Comment was sent to ${response.url}. Response:`, response.status, response.data);
    core.debug('leaveCommitComment end');
    return response;
}

// Commit comments are attached to the commit where the alert was detected. When the alert is later
// resolved (no alert on the current commit), replace the existing alert comment with a new message
// instead of leaving the stale alert comment. Returns null when no matching comment was found.
export async function updateCommitCommentIfExists(
    repoOwner: string,
    repoName: string,
    commitId: string,
    body: string,
    commentId: string,
    token: string,
) {
    core.debug('updateCommitCommentIfExists start');
    const client = github.getOctokit(token);

    const existingCommentsResponse = await client.rest.repos.listCommentsForCommit({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        commit_sha: commitId,
    });

    const existingComment = existingCommentsResponse.data.find((comment) =>
        comment.body.startsWith(benchmarkStartTag(commentId)),
    );

    if (!existingComment) {
        core.debug(`No existing alert comment was found on commit ${commitId}. Skipping comment update`);
        return null;
    }

    const updateResponse = await client.rest.repos.updateCommitComment({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        comment_id: existingComment.id,
        body: wrapBodyWithBenchmarkTags(commentId, body),
    });
    console.log(`Comment was updated via ${updateResponse.url}. Response:`, updateResponse.status, updateResponse.data);
    core.debug('updateCommitCommentIfExists end');
    return updateResponse;
}
