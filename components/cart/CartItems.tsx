'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface CartItemsProps {
  cart: any;
  onUpdate: () => void;
}

export function CartItems({ cart, onUpdate }: CartItemsProps) {
  const { refreshCart } = useCart();
  const { toast } = useToast();

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      onUpdate();
      refreshCart();

      toast({
        title: 'Success',
        description: 'Cart updated successfully',
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cart',
        variant: 'destructive',
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      onUpdate();
      refreshCart();

      toast({
        title: 'Success',
        description: 'Item removed from cart',
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {cart.items.map((item: any) => (
        <div
          key={item._id}
          className="flex gap-4 p-4 bg-card rounded-lg border"
        >
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={item.product.imageUrl}
              alt={item.product.title}
              fill
              className="object-cover rounded-md"
            />
          </div>

          <div className="flex-grow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{item.product.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.subProductName}
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(item.price * item.quantity, 'USD')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(item.price, 'USD')} each
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                      updateQuantity(item._id, value);
                    }
                  }}
                  className="w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeItem(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}