# Quickbid Technical Overview & Implementation Guide

This document provides a comprehensive breakdown of the Quickbid React Native application. It covers architecture, core features, technical decisions, and implementation details to help you explain the codebase to your manager.

---

## 1. Project Overview
Quickbid is a premium real-time auction platform built with React Native. It features a sophisticated bidding system, live WebSocket updates, a dynamic theme engine, and secure local persistence.

## 2. Tech Stack
- **Framework**: React Native 0.83 (New Architecture ready)
- **State Management**: Redux Toolkit (Slices for Auth, Users, Auctions, Theme)
- **Local Storage**: `react-native-encrypted-storage` (Secure JWT and preference storage)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Real-time**: Socket.IO Client
- **UI/UX**: Custom themed components, `react-native-toast-message` for flash cards.

## 3. Core Architecture

### Redux State Management
The app uses a centralized Redux store located in `src/store/store.ts`.
- **`authSlice`**: Manages the user session, JWT storage, and login/register flows.
- **`userSlice`**: Handles profile data, balance updates, and the "Won Auctions" list.
- **`auctionList`**: Manages the feed of auctions with pagination and status filtering.
- **`auctionDetail`**: Handles the deep-state of a single auction, including live bids and real-time status changes.
- **`themeSlice`**: Manages the UI theme mode (light/dark) and persists it to disk.

### Navigation Hierarchy
Defined in `src/navigation/RootNavigator.tsx`:
- **AuthStack**: Login and Register screens.
- **MainStack**:
    - **TabNavigator**: Bottom bar (Home, Auctions, Create Auction, Profile).
    - **AuctionDetail**: Fullscreen view for bidding.
    - **Settings**: Theme toggle and user preferences.
    - **WonAuctions**: A list of the user's successful wins.

## 4. Key Feature Implementation

### Premium Theme System
We implemented a custom theme engine in `src/theme/` and `src/hooks/useTheme.ts`.
- **`useTheme()` Hook**: This is the heart of the UI. Components use this hook to get reactive `colors`. When the theme toggles, every screen updates instantly without a refresh.
- **Persistence**: The theme choice is saved in encrypted storage, so the app remembers your preference (Light/Dark) on restart.

### Real-Time Sockets & Hooks
The `useAuctionSocket` hook provides a reactive bridge between the server and UI.
- **Event Listeners**: We listen for `NEW_BID`, `AUCTION_SOLD`, `AUCTION_EXPIRED`, and `AUCTION_EXTENDED`.
- **Dynamic Feedback**: Events trigger both Redux updates (to update the UI) and Toast notifications (to alert the user).

### Auction Status & Logic
- **Status Alignment**: We strictly follow the backend enum: `draft` | `active` | `sold` | `expired`.
- **Timer Extension (+30s)**: A key feature where a bid placed near the end triggers an `AUCTION_EXTENDED` event, adding 30 seconds to the `endsAt` timestamp in the UI.

### Create Auction Flow
- **Auto-Reset**: The `CreateAuctionScreen` uses `useFocusEffect` to clear all fields and reset the default end time to **5 minutes** from the current time every time the user navigates to it.

## 5. Directory Structure
```text
src/
├── api/          # Fetch calls and API interfaces
├── components/   # Reusable UI elements (AuctionCard, Modals)
├── hooks/        # Custom logic (useTheme, useAuctionSocket)
├── navigation/   # Routing logic
├── screens/      # Full-page components (Home, Profile, etc.)
├── store/        # Redux Toolkit slices and configuration
├── theme/        # Color palettes and global styles
└── types/        # TypeScript interfaces and enums
```

## 6. Critical Implementation Details (FAQ for Managers)

**Q: How does the theme system work?**
A: We don't use hardcoded colors. We defined two palette objects (Light/Dark). The `useTheme` hook detects the current state from Redux and returns the correct hex codes. This ensures 100% consistency across the app.

**Q: How do we handle security?**
A: Tokens and sensitive theme preferences are stored using `react-native-encrypted-storage`, which uses Keychain (iOS) and Keystore (Android) for hardware-level security.

**Q: What happens if the socket disconnects?**
A: The `SocketService` has built-in reconnection logic. Additionally, we use `useFocusEffect` in our screens to refresh data via HTTP APIs as a fallback when the user enters a screen.

**Q: How is the timer extension handled?**
A: When the server sends `AUCTION_EXTENDED`, we update the `endsAt` property in the Redux store for that specific auction. The `AuctionDetailScreen` has a `useEffect` that listens to this property and recalculates the countdown immediately.
