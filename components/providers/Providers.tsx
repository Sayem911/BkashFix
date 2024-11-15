'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { useSocket } from '@/hooks/use-socket';

function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocket(); // Set up socket connection
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </SocketProvider>
    </SessionProvider>
  );
}