# Baseline: shoggoth-playground before the action center

Measured on the entry tree at `a17f0fa`, before the study was written. Same
tree and commit as the `product#682` run earlier tonight, re-run and confirmed.

- `npm run test`: exit 1. **125 tests pass** across 28 suites. Two suites fail
  to run, both files whose contents are entirely commented out:
  `src/app/api/mla/mla.test.ts` and `src/app/api/profiles/profile.test.ts`.
- `npm run lint`: cannot run. No ESLint configuration is committed, so
  `next lint` stops at an interactive prompt.
- `npm run build`: flaky, failing with `Failed to collect page data` on a
  different API route each attempt, before and after any change.

Both test and build need `NEXT_PUBLIC_TARGET_NETWORK` and
`NEXT_PUBLIC_TOKENS_IMG_HOSTNAME`, neither of which is documented anywhere in
the repository.

This run adds no application code, so the only comparison that matters is that
the suite still reports 125 passing and the same two failures.
