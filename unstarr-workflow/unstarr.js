/**
 * Copyright Eickelmann & Meyer Industries GbR | Author: Robin Meyer
 *
 * Licensed under the GNU General Public License v3.0,
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at:
 *
 * https://choosealicense.com/licenses/gpl-3.0/
 */

// default variables required for the workflow
var entities = require("@jetbrains/youtrack-scripting-api/entities");

exports.rule = entities.Issue.onChange({
    title: "unstarr issue if resolved",
    guard: function (ctx) {
        const issue_0 = ctx.issue;

        const IssuebecomesResolvedFn_0 = () => {
            return issue_0.becomesResolved;
        };

        const IssueisStarredFn_0 = () => {
            return issue_0.isStarred;
        };

        try {
            return IssuebecomesResolvedFn_0() && IssueisStarredFn_0();
        } catch (err) {
            throw err;
        }
    },
    action: function (ctx) {
        const logger = new Logger(ctx.traceEnabled);
        const issue_0 = ctx.issue;
        const user_0 = ctx.issue.reporter;
        const user_1 = ctx.issue.updatedBy;
        const user_2 = ctx.currentUser;
        const user_3 = ctx.issue.fields.Assignee;

        logger.log("clear taged issue" + issue_0.id);

        user_0.unwatchIssue(issue_0);
        user_1.unwatchIssue(issue_0);
        user_2.unwatchIssue(issue_0);
        user_3.unwatchIssue(issue_0);

        console.log("unstarred issue: " + issue_0.id);
    },
});

function Logger(useDebug = true) {
    return {
        log: (...args) => useDebug && console.log(...args),
        warn: (...args) => useDebug && console.warn(...args),
        error: (...args) => useDebug && console.error(...args),
    };
}
