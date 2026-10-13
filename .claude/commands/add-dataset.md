# Register a feedback source

Use the operator's real owner, jurisdiction, purpose and review date. No statutory review interval is assumed.

```bash
npm run feedback -- add-dataset --name="Customer feedback" --owner="Analyst" --purpose="Improve service" --retention=2027-01-01 --jurisdiction=NZ --actor="Operator"
```

Replace example values with the authorised records. For machine-readable output append --json. Resolve ambiguous names by showing the candidates and selecting the intended identifier. Never guess. Present the result in plain language with its dataset and sample size where relevant.
