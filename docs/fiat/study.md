# Study: TVL momentum

Task issue: https://github.com/wildcat-finance/product/issues/682
Mirror: https://github.com/laurenceday/shoggoth-playground/issues/4

## Assumptions

1. The delivery target is `laurenceday/shoggoth-playground`, a copy of
   `wildcat-app-v2` at `a17f0fa`. The upstream repository is in a protected
   organisation and the write gate refuses it.
2. Anastasia's Figma is the design authority. It cannot be opened from here, so
   the two images attached to the issue are what this run works from. They were
   fetched with an authenticated request; the design file itself was not read.
3. The scope taken is the All Markets summary row. The market page work in the
   same design is four alternative treatments with none chosen, and picking one
   is a design decision rather than an implementation detail.
4. The baseline was measured before this study was written, so the numbers in
   item 3 of the runbook are observed rather than assumed.

## 1. Problem statement

The All Markets page opens on a filter bar and a table. Nothing on it says how
large the protocol is, so a lender deciding whether to deposit sees individual
markets without the context that others have already committed capital to them.
The issue calls this social proof and points at Euler, whose lend page carries
Total borrow and Total supply above the table.

Working means: the All Markets page shows Total Value Locked, Total Borrowed and
Total Interest Paid, in dollars, above the table, sourced from real protocol
data rather than a placeholder.

## 2. Prior art

The data already exists in this repository, which is the single most important
fact about this work. `src/lib/protocol-stats/` fetches, converts and aggregates
protocol figures across Ethereum and Plasma:

- `queries.ts` returns `ChainStats` per chain: `tvlNow`, `tvlMonthAgo`,
  `totalLenderFeesNow`, `totalLenderFeesMonthAgo`, `activeMarkets`,
  `newMarketsLast7d`, `aprWeightedSumByDebt` and `totalActiveDebtUSD`. It reads
  `tokenDailyPrices` from the subgraph, so figures are already in dollars rather
  than raw token amounts.
- `aggregate.ts` folds those into `ProtocolStats`: `tvl`, `tvlChangePct30d`,
  `avgAprWeighted`, `totalLenderFees`, `lenderFeesChange30dAbs`,
  `activeMarkets`, `newMarkets7d`.
- `useProtocolStats.ts` wraps it in react-query.
- `format.ts` has `fmtUSD`.

`src/components/Header/index.tsx` already consumes the hook and renders a TVL
figure, with a skeleton while it loads. So there is a working precedent in the
codebase for exactly this kind of display, and the new work can follow it.

Two of the three metrics the design asks for are therefore already aggregated.
The gap is Total Borrowed: `totalActiveDebtUSD` is computed per chain in
`ChainStats` and then dropped, because `aggregateChainStats` never sums it into
`ProtocolStats`.

## 3. Constraints and non-goals

Starting ref: `a17f0fa` on `laurenceday/shoggoth-playground` `main`, fetched and
fast-forwarded before the run branch was cut.

The tree is not green on arrival, measured before this study was written:

- `npm run lint` cannot run. No ESLint configuration is committed, so
  `next lint` stops at an interactive prompt.
- `npm run test` exits 1. 125 tests pass across 28 suites; two fail to run, and
  both are files whose contents are entirely commented out.
- `npm run build` exits 1 with `Failed to collect page data`, on a different API
  route each run.

Non-goals: the market page treatment, the sorted-column highlight visible in the
Euler reference, any change to how `protocol-stats` fetches or prices, the
market table itself, and fixing any of the three pre-existing problems above.

## 4. Design options

**A. Add `totalBorrowed` to `ProtocolStats` and build a summary row that reads
the existing hook.** The aggregate function already receives
`totalActiveDebtUSD` per chain and discards it; summing it is three lines. The
row then reads one hook that is already fetched and cached elsewhere in the
app. Trade: `ProtocolStats` grows a field, so anything constructing that type in
a test has to supply it.

**B. Compute the three figures in the component from `useAllTokensWithMarkets`.**
No change to shared code. Trade: the component would sum raw token amounts
across markets denominated in different assets, which is wrong without prices,
and prices live in `protocol-stats`. It would either duplicate that pricing or
produce a meaningless number.

