# Architectural RFCs

This directory holds the Bayaan web app's architectural Request for Comments
documents.

## When to write an RFC

Open a regular PR by default. Reach for an RFC when the change is:

- Cross-cutting (touches more than one feature surface or domain).
- Introducing a new external dependency or service.
- Changing how data is persisted or how authentication works.
- Defining a new public contract (component API, store shape, route shape)
  that other features will build on.
- Modifying governance, contribution rules, or release process.

If you are not sure, open a regular PR. Reviewers will redirect to the RFC
track when the scope justifies it.

## Process

1. Copy [000-template.md](000-template.md) to a new file numbered
   sequentially: `001-short-title.md`.
2. Open an `rfc/NNN-short-title` branch and submit a PR. The PR may include
   scaffolding the design enables (types, contract test fixtures, CI workflow
   files) as long as no existing behaviour changes. Refactors of existing
   code go in named follow-up PRs that reference the merged RFC.
3. Discussion happens in PR comments. Substantive changes update the RFC
   document itself, so the merged version is the agreed design.
4. On merge, the RFC's status moves from `Proposed` to `Accepted`. Rejected
   RFCs are still merged for the historical record with status `Rejected`
   and a one-paragraph rationale.

## Index

No RFCs yet. The first will be numbered `001-*.md`.

## Conventions

- RFC numbers are sequential and never reused, even for rejected RFCs.
- The template's status table is the source of truth for whether an RFC is
  active.
- Superseded RFCs link forward to their replacement and keep their status as
  `Superseded by RFC-XXX`.
