### iOS build

<!-- START doctoc -->

- [Install CocoaPods dependencies](#install-cocoapods-dependencies)
- [Run in Xcode](#run-in-xcode)
- [Clearing caches](#clearing-caches)
- [Build for distribution](#build-for-distribution)

<!-- END doctoc -->

CocoaPods is managed through Bundler (see `brekekephone/app/Gemfile`), not a system-wide `pod` install, so the versions of `cocoapods`/`activesupport`/`xcodeproj` used are pinned per this repo.

#### Install CocoaPods dependencies

```sh
cd brekekephone/app
bundle install
cd ios
bundle exec pod install --repo-update
```

#### Run in Xcode

Open `brekekephone/app/ios/BrekekePhone.xcworkspace` (not the `.xcodeproj`) in Xcode and run it, with the Metro bundler already running (see [Getting started](./getting-started.md)).

To see push notification and other permission prompts again, uninstall the app from the simulator/device before reinstalling.

#### Clearing caches

If Xcode doesn't reflect changes or throws unusual build errors:

```sh
rm -rf brekekephone/app/ios/build/*
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

#### Build for distribution

- Make sure a distribution certificate is installed locally.
- Archive in Xcode and distribute Ad-hoc/Team-distribution builds to your own server for testing, or validate/distribute to App Store.
- See [Credentials and config](./credentials-and-config.md) for version bump locations before cutting a release.
