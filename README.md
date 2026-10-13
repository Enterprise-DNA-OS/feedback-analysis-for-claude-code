# Feedback Analysis for Claude Code

Customer comments, reviewed themes and accountable improvements in a database you own. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install, try the demo, import your response export. | Your themes, privacy rules, source connections and reports. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=thematic&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=thematic&utm_medium=managed) |

Thematic lists Foundation at $25,000 per year on its [pricing page](https://getthematic.com/product/plan-and-pricing), checked 13 October 2026. The page does not specify a currency code. This is a published price, not a verified customer's invoice or a savings promise. [Research and six scores](docs/research.md).

## The five weekly jobs

Bring in new feedback, review evidence coding, compare customer groups, chase improvement actions and prepare the Monday brief. The fictional Harbour demo includes an overdue delivery action, proposed invoice coding, a quiet support source, a missing NPS score and an overdue retention review.

The base stores and analyses reviewed evidence. It does not reproduce Thematic's proprietary automated theme discovery. Ask your coding agent to propose labels, then review the exact source words before accepting them. No paid model call is built in.

## Quick start

Node 20 or later, Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/feedback-analysis-for-claude-code.git
cd feedback-analysis-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

PGlite stores the local demo under .data/db. Set DATABASE_URL for a shared Postgres database; use a trusted operator role. For real records, choose a separate DATA_DIR and run migrate without seed. The demo uses relative dates on first seed and repeat seeds preserve existing rows. Read [the switch guide](docs/replace-thematic.md) before importing.

## 28 CLI commands and 29 slash recipes

/datasets, /responses, /response, /themes, /theme-volume, /segment-compare, /score-drivers, /trend, /review-queue, /actions-due, /attention, /compliance, /activity, /weekly-review, /add-dataset, /add-response, /add-theme, /code, /review-code, /privacy-review, /add-action, /close-action, /retention, /log, /draft-brief, /import, /export, /customise, /new-view. CLI help lists arguments. [Full command reference and calculations](docs/cli.md). Every command supports --json; ambiguous names list candidates and fail.

## Ten questions for your customer review

Thematic already offers natural-language analysis, charts and exports. These are working questions against this base's records, not claims that the vendor cannot answer them.

- Which themes combine negative comments with no assigned action? `theme-volume`
- Do wholesale and retail customers mention the same problems at the same rate? `segment-compare`
- How many scored responses sit behind each theme score? `score-drivers`
- Which themes gained mentions across the last two thirty-day periods? `trend`
- Which responses still have proposed labels or no accepted theme? `review-queue`
- Which feedback datasets have gone quiet while actions remain overdue? `attention`
- What action evidence is due before our next review? `actions-due`
- Which datasets need a personal-information retention review? `compliance`
- Who reviewed a theme assignment and what source words support it? `response --response=R-001`
- What are the accepted themes, review backlog and action commitments for Monday? `weekly-review`

## Your first hour: ten things to ask for

1. Put our business name, logo and colours on the feedback brief.
2. Show overdue improvement actions with their owners.
3. Compare wholesale and retail theme shares with response counts.
4. Show the missing-score count before discussing NPS.
5. List proposed themes awaiting review.
6. Draft a brief without customer quotations.
7. Preview our Thematic response export without saving it.
8. Check which sources have no recent feedback.
9. Add our product family as a new field and migration.
10. Create a read-only view for the operations meeting.

## Documents and views

brand.json controls the business name, logo, colours and footer. npm run docs creates a feedback evidence brief, action register and retention review for each dataset. npm run view creates the weekly read-only snapshot. Outputs are local HTML, escaped and printable. They are internal drafts until reviewed; no sender is present.

[Compliance checks](docs/compliance.md) cite NZ privacy Principle 9 and Australian APP 11 guidance, distinguish internal review policy and preserve legal holds. They do not certify compliance or redact private data. [Why no front end](docs/why-no-front-end.md) states the operating limits and the additions Enterprise DNA can scope.

## Switch in a day

```bash
npm run feedback -- import thematic --dataset="Customer feedback" --file=imports/responses.csv --actor="Migration operator" --dry-run
npm run feedback -- import thematic --dataset="Customer feedback" --file=imports/responses.csv --actor="Migration operator"
```

Create the dataset first. The one-command import carries response text, dates, segments, channels, NPS and optional vendor themes. Use --map for custom headings. Original fields are preserved; imported coding awaits review. Repeat imports skip identical records and reject changed repeats for reconciliation. Dashboards, trained models, access permissions and integrations require separate work. [Export steps and boundaries](docs/replace-thematic.md).

## Verification

npm test passes on local PGlite and exercises every CLI command, idempotent seeds and migrations, theme denominators, null scores, review transitions, ambiguous names, failed-import rollback, exact repeats, mapping, exports, drafts and escaped HTML. GitHub checks run the same suite on Linux, Windows and Postgres. TEST_DATABASE_URL must point to an empty disposable database when used; tests create records there.

MIT licence. Not affiliated with Thematic or Anthropic. Database hosting and coding-agent use have their own costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=thematic&utm_medium=readme).
