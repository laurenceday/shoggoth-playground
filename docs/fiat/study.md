# Back To Markets returns to the lender markets page

Issue: https://github.com/laurenceday/shoggoth-playground/issues/32

Assuming, unless corrected:

1. The reporter wants one destination, always the same one, and names the site
   logo as the behaviour he already falls back to. The logo goes to `/lender`.
2. `/lender` is the lender markets page the issue asks for. It renders
   `ExploreSection`, and the lender nav sidebar linking to My Markets and All
   Markets renders beside it.
3. Jest is the only automated check that can run against this base. The Next
   build and ESLint cannot, for the reasons measured and recorded in item 3.
4. Node 22.22.1 and npm 11.12.0, matching the `engines` field. The host also
   holds newer Node; the pinned one is used.

Proceeding on these unless corrected.

## 1. Problem statement

On a lender market page, the sidebar's "Back To Markets" control does not go to
the markets page. It calls `router.back()` whenever the browser tab holds more
than one history entry, and `window.history.length` counts the whole tab's
session history rather than this application's. A lender who opened the market
URL directly, in a tab that already held another site, is sent to that other
site.

Igor Igamberdiev at Wintermute/Armitage reported it against
`https://app.wildcat.finance/lender/market/0xc9499006a149c553d18171747ed19aa7c6dd19e2?chainId=1`,
says he hit it about ten times, and works around it by clicking the logo.

Reaching a market URL first is not the edge case the report is modest about.
It is what happens to every shared link, every bookmark, every paste from a
chat, and every arrival from a block explorer, which is the normal way an
address-bearing URL travels.

A working prototype here means: from a lender market page reached as the first
in-app navigation of a tab, activating "Back To Markets" lands on `/lender`.
The check that proves it is a jsdom test asserting the rendered control is an
anchor whose `href` is `/lender`, run against both the pre-change and the
post-change component so the test is shown to distinguish them.

## 2. Prior art

**In this repository.**

- `src/components/BackButton/index.tsx` is the component. Lines 48 to 55 hold
  the `back` branch: `window.history.length > 1` selects `router.back()`, and
  the `link` prop is used only as the fallback when it does not.
- `src/components/Sidebar/LenderMarketSidebar/index.tsx:67` is the only call
  site that passes `back`. There are eight `<BackButton>` call sites; the other
  seven render a `next/link` anchor.
- `src/components/Sidebar/MarketSidebar/index.tsx:73` is the borrower
  equivalent of the reported control. It passes no `back` and falls through to
  the `ROUTES.borrower.root` default, so the borrower side already behaves the
  way the issue asks the lender side to.
- `src/components/Header/index.tsx:66` derives `homeUrl` as
  `ROUTES.lender.root` on the lender side and links the logo to it at line 121.
  That is the reporter's workaround, and it is the destination this study
  adopts.
- `src/routes.ts` fixes `ROUTES.lender.root` at `/lender`.
  `src/app/[locale]/lender/page.tsx` renders `ExploreSection` there.
- `src/components/Sidebar/LendersListSidebar/index.tsx:23` holds a separate
  `router.back()` on the borrower lenders-list sidebar. Same defect class, a
  different surface, and a non-goal below rather than a silent omission.
- `src/app/[locale]/lender/components/LenderMarketsNavigationLoading.test.tsx`
  is the house style for a jsdom component test here: `@testing-library/react`,
  `jest.mock` for every hook the tree reaches, no provider stack.

**Merged pull requests.** The base branch holds one commit. Five pull requests
have merged in this repository, all of them step merges inside earlier Fiat
stacks that never reached `main`. The last two, one per prior run, were read:

