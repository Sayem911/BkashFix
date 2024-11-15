'use client';

import { create } from 'zustand';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface CartStore {
  itemCount: number;
  setItemCount: (count: number) => void;
}

const useCartStore = create<CartStore>((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
}));

export function useCart() {
  const { data: session } = useSession();
  const { itemCount, setItemCount } = useCartStore();

  useEffect(() => {
    if (session?.user) {
      fetchCartCount();
    } else {
      setItemCount(0);
    }
  }, [session]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      const cart = await response.json();
      setItemCount(cart.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setItemCount(0);
    }
  };

  return {
    itemCount,
    refreshCart: fetchCartCount,
  };
}