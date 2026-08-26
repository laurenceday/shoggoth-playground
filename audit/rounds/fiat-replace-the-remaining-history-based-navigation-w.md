## Step 1, round 1 -- 2026-08-26T14:35:42Z

Audit schema: fiat-audit-round/v2

Covered: borrower-back-destination=reviewed; no-scope-bleed=reviewed; test-baseline=reviewed; guard-strength=reviewed; open-redirect=not-applicable; return-target-allowlist=not-applicable; signature-then-exit=not-applicable; origin-preserved=not-applicable; party-fallback=not-applicable

Not checked: runtime behaviour in a real browser. The evidence is the rendered anchor's href under jsdom, not a navigation observed in Chrome. ESLint and the Next build were not run and cannot be run on this base; the study's item 3 records why. The five not-applicable concerns all belong to step 2's return-target work and no file in step 2's scope was touched here.

Elenchus verdict: null

| id | severity | file | finding | status |
| --- | --- | --- | --- | --- |
| -- | -- | -- | none | -- |

Leads not pursued: two. `handleClickEdit` and `handleClickConfirm` in `src/components/Sidebar/LendersListSidebar/index.tsx` are unreachable, because their `onClick` bindings are commented out at the two step buttons; that was true before this change and removing them is not this step's scope. Separately, `init` reported cutting the run branch `fiat/replace-the-remaining-history-based-navigation-w` and left the worktree on `develop` instead, so the branch did not exist until it was created by hand at the recorded base commit `a17f0fa6fece61b3c118c8995d1bfce47d77ce09`; `develop` was verified unchanged and the step branch was already cut from that same commit, so the topology matches what was recorded, but the controller behaviour is worth reporting upstream rather than only working around.
