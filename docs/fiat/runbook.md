# Runbook: TVL momentum

Derived from `.hexaemeron/study.md`. Three steps. The aggregate is widened
before anything renders it, so the one piece with a real correctness question
gets its own reviewable diff and its own test.

## Step 1: Commit the spec and record the baseline

**Goal.** Put the study and runbook in the repository with the measured state of
the tree before any code changes.

**Entry.** `fiat/682-tvl-momentum` at `a17f0fa`, the synced tip of
`laurenceday/shoggoth-playground` `main`.

**Exit.** `docs/fiat/study.md` and `docs/fiat/runbook.md` match the
`.hexaemeron` copies byte for byte, and `docs/fiat/baseline.md` records an exit
code and a reason for each of `npm run lint`, `npm run test` and `npm run
build`. Proved by: `diff` of each committed copy against its original exits 0,
and `baseline.md` naming all three results.

The baseline does not require any command to pass. Measured before this runbook
was written: lint cannot run because no ESLint configuration is committed, test
exits 1 with 125 passing and two entirely commented-out suites failing, and
build exits 1 on a different API route each attempt.

**Files.** `docs/fiat/study.md`, `docs/fiat/runbook.md`, `docs/fiat/baseline.md`.

**Tests.** None added. This step changes no code.

**Disciplines.** phylax: none, no boundary. ephoros: none, nothing unattended.
metron: none, no performance claim. elenchus: none, no failure in hand.
hypomnema: the baseline is the record later steps are compared against, and it
is written down because a terminal scrollback is not a record.

## Step 2: Aggregate total borrowed

**Goal.** Make the dollar total of outstanding debt available to the
application, from data it already fetches.

**Entry.** Step 1's branch and tree.

**Exit.** `ProtocolStats` carries `totalBorrowed`, summed from each chain's
`totalActiveDebtUSD` in `aggregateChainStats`. Proved by:

- a new unit test over `aggregateChainStats` asserting the sum for known
  per-chain inputs, including that a chain contributing zero does not change the
  total and that both chains are counted
- `npm run test` reports one more passing test than the baseline's 125, the same
  two suites failing and no third
- `npx tsc --noEmit` reports no error introduced by the new field, so no
  existing consumer or test that constructs `ProtocolStats` was broken

**Files.** `src/lib/protocol-stats/aggregate.ts`,
`src/lib/protocol-stats/aggregate.test.ts`.

**Tests.** `aggregate.test.ts`, new. It is the only place in this delivery where
a number is computed rather than displayed, so it is the only place a test can
say something a reader could not check by eye.

**Disciplines.** phylax: none, no new input path; the values summed are already
fetched and priced upstream. ephoros: none, this emits nothing. metron: none, an
addition over two elements has no measurable cost. elenchus: governs any test or
type failure this surfaces. hypomnema: none beyond the commit message; a summed
field is not an expensive decision to reverse.

## Step 3: Render the summary row and demonstrate

**Goal.** Show Total Value Locked, Total Borrowed and Total Interest Paid above
the All Markets table.

**Entry.** Step 2's branch and tree, with `totalBorrowed` available.

**Exit.** A summary row renders above the filter bar on All Markets, reading
`useProtocolStats`, showing a skeleton while the query is pending and omitting a
figure it does not have rather than printing zero. Every caption names the
window of the field behind it. Proved by:

- the rendered All Markets page containing the three labels and three dollar
  figures, captured as a screenshot committed under `docs/fiat/`
- a grep confirming no caption in the new component says "week" while reading a
  field whose name ends `30d`
- `npm run test` still reporting the step 2 count, the same two suites failing
  and no third
- `npm run build` compared against the baseline and its result recorded, since
  it is flaky on this tree and cannot be a gate

**Files.**
`src/app/[locale]/lender/all-markets/components/ProtocolSummaryRow/index.tsx`,
`src/app/[locale]/lender/all-markets/components/AllMarketsSection/index.tsx`,
`src/locales/en/en.json`, `docs/fiat/render-all-markets.png`.

**Tests.** None added. What this step does is place existing numbers on a page,
and a test asserting a label renders would restate the component rather than
check it. The screenshot and the caption grep are the evidence.

**Disciplines.** phylax: none, the row reads a hook already called by the
header. ephoros: none. metron: none, and explicitly so, since react-query
dedupes by key and the row adds no fetch. elenchus: governs any render failure.
hypomnema: the naming of the third metric, and whether a thirty-day change is
shown at all, are recorded in the commit and the pull request, per study item
12.
