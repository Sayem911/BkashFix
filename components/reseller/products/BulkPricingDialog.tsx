'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Percent } from 'lucide-react';

interface BulkPricingDialogProps {
  selectedProducts: string[];
  onUpdate: () => void;
  minMarkup: number;
  maxMarkup: number;
}

export function BulkPricingDialog({
  selectedProducts,
  onUpdate,
  minMarkup,
  maxMarkup
}: BulkPricingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markup, setMarkup] = useState(minMarkup);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (markup < minMarkup || markup > maxMarkup) {
      setError(`Markup must be between ${minMarkup}% and ${maxMarkup}%`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reseller/products/pricing/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: selectedProducts.map(id => ({
            productId: id,
            markup
          }))
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update pricing');
      }

      toast({
        title: 'Success',
        description: 'Product pricing updated successfully',
      });

      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update pricing:', error);
      setError(error instanceof Error ? error.message : 'Failed to update pricing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedProducts.length === 0}>
          <Percent className="mr-2 h-4 w-4" />
          Update Pricing ({selectedProducts.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Pricing</DialogTitle>
          <DialogDescription>
            Set markup percentage for {selectedProducts.length} selected products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Markup Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={minMarkup}
                max={maxMarkup}
                step="0.1"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value))}
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Allowed range: {minMarkup}% - {maxMarkup}%
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Pricing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}