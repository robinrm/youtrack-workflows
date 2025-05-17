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
const entities = require("@jetbrains/youtrack-scripting-api/entities");
const search = require("@jetbrains/youtrack-scripting-api/search");
var dateTime = require("@jetbrains/youtrack-scripting-api/date-time");

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// change these variables to your needs!

const activeWorkflow = false;
const project = "Test";
const tasktitle = "Projekt: " + project + ", Issue: template repeating issue";
// For format details refer to https://www.freeformatter.com/cron-expression-generator-quartz.html
const cronintervall = "0 0/1 * ? * *"; // every minute | every 10 seconds: "0/10 * * ? * * *" | every hour: "0 0 * ? * * *"
const usercreated = "admin";
const usereditor = "robinrm";
const keyword = "Repeating Task (1x weekly) ";
const keywordMaster = "masterticket";
const searchday = 7; // 1 = Monday, ..., 7 = Sunday
const intervall = 0; // search day + x days ( should be 7 14 21 ... otherwise it will be rounded down to nearest x*7)
const dayx = 1; // 1 = first day of month, 31 = last day of month (be aware of last day of month could be different in each month → auto adjusted to last day of month if set to high)
const mode = 1; // 1 = intervall, 2 = day x of month
const timeneeded = "1h";
const description = `* [ ] VM xxx - system01
* [ ] VM xxx - system02
* [ ] VM xxx - system03
---
on VM xxx:
* [ ] task xxx
* [ ] task xxx
* [ ] task xxx`;

// no changes needed beyond this point!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// find issues
function findissue(project, keyword) {
    const query = {
        query: keyword,
    };

    const IssueList = search.search(project, query);
    // console.log(IssueList);
    const emptyList = !IssueList.isEmpty();
    // console.log(emptyList);

    return [emptyList, IssueList];
}

