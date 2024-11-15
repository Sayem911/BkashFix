'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IProduct } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface ProductGridProps {
  search: string;
}

export function ProductGrid({ search }: ProductGridProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [priceMultiplier, setPriceMultiplier] = useState<number>(1.2);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdatePricing = async (productId: string, multiplier: number) => {
    try {
      const response = await fetch(`/api/reseller/products/${productId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiplier }),
      });

      if (!response.ok) throw new Error('Failed to update pricing');

      // Refresh products
      fetchProducts();
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((product) => (
        <Card key={product._id} className="overflow-hidden">
          <div className="relative h-48">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
            {product.instantDelivery && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                Instant Delivery
              </Badge>
            )}
          </div>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {product.region} • {product.category.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              {product.subProducts.map((subProduct, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{subProduct.name}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(subProduct.price * priceMultiplier, 'USD')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cost: {formatCurrency(subProduct.originalPrice, 'USD')}
                    </div>
                  </div>
                </div>
              ))}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Update Pricing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Product Pricing</DialogTitle>
                    <DialogDescription>
                      Set your markup percentage for this product
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Markup Multiplier</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        value={priceMultiplier}
                        onChange={(e) =>
                          setPriceMultiplier(parseFloat(e.target.value))
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        Example: 1.2 means 20% markup
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="space-y-2">
                        {selectedProduct?.subProducts.map((subProduct, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span>{subProduct.name}</span>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(
                                  subProduct.price * priceMultiplier,
                                  'USD'
                                )}
                              </div>
                              <div className="text-sm text-green-600">
                                Profit:{' '}
                                {formatCurrency(
                                  subProduct.price * priceMultiplier -
                                    subProduct.originalPrice,
                                  'USD'
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() =>
                        selectedProduct &&
                        handleUpdatePricing(selectedProduct._id!, priceMultiplier)
                      }
                    >
                      Save Pricing
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}