import { useAuthStore } from '@/stores/auth-store';
import { ServerToClientEvents } from '@/types/socket-events';
import { io, Socket } from 'socket.io-client';

let socket: Socket<ServerToClientEvents> | null = null;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

export function getSocket(): Socket<ServerToClientEvents> {
  const { accessToken } = useAuthStore.getState();

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ socket connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ socket connect_error:', err.message, err);
    });
  }

  return socket;
}
