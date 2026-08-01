# Dhulo

**Thoughts meant to fade.**

I built Dhulo for the thoughts that need somewhere to land, but do not need a permanent home. Write down whatever is looping in your head, choose how long you want to keep it around, and watch the words slowly lose their shape.

Dhulo is not trying to become a productivity system or an endless journal archive. It is a small, private ritual: get it out, sit with it for a while, then let it go.

The name _Dhulo_ means dust in Nepali. That felt right for an app where words can soften, scatter, and finally disappear.

## What it can do

- Write temporary notes with an optional photo
- Choose an exact lifespan with day, hour, and minute controls
- Let words decay as Ash, Drift, Redact, or Scramble
- Watch the decay happen gradually while the timer runs
- Use **Decay now** to fast-forward and see the ending live
- Put a note on hold and resume it when you are ready
- Keep unfinished writing as a local draft
- Search notes, filter by state, and sort by newest or ending soon
- Choose from several colour themes and genuinely different wallpapers
- Set sound, haptics, motion, default timing, and default decay behaviour
- Learn the app through an interactive first-launch guide
- Release an expired note permanently, with no trash folder or restore button

## The basic idea

1. Write what is bothering you. It can be messy.
2. Pick how long the note should stay.
3. Let it fade in the background, or fast-forward when you want to move on.
4. Release it for good when its time is up.

Dhulo keeps a final decayed trace at expiry, but the original writing cannot be reopened. Final release removes the note from the app. That action is deliberately irreversible.

## Run it locally

Dhulo uses Expo SDK 54 and npm.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press the platform shortcut shown by Expo. Expo Go is the quickest development loop; a native build is the better final check for storage, permissions, haptics, and sound.

Before opening a pull request or preparing a build, run:

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
```

## Android builds

The EAS profiles are already configured in `eas.json`.

```bash
# Installable APK for testing
npm run build:android:apk

# Play Store AAB
npm run build:android:aab
```

The production profile creates an Android App Bundle and increments the remote Android version code. Building and publishing are intentionally separate steps.

## Project layout

```text
app/           Expo Router entry and top-level screen flow
screens/       Home, editor, reader, profile, and settings screens
components/    Shared interface, tutorial, timer, and decay visuals
context/       Local notes, settings, and profile state
hooks/         Timers, theme helpers, and keyboard behaviour
lib/           Note models, decay rules, and local image storage
utils/         Timing, formatting, and shared constants
assets/        Icons, brand artwork, fonts, and bundled sound
```

## Private by design

Dhulo has no account, ads, analytics, or cloud note sync. Notes, settings, profile details, and private copies of attached photos stay in local app storage. The app does not upload your writing or use it to train AI models.

The GitHub and Privacy Policy links only open when you tap them. As with any local app, someone who can unlock your device or access a device backup may also be able to access locally stored app data.

Read the full [privacy policy](https://swaznil.github.io/dhulo/privacy-policy.html).