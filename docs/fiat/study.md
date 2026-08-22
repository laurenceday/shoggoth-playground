# Study: action center

Task issue: https://github.com/wildcat-finance/product/issues/637
Mirror: https://github.com/laurenceday/shoggoth-playground/issues/5

## Assumptions

1. The delivery target is `laurenceday/shoggoth-playground`, a copy of
   `wildcat-app-v2` at `a17f0fa`. The upstream repository is in a protected
   organisation and the write gate refuses it.
2. **The design cannot be read from here, and this study does not guess at it.**
   Anastasia's Figma frame `16279-92110` is the authority for what the widget
   looks like, which tasks it lists and in what order. The account available to
   this work holds a View seat, so both the file export and the Figma MCP return
   a seat limit. The screenshot attached to the issue is hosted on ZenHub and
   needs a session this run does not have. An export has been requested on the
   issue.
3. What this study can establish without the design is which of the tasks the
   issue names the application is able to answer at all. That is the part that
   decides whether the feature is buildable, and it does not depend on how the
   widget looks.
4. The baseline is the same tree and commit measured for `product#682` earlier
   tonight, re-run and confirmed: 125 tests passing, two commented-out suites
   failing, lint unable to run, build flaky.

## 1. Problem statement

The issue asks for a progress widget: a to-do component showing a user what
steps remain before they are fully set up. It names examples for both sides.
For a borrower: completing KYC, adding organisation information, uploading
collateral, repaying part of a debt. For a lender: signing the MLA, adding
liquidity, enabling notifications for market health.

Working means: a user sees the steps that actually remain for them, each step
reflects real state rather than a placeholder, and completing a step removes it.

The second clause is where this study spends its effort. A to-do list that
cannot tell whether a task is done is worse than no list, because it tells
people to do things they have already done.

## 2. Prior art

**The application already nudges, in one place.** `MobileMlaAlert` at
`src/app/[locale]/lender/market/[address]/components/mobile/MobileMlaAlert/`
prompts a lender to sign an unsigned MLA. It is a single-task version of what
this issue asks for, scoped to one market on mobile, and it is the closest thing
to prior art in the codebase. Whatever is built should either absorb it or
explain why two nudges about the same thing coexist.

The visual language for action tiles exists too. The design system carries a
"Main Actions Tile" pattern: a dark card with a label, a figure, and a white
action button. The examples are Available to withdraw and deposit, a Master Loan
Agreement card reading "Waiting for sign, issued to sign: 02.03.24" with a View
and Sign button, and an Amount to Claim card with a Claim money button. So the
widget has a house style to sit in, even though its own frame is unread.

## 3. What state the application can actually answer

This is the finding of the study. Each task the issue names, against what the
code can determine today.

**Answerable now.**

- *Lender: sign the MLA.* `useGetSignedMla` at
  `src/app/[locale]/lender/hooks/useSignMla` returns whether this lender has
  signed for a market. `MobileMlaAlert` already consumes it.
- *Borrower: MLA issued and awaiting signature.*
  `MasterLoanAgreementResponse` carries `borrowerSignature` and `timeSigned`,
  and a `noMLA` case, so issued, signed and not-applicable are distinguishable.
- *Borrower: organisation information.* `BorrowerProfile` at
  `src/app/api/profiles/interface.ts` has fifteen optional fields, from `name`
  and `description` through `jurisdiction`, `entityKind` and `physicalAddress`.
  Completeness is computable as which of them are empty, though which count as
  required is a product decision nobody has written down.
- *Borrower: repay a delinquent market.* Market status already distinguishes
  Healthy, Pending and Penalty, and the market page surfaces it.
- *Lender: add liquidity.* Market account data already drives the deposit
  controls, so "has deposited nothing here" is derivable.

**Not answerable.**

- *Borrower: complete KYC.* There is no KYC state anywhere in this application.
  The only matches for the term are a locale string reading "KYC Preferences", a
  country list at `src/config/elfs-by-country.json`, and one commented-out
  button at `MarketTransactions/index.tsx:122`. KYC is the issue's headline
  borrower example and the app cannot tell whether it has been done.
- *Borrower: upload collateral.* There is a Collateral Contract section, but
  nothing this study found that reports whether a borrower has satisfied a
  collateral obligation as a completable step.
- *Lender: enable notifications.* There is a borrower notifications page. No
  lender-side notification preference was found, so "enabling" it has no state
  to read and possibly no feature behind it.

Three of the eight named tasks cannot be computed. Two of those three are
borrower tasks, and one of them is the first example in the issue.

## 4. Design options

