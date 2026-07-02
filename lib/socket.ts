import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket-events';
import { io, type Socket } from 'socket.io-client';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: AppSocket | null = null;
let activeToken: string | null = null;

export function connectSocket(accessToken: string): AppSocket {
  if (!SOCKET_URL) {
    throw new Error('NEXT_PUBLIC_SOCKET_URL is not defined');
  }

  if (socket && activeToken === accessToken) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  disconnectSocket();

  activeToken = accessToken;

  socket = io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function getSocket(): AppSocket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (!socket) {
    activeToken = null;
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();

  socket = null;
  activeToken = null;
}
