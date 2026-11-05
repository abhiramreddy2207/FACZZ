# FACZZ — F1 news app

Faczz is a responsive Formula 1 news and data app built with TanStack Start, React, TypeScript, and Tailwind CSS. It includes Home, Explore, Saved, Data, Profile and Settings, Race Center, source profiles, onboarding, notifications, light/dark themes, and an installable PWA layout for phones and desktop.

Explore loads current BBC Sport F1 and Autosport RSS updates. Publisher follows, team and driver follows, bookmarks, collections, and preferences are stored on the device. Social timelines require account connections; public video and post URLs can use platform embeds when available. Some timing and statistics remain prototype data.

## Run locally

Requires Node.js and npm.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it with `npm run preview`.

## Use on a phone

The web app has a responsive mobile layout and a PWA manifest. Serve it over HTTPS, open it in Safari or Chrome, and choose **Add to Home Screen** / **Install app** from the browser menu. It opens in a standalone app-like window. The current PWA does not cache the app for offline use.

This project does not yet include native Xcode or Android Studio projects. Native store builds need platform projects and signing configuration.
