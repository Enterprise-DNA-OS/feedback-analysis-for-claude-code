# Feedback Analysis for Claude Code: operating instructions

Read the README and docs/cli.md. Business: the operator's business. The installed demonstration is fictional Harbour feedback; do not describe it as customer evidence.

The database is the source of truth. Read before writing. Never invent comments, themes, scores, compliance findings, meetings or command output. No sends, deletion, public sharing or external model calls without the operator's explicit authority. Writes require a named actor. For private data, inspect the business's access and processing arrangements first.

## One path for each recurring job

| Ask | Recipe |
|---|---|
| Review feedback sources | /datasets |
| List incoming feedback | /responses |
| Read one response and its evidence | /response |
| Review the coding dictionary | /themes |
| Review accepted themes | /theme-volume |
| Compare customer groups | /segment-compare |
| Check scores behind the themes | /score-drivers |
| Compare two feedback periods | /trend |
| Review uncoded and unapproved feedback | /review-queue |
| Review feedback action commitments | /actions-due |
| Find quiet sources and overdue action | /attention |
| Prepare the privacy and evidence review | /compliance |
| Read the operator history | /activity |
| Write the Monday feedback review | /weekly-review |
| Register a feedback source | /add-dataset |
| Record a feedback response | /add-response |
| Define a local theme | /add-theme |
| Propose evidence coding | /code |
| Accept or reject a proposed theme | /review-code |
| Record review of a comment | /privacy-review |
| Assign a feedback improvement | /add-action |
| Close an action with evidence | /close-action |
| Record a retention decision | /retention |
| Log a review note | /log |
| Draft an internal feedback brief | /draft-brief |
| Bring across Thematic responses | /import |
| Export the complete feedback records | /export |
| Add fields or change a rule | /customise |
| Add a read-only snapshot | /new-view |

Open the matching .claude/commands file and follow it. Commands run through npm run feedback --. The schema lives in supabase/migrations, source records in the database, drafts in drafts, private exports in exports. Do not edit an applied migration.

Proposed coding must cite exact source text. A person reviews acceptance and privacy decisions. Imported coding is not accepted automatically. Aggregate reports count only accepted coding; always show denominators. NPS association is not causation. Do not compare different source populations as though they are an experiment.

Only trusted operators use this base. PGlite is single-process. Shared Postgres requires authenticated restricted roles and tested backups. Public database access is denied by default. RLS is not a complete multi-tenant authorisation design. Documents are read-only internal snapshots. Every retention rule cites docs/compliance.md; a hold never authorises disposal.

For changes, run npm test and npm run demo. Keep AGENTS.md beside this file for other coding agents. Enterprise DNA installs and operates the agreed version through Omni by Enterprise DNA for one setup fee, then a retainer.
