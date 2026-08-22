# Study: market category rename

Task issue: https://github.com/wildcat-finance/product/issues/691
Mirror: https://github.com/laurenceday/shoggoth-playground/issues/3

## Assumptions

1. The delivery target is `laurenceday/shoggoth-playground`, a copy of
   `wildcat-app-v2` at `a17f0fa`. The upstream repository is inside a protected
   organisation and the write gate refuses it.
2. The issue body is the whole specification. It gives two renames and nothing
   else: Self Onboard becomes Public Markets, Onboard by borrower becomes
   Private Markets. There is no design file and no acceptance criteria.
3. The rename is a label change, not a behaviour change. Which markets fall in
   which group is decided by existing filter logic that this run does not
   touch.
4. English is the only locale in the repository, so there is no translation to
   keep in step.

## 1. Problem statement

The all-markets view groups markets by how a lender gets access. The two groups
are labelled Self-Onboard and Onboard by Borrower, which name the mechanism
rather than the thing a lender is choosing between. The
issue renames them to Public Markets and Private Markets.

Working means: both groups carry the new labels wherever they appear, no key or
identifier still claims the old meaning, and the grouping itself is unchanged.

## 2. Prior art

The labels live in `src/locales/en/en.json` under
`dashboard.markets.tables.other`, as `selfOnboard` and `manual`. Their siblings
in that block are `title`, `terminated`, `depositBTN` and `requestBTN`.

Two components read them, and both read the same keys:

- `src/app/[locale]/lender/all-markets/components/MarketsTables/OtherMarketsTable/index.tsx`
  at lines 492 and 520
- `src/app/[locale]/borrower/components/MarketsSection/сomponents/MarketsTables/OtherMarketsTables/index.tsx`
  at lines 483 and 511

Because both read the same keys, changing the values fixes both views at once.

There is a third thing carrying the old name, and it is not a label. The string
`self-onboard` is a scroll anchor: a DOM `id`, a `ref`, and a redux scroll
target set by `MobileHeader`. It appears in both tables and in
`src/app/[locale]/lender/all-markets/components/MobileHeader/index.tsx` at
lines 81 and 122. Nothing renders it.

The semantics hold up. Self-onboarding means a lender admits themselves, which
is what makes a market public. Onboarding by borrower means the borrower
maintains the allowlist, which is what makes it private. The rename describes
the same division in the reader's terms rather than the implementation's.

## 3. Constraints and non-goals

Starting ref: `a17f0fa` on `laurenceday/shoggoth-playground` `main`, fetched and
fast-forwarded before the run branch was cut. Next 14, React, MUI, i18n through
`react-i18next`.

Non-goals: the filter logic deciding which markets are in which group, the
`terminated` group, the role-provider strings elsewhere in `en.json` that read
Lender Self-Onboarding, any styling, and the Cyrillic homoglyph in the borrower
component path, which is real but belongs to its own change.

## 4. Design options

**A. Change the two values, leave the keys.** Two lines. A reader later opens
`en.json`, sees `selfOnboard: "Public Markets"`, and has to work out whether the
key or the value is stale. Trade: smallest possible diff, bought with a name
that now lies.

**B. Change the values and the keys, and update both call sites.** Two lines in
`en.json` and four in components. Nothing in the file claims the old meaning.
Trade: a larger diff that touches two components for a rename.

**C. B, and rename the scroll anchor too.** Complete, and also changes a DOM id
and a redux action payload that nothing displays. Trade: it puts identifier
churn with no user-visible effect into a labelling change, and a deep link or
saved anchor pointing at `#self-onboard` would break.

**Chosen: B.** The issue is about what things are called, and a key called
`selfOnboard` holding Public Markets is exactly the trap the rename exists to
remove. The anchor stays, because it is not a name anyone reads and changing it
can break a link.

## 5. Risk register seed

```risk-register
stale-key-names | the i18n keys and the values they hold | no key under dashboard.markets.tables.other still names a mechanism the label no longer mentions
missed-call-site | every reader of the two renamed keys | both tables and any other consumer resolve the new keys, and no lookup returns a raw key string at runtime
grouping-changed | the filter deciding which markets are in which group | the diff touches no filter predicate, so membership is identical before and after
anchor-breakage | the self-onboard scroll anchor, id, ref and redux target | the anchor is left alone and the mobile header still scrolls to the right section
locale-drift | src/locales, where en is the only locale | no other locale file exists that would now be missing the key
structure-drift | the diff of every step | no component structure, styling or spacing moves
```

The one worth the most attention is `missed-call-site`. A missing i18n key does
not throw: `react-i18next` returns the key itself, so a missed call site renders
the literal text `dashboard.markets.tables.other.selfOnboard` in the interface.
That is a silent failure a build will not catch, which is why the exit condition
checks for surviving references rather than trusting the edit.

## 6. Glossary seeds

- `Public market`: one a lender can enter by self-onboarding, previously
  labelled Self-Onboard.
- `Private market`: one where the borrower maintains the allowlist, previously
  labelled Onboard by Borrower.
- `Anchor`: the `self-onboard` DOM id and scroll target, which is an identifier
  and not a label.

## 7. Sources

- Issue text: `wildcat-finance/product#691`
- Labels: `src/locales/en/en.json`, `dashboard.markets.tables.other`
- Lender table: `.../lender/all-markets/.../OtherMarketsTable/index.tsx:492,520`
- Borrower table: `.../borrower/.../OtherMarketsTables/index.tsx:483,511`
- Anchor: `.../lender/all-markets/components/MobileHeader/index.tsx:81,122`

## 8. Signals, and the questions behind them

**Does any reference to the old keys survive?** A grep for `other.selfOnboard`
and `other.manual` across `src`. The target is zero.

**Does the interface render a raw key anywhere?** A grep of the rendered page
for `dashboard.markets.tables`, which is what a failed lookup produces.

**Do the suites still pass?** `npm run test` and `npm run lint`, both
zero-exit, matching the baseline.

**Did the grouping move?** The diff should contain no filter predicate. A diff
touching `activeRows.filter` has exceeded the issue.

## 9. Boundaries, per capability

**No new boundary.** The run changes display strings and the keys addressing
them. It opens no input path, adds no dependency, touches no credential and
makes no network call, so `phylax` has nothing new to control.

**Writing to the fork.** Pushes go to `laurenceday/shoggoth-playground` through
the guardrail pre-push hook installed on the clone.

## 10. The budget, or its absence

No performance budget, and no change that could plausibly affect one. String
values and key names have no measurable before and after, so `metron` has
nothing to hold.

## 11. The fail-closed posture

A step stops when `npm run lint` or `npm run test` exits non-zero, when a grep
finds a surviving reference to a renamed key, or when the diff touches filter
logic.

The guard that matters: a missed key renders as its own name rather than
throwing. The exit condition is therefore a search for surviving references and
for raw key text in the rendered output, not merely a green build.

## 12. Decisions and their homes

- **Keys renamed alongside values, option B over A.** Recorded in the commit
  message and the pull request body. It is a decision about one rename and the
  repository keeps no decision record for that.
- **The scroll anchor left as it is.** Recorded in the same place, because it
  is the obvious next question a reviewer will ask and the answer is that a
  deep link can break.
