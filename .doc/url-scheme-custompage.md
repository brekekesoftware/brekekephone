### URL scheme - Open custom page

- External apps can open a specific custom page inside BrekekePhone using a URL scheme:

```
brekekephone://custompage?id=1
brekekephone://custompage?id=2
brekekephone://custompage?id=3
brekekephone://custompage?id=4
```

```
brekekephonedev://custompage?id=1
brekekephonedev://custompage?id=2
brekekephonedev://custompage?id=3
brekekephonedev://custompage?id=4
```

- Note: the dev build uses `brekekephonedev://` instead of `brekekephone://`

- The `id` parameter maps to the custom page configured on the PBX server:
  - `id=1` → `webphone.custompage1`
  - `id=2` → `webphone.custompage2`
  - `id=3` → `webphone.custompage3`
  - `id=4` → `webphone.custompage4`

#### PBX configuration

- The custom page must be configured on the PBX server before it can be opened via URL scheme
- Required fields for each custom page (example for custompage1):
  - `webphone.custompage1.url` — the URL of the web page to display
  - `webphone.custompage1.title` — the title shown in the app
  - `webphone.custompage1.pos` — menu position (e.g. `settings,right,1`)

#### Behavior

- If the user is already signed in, the app will open the custom page of the currently signed-in account
- If the user is not signed in but has a saved account, the app will automatically sign in with the first saved account and then open the custom page
- If the user is not signed in and has no saved account, the URL scheme is ignored
- If the `id` is invalid (0, 5 or higher, non-numeric, or missing), the URL scheme is ignored
- If the `id` is valid but the custom page is not configured on the PBX, the URL scheme is ignored
- If there is an active call in progress, the URL scheme is ignored to avoid disrupting the call UI

#### Triggering from a web page

- The simplest way to trigger the URL scheme is via an HTML link. Create a static HTML file and open it in the mobile browser:

```html
<a href="brekekephone://custompage?id=1">Open Custom Page 1</a>
<a href="brekekephone://custompage?id=2">Open Custom Page 2</a>
```

- Tapping the link in the mobile browser will launch BrekekePhone and open the corresponding custom page
- For the dev build, replace `brekekephone://` with `brekekephonedev://`

#### Platform notes

- The URL scheme works both when the app is already open (foreground or background) and when the app is launched cold (killed completely)
- The URL does not contain account credentials — the custom page always belongs to the currently signed-in account. There is no account switching via URL scheme
