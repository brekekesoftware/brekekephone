<!-- START doctoc -->

- [Quality and testing](#quality-and-testing)
  - [No reliable automated tests](#no-reliable-automated-tests)
  - [Lint/format/type-check moved to a shared `rntwsc/devtools` pipeline, and are now mostly warn-not-block](#lintformattype-check-moved-to-a-shared-rntwscdevtools-pipeline-and-are-now-mostly-warn-not-block)

<!-- END doctoc -->

# Quality and testing

## No reliable automated tests

The repo still has no test suite protecting the main flows (confirmed: no `jest.config.*`, no `.test.`/`.spec.` files, no `test` script in any `package.json`). Lint/format/type-check remain the main gate. The important flows depend on PBX/SIP/WebRTC/native OS/push providers, which are hard to mock meaningfully, and races only show up in real state: killed app, lock screen, switch account, PN delay, OS background.

For pure logic changes such as PN parsing, resource line, park number, or auth conditions, prefer adding a small test. If there is no test yet, the PR must clearly document the manual test matrix. Do not merge call/auth/PN changes just because lint/type-check passes.

## Lint/format/type-check moved to a shared `rntwsc/devtools` pipeline, and are now mostly warn-not-block

`package.json` scripts are thin wrappers (`node ./devtools normalize,doctoc,eslint,stylelint,prettier`, `node ./devtools tsc,type-coverage`) around a shared `rntwsc/devtools` package. There is no `typeCoverage.atLeast` field anywhere, and the `type-coverage` command that actually runs is `type-coverage --suppressError --at-least 0 --project <tsconfig>`, i.e. it always passes and is informational only, not a gate. No `husky`/`lint-staged` dependency or config was found anywhere in the repo, and no `.git/hooks/pre-commit` tied to this project's tooling exists (a leftover, unrelated Husky v4 hook from a completely different old repo path was found in this checkout's `.git/hooks`, but it is not part of this project's config and should not be treated as evidence a pre-commit gate is configured). Separately, `tsc` itself only runs against packages that don't opt out: both the root `package.json` and `brekekephone/web/package.json` set `"ignoreTsc": true`, which the `rntwsc` runner treats as "skip this tsconfig entirely", so in practice `brekekephone/web` currently gets no compile-time type checking from `pnpm ts`, only `brekekephone/app` does.

This is a deliberate philosophy change, not a regression. The 3.0.0 migration deliberately updated the ESLint/Prettier configuration (now `rntwsc/devtools/eslint/config`, extended in `eslint.config.js` with a handful of project-specific rule overrides, e.g. `custom/kebab-case-import-paths` to enforce the new file-naming convention) to add more rules for code quality, but with an explicit design goal: most rules are auto-fixable, and rules warn by default instead of hard-blocking, specifically to avoid "error blocking overhead", i.e. to keep local dev and CI friction low while still surfacing quality issues. The 100%-type-coverage hard gate from before 3.0.0 is consistent with this same philosophy shift: type coverage is still measured and reported, but it no longer fails a build/commit on its own (`--at-least 0`). Treat it as a dashboard signal, not a gate, and do not assume "type-coverage passed" means "no `any` was introduced"; check the report's percentage, or `git diff` for new `any`/casts, directly. Whether a pre-commit hook (husky/lint-staged or otherwise) is supposed to exist in this project is unclear from the repo alone: there is no config for one right now. If you need commit-time enforcement, either confirm with the team it was intentionally dropped as part of the "no error blocking overhead" philosophy, or that it is expected to be re-added.

Since ESLint/Prettier/type-coverage are largely non-blocking now, do not rely on "the tool would have caught it" as a substitute for review on quality-sensitive changes; run `pnpm fmt` (`normalize,eslint,stylelint,prettier`) and `pnpm ts` (`tsc,type-coverage`) yourself before opening a PR, since nothing will force this automatically at commit time. Adding `any` still lowers the reported type-coverage number even though it won't fail CI by itself; keep casting at the boundary and declare the type clearly, consistent with the pre-3.0.0 convention. Native code formatting (`make fmt_objc`/`fmt_swift`/`fmt_java`/`fmt_kotlin`/`fmt_xml`) is unchanged and still needs external tools (clang-format-11, swiftformat, google-java-format, ktfmt) installed; run `make fmt` for the full sweep including JS/TS via `pnpm fmt`. `eslint.config.js` re-exports the shared `rntwsc` config specifically so editor/IDE integration (e.g. VS Code) picks up the same rules as the CLI; do not fork it into a second, divergent config.

Related files:

- `package.json`
- `eslint.config.js`
- `Makefile`
