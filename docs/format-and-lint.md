### Format and lint

<!-- START doctoc -->

- [JS/TS](#jsts)
- [Native code](#native-code)
- [Type checking](#type-checking)

<!-- END doctoc -->

Formatting/linting run through a shared `rntwsc/devtools` pipeline and are not currently enforced by a git pre-commit hook in this repo -- run them yourself before opening a PR. See [Quality and testing](./quality-and-testing.md) for why (most rules warn and auto-fix rather than hard-block).

#### JS/TS

From the repo root:

```sh
pnpm fmt
```

This runs `normalize`, `doctoc`, `eslint`, `stylelint`, and `prettier` in sequence. Each also has its own script (`pnpm eslint`, `pnpm prettier`, `pnpm stylelint`, `pnpm normalize`, `pnpm doctoc`) if you want to run just one -- `pnpm doctoc` regenerates the TOC block in every markdown file under `docs/` and the root `README.md`, and can reformat more than just the TOC in files it touches, so review its diff before committing.

#### Native code

```sh
make fmt
```

Requires these tools on your PATH (macOS via Homebrew):

```sh
brew install clang-format@11 swiftformat google-java-format ktfmt
npm i -g imagemin-cli
```

`make fmt` runs `pnpm fmt` plus native formatters for Objective-C/Swift/Java/Kotlin/xcode-project-file XML, scoped to files tracked by git. If you don't have all the native formatters installed, don't run `make fmt` and commit a half-formatted diff -- run `pnpm fmt` alone instead.

#### Type checking

```sh
pnpm ts
```

Runs `tsc` (a real compile-error gate) and `type-coverage` (informational only, not a hard gate -- see [Quality and testing](./quality-and-testing.md)). Note `tsc` only actually checks `brekekephone/app`: both the root `package.json` and `brekekephone/web/package.json` set `"ignoreTsc": true`, which the `rntwsc` runner uses to skip a package entirely -- see [Quality and testing](./quality-and-testing.md) and [TODO](./TODO.md).
