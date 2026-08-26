## Step 1, round 1 -- 2026-08-26T14:35:42Z

Audit schema: fiat-audit-round/v2

Covered: borrower-back-destination=reviewed; no-scope-bleed=reviewed; test-baseline=reviewed; guard-strength=reviewed; open-redirect=not-applicable; return-target-allowlist=not-applicable; signature-then-exit=not-applicable; origin-preserved=not-applicable; party-fallback=not-applicable

Not checked: runtime behaviour in a real browser. The evidence is the rendered anchor's href under jsdom, not a navigation observed in Chrome. ESLint and the Next build were not run and cannot be run on this base; the study's item 3 records why. The five not-applicable concerns all belong to step 2's return-target work and no file in step 2's scope was touched here.

Elenchus verdict: null

| id | severity | file | finding | status |
| --- | --- | --- | --- | --- |
| -- | -- | -- | none | -- |

Leads not pursued: two. `handleClickEdit` and `handleClickConfirm` in `src/components/Sidebar/LendersListSidebar/index.tsx` are unreachable, because their `onClick` bindings are commented out at the two step buttons; that was true before this change and removing them is not this step's scope. Separately, `init` reported cutting the run branch `fiat/replace-the-remaining-history-based-navigation-w` and left the worktree on `develop` instead, so the branch did not exist until it was created by hand at the recorded base commit `a17f0fa6fece61b3c118c8995d1bfce47d77ce09`; `develop` was verified unchanged and the step branch was already cut from that same commit, so the topology matches what was recorded, but the controller behaviour is worth reporting upstream rather than only working around.

## Step 2, round 1 -- 2026-08-26T14:47:31Z

Audit schema: fiat-audit-round/v2

Covered: open-redirect=reviewed; return-target-allowlist=reviewed; signature-then-exit=reviewed; origin-preserved=reviewed; party-fallback=reviewed; test-baseline=reviewed; guard-strength=reviewed; no-scope-bleed=reviewed; borrower-back-destination=not-applicable

Not checked: runtime behaviour in a real browser. Evidence is the mocked router's argument under jsdom, not a navigation observed in Chrome, and no message was actually signed. ESLint and the Next build were not run and cannot be run on this base. The validator was probed by hand against twelve hostile forms rather than fuzzed.

Elenchus verdict: guarded

| id | severity | file | finding | status |
| --- | --- | --- | --- | --- |
| S2-R1-01 | low | src/utils/returnTarget.test.ts | The rejection table omitted the forms a browser folds before parsing: a tab, newline or carriage return that becomes a protocol-relative authority, userinfo smuggled onto the prefix, and encoded or double-encoded separators. All twelve probes were already refused by the origin and prefix checks, so this is missing coverage rather than a live bypass, but a later change to the validator could regress any of them with no test failing. | fixed in e586361 |

Leads not pursued: three. `parseReturnTarget` accepts `/lender/my-markets?returnTo=https://evil.example`, returning that whole in-app path; the destination is the pathname, the nested parameter is read by nothing at that route, and the behaviour is now pinned by a test rather than left to chance. The fragment is dropped from a return target, so a deep link into a page section is not restored; that is a deliberate narrowing and restoring it would widen the value handed to `router.push` for no reported need. The three agreement routes still have no `returnTo` on a direct visit, so a user who bookmarks `/lender/agreement` and signs lands on the lender root rather than anywhere more specific, which is the intended fallback and not a defect.
