### Web and embed

<!-- START doctoc -->

- [Dev server](#dev-server)
- [Production build](#production-build)
- [Embed example](#embed-example)

<!-- END doctoc -->

`brekekephone/web` is a Vite package; its own `src/` is a thin shim that imports `brekekephone/app/src` directly and aliases away native-only modules (CallKeep, RNFS, etc.). See [Web, embed, and navigation](./web-embed-and-navigation.md) for how that works internally.

#### Dev server

```sh
cd brekekephone/web
pnpm start
```

Some push-notification-related browser permission prompts require HTTPS. To run the dev server over HTTPS with a self-signed cert:

```sh
cd brekekephone/web
pnpm https
```

#### Production build

```sh
cd brekekephone/web
pnpm build
```

This runs `vite build` and then a post-processing step (`embed-build.cjs`) that prepares the embed bundle -- `pnpm build` is the complete build, you don't need a separate step for embed output.

#### Embed example

`embed-example/react` is a small React app that consumes the embed API (`window.Brekeke.Phone.render`, see [Web, embed, and navigation](./web-embed-and-navigation.md)) the way a third-party host or Operator Console would.

```sh
cd embed-example/react
pnpm start
```

To build it: `pnpm build` from the same directory.
