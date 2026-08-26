# Runbook: Back To Markets returns to the lender markets page

Derived from `.hexaemeron/study.md`. One step, because the study's chosen
design is one deletion at one call site and the check that proves it. There is
nothing a second step could start from that this one does not finish.

The step carries all three of Protasis's fixed points at once. It scaffolds, by
committing the study, the runbook and the recorded baseline. It builds, by
removing the history branch. It demonstrates, by running the demo path from the
study's problem statement.

Every jest command below sets `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME`. Without it
this repository's jest collects zero tests and prints nothing while exiting 0
outside `--ci`, so an unset run reads as a pass and checks nothing. The reason
is in the study's item 3.

## Step 1: Link Back To Markets to the markets page and demonstrate it

**Goal.** Make the lender market page's "Back To Markets" control go to
`/lender` every time, instead of to whatever the tab held before.

**Entry.** The run branch `fiat/32-back-to-markets-lender-markets-page`
at its cut from `main`, commit `a17f0fa6fece61b3c118c8995d1bfce47d77ce09`.
Dependencies installed with `PUPPETEER_SKIP_DOWNLOAD=true npm ci` under Node
22.22.1.

**Exit.** `BackButton` renders only a `next/link` anchor and holds no reference
to `router.back()` or `window.history`; the `back` prop is gone from
`BackButtonProps` and from its one call site; a new jsdom suite asserts the
lender control is an anchor to `/lender`; and the study, the runbook and the
measured baseline are committed under `docs/fiat/`. Proved by one command that
exits 0 only if all of that holds:

```bash
NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci \
  --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' \
  'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx' \
&& test "$(npx tsc --noEmit 2>&1 | grep -c 'error TS')" = 4 \
&& ! grep -qE 'router\.back|history\.length' src/components/BackButton/index.tsx \
&& grep -q 'link={ROUTES.lender.root}' src/components/Sidebar/LenderMarketSidebar/index.tsx \
&& test -f docs/fiat/study.md && test -f docs/fiat/runbook.md && test -f docs/fiat/baseline.md
```

The jest clause excludes exactly the three suites the study recorded as failing
before any change, and nothing else. The tsc clause pins the pre-existing error
count at four rather than demanding zero, for the reason in the study's item 3.

**Files.**

- `src/components/BackButton/index.tsx` -- changed. Delete the `back` branch,
  the `back` prop and the now-unused `useRouter` import.
- `src/components/Sidebar/LenderMarketSidebar/index.tsx` -- changed. Drop
  `back` from the call site, keeping `link={ROUTES.lender.root}`.
- `src/components/BackButton/index.test.tsx` -- created. The new suite.
- `docs/fiat/study.md` -- created. The receipted study.
- `docs/fiat/runbook.md` -- created. This file.
- `docs/fiat/baseline.md` -- created. The pre-change measurements and the guard
  demonstration.

**Tests.** A new jsdom suite at `src/components/BackButton/index.test.tsx`,
four cases: the lender market sidebar renders its control as an anchor whose
`href` is `/lender`; `BackButton` renders an anchor for a supplied `link`;
it falls back to the borrower root when no `link` is given; and it fires
`onClick` when activated. Expected count 4, taking the gate from 124 tests in
27 suites to 128 in 28.

The guard obligation, per Elenchus. Before the component change is committed,
the first case is run against the component as it stands on `main` and shown to
fail, then against the changed component and shown to pass. Both outputs go in
`docs/fiat/baseline.md`. A test never seen to fail is not evidence.

Elenchus runner contract, for any fix an audit round claims:

- Command:
  `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci --json --outputFile {report} --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' 'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx'`
- Report format: the jest `--json` result object.
- Report file: `.hexaemeron/warden-report.json`.

**Disciplines.** phylax: none, the step opens no boundary and closes one, since
it removes a navigation target chosen by session history the application does
not own and replaces it with a compile-time constant. ephoros: none, nothing
here runs unattended and the destination is readable in the JSX rather than
needing a signal to recover it. metron: none, no performance claim is made and
nothing in the change is motivated by speed. elenchus: applies, both because
the jest-silence failure was worked to cause during the study and because the
new test is held to the guard convention above. hypomnema: applies, removing
`back` from a shared component's props is the decision that will be silently
reversed unless the reason sits where the next contributor stands, so it is
recorded in a comment at the component and argued in the pull request body.

### Amendment -- 2026-08-26

**What changed.** Complete replacement Exit: `BackButton` renders only a `next/link` anchor, holds no `useRouter` import and no `back` prop, and neither does its one call site; a new jsdom suite asserts the lender control is an anchor to `/lender`; and the study, the runbook and the measured baseline are committed under `docs/fiat/`. The type clause asserts that no type error names a file this step changed, rather than pinning a count that moves with whether the generated `next-env.d.ts` exists. Proved by one command that exits 0 only if all of that holds: `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' 'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx' && ! npx tsc --noEmit 2>&1 | grep -qE 'BackButton|LenderMarketSidebar' && ! grep -qE 'useRouter|back\?:' src/components/BackButton/index.tsx && grep -q 'link={ROUTES.lender.root}' src/components/Sidebar/LenderMarketSidebar/index.tsx && ! grep -q 'title="Back To Markets" back' src/components/Sidebar/LenderMarketSidebar/index.tsx && test -f docs/fiat/study.md && test -f docs/fiat/runbook.md && test -f docs/fiat/baseline.md`
**Why.** The replaced exit failed on two clauses of its own making rather than on the change. It pinned the type-error count at four, which was misread from a truncated baseline view and in any case varies between five and zero according to whether Next has generated `next-env.d.ts`. And it grepped the component for `router.back`, which now matches the comment recording why that call was removed, so the clause would refuse the very state it exists to require.
**Steps touched.** Step 1's exit.
**Still holding.** Step 1: entry holds; exit holds.
