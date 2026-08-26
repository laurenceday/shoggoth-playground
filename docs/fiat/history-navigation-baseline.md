# Baseline and guard demonstration: remaining history-based navigation

Measured on `fiat/replace-the-remaining-history-based-navigation-w`, cut from
`develop`, before any file in step 1 was changed. At that point `develop` and
`main` held the same commit, and pull request 34 was open and unmerged.

## Environment

Node 22.22.1 and npm 11.12.0, matching `engines`. Dependencies installed with:

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm ci
```

A plain `npm ci` fails in the puppeteer postinstall, on a browser cache holding
the version directory without its executable. Nothing in the jest suite reaches
puppeteer.

## Jest needs NEXT_PUBLIC_TOKENS_IMG_HOSTNAME

Unset, `next.config.mjs` produces an undefined image hostname, Next rejects the
config, and `next/jest` hands jest a configuration that collects zero tests and
prints nothing while exiting 0 outside `--ci`. A run in that state reads as a
pass. Every jest command in this run sets it to `raw.githubusercontent.com`, a
hostname the same config file already lists.

## Pre-change jest result

```bash
NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci
```

```text
Test Suites: 3 failed, 27 passed, 30 total
Tests:       124 passed, 124 total
```

The three failures are pre-existing and unrelated:

| Suite | Reason |
| --- | --- |
| `src/components/StoreProvider/index.test.tsx` | "Your test suite must contain at least one test"; its cases are commented out. |
| `src/app/api/mla/mla.test.ts` | `REACT_APP_TARGET_NETWORK is not set or is invalid`. |
| `src/app/api/profiles/profile.test.ts` | The same. |

Identical to what the issue 32 run measured and to what pull request 13
recorded independently. Gates exclude exactly those three, and on the
pre-change tree the gate passes with 27 suites and 124 tests.

## Type check

`npx tsc --noEmit` reports zero errors when the generated `next-env.d.ts` is
present and five `TS2307` errors on image imports when it is not. That file is
produced by Next tooling and is not committed. Gates here assert that no error
names a file the step changed, which holds in both states.

## What the inventory found

Five history calls at this base. One belongs to pull request 34 and is out of
scope. The other four are this run's subject.

| Site | Route | Guarded |
| --- | --- | --- |
| `src/components/BackButton/index.tsx:50` | lender market sidebar | `history.length > 1`; out of scope, pull request 34 |
| `src/components/Sidebar/LendersListSidebar/index.tsx:24` | `/borrower/edit-lenders-list` | no |
| `src/app/[locale]/agreement/components/AgreementPage/index.tsx:144` | agreement cancel | no |
| `src/app/[locale]/agreement/hooks/useSignAgreement.ts:96` | after a successful signature | no |
| `src/app/[locale]/agreement/components/ReacceptButton/index.tsx:25` | after a successful re-acceptance | no |

## Step 1 guard demonstration

The suite was written before the component changed and run against it.

Before, `npx jest src/components/Sidebar/LendersListSidebar`:

```text
Tests:       1 failed, 1 passed, 2 total

  ● LenderListSidebar > gives its back control a link to the borrower markets page

    Unable to find an accessible element with the role "link" and name
    `/lenderMarketList.sidebar.back/i`
```

Only the first case is a guard. The second passes before the change as well as
after, because it asserts the step buttons keep rendering with the current step
selected, which the change is not supposed to alter. The runbook amendment
dated the same day says so rather than claiming both cases are guards.

After the change, the same command:

```text
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

## A note on what step 1 replaced

The button removed here was a copy of `BackButton`. Its `sx` block and its icon
styles matched that component's `buttonSx` and `iconSx` exactly, with
`router.back()` in place of the link. Replacing it with `BackButton` renders
the same markup and removes the duplicate, so the visual result is unchanged.
