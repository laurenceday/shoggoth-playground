# Baseline: shoggoth-playground before the TVL summary row

Measured on the entry tree at `a17f0fa`, **before the study and runbook were
written**, so their exit conditions describe the tree that exists rather than
one assumed to be green.

## Toolchain

`npm run lint`: **cannot run.** No ESLint configuration is committed anywhere,
so `next lint` stops at its interactive "How would you like to configure
ESLint?" prompt and exits 1. There is no non-interactive result, so lint is
treated as unavailable rather than failing, and it is not a gate in this run.

`npm run test`: **exit 1.** 125 tests pass across 28 suites. Two suites fail to
run, both files whose contents are entirely commented out:
`src/app/api/mla/mla.test.ts` at 177 lines and
`src/app/api/profiles/profile.test.ts` at 974.

`npm run build`: **exit 1**, with `Failed to collect page data`. The failing
route differs between runs, which makes it order-dependent rather than caused by
any one file. Not a gate here for that reason; its result is recorded and
compared.

Both test and build need two environment variables that nothing documents:
`NEXT_PUBLIC_TARGET_NETWORK` and `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME`. There is no
`.env.example`, and neither name appears in the README or AGENTS.md.

## A correction to the earlier run's baseline

The `product#691` run recorded three failing suites and 125 passing tests. The
third failure, `src/components/StoreProvider/index.test.tsx`, was an error in
how that baseline was taken rather than a property of the tree. It was run with
`REACT_APP_TARGET_NETWORK` set, which nothing reads: `src/config/network.ts`
reads `process.env.NEXT_PUBLIC_TARGET_NETWORK` while its assertion message names
`REACT_APP_TARGET_NETWORK`. Following the message sets the wrong variable.

With the variable the code actually reads, that suite passes. The true baseline
is 125 passing and two failing suites, both of them the commented-out files.
`product#691`'s delivery is unaffected, because its before and after were taken
under the same conditions and matched, but its description of the third failure
as pre-existing was wrong.

## What this run is measured on

- step 2 adds one passing test, so 126 passing
- the same two suites fail, and no third
- `npx tsc --noEmit` introduces no new error
- build is recorded and compared, not required to pass

## The data this feature needs, and where it already is

`src/lib/protocol-stats/` already fetches, prices and aggregates protocol
figures across Ethereum and Plasma. `ProtocolStats` today carries `tvl`,
`tvlChangePct30d`, `avgAprWeighted`, `totalLenderFees`,
`lenderFeesChange30dAbs`, `activeMarkets` and `newMarkets7d`, and
`src/components/Header/index.tsx` already renders TVL from it.

`totalActiveDebtUSD` is computed per chain in `ChainStats` and then dropped:
`aggregateChainStats` never sums it. That single omission is the only reason
Total Borrowed is unavailable to the application.
