# Total Borrowed is not a number this application has

The issue and Anastasia's design both ask the All Markets page to show three
figures: Total Value Locked, Total Borrowed and Total Interest Paid. Two of
those exist. The third does not, and the way it does not exist is worth writing
down, because the code reads as though it does.

## How it surfaced

The row was built, rendered against live mainnet data, and screenshotted. Total
Value Locked read `$180.19M`. Total Borrowed read `$180.19M`. Identical, to the
cent, which no two independent quantities are.

## Why

`src/lib/protocol-stats/queries.ts` computes one sum and returns it twice.

```text
const debtRaw = normalizeScaled(m.scaledTotalSupply, m.scaleFactor)
const debtUSD = toHuman(debtRaw, m.asset.decimals) * getPrice(m.asset.address)
tvlNow += debtUSD
...
return { tvlNow, ..., totalActiveDebtUSD: tvlNow }
```

`totalActiveDebtUSD` is assigned `tvlNow`. Both derive from
`scaledTotalSupply`, which is market supply. The field's name says outstanding
debt and its value is TVL.

That is not a bug in the arithmetic. In these markets a lender's deposit is the
borrower's debt, so supply and debt are genuinely the same sum, and the field
was only ever used as the denominator for a debt-weighted average APR, where
either reading gives the same answer. The name became misleading the moment
something tried to display it.

## What this run did about it

Step 2 added `totalBorrowed` to `ProtocolStats`, summing that field. Step 3
rendered it, saw two identical figures, and traced it here. So:

- the `totalBorrowed` field is withdrawn rather than shipped, because exposing a
  duplicate of `tvl` under a name implying a second quantity is worse than not
  exposing it
- the accumulator inside `aggregateChainStats` is named `tvlForAprWeight`, which
  is what it is
- the alias is documented at the point it is created in `queries.ts`, so the
  next person to reach for `totalActiveDebtUSD` reads what it is before using it
- the summary row ships with the two metrics that are real

## What a real Total Borrowed would need

The distinction the design wants is between what lenders have supplied and what
the borrower has actually drawn. Both sides exist on a market: `totalSupply` is
the lender claim and the borrower may hold part of it undrawn as market assets.
The gap between them is the number.

`protocol-stats` does not fetch market assets. Adding Total Borrowed means
extending the subgraph query and the per-chain aggregation to carry a second
sum, then deciding whether "borrowed" means outstanding principal, principal
plus accrued interest, or drawn-minus-repaid. That is a data change with a
definitional question attached, not a display change, and it is not what this
issue asked for.

## The other label

The design's third metric is Total Interest Paid. The field behind it is
`totalLenderFees`, which is interest accrued to lenders rather than interest a
borrower has handed over. The row says Total Interest Accrued for that reason.
If product wants the word Paid, the number behind it has to change too.
