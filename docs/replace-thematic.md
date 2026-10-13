# Replace the feedback register from Thematic

Sources checked 13 October 2026: [download responses](https://help.getthematic.com/article/59-how-to-download-your-data-from-thematic) and [documented CSV formats](https://help.getthematic.com/article/105-thematic-api-retrieving-data).

An authorised Thematic user can export response CSV. Reset filters if the intention is to bring all records. Exports depend on account permissions. This importer accepts one comment column per row, the original response identifier, date, optional segment, channel and NPS score. For a byResponse export it can also read the documented JSON theme list. Column names vary with the original dataset; map yours explicitly when needed.

Create an empty dataset first, without seeding demo records:

```bash
npm run migrate
npm run feedback -- add-dataset --name="Customer feedback" --owner="Analyst" --purpose="Improve service experience" --jurisdiction=NZ --retention=2027-01-01 --actor="Migration operator"
npm run feedback -- import thematic --dataset="Customer feedback" --file=imports/responses.csv --map=imports/mapping.json --actor="Migration operator" --dry-run
npm run feedback -- import thematic --dataset="Customer feedback" --file=imports/responses.csv --map=imports/mapping.json --actor="Migration operator"
```

The last line is the one-command import. mapping.json maps internal keys to exact CSV headings, for example:

```json
{"reference":"Survey response ID","comment":"What could we improve?","date":"Submitted date","score":"Recommend score","themes":"Comment themes"}
```

Date values must be ISO calendar dates, not ambiguous day/month strings. Score is specifically NPS 0 to 10. Do not map CSAT or satisfaction percentages to it. Missing scores remain missing. Standard recognised headings are Response ID, Comment, Date, Segment, Channel, NPS and Themes. Custom columns are preserved in source_data.

The importer checks the entire file and uses a transaction. Dry runs roll back all writes. Exact repeats are skipped; changed rows with an existing dataset/reference fail for explicit reconciliation. The same identifier in another dataset is independent. Missing identifiers or dates, duplicate identifiers within the file, malformed CSV, invalid scores and invalid theme JSON fail without partial inserts. Test fixtures are synthetic examples, not a real customer export.

Imported theme entries use base and optional sub labels. Numeric sentiment in the documented range supplies a proposed label only. Original metadata remains in source_data. Every imported coding starts proposed and uses the entire comment as its evidence excerpt; review it before accepting. The base does not reconstruct vendor probabilities, specificity calculations or character-location annotations. It does not reproduce Thematic's trained discovery model.

Denormalized responses, multiple comment questions, theme-chart exports and aggregate Export Assistant results need mapping before import. Dashboards, integrations, access permissions, workflows, attachments and vendor models are not in the response CSV. Enterprise DNA scopes these additions for your version. No source system is disabled by this tool.

Check record counts, theme counts, missing dates, missing scores, samples from each segment and your export filters. Reconcile against the source before switching. npm run feedback -- export writes all seven record sets, including original fields and review history, to a unique JSON file under exports. Referenced external evidence needs its own backup. Restoring a database uses its tested database backup process; the JSON export is portable records, not a one-command database restore.
