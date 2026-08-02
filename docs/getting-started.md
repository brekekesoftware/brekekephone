### Getting started

<!-- START doctoc -->

- [Repo layout](#repo-layout)
- [Requirements](#requirements)
- [Install](#install)
- [Run the mobile app](#run-the-mobile-app)
- [Run the web app](#run-the-web-app)

<!-- END doctoc -->

#### Repo layout

This is a pnpm workspace (`pnpm-workspace.yaml`'s `packages: ['./*/*']`) with **five** packages in total -- the two you'll actually work in day to day, plus three supporting infra packages covered in [Repo layout](./repo-layout.md):

- `brekekephone/app` -- the React Native app (iOS + Android). Almost all shared app logic (`src/`) lives here; the web package imports it directly.
- `brekekephone/web` -- the Vite package that builds the web/embed bundle. Its own `src/` is a thin shim around `brekekephone/app/src`.
- `dev01/api`, `dev01/web`, `embed-example/react` -- infra for the dev01 download page and the embed example; see [Repo layout](./repo-layout.md) and [Building and deploying to dev01](./dev01-deploy.md).

Everything else at the repo root (`Makefile`, `patches/`, `docs/`) applies to all of them.

This project uses [rntwsc](https://github.com/namnm/rntwsc) for Tailwind class name support (compiled by a Babel plugin into React Native styles) and shared devtools (formatting, linting, type checking). See [Format and lint](./format-and-lint.md) for how those run.

#### Requirements

- Node `>=24.11` and `pnpm >=11` (see the `engines` field in `package.json`). Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions if needed: `npm i -g pnpm`
- For Android: Android Studio + SDK, see [Android build](./android-build.md)
- For iOS: Xcode + CocoaPods (via Bundler), see [iOS build](./ios-build.md)
- Ruby `>=2.6.10` for CocoaPods, managed with [rbenv](http://rbenv.org/) or [rvm](https://rvm.io/) if you don't already have a suitable system Ruby

#### Install

From the repo root:

```sh
pnpm i
```

This installs dependencies for every package in the workspace (all five listed above) and applies the patches listed in `pnpm-workspace.yaml`'s `patchedDependencies` automatically -- no separate `postinstall`/`patch-package` step is needed.

See [Credentials and config](./credentials-and-config.md) for the local files (keystores, `google-services.json`, TURN config) you need before you can build a working app.

#### Run the mobile app

Start the Metro bundler from `brekekephone/app` and leave it running:

```sh
cd brekekephone/app
pnpm start
```

Then follow [Android build](./android-build.md) or [iOS build](./ios-build.md) to run the app on a device/emulator/simulator.

#### Run the web app

```sh
cd brekekephone/web
pnpm start
```

See [Web and embed](./web-and-embed.md) for the HTTPS dev server flag, production build, and the embed example.
