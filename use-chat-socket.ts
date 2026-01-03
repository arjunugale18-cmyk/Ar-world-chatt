import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ws } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

type Message = {
  from: string;
  to: string;
  msg: string;
  timestamp?: number;
};

export function useChatSocket(username: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!username) return;

    // Connect to socket
    const socket = io(window.location.origin, {
      query: { username },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to chat server");
    });

    socket.on(ws.events.NEW_MESSAGE, (data: Message) => {
      setMessages((prev) => [...prev, { ...data, timestamp: Date.now() }]);
      
      // Optional: Play a sound or show toast if it's from someone else
      if (data.from !== username) {
        // We could show a toast notification here if needed
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [username]);

  const sendMessage = (to: string, msg: string) => {
    if (!socketRef.current || !username) return;

    const messageData = { from: username, to, msg };
    
    // Emit to server
    socketRef.current.emit(ws.events.SEND_MESSAGE, messageData);
    
    // Optimistically add to our own list (though the server usually echoes it back in many implementations, 
    // the provided vanilla implementation emits to everyone in room including sender. 
    // We will rely on the server echo to avoid duplicates based on the vanilla implementation logic: 
    // "io.emit('newMessage', data)" sends to everyone.)
  };

  return { messages, sendMessage };
}
