# Runbook: replace the remaining history-based navigation

Derived from `.hexaemeron/study.md`. Two steps, because the study's two kinds
of control want different fixes and can ship and be verified separately. Step 1
replaces one history call with a link and opens no boundary. Step 2 introduces
a return-target contract and the redirect input it validates, which is the only
security surface in the run.

Neither step depends on the other, so the smaller one goes first and commits
the study, the runbook and the baseline alongside its change. Step 2 runs the
demo path from the study's problem statement.

Every jest command sets `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME`. Without it this
repository's jest collects zero tests and prints nothing while exiting 0
outside `--ci`, so an unset run reads as a pass and checks nothing. The study's
item 3 has the trace.

## Step 1: Send the borrower lenders-list back control to the borrower markets page

**Goal.** Make the back control on `/borrower/edit-lenders-list` an anchor to
`/borrower` instead of a history jump.

**Entry.** The run branch `fiat/replace-the-remaining-history-based-navigation-w`
at its cut from `develop`. Dependencies installed with
`PUPPETEER_SKIP_DOWNLOAD=true npm ci` under Node 22.22.1.

**Exit.** `LendersListSidebar` holds no `router.back()` and no `useRouter`
import; its control renders as an anchor whose `href` is `/borrower`; the
study, the runbook and the measured baseline are committed under `docs/fiat/`;
and neither `BackButton` nor `LenderMarketSidebar` appears in the diff. Proved
by one command that exits 0 only if all of that holds:

```bash
NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci \
  --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' \
  'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx' \
&& ! npx tsc --noEmit 2>&1 | grep -qE 'LendersListSidebar' \
&& ! grep -qE 'router\.back|useRouter' src/components/Sidebar/LendersListSidebar/index.tsx \
&& ! git diff --name-only develop...HEAD | grep -qE 'BackButton|LenderMarketSidebar' \
&& test -f docs/fiat/history-navigation-study.md \
&& test -f docs/fiat/history-navigation-runbook.md \
&& test -f docs/fiat/history-navigation-baseline.md
```

**Files.**

- `src/components/Sidebar/LendersListSidebar/index.tsx` -- changed. Replace the
  `router.back()` button with the shared back control pointing at
  `ROUTES.borrower.root`, and drop the `useRouter` import.
- `src/components/Sidebar/LendersListSidebar/index.test.tsx` -- created.
- `docs/fiat/history-navigation-study.md` -- created.
- `docs/fiat/history-navigation-runbook.md` -- created.
- `docs/fiat/history-navigation-baseline.md` -- created.

**Tests.** A new jsdom suite at
`src/components/Sidebar/LendersListSidebar/index.test.tsx`, two cases: the
control renders as an anchor whose `href` is `/borrower`; and the sidebar's
step buttons still dispatch their existing actions, so the replacement did not
take anything else with it. Expected count 2, taking the gate from 124 tests in
27 suites to 126 in 28.

The guard obligation, per Elenchus. Both cases run against the unchanged
component first and are shown to fail, then against the changed one and shown
to pass. Both outputs go in `docs/fiat/history-navigation-baseline.md`.

Elenchus runner contract, for any fix an audit round claims:

- Command:
  `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci --json --outputFile {report} --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' 'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx'`
- Report format: the jest `--json` result object.
- Report file: `.hexaemeron/warden-report.json`.

**Disciplines.** phylax: none, the step opens no boundary and closes one, since
it replaces a destination chosen by session history with a compile-time
constant. ephoros: none, nothing here runs unattended and the destination is
readable in the JSX. metron: none, no performance claim is made. elenchus:
applies, the new cases are held to the guard convention above. hypomnema:
applies, the control loses its history behaviour permanently and the reason has
to sit where the next contributor stands.

## Step 2: Return the agreement page to the page that sent the user there

**Goal.** Make the agreement page's cancel and both signature-success paths
navigate to a validated return target, falling back to the party root, so a
successful signature never leaves the application.

**Entry.** Step 1's branch at its exit state, with step 1's tests green.

**Exit.** A validation function accepts an in-app path and rejects an absolute
URL, a protocol-relative path, a scheme-bearing value and an in-app path
outside the known route prefixes; `RedirectsProvider` carries the pathname it
redirects away from as `returnTo`; `AgreementPage`, `useSignAgreement` and
`ReacceptButton` navigate to the validated target or to the party root and hold
no `router.back()`; and no rejected value reaches `router.push`. Proved by one
command that exits 0 only if all of that holds:

```bash
NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci \
  --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' \
  'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx' \
&& ! npx tsc --noEmit 2>&1 | grep -qE 'agreement|RedirectsProvider|returnTo' \
&& ! grep -rqE 'router\.back' src/app/\[locale\]/agreement \
&& ! git diff --name-only develop...HEAD | grep -qE 'BackButton|LenderMarketSidebar' \
&& test -f docs/fiat/history-navigation-demo.md
```

**Files.**

- `src/utils/returnTarget.ts` -- created. The validation function and the known
  route prefixes it matches against.
- `src/utils/returnTarget.test.ts` -- created. The accept and reject table.
- `src/providers/RedirectsProvider/index.tsx` -- changed. Carry the pathname
  being left as `returnTo` on the pushed agreement path.
- `src/app/[locale]/agreement/components/AgreementPage/index.tsx` -- changed.
  Cancel navigates to the validated target or the party root.
- `src/app/[locale]/agreement/hooks/useSignAgreement.ts` -- changed. Same on
  success.
- `src/app/[locale]/agreement/components/ReacceptButton/index.tsx` -- changed.
  Same on success.
- `src/app/[locale]/agreement/components/AgreementPage/index.test.tsx` --
  created.
- `docs/fiat/history-navigation-demo.md` -- created. The demo path from the
  study's problem statement, run and recorded.

**Tests.** Two new jsdom suites. `src/utils/returnTarget.test.ts` is a table:
accepted rows for plain in-app paths under each known prefix; rejected rows for
`https://evil.example/x`, `//evil.example/x`, `javascript:alert(1)`, a path
outside the known prefixes, an empty value and an absent value. Every rejected
row asserts the party root is returned. `AgreementPage/index.test.tsx` asserts
cancel navigates to the carried target when it is valid, and to the party root
when it is not. Expected count 12 or more, taking the gate to at least 138 in
30 suites.

The guard obligation, per Elenchus. Every new case runs against the unchanged
tree first and is shown to fail, then against the changed one and shown to
pass, with both outputs in `docs/fiat/history-navigation-demo.md`. The
signature-success paths are additionally demonstrated by asserting that the
mocked router receives an in-app path on success for every rejected return
target, which is the "successful signature never leaves the application"
condition stated as a test rather than as prose.

Elenchus runner contract, for any fix an audit round claims:

- Command:
  `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci --json --outputFile {report} --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' 'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx'`
- Report format: the jest `--json` result object.
- Report file: `.hexaemeron/warden-report.json`.

**Disciplines.** phylax: applies, this step turns the navigation destination
into external input read from a query parameter and owes the allowlist control
the study names. ephoros: none, the step adds nothing that runs unattended and
the rejection behaviour is a pure function of the URL and the party. metron:
none, no performance claim is made. elenchus: applies, the guard convention
governs every new case and the rejection table is where it bites hardest.
hypomnema: applies, the return-target contract is the decision other redirects
will copy, so its rule is recorded beside the validation function.

### Amendment -- 2026-08-26

**What changed.** Complete replacement Tests: A new jsdom suite at `src/components/Sidebar/LendersListSidebar/index.test.tsx`, two cases: the control renders as an anchor whose `href` is `/borrower`; and both step buttons still render, with the one matching `state.editLendersList.step` carrying the selected style, so the replacement did not disturb the rest of the sidebar. Expected count 2, taking the gate from 124 tests in 27 suites to 126 in 28. The guard obligation, per Elenchus. Both cases run against the unchanged component first, the first shown to fail and the second shown to pass, then against the changed one with both shown to pass. Both outputs go in `docs/fiat/history-navigation-baseline.md`. Elenchus runner contract, for any fix an audit round claims: Command: `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci --json --outputFile {report} --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' 'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx'`. Report format: the jest `--json` result object. Report file: `.hexaemeron/warden-report.json`.
**Why.** The replaced field said the step buttons "still dispatch their existing actions". They dispatch nothing: `handleClickEdit` and `handleClickConfirm` exist but their `onClick` bindings are commented out at lines 76 and 85, so the sidebar's step buttons are inert. A case asserting a dispatch that never happens could only be made to pass by writing the dispatch, which is scope this step does not have. The replacement asserts what the buttons actually do, which is render with a selected style driven by the store. The guard sentence is corrected in the same clause, because the second case passes before the change as well as after: only the first case is a guard, and claiming both were would be false.
**Steps touched.** Step 1's tests.
**Still holding.** Step 1: entry holds; exit holds. Step 2: entry holds; exit holds.

### Amendment -- 2026-08-26