- [#18](https://github.com/laurenceday/shoggoth-playground/pull/18), the last
  merge of the tvl-momentum run, which halted rather than receipting. It
  carries forward a real Total Borrowed metric, needing a subgraph change and a
  product decision about what borrowed means. Unrelated to this topic and
  recorded as a non-goal below rather than answered here.
- [#13](https://github.com/laurenceday/shoggoth-playground/pull/13), the last
  merge of the market-category-rename run. It touched `LenderNavSidebar`,
  adjacent to this work but not the same control. It carries forward one thing
  this study does answer: `npm run build` exits 1 nondeterministically in API
  page-data collection, on a different route each run, on trees both before and
  after that change. That is carried into the constraints as the reason the
  build is not an exit criterion here.

Neither touched `BackButton` or `LenderMarketSidebar`.

**Audit records.** There are none in scope. The base has no `audit/` directory
and no `AUDIT.md`; `docs/fiat/` exists only on unmerged prior run branches. No
synopsis question arises, so no synopsis currency check was run and none is
claimed. Nothing was read in place of a source.

**Outside.** Next.js 14 App Router `useRouter().back()` delegates to
`window.history.back()`, which is a browser-level operation with no knowledge
of which entries belong to the application. MDN records `Window.history.length`
as the count of entries in the tab's session history, including entries from
other origins. The two together are the defect.

## 3. Constraints and non-goals

**Starting ref.** `main` at `a17f0fa6fece61b3c118c8995d1bfce47d77ce09`, the tip
at the time the run branch `fiat/32-back-to-markets-lender-markets-page`
was cut.

**Toolchain.** Next 14.2.35 App Router, React 18.2.0, TypeScript 5.4.2, MUI 5,
Jest 29.7.0 with `@testing-library/react` 16.0.1 under jsdom. Node pinned by
`engines` to `>=22.22.1 <23`, npm to `11.12.0`.

**The base carries no dotfiles.** `git ls-files` returns 1108 paths and not one
of them begins with a dot. The seed commit was stripped of them, so there is no
`.eslintrc`, no `.gitignore` and no `.env`. Three consequences below are all
downstream of that one fact, and each was measured on the run branch rather
than assumed.

**Install.** `npm ci` fails at the puppeteer postinstall, because the local
browser cache holds the version directory without the executable.
`PUPPETEER_SKIP_DOWNLOAD=true` clears it. Puppeteer serves HTML and PDF
rendering in the API routes and is reached by nothing in the jest suite, so
skipping the browser download weakens no check this study relies on.

**Jest needs one environment variable to produce any output at all.**
`next.config.mjs` sets `images.remotePatterns[0].hostname` from
`NEXT_PUBLIC_TOKENS_IMG_HOSTNAME`. With no `.env` the variable is unset, the
hostname is `undefined`, Next rejects the config, and `next/jest` then hands
jest a configuration under which it collects zero tests and prints nothing --
not a summary, not `--listTests`, not even `--showConfig`. It exits 1 in `--ci`
and 0 otherwise, so a run in this state reads as an empty pass rather than as a
failure.

That was worked to cause rather than waved through, per Elenchus. A minimal
inline jest config found all 30 suites, which located the fault in the
`next/jest` config chain rather than in jest or the tree; setting
`NEXT_PUBLIC_TOKENS_IMG_HOSTNAME=raw.githubusercontent.com` -- a hostname the
same file already lists literally -- restores normal output and all 30 suites.
Every jest command in this run sets it, and the runbook's test contract carries
it, because a run without it silently checks nothing.

**The baseline, measured on the run branch before any change.** 124 tests
passing, 27 suites passing, 3 suites failing:

- `src/components/StoreProvider/index.test.tsx` -- "Your test suite must
  contain at least one test"; its cases are commented out.
- `src/app/api/mla/mla.test.ts` and `src/app/api/profiles/profile.test.ts` --
  `REACT_APP_TARGET_NETWORK is not set or is invalid`. Setting that variable
  was tried and does not clear them.

This matches what pull request #13 recorded independently: 124 passing and
three pre-existing failing suites. `npm test` therefore exits 1 on an unchanged
tree, so no exit condition here can be a bare `npm test`.

**`tsc --noEmit` has four pre-existing errors.** All four are `TS2307 Cannot
find module` on image imports, because the generated `next-env.d.ts` that
declares those module types is absent and `tsconfig.json` includes it. Nothing
in this change touches an image import. The type check is used as a
no-new-error comparison against that recorded count, not as a bare exit-0 gate,
and generating or committing `next-env.d.ts` is out of scope.

**ESLint cannot run.** With no `.eslintrc`, `npm run lint:errors` drops into
`next lint`'s interactive "How would you like to configure ESLint?" prompt and
exits 1. It is excluded from every exit condition. Adding an ESLint
configuration to this repository is worth doing and is not this issue.

**The build is not a gate either.** `npm run build` is excluded for a separate
reason, recorded by pull request #13: it exits 1 on a different API route each
run, and a control build on the unchanged tree in the same environment fails
the same way. A gate that fails at random distinguishes nothing about a diff.

**Non-goals.**

- The `router.back()` in `LendersListSidebar`. Same defect class, a borrower
  surface nobody has reported, and a separate diff.
- Moving the hardcoded `"Back To Markets"` string into i18n. Every other
  `<BackButton>` title here is a `t(...)` key and this one is a literal; it is
  worth fixing and it is not what the issue is about.
- Scroll position and filter restoration on the markets list.
- The borrower-side back button, which already works.
- Total Borrowed, carried forward by #18 and belonging to product.

**Controller currency.** `hexctl init` reported `unknown (route-unresolved)`,
because the controller runs from the session plugin copy rather than the
install cache the currency route reads. Checked independently: the session
`hexctl.py` is byte-identical to the installed hexaemeron 1.6.5 copy, sha256
`4ac36284ce936e8909a2cfab36a3de542bcb57b72f074c3a0992f2977d31925d`, and that
install is pinned to `58b7dcd1004bf8e6b0cf517bbcc778789e2c43ff`, the current
`wildcat-finance/skills` main tip. The controller is not behind. The receipt
records nulls because `init` writes that observation and no later command may.

**Security suite.** Waived and receipted as waived. This delivery is TypeScript
and React and produces no Solidity, so `x-ray`, `solidity-auditor` and `fizz`
have no target. They will not run and no receipt claims they did.

## 4. Design options

**A. Always link to the markets page.** Delete the `back` branch and the `back`
prop from `BackButton`, leaving the `next/link` path every other call site
already takes. The lender call site keeps the `link={ROUTES.lender.root}` it
already passes.

The trade: a lender who reached the market from `/lender/my-markets` or
`/lender/all-markets` lands on `/lender` rather than on the list they came
from. Today, history sometimes returns them to that exact list. Both lists are
one click away in the lender nav sidebar, which renders on all three pages.

**B. Go back only when the previous entry is in-app.** Keep `router.back()`,
gated on a count of in-app navigations held in a provider or in
`sessionStorage`, and fall through to the link when the count is zero.

The trade: it preserves the exact list in the case where history is right, and
buys that with a second model of the history stack maintained for one button.
That model has to stay correct across back, forward, `replace`, and a restored
session, and when it drifts the button's behaviour cannot be read off the
component. It also leaves the control a `<button>`.

**C. Remember the last markets surface in Redux.** On entering `/lender`,
`/lender/my-markets` or `/lender/all-markets`, store which one; link to the
stored value, defaulting to `/lender`.

The trade: deterministic and link-shaped, unlike B, but it adds persisted
cross-page state and a pathname effect to a button whose own label names a
single destination.

**Chosen: A.** It is the option cheapest to comprehend. The diff removes code
rather than adding it, and after it the button's destination is stated by the
JSX at the one call site with nothing to consult elsewhere. It matches the
borrower control that already works and the logo the reporter already uses.
What it trades away is the return-to-exact-list behaviour in the case where
history happened to be right; B and C keep that, and pay for it with state that
can be wrong in ways reading the component will not show.

One thing A recovers that the issue did not ask for, worth naming because it is
part of the diff: the control becomes an anchor again. Under `back` it renders
as `<Button onClick>` with no `href`, so it cannot be middle-clicked, opened in
a new tab, or announced to a screen reader as a link.

## 5. Risk register seed

The change is small and its risks are all about reach: what else touches the
component, and whether the emitted link is the one intended. The register below
is what the audit round enumerates.

```risk-register
other-call-sites | every <BackButton> in the tree | exactly one call site passes back, so removing the prop breaks no other
default-link-drift | BackButton's link default of ROUTES.borrower.root | the lender call site passes its own link and never falls through to the borrower default
link-destination | the rendered anchor against ROUTES.lender.root | the href is /lender, the markets landing page, not a stale or hand-written path
locale-prefix | next-i18next routing over the emitted href | a plain href resolves under the locale segment the way the seven existing Link call sites already do
dead-import | BackButton after the back branch is deleted | useRouter and every other newly unused import are gone, and tsc reports no fifth error
test-baseline | the jest suite before and after the change | the new tests pass and no suite that passed at baseline fails after
silent-empty-run | jest without NEXT_PUBLIC_TOKENS_IMG_HOSTNAME | every recorded jest result came from a run that collected 30 suites, not from a silent empty one
guard-strength | the new test against the pre-change component | the test fails on the old component, so it is a guard rather than a restatement
```

## 6. Glossary seeds

| Term | Meaning |
| --- | --- |
| Back To Markets | The control at the top of `LenderMarketSidebar`, the subject of the issue. |
| Markets page | `/lender`, `ROUTES.lender.root`, rendering `ExploreSection`. |
| `back` prop | The boolean on `BackButtonProps` selecting history navigation over a link. |
| In-app entry | A session-history entry this application pushed, as opposed to one the tab already held. |
| Baseline | The jest result recorded on the run branch before the change, the thing the after-state is compared against. |

## 7. Sources

- Issue 32, https://github.com/laurenceday/shoggoth-playground/issues/32
- `src/components/BackButton/index.tsx`, lines 40 to 89
- `src/components/Sidebar/LenderMarketSidebar/index.tsx`, line 67
- `src/components/Sidebar/MarketSidebar/index.tsx`, line 73
- `src/components/Header/index.tsx`, lines 66 and 121
- `src/routes.ts` and `src/app/[locale]/lender/page.tsx`
- `src/app/[locale]/lender/components/LenderMarketsNavigationLoading.test.tsx`
- Pull request 18, https://github.com/laurenceday/shoggoth-playground/pull/18
- Pull request 13, https://github.com/laurenceday/shoggoth-playground/pull/13
- Next.js App Router `useRouter` reference, `back()`
- MDN, `Window.history.length`

## 8. Signals, and the questions behind them

None, and here is why. The change deletes a client-side branch; it adds no
process, no job, no server path, and nothing that runs unattended. There is no
three-in-the-morning question because there is nothing running at three in the
morning to ask about.

The one question this control could have raised -- where does it send people --
stops being a question at all once the answer is a constant in the JSX rather
than a function of the tab's history, which is the change. Ephoros owns what a
signal must carry; this step incurs none of them.

## 9. Boundaries, per capability

None opened, and one closed.

The change removes a read of `window.history.length` and a call to
`router.back()` and puts a compile-time route constant in their place. It adds
no dependency, no network call, no filesystem path, no subprocess, and no
handling of anything a user supplies.

The boundary it closes is the one the issue is about: today the navigation
target is chosen by session history the application does not own and cannot
inspect, so another origin's presence in the tab determines where this button
goes. After the change the target is fixed at build time and no external state
reaches it. Phylax owns the boundary list and the control each needs; this step
introduces no boundary that needs one.

## 10. The budget, or its absence

None. No performance claim is made here and nothing in this change is motivated
by speed, so Metron's refusal of an unmeasured speed change does not bite. The
diff happens to be net-negative in shipped code, and that is an observation
rather than a measurement, offered as neither.

## 11. The fail-closed posture

Four things stop the run:

- Any of the 27 suites passing at baseline failing after the change.
- The passing-test count falling below the baseline's 124 plus whatever the new
  suite adds.
- `npx tsc --noEmit` reporting a fifth error, or naming a changed file in any
  of the four it already reports.
- The new test passing against the pre-change component, which would mean it
  distinguishes nothing.

Lint and build are absent from that list on purpose. Neither can run here, for
the reasons in item 3, and a gate nobody can run is not a gate.

The guard convention, per Elenchus: the test added here is run against the
pre-change component and shown to fail, then against the post-change component
and shown to pass. Both runs are recorded. A test that was never seen to fail
is not a guard, and this study does not accept one as evidence.

## 12. Decisions and their homes

One decision here is expensive to reverse in the sense Hypomnema means, and one
is not.

Removing `back` from `BackButtonProps` changes a shared component's interface.
Its cost is not the deletion; it is that the next contributor who wants history
navigation will re-add it, and will re-add this defect, unless the reason it
went is written where they will be standing. Its home is a comment at the
component itself and the reasoning in the step's pull request body.

Choosing `/lender` over the exact originating list is a product-visible
decision, and its home is the pull request body and the issue's closing
comment, where the reporter will read it.

No architecture decision record is created. This repository has no `docs/adr`
and one component decision does not earn a new directory; the study and the
runbook are committed to `docs/fiat/`, following what the earlier runs here
did.

## Boundaries

**Always.**

- Jest and `npx tsc --noEmit` before a commit, compared against the baseline
  recorded in `docs/fiat/baseline.md`, with
  `NEXT_PUBLIC_TOKENS_IMG_HOSTNAME` set on every jest invocation.
- The imprimatur lint on the study, the runbook and the pull request body.
- A recorded before and after for any change made in the name of speed.

**Ask first.**

- Adding a dependency.
- Changing any `<BackButton>` call site other than the lender market one.
- Touching `src/routes.ts`.
- Touching CI or the husky hooks.
- Adding an `.eslintrc`, a `.gitignore` or a `.env` to a base that has none.
- Renaming or removing an i18n key.

**Never.**

- Commit an RPC credential or the contents of a `.env`.
- Edit `storybook-static/`, `node_modules/`, or `package-lock.json` by hand.
- Delete or skip a failing test to make the suite green.
- Claim a command ran when it did not.

### Amendment -- 2026-08-26

**What changed.** Item 3's type-check paragraph. `npx tsc --noEmit` reports
five pre-existing errors on this base, not four, and it reports them only while
the generated `next-env.d.ts` is absent. That file declares the image module
types, it is produced by Next's own tooling rather than committed, and with it
present the count is zero. The step's type gate therefore asserts that no error
names a file the step changed, instead of pinning a count. Every one of the
five is a `TS2307` on an image import and none names a changed file.
**Why.** The four came from reading a truncated view of the baseline output,
and the dependence on a generated file was not noticed at all. A gate pinned to
a number that moves according to whether an untracked file happens to exist
proves nothing about the diff, which is the same objection this study already
makes to the build.
**Steps touched.** Step 1's exit.
**Still holding.** Step 1: entry holds; exit broken.
