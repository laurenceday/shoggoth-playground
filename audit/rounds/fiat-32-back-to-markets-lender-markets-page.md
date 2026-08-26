## Step 1, round 1 -- 2026-08-26T13:20:40Z

Audit schema: fiat-audit-round/v2

Covered: other-call-sites=reviewed; default-link-drift=reviewed; link-destination=reviewed; locale-prefix=reviewed; dead-import=reviewed; test-baseline=reviewed; silent-empty-run=reviewed; guard-strength=reviewed

Not checked: runtime behaviour in a real browser, including the reporter's exact path of opening a market URL in a tab already holding another site. The evidence here is the rendered anchor's href under jsdom, not a navigation observed in Chrome. ESLint and the Next build were not run and cannot be run on this base; the study's item 3 records why.

Elenchus verdict: null

| id | severity | file | finding | status |
| --- | --- | --- | --- | --- |
| -- | -- | -- | none | -- |

Leads not pursued: three, none blocking. `src/components/Sidebar/LendersListSidebar/index.tsx:23` calls `router.back()` directly, the same defect class on a borrower surface nobody has reported; it is a study non-goal and a separate diff. `src/components/Sidebar/LenderMarketSidebar/index.tsx:67` passes the literal string "Back To Markets" where every other BackButton title is a `t(...)` key; changing it touches i18n keys, which the study's ask-first list covers. The repository carries no `.eslintrc`, so `next lint` cannot run at all; adding one is worth doing and is outside this issue.
