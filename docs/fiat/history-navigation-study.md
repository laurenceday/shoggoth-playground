# Replace the remaining history-based navigation with named destinations

Follow-up to https://github.com/laurenceday/shoggoth-playground/issues/32,
which fixed one control. This study covers the four that were left.

Assuming, unless corrected:

1. The `Back To Markets` fix is out of scope here. It lives in pull request 34,
   `fiat/32-back-to-markets-lender-markets-page` into `develop`, and it is not
   merged at this run's base. Nothing here touches `BackButton` or
   `LenderMarketSidebar`, so the two changes cannot conflict.
2. `develop` is the branch this work lands on, matching where 34 is headed.
   At this run's base `develop` and `main` are the same commit.
3. Jest is the only automated check that can run against this base. The Next
   build and ESLint cannot, for reasons carried forward from 34 and restated
   in item 3.
4. Node 22.22.1 and npm 11.12.0, matching the `engines` field.

Proceeding on these unless corrected.

## 1. Problem statement

Four controls still navigate by browser history. None has even the
`window.history.length > 1` guard the control in issue 32 had; all four call
`router.back()` unconditionally. They divide into two kinds, and the kinds
want different fixes.

**One is a labelled back control with no origin to preserve.** The sidebar on
`/borrower/edit-lenders-list` has a back button that calls `router.back()`. A
borrower who opens that URL directly is sent wherever the tab was, which is
exactly the defect issue 32 reported, on a borrower page.

**Three are on the agreement page, and they are trying to return the user to
whatever sent them there.** `RedirectsProvider` pushes an unsigned lender to
`/lender/agreement` from whichever lender page they were on, so the origin
really is the previous history entry and `router.back()` is usually right. It
fails when the agreement URL is the tab's first entry: Cancel leaves the site,
and, worse, a successful signature does too. Someone signs the terms of use and
is thrown out of the application.

A working prototype means: the borrower back control is an anchor to
`/borrower`; and the agreement page returns to the page that sent the user
there when there was one, to the party's own root when there was not, and never
to a destination the URL can be made to name from outside. Checks are jsdom
tests per control, plus a validation table for the return-target rule.

## 2. Prior art

**In this repository.**

- `src/components/Sidebar/LendersListSidebar/index.tsx:24` is the borrower back
  control. It is reached from
  `src/app/[locale]/borrower/components/AuthorizedLendersTable/index.tsx:37`,
  which links from the `/borrower` dashboard with a `lenderAddress` parameter.
  `src/app/[locale]/borrower/market/[address]/components/MarketAuthorisedLenders/index.tsx:64`
  now links to the policy route instead and falls back to the lenders list only
  when there is no market. So the one reliable origin is `/borrower`.
- `src/app/[locale]/agreement/components/AgreementPage/index.tsx:144` is the
  Cancel button, rendered when `isReview`. The component already receives
  `party` as a prop, so the party root needs no pathname sniffing.
- `src/app/[locale]/agreement/hooks/useSignAgreement.ts:96` runs on successful
  signature, behind `SignButton`.
- `src/app/[locale]/agreement/components/ReacceptButton/index.tsx:25` runs on
  successful re-acceptance. Its own comment says it returns the user "to where
  the user came from (re-acceptance modal, create-market blocker)", which is
  the intent this study has to preserve rather than replace.
- `src/hooks/useNetworkGate.ts:153` computes `redirectPath` and returns
  `ROUTES.lender.agreement`; `src/providers/RedirectsProvider/index.tsx:31`
  pushes it. That push is where the origin is known and thrown away.
- `src/app/[locale]/borrower/market/[address]/page.tsx:117` reads
  `sessionStorage.getItem("previousPageUrl")`, written by
  `edit-policy/page.tsx:203` and `edit-lenders-list/page.tsx:113`. The
  repository already prefers an explicit hand-off over history. It is a
  two-page arrangement for one flow, not a general tracker, and its key is
  already spoken for.
- `src/components/BackButton/index.test.tsx` does not exist at this base; it
  arrives with 34. The test idiom to follow is
  `src/app/[locale]/lender/components/LenderMarketsNavigationLoading.test.tsx`:
  `@testing-library/react`, `jest.mock` per hook, `getAttribute` rather than
  `jest-dom` matchers, which are not configured.

