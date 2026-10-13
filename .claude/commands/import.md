# Bring across Thematic responses

Read docs/replace-thematic.md. Preview first, inspect counts and mappings, then rerun without --dry-run when the import is authorised. Changed repeats fail without partial writes.

```bash
npm run feedback -- import thematic --dataset="Customer feedback" --file=imports/responses.csv --actor="Operator" --dry-run
```

Replace example values with the authorised records. For machine-readable output append --json. Resolve ambiguous names by showing the candidates and selecting the intended identifier. Never guess. Present the result in plain language with its dataset and sample size where relevant.
