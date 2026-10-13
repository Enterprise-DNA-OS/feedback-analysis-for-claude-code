# Accept or reject a proposed theme

First read the response and theme definition. Record the human reviewer's decision and reason. Do not silently accept a model's suggestion.

```bash
npm run feedback -- review-code --code=<id> --decision=accepted --note="Checked source words against theme definition" --actor="Reviewer"
```

Replace example values with the authorised records. For machine-readable output append --json. Resolve ambiguous names by showing the candidates and selecting the intended identifier. Never guess. Present the result in plain language with its dataset and sample size where relevant.
