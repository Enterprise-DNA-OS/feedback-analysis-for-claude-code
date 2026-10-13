# CLI reference

Run npm run feedback -- help for all options. Every command accepts --json. Options use --key=value; quoted values are supported. Unknown and duplicate options fail. Mutations require --actor. Dates are real ISO calendar dates. Dataset, response, theme and action arguments accept exact UUIDs, partial UUIDs and case-insensitive names or references. Ambiguous matches list candidates and exit one.

There are 28 CLI commands, including help, and 29 slash recipes, including customise and new-view. No command sends messages, captures a live survey, calls a model or deletes a record. Each mutation and import commits its audit note in the same transaction.

## datasets

Check the owner, purpose and response count for each source. Do not combine different datasets without saying so.

```bash
npm run feedback -- datasets
```

## responses

Lists metadata without copying raw customer comments. Use response for a specific evidence review.

```bash
npm run feedback -- responses --dataset="Harbour customer survey"
```

## response

Read the source comment and every proposed, accepted and rejected coding. Cite the reference. Keep personal information internal.

```bash
npm run feedback -- response --response=R-001
```

## themes

Read definitions before proposing coding. Imported vendor labels need a local definition review.

```bash
npm run feedback -- themes
```

## theme-volume

Counts use distinct responses with accepted coding. Share uses all responses in each dataset; themes overlap and shares need not total one hundred percent.

```bash
npm run feedback -- theme-volume
```

## segment-compare

Compare shares with denominators, not just raw counts. Segments with few responses do not support broad conclusions.

```bash
npm run feedback -- segment-compare
```

## score-drivers

NPS uses scores from zero to ten, excludes missing scores and uses accepted coding. Report scored sample sizes. These associations do not establish causes or predicted improvements.

```bash
npm run feedback -- score-drivers
```

## trend

Show both response denominators. Recent means today and the preceding twenty-nine days; prior is the preceding thirty days. Do not call raw count changes a rate change.

```bash
npm run feedback -- trend
```

## review-queue

Read each source before proposing or accepting a theme. Include comments with no accepted coding and those awaiting privacy review.

```bash
npm run feedback -- review-queue
```

## actions-due

Show owner, due date and how overdue the work is. Closure needs evidence; this does not send a reminder.

```bash
npm run feedback -- actions-due --days=14
```

## attention

Read the age of the latest feedback alongside overdue action counts and pending reviews. An empty source is unknown, not healthy.

```bash
npm run feedback -- attention
```

## compliance

Read docs/compliance.md. Distinguish sourced retention principles from internal review policy. Never certify compliance or delete data.

```bash
npm run feedback -- compliance
```

## activity

Show who recorded the action and when. This is operational history, not a tamper-proof audit log.

```bash
npm run feedback -- activity
```

## weekly-review

Use the three returned sections: accepted themes, review queue and due actions. Name owners and deadlines. State that the demo is fictional when demo records are present. Never invent a causal explanation.

```bash
npm run feedback -- weekly-review
```

## add-dataset

Use the operator's real owner, jurisdiction, purpose and review date. No statutory review interval is assumed.

```bash
npm run feedback -- add-dataset --name="Customer feedback" --owner="Analyst" --purpose="Improve service" --retention=2027-01-01 --jurisdiction=NZ --actor="Operator"
```

## add-response

Use supplied words and date. Omit score if unknown; only NPS scores belong in this field. New records await privacy review.

```bash
npm run feedback -- add-response --dataset="Customer feedback" --reference=RESP-1 --comment="Delivery arrived late" --date=2026-10-01 --segment=Wholesale --channel=Survey --score=3 --actor="Operator"
```

## add-theme

Read existing themes first and use a specific definition.

```bash
npm run feedback -- add-theme --name="Delivery promises" --definition="Whether the promised arrival date was met" --actor="Operator"
```

## code

Read the complete response first. The excerpt must occur exactly in its text. Coding starts proposed and does not enter counts until reviewed. No background classifier runs.

```bash
npm run feedback -- code --response=R-001 --theme="Delivery reliability" --excerpt="delivery arrived late" --sentiment=negative --rationale="Explicit missed arrival promise" --actor="Operator"
```

## review-code

First read the response and theme definition. Record the human reviewer's decision and reason. Do not silently accept a model's suggestion.

```bash
npm run feedback -- review-code --code=<id> --decision=accepted --note="Checked source words against theme definition" --actor="Reviewer"
```

## privacy-review

The operator checks the actual comment and preserved original fields. This records an attestation; it does not redact text or establish consent.

```bash
npm run feedback -- privacy-review --response=R-006 --note="Checked purpose, content and permitted sharing" --actor="Reviewer"
```

## add-action

Use an agreed action, named owner and due date. Keep the evidence link through its theme and dataset.

```bash
npm run feedback -- add-action --dataset="Harbour customer survey" --theme="Delivery reliability" --reference=A-003 --title="Review carrier cutoffs" --owner="Aroha" --due=2026-10-30 --actor="Operator"
```

## close-action

Inspect completion evidence first. A stored reference is not verification that the external file exists. Closing records today's date.

```bash
npm run feedback -- close-action --action=A-001 --evidence="archive://dispatch-review" --actor="Operator"
```

## retention

Read the current hold and compliance guide. Use the authorised purpose and review date. Releasing a legal hold needs the responsible person's decision. No deletion occurs.

```bash
npm run feedback -- retention --dataset="Harbour customer survey" --purpose="Ongoing experience review" --review=2027-01-01 --hold=false --actor="Operator"
```

## log

Only record what happened. Never fabricate meetings, quotes or decisions.

```bash
npm run feedback -- log --dataset="Harbour customer survey" --note="Checked delivery evidence with operations" --actor="Operator"
```

## draft-brief

Read the source summaries first. The command writes a unique draft under drafts, excluding verbatim comments. Review small-sample disclosure risk before any sharing. Never sends.

```bash
npm run feedback -- draft-brief --dataset="Harbour customer survey"
```

## import

Read docs/replace-thematic.md. Preview first, inspect counts and mappings, then rerun without --dry-run when the import is authorised. Changed repeats fail without partial writes.

```bash
npm run feedback -- import thematic --dataset="Customer feedback" --file=imports/responses.csv --actor="Operator" --dry-run
```

## export

Writes all seven record sets, including private comments and original fields, under exports. Treat the file as confidential. This does not back up external evidence documents.

```bash
npm run feedback -- export
```

## Calculations

Theme volume is the number of distinct responses with an accepted coding. Share divides that by all responses in the dataset. Segment share uses all responses in the same dataset and segment. A response may carry more than one theme. Counts are not unique people because the base does not infer respondent identity.

NPS equals one hundred times the promoter count minus detractor count, divided by scored responses. Promoters score nine or ten, detractors zero through six, passives seven or eight. A missing score does not enter the denominator. Score-drivers compares theme NPS with the full dataset NPS, which includes those theme responses. It is an association, not an independent control group or causal impact estimate. Small samples are explicitly flagged.

Trend shows accepted-theme response counts and all-response denominators for days (today minus thirty, today] and (today minus sixty, today minus thirty]. It does not claim significance or extrapolate a change. Reports use all recorded history unless a command says otherwise.

Accepted coding is immutable through the base CLI. Correcting a reviewed mistake requires a reviewed migration or scoped custom correction workflow that preserves prior decisions. The activity log is editable by the trusted database owner and is not tamper-proof. Concurrent operators should use shared Postgres with authenticated roles; PGlite permits one process at a time.
