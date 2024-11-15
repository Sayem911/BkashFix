'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductPricingCardProps {
  product: any;
  markup: number;
  minMarkup: number;
  maxMarkup: number;
  onUpdate: () => void;
}

export function ProductPricingCard({
  product,
  markup,
  minMarkup,
  maxMarkup,
  onUpdate
}: ProductPricingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMarkup, setCurrentMarkup] = useState(markup);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (currentMarkup < minMarkup || currentMarkup > maxMarkup) {
      setError(`Markup must be between ${minMarkup}% and ${maxMarkup}%`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/reseller/products/${product._id}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markup: currentMarkup }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update pricing');
      }

      toast({
        title: 'Success',
        description: 'Product pricing updated successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Failed to update pricing:', error);
      setError(error instanceof Error ? error.message : 'Failed to update pricing');
    } finally {
      setLoading(false);
    }
  };

  const calculateSellingPrice = (price: number) => {
    return price * (1 + currentMarkup / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pricing Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              value={currentMarkup}
              onChange={(e) => setCurrentMarkup(parseFloat(e.target.value))}
              disabled={loading}
            />
            <span className="text-muted-foreground">%</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Allowed range: {minMarkup}% - {maxMarkup}%
          </p>
        </div>

        <div className="space-y-2">
          <Label>Price Preview</Label>
          <div className="space-y-2">
            {product.subProducts.map((subProduct: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                <span className="text-sm">{subProduct.name}</span>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(calculateSellingPrice(subProduct.price), 'USD')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost: {formatCurrency(subProduct.price, 'USD')}
                  </div>
                  <div className="text-sm text-green-600">
                    Profit: {formatCurrency(calculateSellingPrice(subProduct.price) - subProduct.price, 'USD')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Pricing
        </Button>
      </CardContent>
    </Card>
  );
}