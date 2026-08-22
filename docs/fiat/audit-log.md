# Audit log: market category rename

One section per round. Every risk-register id from the study gets a verdict in
every round.

## Step 1, round 1

Suite: waived. The Pashov suite is Solidity tooling and this repository has no
Solidity. Recorded on the ledger; nothing security-related ran.

Lints, on the five files this step changed:

- `phylax`: clean, exit 0
- `ephoros`: clean, exit 0
- `hypomnema`: clean, exit 0

`phylax` and `ephoros` skip markdown by suffix, so their clean here means no
applicable file rather than a review. `hypomnema` reads markdown and its clean
is a review. That distinction was established during the analytics run tonight
and holds the same way here.

Risk register:

- `stale-key-names`: not applicable. No key or value changed in this step.
- `missed-call-site`: not applicable. No call site changed.
- `grouping-changed`: not applicable. No filter touched.
- `anchor-breakage`: not applicable. The anchor is untouched.
- `locale-drift`: reviewed. `src/locales` holds only `en`, confirmed, so there
  is no second locale to fall behind.
- `structure-drift`: reviewed and clean. The diff is five files, all under
  `docs/fiat/`. Nothing under `src/`.

Findings: 0. The baseline's discoveries about the tree are recorded as
conditions rather than as findings of this round: they predate the run and this
round did not go looking for them.

## Step 2, round 1

Suite: waived, as recorded on the ledger.

Lints, on the changed source files:

- `phylax`: clean, exit 0
- `ephoros`: clean, exit 0
- `hypomnema`: clean, exit 0

Risk register:

- `stale-key-names`: closed. `selfOnboard` and `manual` are now `publicMarkets`
  and `privateMarkets`. No key under `dashboard.markets.tables.other` names a
  mechanism its label no longer mentions.
- `missed-call-site`: **fired, and this is the finding of the run.** The study
  recorded two components reading these keys. There are six, holding twelve
  call sites: both market tables, the mobile header, and the lender dashboard,
  borrower dashboard and lender nav sidebars. The study's prior art was built
  from a truncated grep and was wrong.

  A missing i18n key does not throw. `react-i18next` returns the key, so four
  sidebars would have rendered the literal string
  `dashboard.markets.tables.other.selfOnboard` to users, and every automated
  check in this runbook would still have passed. It was caught because the
  study made a grep for surviving references the exit condition rather than
  trusting the edit. Closed after all twelve were updated and the grep returned
  nothing.
- `grouping-changed`: reviewed and clean. The diff contains no filter
  predicate. `activeRows.filter` is untouched, so membership is identical.
- `anchor-breakage`: reviewed and clean. The `self-onboard` id, ref and redux
  target are unchanged, so the mobile header still scrolls to its section.
- `locale-drift`: closed. `src/locales` holds only `en`, so no second locale is
  now missing a key.
- `structure-drift`: reviewed and clean. Fourteen lines changed across seven
  files, every one a key name or a string value. No JSX, styling or spacing
  moved.

## A build failure that is not this run's

The step's exit asked for the build to match the baseline, which recorded exit
0. It does not: the build exits 1 with `Failed to collect page data`. That was
worked to cause rather than accepted or explained away.

The failing route is different on every run: `/api/mla/[market]/lenders`, then
`/api/invite/[address]`, then `/api/auth/login`, then
`/api/mla/[market]/[lender]/html`. That pattern says order-dependent, not
caused by any particular file.

A control build settles it. Stashing only the tracked source changes, clearing
`.next`, and building the pre-rename tree under the same environment fails the
same way, on another route again. The two builds differ only by this step's
diff, so the diff is not the cause.

The baseline's recorded exit 0 was therefore a single unreproducible
observation rather than a property of the tree, and that entry should not be
relied on. The honest statement is that this repository's build is flaky in
API page-data collection, before and after this change.

Findings: 0 attributable to this step. One pre-existing flaky build failure
identified and attributed, and one wrong assumption in the study corrected by
the exit condition that existed to catch it.
