import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

/** Socket baglanti durumu. */
export type SocketStatus = "connecting" | "connected" | "disconnected";

interface SocketContextValue {
  socket: Socket | null;
  status: SocketStatus;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  status: "disconnected",
});

/**
 * Uygulama genelinde tek bir WebSocket baglantisi yonetir.
 * Socket.io namespace: /mongo-ws
 *
 * URL turetme:
 *   1. VITE_WS_URL varsa onu kullan.
 *   2. VITE_API_URL varsa /api son ekini cikar ve kullan.
 *   3. Hicbiri yoksa window.location.origin kullan.
 */
const DEFAULT_API_URL = "http://localhost:3888/api";

function resolveWsUrl(): string {
  const wsUrl = import.meta.env.VITE_WS_URL;
  if (wsUrl) return wsUrl;

  // VITE_API_URL veya varsayilan API URL'den /api son ekini cikar
  const apiUrl =
    (import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API_URL;
  return apiUrl.replace(/\/api\/?$/, "");
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  useEffect(() => {
    const url = resolveWsUrl();
    const wsEndpoint = `${url}/mongo-ws`;
    console.log("[SocketProvider] Baglanti kuruluyor:", wsEndpoint);

    const socket = io(wsEndpoint, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SocketProvider] Baglanti kuruldu, id:", socket.id);
      setStatus("connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("[SocketProvider] Baglanti kesildi, neden:", reason);
      setStatus("disconnected");
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log("[SocketProvider] Yeniden baglanma denemesi:", attempt);
      setStatus("connecting");
    });

    socket.on("connect_error", (err) => {
      console.error("[SocketProvider] Baglanti hatasi:", err.message);
    });

    return () => {
      console.log("[SocketProvider] Socket kapatiliyor");
      socket.disconnect();
      socketRef.current = null;
      setStatus("disconnected");
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, status }}
    >
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Socket context'ine erisim icin hook.
 */
export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