**C. Add a new endpoint and hook for page-level stats.** Clean separation.
Trade: a second fetch of data the app already has, and a second thing to keep
correct.

**Chosen: A.** The data is fetched, priced and cached already; the only reason
Total Borrowed is unavailable is that one line drops it. B produces a wrong
number and C pays twice for the same data.

## 5. Risk register seed

```risk-register
wrong-aggregate | the new totalBorrowed sum in aggregateChainStats | the field sums the same per-chain values the other totals sum, over the same chain list, and no chain is counted twice or skipped
delta-window-mismatch | the change figures shown next to each metric | any percentage shown is labelled with the window it actually covers, and no thirty-day figure is presented as weekly
interest-semantics | the label used for totalLenderFees | the label says what the number is, given the field measures lender fees accrued rather than interest a borrower has paid
loading-and-empty | the row while the query is pending or has failed | the row shows a skeleton while loading and does not render a zero or a dash as though it were a real figure
type-widening | every construction of the ProtocolStats type | adding a field does not break an existing consumer or test that builds the type
structure-drift | the diff of every step | the table, the filters and the market page are untouched
```

`delta-window-mismatch` is the one that could ship a lie. The design shows
"+3.87% this week" against each figure. What the code has is
`tvlChangePct30d` and `lenderFeesChange30dAbs`, both thirty-day. Rendering a
thirty-day change under a "this week" caption would misstate the protocol's
growth to lenders, which is the opposite of what a trust-building feature should
do.

## 6. Glossary seeds

- `TVL`: total value locked, the dollar sum of market supply, `tvl` in
  `ProtocolStats`.
- `Total Borrowed`: the dollar sum of outstanding active debt,
  `totalActiveDebtUSD` per chain, not currently aggregated.
- `Lender fees`: what `totalLenderFees` measures. The design calls the third
  metric Total Interest Paid, which is a claim about the same underlying number.
- `Summary row`: the block of metrics above the filter bar on All Markets.

## 7. Sources

- Issue text and Anastasia's comment: `wildcat-finance/product#682`
- Euler reference image, attached to the issue body
- Wildcat design image, attached to Anastasia's comment
- Existing aggregation: `src/lib/protocol-stats/{queries,aggregate,format}.ts`
- Existing consumer to follow: `src/components/Header/index.tsx:71`
- Insertion point: `src/app/[locale]/lender/all-markets/components/AllMarketsSection/index.tsx`

## 8. Signals, and the questions behind them

**Does the row show three real figures?** Rendered against a live subgraph, the
three values are non-zero dollar amounts, and they match what
`useProtocolStats` returns.

**Is Total Borrowed aggregated correctly?** A unit test over
`aggregateChainStats` with known per-chain inputs, asserting the sum.

**Does any caption claim a window the number does not cover?** Read every string
the row renders against the field feeding it.

**Did anything else move?** The diff should touch the aggregate, the new
component, its insertion, and locale strings. A diff touching the table or the
filters has exceeded the issue.

## 9. Boundaries, per capability

**No new external boundary.** The row reads a hook that already fetches from
subgraph endpoints the app already calls. No new host, credential or input path.

**A widened shared type.** `ProtocolStats` gains a field, and every consumer and
test that constructs it is affected. That is the boundary this step actually
opens, and the control is a compile-time check plus a test over the aggregate.

## 10. The budget, or its absence

No performance budget. The row adds no fetch: `useProtocolStats` is already
called by the header and react-query dedupes by key, so the page pays for the
render only. If a later change makes it fetch separately, that is a `metron`
question and needs a measurement.

## 11. The fail-closed posture

A step stops when `npm run test` shows a new failure or a lower passing count
than the baseline, when the aggregate test fails, or when a caption cannot be
matched to the window of the field behind it.

Lint and build cannot be gates here, because both fail on the entry tree for
reasons this run does not touch. Their results are recorded and compared, not
required to pass.

## 12. Decisions and their homes

- **What the third metric is called.** The design says Total Interest Paid; the
  field is lender fees accrued. Whichever word is chosen, the reasoning goes in
  the commit and the pull request, because a reader will otherwise assume the
  label was copied from the design without checking.
- **Showing a thirty-day change under a weekly caption, or not showing it.**
  Recorded in the same place, and raised in the pull request for the designer
  rather than settled silently.
