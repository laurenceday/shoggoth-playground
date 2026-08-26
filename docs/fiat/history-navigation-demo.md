# Demo path and guard demonstration: the agreement return target

The study's problem statement asks for three things: the borrower back control
is an anchor to `/borrower`; the agreement page returns to the page that sent
the user there when there was one, to the party's own root when there was not;
and it never goes to a destination the URL can be made to name from outside.
Step 1 recorded the first. This records the other two.

## The mechanism

`RedirectsProvider` pushes an unsigned lender to the agreement page. It now
carries the page being left as `returnTo`, validated before it is written, so a
value the consumer would refuse never reaches the URL. The agreement page reads
that parameter at the moment it navigates, validates it again, and falls back
to the party root.

Validation parses before it checks. A substring test on the raw string is not
enough: `/lender/../../evil` passes one and resolves to `/evil`. The parsed
pathname is matched against `/lender` and `/borrower`, exact or followed by a
separator, and agreement routes are refused because returning to one from the
agreement page is a loop.

## Guard demonstration

`src/app/[locale]/agreement/components/AgreementPage/index.test.tsx` was
written before any source changed and run against the unchanged page:

```text
Test Suites: 1 failed, 1 total
Tests:       6 failed, 6 total

  ● AgreementPage cancel > returns to the page that sent the user here
  ● AgreementPage cancel > keeps the query string of the page it returns to
  ● AgreementPage cancel > falls back to the party root when no target was carried
  ● AgreementPage cancel > uses the borrower root for a borrower with no target
  ● AgreementPage cancel > refuses a target naming another origin
  ● AgreementPage cancel > never leaves the application, whatever the target says
```

All six fail because the page navigated by browser history and never called
`push` at all.

After the change, with the validation table alongside:

```text
Test Suites: 2 passed, 2 total
Tests:       34 passed, 34 total
```

The two signature-success paths were then given suites of their own, because
inferring them from the shared helper is weaker than asserting them. Run
against the pre-change sources restored from step 1's branch:

```text
Test Suites: 2 failed, 2 total
Tests:       5 failed, 5 total

  ● ReacceptButton > returns to the page that sent the user here
  ● ReacceptButton > never leaves the application, whatever the target says
  ● useSignAgreement success navigation > returns to the page that sent the user here
  ● useSignAgreement success navigation > falls back to the lender root when nothing was carried
  ● useSignAgreement success navigation > never leaves the application after a successful signature
```

After the change, the same two suites pass 5 of 5, and the three agreement
suites together pass 11 of 11.

`src/utils/returnTarget.test.ts` is a new module's table, so its cases could
only fail before the change by failing to import. That is not a guard and is
not offered as one. The eleven component and hook cases are the guards, and the
rejection rows in the table are what make the refusals enumerable.

## The rejection table

Every row below resolves to the party root rather than to the value named.

| Value | Why it is refused |
| --- | --- |
| `https://evil.example/x` | An absolute URL naming another origin. |
| `//evil.example/x` | Protocol-relative, which a browser reads as another origin. |
| `javascript:alert(1)` | A scheme rather than a path. |
| `/\evil.example/x` | A backslash a browser may fold into an authority. |
| `/admin` | An in-app path outside the known prefixes. |
| `/lender/../../evil` | Traversal that escapes a known prefix once parsed. |
| `/lender/agreement` | An agreement route, which would loop. |
| `/borrower/agreement` | The same for the borrower. |
| `/lenderevil` | A prefix look-alike with no separator. |
| `""`, `null`, `undefined` | Nothing carried. |

## Accepted

| Value | Result |
| --- | --- |
| `/lender` | `/lender` |
| `/lender/my-markets` | `/lender/my-markets` |
| `/lender/all-markets` | `/lender/all-markets` |
| `/lender/market/0xabc?chainId=1` | Kept whole, query string included |
| `/borrower` | `/borrower` |
| `/borrower/market/0xabc` | `/borrower/market/0xabc` |

The query-string row matters on its own account: a lender gated out of a market
page returns to that market on the chain they were looking at, not to the
market on whatever chain the app would otherwise pick.

## What is still not established

Nobody has watched this in a browser. The evidence is the mocked router's
argument under jsdom, not a navigation observed in Chrome. In particular the
signature paths are demonstrated by asserting what the success handler pushes,
not by signing a real message.
