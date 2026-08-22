# Runbook: market category rename

Derived from `.hexaemeron/study.md`. Two steps. The rename is small enough that
splitting it further would produce a step whose exit nothing could prove.

## Step 1: Commit the spec and record the baseline

**Goal.** Put the study and runbook in the repository and record what the
toolchain reports before any label changes.

**Entry.** `fiat/691-market-category-rename` at `a17f0fa`, the synced tip of
`laurenceday/shoggoth-playground` `main`.

**Exit.** `docs/fiat/study.md` and `docs/fiat/runbook.md` match the
`.hexaemeron` copies byte for byte. `docs/fiat/baseline.md` records, for each
of `npm run lint`, `npm run test` and `npm run build`, its exit code and the
reason for it, plus every current reference to the two keys being renamed.
Proved by: `diff` of each committed copy against its `.hexaemeron` original
exits 0, and `baseline.md` naming an exit code for all three commands.

The baseline does not require any of them to pass. This tree is not green on
arrival, and pretending otherwise would make every later exit unprovable. Lint
cannot run at all: no ESLint configuration is committed, so `next lint` stops
at an interactive prompt. `npm run test` exits 1 with three suites failing to
run, two of which are files whose contents are entirely commented out. Those
are pre-existing and this run does not fix them; recording them is what lets a
later step show it changed nothing.

**Files.** `docs/fiat/study.md`, `docs/fiat/runbook.md`, `docs/fiat/baseline.md`.

**Tests.** None added. The repository has a Jest suite and this step changes no
code, so the baseline records its result rather than extending it. What the
baseline finds is that the suite does not pass on arrival, which is the fact
every later step is measured against.

**Disciplines.** phylax: none, no boundary and no input path. ephoros: none,
nothing runs unattended. metron: none, no performance claim. elenchus: none, no
failure in hand. hypomnema: the baseline is what a later reader compares
against to see whether the suite result moved.

## Step 2: Rename the two categories and demonstrate

**Goal.** Both groups carry the new labels, and nothing in the repository still
names the old mechanism.

**Entry.** Step 1's branch and tree.

**Exit.** `dashboard.markets.tables.other.selfOnboard` becomes
`publicMarkets` holding `Public Markets`, and `manual` becomes
`privateMarkets` holding `Private Markets`. Both call sites in the lender table
and both in the borrower table resolve the new keys. Proved by:

- a grep for `other.selfOnboard` and `other.manual` across `src` returning
  nothing
- a grep for `publicMarkets` and `privateMarkets` returning exactly the two
  definitions and the four call sites
- the rendered all-markets page containing the strings `Public Markets` and
  `Private Markets`, and containing no text starting
  `dashboard.markets.tables`, which is what a failed lookup renders
- `npm run test` reports the same passing count as the baseline and exactly
  the same three pre-existing suite failures, with no new one. The absolute
  exit code stays 1 for reasons the baseline already recorded, so the check is
  that nothing moved rather than that everything passes
- `npm run build` matches the baseline result
- a screenshot of the section committed under `docs/fiat/`

**Files.** `src/locales/en/en.json`,
`src/app/[locale]/lender/all-markets/components/MarketsTables/OtherMarketsTable/index.tsx`,
`src/app/[locale]/borrower/components/MarketsSection/сomponents/MarketsTables/OtherMarketsTables/index.tsx`,
`docs/fiat/render-all-markets.png`.

**Tests.** None added. The existing suite covers the tables' behaviour, which
this step does not change, and a test asserting that a label reads Public
Markets would be a test of the locale file rather than of the application. The
grep exits and the rendered check are what hold the step.

**Disciplines.** phylax: none, no boundary changes. ephoros: none. metron:
none. elenchus: governs any suite failure this surfaces, worked to cause.
hypomnema: the decision to rename the keys rather than only the values, and to
leave the scroll anchor alone, is recorded in the commit and the pull request,
per study item 12.
