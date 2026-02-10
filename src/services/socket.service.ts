import {io, Socket} from 'socket.io-client';
import {API_BASE_URL} from '../api/config';
import EncryptedStorage from 'react-native-encrypted-storage';

class SocketService {
  private socket: Socket | null = null;
  private currentAuctionId: string | null = null;

  connect = async () => {
    if (this.socket?.connected) {
      console.log('[SOCKET] Already connected, skipping connect call');
      return;
    }

    const token = await EncryptedStorage.getItem('auth_token');
    const url = `${API_BASE_URL}/auctions`;

    console.log('[SOCKET] 🔄 Connecting to:', url);
    
    this.socket = io(url, {
      auth: { token },
      transports: ['polling', 'websocket'], // Allow polling for stability (important for ngrok/unstable networks)
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('[SOCKET] ✅ Connected! ID:', this.socket?.id);
      // Re-join the current auction room if we have one (on reconnect)
      if (this.currentAuctionId) {
        console.log('[SOCKET] 🔄 Automatic re-joining auction:', this.currentAuctionId);
        this.joinAuction(this.currentAuctionId);
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('[SOCKET] ❌ Connection error:', error.message);
      if (error.data) console.error('[SOCKET] Handshake details:', error.data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SOCKET] 🔌 Disconnected. Reason:', reason);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log('[SOCKET] ♻️ Reconnected successfully after attempt:', attempt);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log('[SOCKET] ⏳ Reconnection attempt:', attempt);
    });

    this.socket.on('joined_auction', (data) => {
      console.log('[SOCKET] 📥 Joined confirmation from server:', data);
    });

    this.socket.on('VIEWER_COUNT', (data) => {
      console.log('[SOCKET] 👥 VIEWER_COUNT:', data);
    });

    // Catch-all debugger for ALL incoming events
    this.socket.onAny((eventName, ...args) => {
      console.log(`[SOCKET DEBUG] 📥 EVENT: ${eventName}`, args);
    });
  };

  disconnect = () => {
    if (this.socket) {
      console.log('[SOCKET] Manual disconnect triggered');
      this.socket.disconnect();
      this.socket = null;
      this.currentAuctionId = null;
    }
  };

  joinAuction = (auctionId: string) => {
    this.currentAuctionId = auctionId;
    if (this.socket?.connected) {
      console.log(`[SOCKET] 📤 Emitting join_auction: { auctionId: ${auctionId} }`);
      this.socket.emit('join_auction', { auctionId });
    } else {
      console.log('[SOCKET] ⏳ joinAuction queued (waiting for connection)');
      // If not connected, the 'connect' event listener will handle re-joining later
    }
  };

  leaveAuction = (auctionId: string) => {
    console.log(`[SOCKET] 📤 Leaving auction: ${auctionId}`);
    if (this.socket?.connected) {
      this.socket.emit('leave_auction', { auctionId });
    }
    this.currentAuctionId = null;
  };

  on = (event: string, callback: (data: any) => void) => {
    if (this.socket) {
      console.log(`[SOCKET] 🎧 Attaching listener for: ${event}`);
      this.socket.on(event, callback);
    } else {
      console.warn(`[SOCKET] Cannot attach listener for ${event}: Socket is null`);
    }
  };

  off = (event: string) => {
    if (this.socket) {
      this.socket.off(event);
    }
  };

  getSocket = () => this.socket;
}

export const socketService = new SocketService();
