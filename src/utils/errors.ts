export interface Issue {
    path: string | Array<string | number>
    expected?: string | number
    received?: string | number
    message?: string
}

export class Exception extends Error {
    protected _issues: Issue[] = []

    constructor(issue?: Issue) {
        super()

        if (issue) this.addIssue(issue)
    }

    addIssue(issue: Issue): Exception {
        if (!issue.message) {
            const { path, expected, received } = issue
            const val = Array.isArray(path) ? path.join('.') : path
            issue.message = `"${val}" is expected to be "${expected}" but received "${received}"`
        }
        this._issues.push(issue)
        const issuesWithMessages = this._issues.filter((i) => i.message)
        this.message = `${issuesWithMessages.map((i) => i.message).join(', ')}.`
        return this
    }

    addIssues(issues: Issue[]): Exception {
        issues.forEach((issue) => this.addIssue(issue))
        return this
    }

    get issues(): Issue[] {
        return this._issues
    }

    hasIssues(): boolean {
        return this._issues.length > 0
    }
}
