# Record a feedback response

Use supplied words and date. Omit score if unknown; only NPS scores belong in this field. New records await privacy review.

```bash
npm run feedback -- add-response --dataset="Customer feedback" --reference=RESP-1 --comment="Delivery arrived late" --date=2026-10-01 --segment=Wholesale --channel=Survey --score=3 --actor="Operator"
```

Replace example values with the authorised records. For machine-readable output append --json. Resolve ambiguous names by showing the candidates and selecting the intended identifier. Never guess. Present the result in plain language with its dataset and sample size where relevant.
