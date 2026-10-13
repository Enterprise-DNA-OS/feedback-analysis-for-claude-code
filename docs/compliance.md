# Feedback records and privacy checks

Checked 13 October 2026. The checks prepare an internal review; they do not certify compliance. The operator determines which law applies, permitted uses and retention needs. No fixed statutory retention period is invented.

| Rule | Source | Check and limitation |
|---|---|---|
| NZ-IPP9 | [NZ Privacy Commissioner, Principle 9](https://www.privacy.org.nz/privacy-principles/9/) | Flags personal-data datasets without a purpose or a current retention review. The legal rule limits retention to the period needed for lawful use; our chosen review date is internal policy. |
| AU-APP11.2 | [OAIC, APP 11 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) | Flags the same review gap for an AU dataset. Destruction or de-identification duties depend on whether an APP entity still needs the information and whether retention exceptions apply. |
| POLICY-PRIVACY | Internal operating policy | New and imported comments need an operator privacy review before wider sharing. This is a recorded attestation, not automated redaction or proof of consent. |
| POLICY-EVIDENCE | Internal analysis policy | Proposed coding stays out of aggregate theme analysis. Acceptance records the reviewer and note. Excerpts must occur in the source comment. |

Legal holds are explicit records. Review reminders still surface under a hold; no command deletes anything. The operator must review retained CSV source fields, database backups, agent context and any previously generated exports as well as comments. Marking privacy review complete does not remove personal information.

Reports avoid verbatim comments by default. Small segment counts still risk identification. Keep generated files internal until a responsible reviewer checks them. Restrict local disk access. Shared installations need authenticated roles, least-privilege grants, encrypted backups and restore tests. Database tables have row-level security enabled with no public policy or grants. The base expects a trusted database owner and is not a multi-tenant service.

Do not send real feedback to an external model without the business's data-processing arrangements. There are no model API calls or automatic sends in this repository.
