type OctokitOpts = { owner: string; repo: string; commit_sha: string; body: string };
type UpdateCommitCommentOpts = { owner: string; repo: string; comment_id: number; body: string };
type ReviewOpts = {
    owner: string;
    repo: string;
    pull_number: number;
    event?: string;
    body: string;
    review_id?: number;
};
type ReviewCall = { method: 'createReview' | 'updateReview'; opts: ReviewOpts };
type CommentLike = { id: number; body: string };

class FakedOctokitRepos {
    spyOpts: OctokitOpts[];
    updatedCommitComments: UpdateCommitCommentOpts[];
    commitComments: CommentLike[];

    constructor() {
        this.spyOpts = [];
        this.updatedCommitComments = [];
        this.commitComments = [];
    }

    setCommitComments(comments: CommentLike[]) {
        this.commitComments = comments;
    }

    listCommentsForCommit() {
        return Promise.resolve({ data: this.commitComments });
    }

    updateCommitComment(opt: UpdateCommitCommentOpts) {
        this.updatedCommitComments.push(opt);
        return Promise.resolve({
            url: 'https://dummy-comment-url',
            status: 200,
            data: {},
        });
    }

    createCommitComment(opt: OctokitOpts) {
        this.spyOpts.push(opt);
        return Promise.resolve({
            status: 201,
            data: {
                html_url: 'https://dummy-comment-url',
            },
        });
    }

    lastCall(): OctokitOpts {
        return this.spyOpts[this.spyOpts.length - 1];
    }

    clear() {
        this.spyOpts = [];
        this.updatedCommitComments = [];
        this.commitComments = [];
    }
}

export const fakedRepos = new FakedOctokitRepos();

class FakedOctokitPulls {
    reviews: CommentLike[];
    reviewCalls: ReviewCall[];

    constructor() {
        this.reviews = [];
        this.reviewCalls = [];
    }

    setReviews(reviews: CommentLike[]) {
        this.reviews = reviews;
    }

    listReviews() {
        return Promise.resolve({ data: this.reviews });
    }

    createReview(opt: ReviewOpts) {
        this.reviewCalls.push({ method: 'createReview', opts: opt });
        return Promise.resolve({
            status: 200,
            data: {
                html_url: 'https://dummy-comment-url',
            },
        });
    }

    updateReview(opt: ReviewOpts) {
        this.reviewCalls.push({ method: 'updateReview', opts: opt });
        return Promise.resolve({
            status: 200,
            data: {
                html_url: 'https://dummy-comment-url',
            },
        });
    }

    clear() {
        this.reviews = [];
        this.reviewCalls = [];
    }
}

export const fakedPulls = new FakedOctokitPulls();

export class FakedOctokit {
    rest = {
        repos: fakedRepos,
        pulls: fakedPulls,
    };
    opt: { token: string };
    constructor(token: string) {
        this.opt = { token };
    }
}
