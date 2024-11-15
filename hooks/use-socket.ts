'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useNotificationStore } from '@/lib/store/notification-store';

export const useSocket = () => {
  const { data: session } = useSession();
  const { addNotification } = useNotificationStore();
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    // Create audio element
    audioRef.current = new Audio('/sounds/notification.mp3');

    // Initialize socket connection
    socketRef.current = io({
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    // Join appropriate rooms based on user role
    socketRef.current.emit('join', {
      userId: session.user.id,
      role: session.user.role,
    });

    // Listen for notifications
    socketRef.current.on('notification', (notification) => {
      // Play sound for new notifications
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }

      // Add notification to store
      addNotification({
        ...notification,
        createdAt: new Date(notification.createdAt),
        read: false,
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      audioRef.current = null;
    };
  }, [session, addNotification]);

  return socketRef.current;
};