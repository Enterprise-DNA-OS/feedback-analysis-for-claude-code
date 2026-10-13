# Record a retention decision

Read the current hold and compliance guide. Use the authorised purpose and review date. Releasing a legal hold needs the responsible person's decision. No deletion occurs.

```bash
npm run feedback -- retention --dataset="Harbour customer survey" --purpose="Ongoing experience review" --review=2027-01-01 --hold=false --actor="Operator"
```

Replace example values with the authorised records. For machine-readable output append --json. Resolve ambiguous names by showing the candidates and selecting the intended identifier. Never guess. Present the result in plain language with its dataset and sample size where relevant.
