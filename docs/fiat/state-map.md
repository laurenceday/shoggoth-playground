# What the application can tell a user they still have to do

Every task `product#637` names, against whether this codebase can compute its
completion. A to-do list that cannot tell a task is finished is worse than no
list, so this is the map the widget has to be built on.

| # | Task | Role | Answerable | What decides it |
| --- | --- | --- | --- | --- |
| 1 | Sign the MLA | lender | **yes** | `useGetSignedMla`, `src/app/[locale]/lender/hooks/useSignMla` |
| 2 | MLA issued, awaiting signature | borrower | **yes** | `borrowerSignature` and `timeSigned`, `src/app/api/mla/interface.ts:11,61` |
| 3 | Add organisation information | borrower | **yes, with a caveat** | `BorrowerProfile`, `src/app/api/profiles/interface.ts:6` |
| 4 | Repay a delinquent market | borrower | **yes** | market status, Healthy / Pending / Penalty |
| 5 | Add liquidity | lender | **yes** | market account deposit data, already drives the deposit controls |
| 6 | Complete KYC | borrower | **no** | nothing holds this state, see below |
| 7 | Upload collateral | borrower | **no** | a Collateral Contract section exists; no completable obligation state found |
| 8 | Enable notifications | lender | **no** | a borrower notifications page exists; no lender-side preference found |

Five of eight are answerable. Three are not, and two of those three are borrower
tasks.

## The caveat on task 3

`BorrowerProfile` has fifteen optional fields: `name`, `alias`, `avatar`,
`description`, `founded`, `headquarters`, `website`, `twitter`, `telegram`,
`linkedin`, `jurisdiction`, `entityKind`, `physicalAddress`, `email` and
`additionalUrls`. Completeness is computable as which are empty.

Which of them make a profile complete is not written down anywhere. That is a
product decision, and until someone makes it, "add organisation information"
has no defined finish line even though the data is all there.

## Task 6, and why it is the sharpest of the three

Completing KYC is the first example the issue gives for a borrower. There is no
KYC state in this application. The term appears three times in the whole tree:

- `src/locales/en/en.json`, as the label "KYC Preferences"
- `src/config/elfs-by-country.json`, a country list
- `.../borrower/market/[address]/components/MarketTransactions/index.tsx:122`,
  where the button that would open it is commented out

Preferences are not completion. Nothing records whether a borrower has been
through KYC, so the widget cannot say whether the step is outstanding, and a
list that always shows it is a list nobody can finish.

## What this means for the design

Three tasks need a decision before they can be drawn: either the state gets
built, or the task comes off the list. Both change what the widget shows, so it
is worth settling before the frame is finalised rather than after.

The five that are answerable are enough for a first version, and one of them
already has a single-task implementation: `MobileMlaAlert` prompts a lender to
sign an unsigned MLA on mobile. Whatever is built should absorb it or say why
two prompts about the same thing coexist.
