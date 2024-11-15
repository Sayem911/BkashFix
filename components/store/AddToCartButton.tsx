'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/use-cart';

interface AddToCartButtonProps {
  productId: string;
  subProductName: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, subProductName, disabled }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const { refreshCart } = useCart();

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          subProductName,
          quantity: 1
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add item to cart');
      }

      // Refresh cart count
      refreshCart();

      toast({
        title: 'Success',
        description: 'Item added to cart successfully',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add item to cart',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={loading || disabled}
      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <ShoppingCart className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Adding to Cart...' : 'Add to Cart'}
    </Button>
  );
}