**A. Build the widget over the five answerable tasks, and leave the other three
out until the state exists.** Ships something true. Trade: a borrower's list
would omit KYC, which is the step the issue leads with, so the widget would look
incomplete to whoever wrote the issue unless the omission is explained.

**B. Build the widget with all eight, showing the three unanswerable ones as
always-outstanding.** Matches the issue's list. Trade: it tells users to do
things they may have already done, and never lets them clear it. That is the
failure the problem statement calls out.

**C. Build the task-state layer only, with no widget: a hook returning the
computable tasks and their status, plus tests.** Everything the widget needs,
none of the design. Trade: nothing ships to a user, and a layer built without
its consumer tends to fit it badly.

**D. Establish the state map, request the design, and stop.** What this run
does.

**Chosen: D, and then A when the design arrives.** The widget is a user-facing
component whose task list, ordering, empty state and placement are all design
decisions recorded in a file this run cannot read. Building it from the issue
prose would produce something to throw away. The state map above is the part
that is knowable now, and it is also the part that changes the design: three of
the eight tasks cannot be shown truthfully, and whoever draws the widget should
know that before drawing it rather than after.

## 5. Risk register seed

```risk-register
unanswerable-task | any task whose completion state the app cannot compute | no task appears in the widget unless its done and not-done states are both derivable from real data
stale-completion | a task that stays listed after the user has done it | completing a task removes it without a manual refresh, and the state it reads is invalidated on the mutation that completes it
duplicate-nudge | MobileMlaAlert and any new MLA task | one prompt about signing the MLA reaches the user, not two
role-leakage | the borrower and lender task lists | a lender never sees a borrower task and the reverse, including when one address is both
empty-state | a user with nothing outstanding | the widget disappears or says so, rather than rendering an empty container
design-drift | the built widget against the Figma frame | the component matches the design that was read, and no part of it is invented from the issue prose
```

`unanswerable-task` is the one this study exists to raise. `design-drift` is the
one that stops the run.

## 6. Glossary seeds

- `Task`: one step with a derivable done or not-done state, shown to one role.
- `Answerable`: the application can compute both states from data it holds.
- `Action tile`: the existing dark-card pattern with a label, a figure and a
  white button, which the widget should sit inside.

## 7. Sources

- Issue text: `wildcat-finance/product#637`
- Design, unread: Figma `feXTW9I6NCKBLnPq3lt6rT` node `16279-92110`
- Export requested: `wildcat-finance/product#637`, comment of 2026-08-22
- Lender MLA state: `src/app/[locale]/lender/hooks/useSignMla`
- Borrower MLA state: `src/app/api/mla/interface.ts`
- Profile fields: `src/app/api/profiles/interface.ts`
- Existing single-task nudge: `.../mobile/MobileMlaAlert/index.tsx`
- Absence of KYC state: `src/locales/en/en.json`,
  `.../MarketTransactions/index.tsx:122`

## 8. Signals, and the questions behind them

**Can every listed task be completed and disappear?** For each task in the
widget, perform the action and confirm the entry goes without a reload.

**Does a fully set-up user see nothing?** Render with an account that has
completed everything and confirm the widget is absent rather than empty.

**Does the widget match the design?** Compare against the exported frame, once
there is one. This cannot be answered today, which is why the run stops.

**Do the suites hold?** 125 passing and the same two failing suites, as the
baseline records.

## 9. Boundaries, per capability

**Reading per-user state.** The widget reads whether a specific address has
signed, deposited or completed a profile, and shows it. The control is that it
reads the same hooks the existing pages already use, under the same auth, and
adds no new endpoint. A widget that inferred state by combining sources the app
does not already combine would be a new boundary; this one should not be.

**No new external input.** No new host, credential or fetch path is proposed.

## 10. The budget, or its absence

No performance budget. The widget would read hooks the pages already call, and
react-query dedupes them. If a later design requires a task whose state needs a
new request, that is a `metron` question at that point and needs a measurement,
not an assumption.

## 11. The fail-closed posture

This run stops before implementation, deliberately and on the ledger. The exit
condition it cannot meet is `design-drift`: there is no read design to build
against and no way to check a built component against one.

For the implementation that follows: a task stops from being listed the moment
its completion state cannot be derived, rather than being shown as permanently
outstanding.

## 12. Decisions and their homes

- **That the run stops rather than guessing the widget.** Recorded in the halt
  reason on the ledger, in the pull request, and on the mirror issue.
- **Which profile fields count as complete enough.** Not decided here. It is a
  product decision and belongs with whoever owns onboarding, recorded wherever
  that decision lands rather than inferred from which fields happen to be
  filled.
- **What happens to the three unanswerable tasks.** Belongs to the same person
  as the design, because the answer is either to build the missing state or to
  drop the task, and both change what the widget shows.
