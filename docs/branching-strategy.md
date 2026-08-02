### Branching strategy

<!-- START doctoc -->

- [Why two branches](#why-two-branches)
- [What actually differs between them](#what-actually-differs-between-them)
- [The release workflow](#the-release-workflow)
- [Version branches as a fixed reference](#version-branches-as-a-fixed-reference)

<!-- END doctoc -->

#### Why two branches

- `master` builds as `com.brekeke.phonedev` ("Brekeke Phone Dev").
- `release` builds as `com.brekeke.phone` ("Brekeke Phone").

Both bundle ids can be installed side by side on the same device/simulator. This is deliberate: it lets anyone install the in-development dev build and the last-released build at the same time, to compare behavior and catch a regression before it ships, instead of only being able to test one version at a time.

#### What actually differs between them

`release` is not an independent line of development. As of this writing it is exactly **one commit ahead** of a past point on `master` (`git log origin/master..origin/release` shows a single `Release` commit). That commit only renames the bundle id/package/app name across both platforms -- for example (from the actual last "Release" commit):

- Android: `android/app/build.gradle` (`applicationId`), `AndroidManifest.xml`, and the whole `com/brekeke/phonedev` Java/Kotlin package tree renamed to `com/brekeke/phone`.
- iOS: bundle identifier and related Xcode project settings.

Everything else on `release` is whatever `master` looked like the last time `release` was rebased -- it is **not** kept continuously up to date with `master`, so if you `git diff origin/master origin/release` right now you will see a large diff (all of `master`'s work since the last rebase), not just the rename commit. That is expected, not a sign `release` is broken; it just means `release` hasn't been rebased since then.

#### The release workflow

When it's time to cut a release:

1. Rebase `release` onto the current tip of `master` (`git rebase origin/master` on the `release` branch, or an equivalent merge if the team prefers -- either way, the one "rename bundle id" commit must end up back on top).
2. Resolve any conflicts the rebase produces. Since `release`'s only diff from `master` is a mechanical rename, conflicts are usually just the rename touching the same lines `master` changed since -- read them carefully rather than blindly taking one side, especially in files the rename touches directly (`build.gradle`, `AndroidManifest.xml`, the renamed Java/Kotlin package, Xcode project settings).
3. Double-check the rebased `release` branch actually builds and runs correctly (both platforms) before treating it as ready.
4. Build for release from this branch -- see [Building for the App Store and Play Store](./app-store-release.md).
5. Once the release is approved and shipped, cut a **version branch** from this exact commit as a permanent, named reference (see below).

#### Version branches as a fixed reference

Run `git branch -a` and you'll see a long list of version-named branches (`2.17.6`, `2.17.7`, `2.16.11`, ...) alongside `master` and `release`. Each one is a snapshot of `release` at the moment that version shipped -- there are no git tags used for this, version branches serve that purpose instead. For example, `origin/2.17.7`'s tip is the exact same commit as `origin/release`'s tip was at that time.

Use these when you need to know exactly what shipped in a given version (e.g. to bisect a regression a customer reports against a specific released version), rather than trying to reconstruct it from `CHANGELOG.md` and commit history alone.
