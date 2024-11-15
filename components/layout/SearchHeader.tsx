'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthStatus } from './AuthStatus';
import { NotificationBell } from '../notifications/NotificationBell';

export function SearchHeader() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-purple-900/20 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1 flex items-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search games, cards, top-ups..."
              className="w-full pl-10 bg-gray-900 border-gray-800 focus-visible:ring-purple-500"
            />
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Search
        </Button>
        <NotificationBell />
        <AuthStatus />
      </div>
    </div>
  );
}