**Merged pull requests.** The last two merged that touch this area are
[#33](https://github.com/laurenceday/shoggoth-playground/pull/33), the step
merge of the issue 32 fix, and
[#18](https://github.com/laurenceday/shoggoth-playground/pull/18). #33 carried
forward the `LendersListSidebar` call as a known non-goal, which this study
answers, and it did not name the three agreement calls, because that run swept
only the sidebars. That gap is the reason this run exists and it is recorded
rather than glossed. #18 carried forward a Total Borrowed metric needing
subgraph work and a product definition, which is unrelated and stays a non-goal
here.

**Audit records.** `audit/rounds/` exists only on the branch behind 34, not at
this base, so there is no in-scope audit source to read here and no synopsis
question to settle. Nothing was read in place of a source.

**Outside.** Reading a redirect target out of a URL parameter and navigating to
it is the open-redirect pattern; OWASP files it as unvalidated redirects and
forwards. The control is an allowlist on the parsed value, not a substring
check on the raw string. This matters here because option A below introduces
exactly such a parameter.

## 3. Constraints and non-goals

**Starting ref.** `develop`, at the commit this run's branch was cut from.
`develop` and `main` hold the same commit at that point.

**Toolchain.** Next 14.2.35 App Router, React 18.2.0, TypeScript 5.4.2, MUI 5,
Jest 29.7.0 with `@testing-library/react` 16.0.1 under jsdom.

**Install.** `PUPPETEER_SKIP_DOWNLOAD=true npm ci`, because a plain `npm ci`
fails in the puppeteer postinstall on a browser cache holding the version
directory without its executable.

**Jest needs `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME` set to produce any output.**
Unset, `next.config.mjs` yields an undefined image hostname, Next rejects the
config, and `next/jest` hands jest a configuration that collects zero tests and
prints nothing while exiting 0 outside `--ci`. An unset run reads as a pass.
Every jest command in this run sets it to `raw.githubusercontent.com`, a
hostname that file already lists.

**The baseline, measured on this run's branch before any change.** 124 tests
passing in 27 suites, with three suites failing:
`src/components/StoreProvider/index.test.tsx`, whose cases are commented out,
and `src/app/api/mla/mla.test.ts` and `src/app/api/profiles/profile.test.ts`,
both on `REACT_APP_TARGET_NETWORK is not set or is invalid`. Identical to what
the issue 32 run measured and to what pull request 13 recorded. Gates exclude
exactly those three.

**`tsc --noEmit` depends on a generated file.** Without `next-env.d.ts` it
reports five `TS2307` errors on image imports; with it, zero. The file is
produced by Next tooling and is not committed. Type gates here assert that no
error names a file this run changed, which holds either way.

**ESLint and the build cannot run.** The base carries no dotfiles at all, so
`npm run lint:errors` drops into `next lint`'s interactive setup prompt, and
pull request 13 recorded `npm run build` failing on a different API route each
run including on unchanged trees. Neither is an exit condition.

**Non-goals.**

- `BackButton` and `LenderMarketSidebar`. Pull request 34 owns them.
- The hardcoded `"Back To Markets"` string, an i18n question carried by 34.
- `ToUReacceptanceModal`, which uses `useAcceptToU` without navigating.
- Adding an ESLint configuration, a `.gitignore`, or a `.env` to the base.
- Total Borrowed, carried forward by 18 and belonging to product.

**Security suite.** Waived and receipted as waived. This delivery is TypeScript
and React and produces no Solidity, so `x-ray`, `solidity-auditor` and `fizz`
have no target and will not run.

## 4. Design options

The borrower back control is not in question: it is a labelled control whose
only reliable origin is `/borrower`, so it becomes a link and there is nothing
to trade. The options below are about the three agreement calls.

**A. Carry the origin on the redirect, and validate it.**
`RedirectsProvider` knows the pathname it is redirecting away from. It pushes
`${ROUTES.lender.agreement}?returnTo=<pathname>`. The agreement page reads the
parameter, accepts it only when it parses as a same-origin application path,
and navigates there on cancel and on both success paths; anything else falls
back to the party root.

The trade: it adds a query parameter to a URL people may bookmark or paste, and
it introduces a redirect target that the URL can name. That is an open redirect
unless the validation is right, so the validation becomes a thing to get right
and to test, not a line of code.

**B. Hand the origin over in `sessionStorage`.** Matches the existing
`previousPageUrl` idiom.

The trade: the state is invisible in the URL, so a reloaded or shared agreement
link silently loses it, and it does not survive a second tab. The existing key
already carries different semantics for the edit-policy and edit-lenders-list
flow, so this needs its own key and two mechanisms then exist side by side.

**C. Keep `router.back()` and fall back when nothing in-app is behind.** Track
in-app navigation depth; call `back()` when it is non-zero, push the party root
otherwise.

The trade: it needs the depth tracker the issue 32 study already rejected, it
has to stay correct across back, forward, `replace` and restored sessions, and
even when correct it only knows that *something* in-app is behind, not that it
is the page that pushed the user.

**D. Always go to the party root.** One line per call site, nothing to
validate.

The trade: it regresses the case these calls exist for. A lender gated out of
`/lender/my-markets` gets dropped on `/lender` after signing rather than
returned to what they were doing, and the re-acceptance path loses the
create-market blocker its comment names.

**Chosen: A.** It is the only option that keeps the behaviour the three calls
are for while removing the dependence on a history the application does not
own. B hides the same information somewhere less reliable. C is more machinery
for a weaker guarantee. D is simpler than all of them and buys that simplicity
by breaking the feature.

What A trades away is that the return target becomes attacker-influencable
input, where today it is not input at all. That is a real cost and it is paid
with a control rather than argued away: parse the value, require a path
beginning with a single `/`, reject anything with a scheme, an authority, or a
protocol-relative `//` prefix, and match the result against the application's
known route prefixes before navigating. The risk register makes it an
enumerable obligation and step 2 makes it a table of cases.

## 5. Risk register seed

The borrower control carries ordinary change risk. The agreement work carries
one genuine security concern, which the register puts first.

```risk-register
open-redirect | the returnTo parameter as it reaches router.push | a value naming another origin, a scheme, or a protocol-relative path is rejected and the party root used instead
return-target-allowlist | the parsed returnTo against the app's known routes | an in-app path outside the known route prefixes is refused rather than followed
signature-then-exit | the success paths of signing and re-acceptance | a successful signature never leaves the application, whatever the tab held before
origin-preserved | the redirect from a gated lender page | signing from a gated page returns the user to that page, not to the party root
party-fallback | the agreement page with no usable returnTo | the fallback is the party's own root, taken from the party prop rather than from the pathname
borrower-back-destination | the rendered anchor on the lenders-list sidebar | the href is /borrower and the control is an anchor, not a button
no-scope-bleed | the diff against pull request 34's files | neither BackButton nor LenderMarketSidebar is touched, so the two branches cannot conflict
test-baseline | the jest suite before and after | new tests pass and no suite that passed at baseline fails after
guard-strength | each new test against its pre-change component | every new case fails on the unchanged tree, so each is a guard rather than a restatement
```

## 6. Glossary seeds

| Term | Meaning |
| --- | --- |
| Return target | The in-app path the agreement page should navigate to when it is finished, whether by cancel or by a successful signature. |
| `returnTo` | The query parameter carrying that path from the redirect that pushed the user to the agreement page. |
| Party | `Lender` or `Borrower`, already a prop on `AgreementPage`. |
| Party root | `/lender` or `/borrower`, the fallback when no usable return target exists. |
| Gated page | A page `useNetworkGate` refuses to show an unsigned user, redirecting them to the agreement page. |
| Baseline | The jest result recorded on this run's branch before any change. |

## 7. Sources

- Issue 32, https://github.com/laurenceday/shoggoth-playground/issues/32
- Pull request 33, https://github.com/laurenceday/shoggoth-playground/pull/33
- Pull request 34, https://github.com/laurenceday/shoggoth-playground/pull/34
- Pull request 18, https://github.com/laurenceday/shoggoth-playground/pull/18
- `src/components/Sidebar/LendersListSidebar/index.tsx`, line 24
- `src/app/[locale]/agreement/components/AgreementPage/index.tsx`, lines 17 to 36 and 139 to 156
- `src/app/[locale]/agreement/hooks/useSignAgreement.ts`, line 96
- `src/app/[locale]/agreement/components/ReacceptButton/index.tsx`, line 25
- `src/hooks/useNetworkGate.ts`, lines 153 to 182
- `src/providers/RedirectsProvider/index.tsx`, line 31
- `src/utils/serviceAgreementParty.ts`
- OWASP, unvalidated redirects and forwards

## 8. Signals, and the questions behind them

None, and here is why. Every change here is client-side navigation in a browser
tab. Nothing runs unattended, there is no server path, no job, and no scheduled
work, so there is no question anyone asks at three in the morning about a
process that is running.

The one thing worth knowing after the fact, where a signature sent someone, is
answered by reading the return-target rule rather than by a signal, because the
rule is a pure function of the URL and the party. Ephoros owns what a signal
must carry; this run incurs none.

## 9. Boundaries, per capability

One boundary opens, in step 2, and it is the reason that step is separate.

Today the agreement page's destination is not input: it is whatever the browser
history holds. Option A makes it input, read from a query parameter that anyone
can write. That is a redirect target under external control, and the control it
needs is an allowlist applied to the parsed value: a path beginning with a
single `/`, no scheme, no authority, no protocol-relative prefix, and a match
against the application's known route prefixes, with the party root as the
refusal behaviour. Rejection is silent to the user and total, never a partial
sanitisation of a value that stays otherwise trusted.

Step 1 opens no boundary. It replaces a history call with a constant.

Phylax owns the boundary list and the control each needs; the concerns above
enter the audit loop through the register in item 5 rather than being restated
here.

## 10. The budget, or its absence

None. No performance claim is made and nothing here is motivated by speed, so
Metron's refusal of an unmeasured speed change does not apply.

## 11. The fail-closed posture

What stops a step:

- Any of the 27 suites passing at baseline failing after the change.
- The passing-test count falling below the baseline's 124 plus the new cases.
- `npx tsc --noEmit` naming a file the step changed.
- A new test passing against its pre-change component, which would mean it
  distinguishes nothing.
- In step 2, any rejected return-target case navigating anywhere but the party
  root.

The guard convention, per Elenchus: every new test is run against the unchanged
component first and shown to fail, then against the changed one and shown to
pass, with both outputs recorded. The return-target validation is tested as a
table of accepted and rejected values, and the rejected rows include an
absolute URL, a protocol-relative path, a scheme-bearing value, and an in-app
path outside the known prefixes.

## 12. Decisions and their homes

Two decisions here are expensive to reverse.

The return-target contract is the larger one. Once a `returnTo` parameter
exists, other redirects will reach for it, and whether it is validated at the
producer, at the consumer, or both determines whether that spread is safe. The
decision and the allowlist rule live beside the validation function itself,
where the next caller will be standing, and are argued in step 2's pull request
body.

The second is smaller: the borrower lenders-list control loses its history
behaviour permanently. Its reason goes in step 1's pull request body, next to
the same reasoning pull request 34 recorded for `BackButton`.

No architecture decision record is created. The repository has no `docs/adr`,
and the study and runbook are committed to `docs/fiat/`, following what the
earlier runs here did.

## Boundaries

**Always.**

- Jest and `npx tsc --noEmit` before a commit, compared against the baseline in
  `docs/fiat/history-navigation-baseline.md`, with
  `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME` set on every jest invocation.
- The imprimatur lint on every shipped document and pull request body.
- A recorded before and after for any change made in the name of speed.

**Ask first.**

- Adding a dependency.
- Touching `BackButton` or `LenderMarketSidebar`, which belong to pull
  request 34.
- Changing `src/routes.ts`, `src/hooks/useNetworkGate.ts`'s redirect conditions,
  or any gate that decides who is sent to the agreement page.
- Touching CI or the husky hooks.
- Renaming or removing an i18n key.

**Never.**

- Commit an RPC credential or the contents of a `.env`.
- Edit `storybook-static/`, `node_modules/`, or `package-lock.json` by hand.
- Delete or skip a failing test to make a suite pass.
- Navigate to a `returnTo` value that failed validation.
- Claim a command ran when it did not.
