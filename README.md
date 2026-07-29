# Dhulo

Dhulo is a small disappearing journal app.

You write a note, choose how long it should live, and let it slowly fall apart. Text can burn into ash, blur out, drift apart, or scramble itself. Images fade and soften too. The point is not to build an archive. It is a place for thoughts that only need to exist for a while.

## What It Does

- Create temporary notes with text and optional images
- Pick a lifespan for each note
- Choose a decay style: ash, blur, drift, or scramble
- Fast-forward a note to expiry, watch it decay live, then restore or release it
- Save unfinished writing as drafts and reopen it later
- Search, filter, sort, preserve, extend, duplicate, and share notes
- Customize the app mood with themes and animated backgrounds
- Learn the ritual through an optional first-launch guide
- Keep notes and durable copies of attached photos local on the device

## Running It

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

Then scan the QR code with Expo Go.

## Expo Version

This app is pinned to Expo SDK 54 because that is the version that works with the regular Expo Go app on phones right now. 
If Expogois updated, run:

```bash
npx expo install --check
npx expo-doctor
```

## Project Map

- `app/` contains the Expo Router entry and the main screen switching
- `screens/` has the full app screens
- `components/` has shared UI, animation, and note rendering pieces
- `context/` stores notes, settings, and profile state
- `lib/` holds the decay rules and core types
- `utils/` has timing, formatting, and shared constants

## Current State

Ready for Expo Go testing. No release build has been created.
