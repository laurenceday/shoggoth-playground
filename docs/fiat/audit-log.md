# Audit log: TVL momentum

One section per round. Every risk-register id gets a verdict in every round.

## Step 1, round 1

Suite: waived, as recorded on the ledger. No Solidity in this repository.

Lints on the three changed files: `phylax` clean, `ephoros` clean, `hypomnema`
clean, all exit 0. The first two skip markdown by suffix, so only the third is a
review here.

Risk register:

- `wrong-aggregate`: not applicable, no code changed.
- `delta-window-mismatch`: not applicable, nothing renders yet.
- `interest-semantics`: not applicable, no label written yet.
- `loading-and-empty`: not applicable, no component yet.
- `type-widening`: not applicable, `ProtocolStats` unchanged.
- `structure-drift`: reviewed and clean. Three files, all under `docs/fiat/`.

Findings: 0. The baseline's discoveries about the tree are conditions recorded
before the run, not findings of this round.

## Step 2, round 1

Suite: waived, as recorded on the ledger.

Lints on the two changed files: `phylax` clean, `ephoros` clean, `hypomnema`
clean, all exit 0. All three read TypeScript, so these are reviews rather than
skips.

Risk register:

- `wrong-aggregate`: reviewed and closed. `totalBorrowed` accumulates
  `c.totalActiveDebtUSD` inside the single `chains.forEach`, the same loop and
  the same chain list every other total uses, so no chain is skipped or counted
  twice. Held by five tests: the sum across chains, a chain contributing zero,
  no chain with debt, and the empty list, which returns 0 rather than
  `undefined`.
- `type-widening`: reviewed and closed. `npx tsc --noEmit` exits 0, so no
  existing consumer or test that constructs `ProtocolStats` was broken by the
  new field.
- `delta-window-mismatch`: not applicable, nothing renders yet.
- `interest-semantics`: not applicable, no label written yet.
- `loading-and-empty`: not applicable, no component yet.
- `structure-drift`: reviewed and clean. Two files, both under
  `src/lib/protocol-stats/`. No component, page or locale file touched.

One thing worth recording that the register did not name. The accumulator was
previously called `aprDenom` and served only as the weight for the average APR.
Returning it under its real name means one variable now has two consumers, and a
later edit could split them and leave the APR dividing by something else. The
fifth test exists for that: it asserts the returned `totalBorrowed` is still the
denominator `avgAprWeighted` uses.

The step also added five tests where the runbook's exit said "one more passing
test". The exit's own description asked for several assertions, so the count in
the prose was wrong rather than the work. Recorded rather than trimmed, because
deleting real tests to match a number in a document would be the wrong repair.

Findings: 0.

