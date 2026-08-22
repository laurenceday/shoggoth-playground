# Baseline: shoggoth-playground before the category rename

Recorded on the entry tree of step 1, at `a17f0fa`, before any label changed.
Every later step is measured against this rather than against zero.

## The tree is not green on arrival

This is the fact that shapes the rest of the run. Two of the three commands a
step would normally lean on cannot be used as a pass or fail signal.

`npm run lint`: **cannot run.** No ESLint configuration is committed. `git
ls-files` matches nothing for eslint, `package.json` has no `eslintConfig`
block, and nothing is gitignored, so `next lint` stops at its interactive
"How would you like to configure ESLint?" prompt and exits 1. There is no
non-interactive result to record, so this run treats lint as unavailable rather
than as failing.

`npm run test`: **exit 1.** 124 tests pass across 27 suites. Three suites fail
to run:

- `src/app/api/mla/mla.test.ts`: 177 lines, every one commented out. Jest
  reports "Your test suite must contain at least one test."
- `src/app/api/profiles/profile.test.ts`: 974 lines, likewise entirely
  commented out.
- `src/components/StoreProvider/index.test.tsx`: needs
  `REACT_APP_TARGET_NETWORK` to be one of Sepolia, Mainnet, PlasmaTestnet or
  PlasmaMainnet. Jest reads env through `next/jest`, which loads `.env` files
  rather than the shell, and no `.env` is committed. Setting the variable in
  the shell does not reach it.

`npm run build`: **exit 0**, with two environment variables set on the command
line: `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME` and `REACT_APP_TARGET_NETWORK`. Without
the first, `next.config.mjs` fails validation because
`images.remotePatterns[0].hostname` reads an unset variable. Neither is
documented: there is no `.env.example`, and neither name appears in the README
or AGENTS.md. A clean clone cannot be built without knowing them.

None of this is caused by this run and none of it is fixed by it. Two of these
are worth someone's attention on their own account: over eleven hundred lines
of commented-out API tests, and a repository that cannot be linted or built
from a fresh clone without undocumented variables.

## What this run is measured on

Since lint is unavailable and the test exit code is already 1, the signal for
step 2 is comparative:

- the same 124 tests pass
- exactly the same three suites fail, and no fourth
- `npm run build` still exits 0 with the same two variables set
- the greps in the step's exit condition return what it says they must

## The keys being renamed, as they stand

```text
src/locales/en/en.json:152          "selfOnboard": "Self-Onboard"
src/locales/en/en.json:153          "manual": "Onboard by Borrower"
```

Call sites:

```text
src/app/[locale]/lender/all-markets/components/MarketsTables/OtherMarketsTable/index.tsx:492   other.selfOnboard
src/app/[locale]/lender/all-markets/components/MarketsTables/OtherMarketsTable/index.tsx:520   other.manual
src/app/[locale]/borrower/components/MarketsSection/сomponents/MarketsTables/OtherMarketsTables/index.tsx:483   other.selfOnboard
src/app/[locale]/borrower/components/MarketsSection/сomponents/MarketsTables/OtherMarketsTables/index.tsx:511   other.manual
```

Four call sites, two definitions. Both tables read the same keys, so both
follow from one change.

## First attempt

This run was initialised twice, for the same reason as the analytics run
earlier tonight. The runbook's exits were written assuming lint and tests pass;
the baseline found they do not. Correcting a receipted runbook is refused by the
controller, and protasis requires the correction to append as an amendment, so
the run was re-initialised on corrected exits. The first attempt's ledger is in
`halted-run/`. The conflict is filed as wildcat-finance/skills#446.
