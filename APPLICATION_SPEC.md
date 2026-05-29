# Technical specification

## Architecture

The system separates interpretation, persistence and deterministic calculation.

- Next.js is only the UI and calls the NestJS API.
- NestJS owns file upload, Claude integration, normalization, business rules and persistence.
- PostgreSQL stores master data, metrics, configurations and proposal versions.
- Claude is used to interpret ambiguous Excel structures. It should not decide business quantities.

## Data model overview

ImportBatch:
- original file metadata, file hash, mapping JSON, status and row count.

Article:
- code, description, unitCost, currentStock, packaging and cost exception flag.

ArticleMetric:
- import-specific rotation/consumption data and avgDailyDemand.

KanbanConfig:
- user-editable parameters and rounding rules.

KanbanProposal:
- proposal version, source hash, config snapshot and summary.

KanbanProposalItem:
- per-article Kmin, Klot, Kmax, values, control type and diff from previous proposal.

## Why Claude only maps columns

Excel files can have different header names, sheet structures or language variants. Claude is valuable for mapping headers and detecting intent. Once canonical fields are mapped, calculations are deterministic and auditable.

## User-friendly explanation of formulas

Kmin answers: when should I trigger replenishment?
- It covers expected consumption while waiting for replenishment plus a safety buffer.

Klot answers: how much should I replenish each time?
- Cheap items receive larger lots because the cost of holding inventory is low and stockouts are more annoying than small overstock.
- More expensive items receive smaller lots to avoid immobilizing unnecessary value.

Kmax answers: how much should there be right after replenishment?
- It is the reorder point plus the replenishment lot.

## Default Lean logic

- Kmin protects service continuity.
- Klot controls replenishment effort and inventory value.
- Kmax defines the visual maximum in the bin, shelf or two-bin system.

## Recommended deployment

- API and Web as separate containers.
- Managed PostgreSQL.
- Object storage for original Excel files if file retention is required.
- Environment variables managed by the deployment platform.
- Audit log for imports, config changes and approved proposals.