**What changed.** Complete replacement Exit: `LendersListSidebar` holds no `useRouter` import and no `next/navigation` import; its control renders as an anchor whose `href` is `/borrower`; the study, the runbook and the measured baseline are committed under `docs/fiat/`; and neither `BackButton` nor `LenderMarketSidebar` appears in the diff. Proved by one command that exits 0 only if all of that holds: `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' 'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx' && ! npx tsc --noEmit 2>&1 | grep -qE 'LendersListSidebar' && ! grep -qE 'useRouter|next/navigation' src/components/Sidebar/LendersListSidebar/index.tsx && ! git diff --name-only develop...HEAD | grep -qE 'BackButton|LenderMarketSidebar' && test -f docs/fiat/history-navigation-study.md && test -f docs/fiat/history-navigation-runbook.md && test -f docs/fiat/history-navigation-baseline.md`
**Why.** The replaced exit grepped the file for `router\.back`, and the file now carries a comment recording why that call was removed, so the clause refused the very state it exists to require. This is the second time this run's lineage has hit it: pull request 34's exit had the same defect for the same reason, and writing this one anyway was careless. `useRouter` and `next/navigation` are code-only tokens that prose about the removed behaviour has no reason to contain, so the replacement asserts the imports are gone rather than searching for a call that a comment can also spell. A step whose exit is a text search constrains the comments in the files it searches, and that is worth knowing before writing either.
**Steps touched.** Step 1's exit.
**Still holding.** Step 1: entry holds; exit holds. Step 2: entry holds; exit holds.

### Amendment -- 2026-08-26

**What changed.** Complete replacement Files: `src/utils/returnTarget.ts` -- created. The validation function and the known route prefixes it matches against. `src/utils/returnTarget.test.ts` -- created. The accept and reject table. `src/providers/RedirectsProvider/index.tsx` -- changed. Carry the pathname being left as `returnTo` on the pushed agreement path. `src/app/[locale]/agreement/components/AgreementPage/index.tsx` -- changed. Cancel navigates to the validated target or the party root. `src/app/[locale]/agreement/hooks/useSignAgreement.ts` -- changed. Same on success, with the party taken from the pathname. `src/app/[locale]/agreement/components/ReacceptButton/index.tsx` -- changed. Same on success, with the party taken from its prop. `src/app/[locale]/agreement/components/AgreementPage/index.test.tsx` -- created. `src/app/[locale]/agreement/components/ReacceptButton/index.test.tsx` -- created. `src/app/[locale]/agreement/hooks/useSignAgreement.test.ts` -- created. `docs/fiat/history-navigation-demo.md` -- created. The demo path from the study's problem statement, run and recorded.
Complete replacement Tests: Four new jsdom suites. `src/utils/returnTarget.test.ts` is a table: accepted rows for plain in-app paths under each known prefix, including one carrying a query string; rejected rows for `https://evil.example/x`, `//evil.example/x`, `javascript:alert(1)`, a backslash authority, a path outside the known prefixes, a traversal that escapes a prefix, both agreement routes, a prefix look-alike, an empty value, null and undefined. Every rejected row asserts the party root is returned. `AgreementPage/index.test.tsx` asserts cancel navigates to the carried target when it is valid, keeps its query string, and goes to the party root when it is not. `ReacceptButton/index.test.tsx` and `useSignAgreement.test.ts` assert the same for both signature-success paths, each with a hostile-value loop asserting an in-app destination every time. Expected count 33 or more, taking the gate to at least 160 tests in 32 suites. The guard obligation, per Elenchus. Every case in the three component and hook suites runs against the unchanged sources first and is shown to fail, then against the changed ones and shown to pass, with both outputs in `docs/fiat/history-navigation-demo.md`. `returnTarget.test.ts` is exempt and is not counted as a guard: its subject is a new module, so before the change its cases could only fail by failing to import, which distinguishes nothing. Elenchus runner contract, for any fix an audit round claims: Command: `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com npx jest --ci --json --outputFile {report} --testPathIgnorePatterns '/node_modules/' 'src/app/api/mla/mla.test.ts' 'src/app/api/profiles/profile.test.ts' 'src/components/StoreProvider/index.test.tsx'`. Report format: the jest `--json` result object. Report file: `.hexaemeron/warden-report.json`.
**Why.** The replaced Tests field promised that the signature-success paths would be demonstrated by asserting what the router receives for every rejected target, and the first implementation covered only the cancel button. Rather than record the gap and move on, the two suites were written, so the sharpest case in the study, a successful signature throwing the user out of the application, is now asserted directly instead of inferred from the shared helper. The Files field is replaced in the same amendment because those two suites are files it did not list. The exemption for `returnTarget.test.ts` is stated rather than left implicit, because claiming a new module's own table as a guard would be false.
**Steps touched.** Step 2's files and tests.
**Still holding.** Step 2: entry holds; exit holds.
