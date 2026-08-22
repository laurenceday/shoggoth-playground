# Runbook: action center

Derived from `.hexaemeron/study.md`. Two steps are specified. Only the first can
be built today, and the runbook says so rather than pretending otherwise.

## Step 1: Commit the spec and the state map

**Goal.** Put the study in the repository, with the map of which tasks the
application can and cannot answer, so the design work that follows starts from
it.

**Entry.** `fiat/637-action-center` at `a17f0fa`, the synced tip of
`laurenceday/shoggoth-playground` `main`.

**Exit.** `docs/fiat/study.md` and `docs/fiat/runbook.md` match the
`.hexaemeron` copies byte for byte. `docs/fiat/state-map.md` lists each task the
issue names, whether the application can compute its completion, and the file
that decides it. Proved by: `diff` of each committed copy against its original
exits 0, `state-map.md` naming a verdict and a source file for all eight tasks,
and `npm run test` reporting the baseline's 125 passing with the same two suites
failing.

**Files.** `docs/fiat/study.md`, `docs/fiat/runbook.md`,
`docs/fiat/state-map.md`, `docs/fiat/baseline.md`.

**Tests.** None added. This step changes no application code. The state map's
claims are each backed by a named file and line, which is the checkable form
available for a claim about what a codebase does not contain.

**Disciplines.** phylax: none, no boundary and no input path. ephoros: none.
metron: none. elenchus: none, no failure in hand. hypomnema: the state map is
the artefact, and its whole purpose is to be found by whoever builds the widget
rather than rediscovered.

## Step 2: Build the widget

**Goal.** Show a user the steps that remain for them.

**Entry.** Step 1's branch and tree, **and an exported design frame**. This
entry is not satisfied today. Figma `feXTW9I6NCKBLnPq3lt6rT` node `16279-92110`
is unreadable from here on a View seat, and an export has been requested on the
issue.

**Exit.** The widget renders each answerable task for the current role, each
entry disappears when its action is completed without a reload, a user with
nothing outstanding sees no widget, and the component matches the exported
frame. No task appears whose completion state cannot be derived. `MobileMlaAlert`
is either absorbed or its coexistence is explained. Proved by: a rendered
walkthrough per role committed as screenshots, a test per task asserting the
done and not-done states, and `npm run test` above the baseline by that number
with the same two suites failing.

**Files.** Unknown until the design is read. Naming them now would be inventing
the component this step exists to build from a design.

**Tests.** One per answerable task, asserting both states. Five tasks are
answerable today, so five, unless the design's task list differs from the
issue's.

**Disciplines.** phylax: the widget reads per-user state, so it must use the
hooks the pages already use under the same auth rather than combining sources
the app does not already combine. ephoros: none, nothing runs unattended.
metron: none unless the design needs a task whose state requires a new request,
which would need a measurement rather than an assumption. elenchus: governs any
failure the walkthrough surfaces. hypomnema: which profile fields count as
complete is a product decision and is recorded wherever that decision lands, not
inferred from the code.

**This step does not start until its entry is satisfied.** Building a
user-facing component from the issue prose, when a design for it exists and is
merely unread, produces work that is thrown away when the design arrives.
