# WebSocket Implementation Guide: Quickbid Live Updates

If you've never implemented WebSockets before, think of them as a **persistent two-way telephone line** between the App and the Server. Unlike normal API calls (where the app asks and the server answers), with Sockets, the server can "call" the app whenever something new happens (like a new bid).

---

## 🏗️ 1. The Core: `SocketService.ts`
Located in `src/services/socket.service.ts`, this is a **Singleton class**. This means there is only *one* instance of the socket connection shared across the entire app.

### Key Responsibilities:
- **Connection Management**: It connects to `${API_BASE_URL}/auctions` using the user's secure token.
- **Handling Reconnections**: If the internet drops, it automatically tries to reconnect (up to 10 attempts).
- **Room Management**: It tells the server which auction room we are currently looking at (`join_auction`).

### Important Methods:
```typescript
socketService.connect();       // Establishes the connection
socketService.joinAuction(id); // Joins a specific auction room
socketService.on(event, cb);   // Listens for a specific server message
```

---

## 🎣 2. The Bridge: `useAuctionSocket.ts`
Located in `src/hooks/useAuctionSocket.ts`, this is a **Custom Hook**. It acts as the bridge between the raw Socket service and your React components.

### How it Works:
1. **Auto-Connect**: As soon as a screen (like `AuctionDetail`) using this hook mounts, it calls `socketService.connect()`.
2. **Room Entry**: It immediately emits a `join_auction` event so the server knows to send updates for *that specific* item.
3. **Event Listening**: It sets up listeners for:
   - `NEW_BID`: Re-fetches data or shows a "You were outbid!" toast.
   - `AUCTION_SOLD`: Updates the status to "Sold" in real-time.
   - `AUCTION_EXTENDED`: Updates the end timer if a bid is placed at the last second.
4. **Cleanup**: When you leave the screen, the hook automatically removes all listeners and tells the server you've left the room. This prevents "memory leaks" or getting notifications for screens you aren't looking at.

---

## 📱 3. Using it in a Screen
Adding real-time support to a new screen is simple:

```tsx
const MyScreen = ({ auctionId }) => {
  // Just by calling this hook, the screen is now "live"
  useAuctionSocket(auctionId); 

  return <Text>This screen now receives live updates!</Text>;
};
```

---

## 🚦 4. General Logic Flow (Visual)
1. **User enters screen** → Hook calls `SocketService`.
2. **SocketService connects** → Server verifies the Token.
3. **Hook joins room** → Server puts this user in the "Auction #123" room.
4. **Another user bids** → Server sends `NEW_BID` to everyone in that room.
5. **App receives `NEW_BID`** → Redux state is updated + Toast notification shown.
6. **User leaves screen** → Hook runs cleanup → App leaves the room.

---

## 💡 Troubleshooting Tips
- **Logs**: Look for `[SOCKET] ✅ Connected!` in the console to verify connection.
- **Events**: We use `socketService.onAny()` which logs **every single message** coming from the server. This is your best friend for debugging.
- **Auth**: Sockets require the `auth_token`. If the user logs out, the socket should be disconnected.