// create date for next issue
function getDueDate(searchday, intervall, dayx, mode) {
    let multipledatespossible = null;
    let datecounts = null;
    let datearray = [];
    let ndate = null;
    let ntimestamp = null;
    let ndateadjusted = null;
    let adateadjusted = null;

    const cdate = new Date(); // year, month (0-11), day, hours, minutes, seconds, milliseconds

    // const clocaltime = new Date(cdate.getTime());
    // console.log("localtime now: " + clocaltime);
    // const ctimestamp = Date.parse(clocaltime.toString());
    // console.log("timestamp now: " + ctimestamp);

    const cdateadjusted =
        cdate.getFullYear() +
        "-" +
        ("0" + (cdate.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + cdate.getDate()).slice(-2);
    // console.log("full date now: " + cdateadjusted);

    ndate = new Date(cdateadjusted);
    if (mode == 1) {
        ntimestamp = ndate.setDate(
            ndate.getDate() +
                (((searchday + 7 - ndate.getDay()) % 7 || 7) +
                    Math.floor(intervall / 7) * 7)
        );

        const cdatedif = new Date(ndate.getTime() - cdate.getTime()).getDate();
        const filtercday = cdatedif % 7; // by 0 skip current day in array
        if (cdatedif >= 7) {
            multipledatespossible = true;

            if (filtercday == 0) {
                datecounts = Math.floor(cdatedif / 7);
            } else {
                datecounts = Math.floor(cdatedif / 7) + 1;
            }
        } else {
            multipledatespossible = false;
            datecounts = 1;
        }
        // console.log("date difference: " + cdatedif);
        // console.log("multiple dates possible: " + multipledatespossible);
        // console.log("possile dates: " + datecounts);

        for (let i = datecounts; i >= 1; i--) {
            const adate = new Date(
                ntimestamp + (i - datecounts) * 7 * 24 * 60 * 60 * 1000
            );
            const aday = adate.toISOString().slice(0, 10);
            adateadjusted =
                aday.slice(8, 10) +
                "." +
                aday.slice(5, 7) +
                "." +
                aday.slice(0, 4);

            datearray.push(adateadjusted);
        }
    }
    if (mode == 2) {
        // const firstcday = new Date(ndate.getFullYear(), ndate.getMonth(), 1).getDate();
        // console.log("first day of month: " + firstcday);
        const lastcday = new Date(
            ndate.getFullYear(),
            ndate.getMonth() + 1,
            0
        ).getDate();
        // console.log("last day of month: " + lastcday);
        const cday = cdate.getDate();
        // console.log("day now: " + cday);
        const cmonth = cdate.getMonth() + 1;
        // console.log("month now: " + cmonth);

        if (cday < dayx && dayx <= lastcday) {
            ndateadjusted =
                cdate.getFullYear() +
                "-" +
                ("0" + (cdate.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + dayx).slice(-2);

            // console.log("dayx is in current month");
        } else if (cday <= dayx && dayx >= lastcday) {
            ndateadjusted =
                cdate.getFullYear() +
                "-" +
                ("0" + (cdate.getMonth() + 1)).slice(-2) +
                "-" +
                ("0" + lastcday).slice(-2);

            // console.log("dayx is in current month but set to high")
        } else if (cday >= dayx) {
            if (cmonth == 12) {
                ndateadjusted =
                    cdate.getFullYear() +
                    1 +
                    "-" +
                    "01" +
                    "-" +
                    ("0" + dayx).slice(-2);
            } else {
                ndateadjusted =
                    cdate.getFullYear() +
                    "-" +
                    ("0" + (cdate.getMonth() + 2)).slice(-2) +
                    "-" +
                    ("0" + dayx).slice(-2);
            }

            // console.log("dayx is in next month")
        }

        ndate = new Date(ndateadjusted);
        ntimestamp = ndate.setDate(ndate.getDate());

        adateadjusted =
            ndateadjusted.slice(8, 10) +
            "." +
            ndateadjusted.slice(5, 7) +
            "." +
            ndateadjusted.slice(0, 4);
        datearray.push(adateadjusted);
        datecounts = 1;
    }
    // console.log("full date searched: " + adateadjusted);
    // console.log("timestamp searched: " + ntimestamp);
    // console.log("datearray: " + datearray);

    const sdate = new Date(ntimestamp);
    const slocaltime = new Date(sdate.getTime());
    // console.log("localtime searched: " + slocaltime);

    const sday = slocaltime.toISOString().slice(0, 10);
    // console.log("day searched: " + sday);

    const dueDay =
        sday.slice(8, 10) + "." + sday.slice(5, 7) + "." + sday.slice(0, 4);
    // console.log("due day: " + dueDay);

    return [ntimestamp, dueDay, datecounts, datearray];
}

// createIssue
function createIssue(ctx, summary, dueTimestamp) {
    let newIssue;

    newIssue = new entities.Issue(ctx.user_Issue, ctx.project_Issue, summary);
    newIssue.description = description;
    newIssue.fields["Assignee"] = ctx.AssigneeUser_Issue.usereditor_Issue;
    newIssue.fields["Due Date"] = dueTimestamp;
    newIssue.fields["Zeitschätzung"] = dateTime.toPeriod(timeneeded);

    console.log("Issue created: " + summary);
}

exports.rule = entities.Issue.onSchedule({
    title: tasktitle,
    search: keywordMaster,
    cron: cronintervall,
    muteUpdateNotifications: false, // to mute notifications for changes that are applied by this rule, set to true
    modifyUpdatedProperties: false, // to update the values for the `updated` and `updatedBy` properties in the target issue, set to true
    guard: (ctx) => {
        return true;
    },
    action: function (ctx) {
        if (activeWorkflow) {
            const logger = new Logger(ctx.traceEnabled);

            const [dueTimestamp, dueDate, counts, dates] = getDueDate(
                searchday,
                intervall,
                dayx,
                mode
            );
            // console.log("timestamp: " + dueTimestamp);
            // console.log("due date: " + dueDate);
            // console.log("possile dates: " + counts);
            // console.log("dates: " + dates);

            for (let i = counts; i >= 1; i--) {
                // console.log("i: " + i);

                const searchkey = "'" + keyword + dates[i - 1] + "'";
                // console.log("search key: " + searchkey);

                let [found, list] = findissue(ctx.project_Issue, searchkey);
                // console.log("found keyword: " + found);
                // console.log("items found: " + list);

                if (found) {
                    i = 1;
                }

                if (i == 1 && !found) {
                    found = true;
                    const summary = keyword + dueDate;
                    // console.log("summary: " + summary);

                    createIssue(ctx, summary, dueTimestamp);

                    logger.log("Issue created: " + summary);
                }
            }
        }
    },
    requirements: {
        project_Issue: {
            type: entities.Project,
            name: project,
        },
        user_Issue: {
            type: entities.User,
            login: usercreated,
        },
        AssigneeUser_Issue: {
            name: "Assignee",
            type: entities.User.fieldType,
            usereditor_Issue: {
                login: usereditor,
            },
        },
    },
});

function Logger(useDebug = true) {
    return {
        log: (...args) => useDebug && console.log(...args),
        warn: (...args) => useDebug && console.warn(...args),
        error: (...args) => useDebug && console.error(...args),
    };
}
