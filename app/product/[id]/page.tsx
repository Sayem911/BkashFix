'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IProduct, ISubProduct } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Zap, Star, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import Image from 'next/image';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ISubProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
      if (data.subProducts.length > 0) {
        setSelectedVariant(data.subProducts[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative h-96 lg:h-[600px] animate-pulse bg-muted rounded-lg" />
            <div className="space-y-6">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <Separator />
              <div className="space-y-4">
                <div className="h-12 bg-muted rounded" />
                <div className="h-32 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
            <CardDescription>
              The product you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative h-96 lg:h-[600px]">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              {product.instantDelivery && (
                <Badge variant="secondary">
                  <Zap className="w-4 h-4 mr-1" />
                  Instant Delivery
                </Badge>
              )}
              {product.popularity === 'FEATURED' && (
                <Badge className="bg-yellow-500">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                {product.region} • {product.category.replace(/_/g, ' ')}
              </p>
            </div>

            <Separator />

            {/* Sub-Products Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Package</CardTitle>
                <CardDescription>Choose your preferred package option</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  {product.subProducts.map((subProduct) => (
                    <div
                      key={subProduct.name}
                      className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                        selectedVariant?.name === subProduct.name
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedVariant(subProduct)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{subProduct.name}</h3>
                          {subProduct.inStock ? (
                            <p className="text-sm text-green-500 flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              In Stock
                            </p>
                          ) : (
                            <p className="text-sm text-destructive">Out of Stock</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatCurrency(subProduct.price, 'USD')}
                          </div>
                          {subProduct.originalPrice > subProduct.price && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatCurrency(subProduct.originalPrice, 'USD')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {product.importantNote && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{product.importantNote}</AlertDescription>
                  </Alert>
                )}

                <AddToCartButton
                  productId={product._id!}
                  subProductName={selectedVariant?.name || ''}
                  disabled={!selectedVariant?.inStock}
                />
              </CardContent>
            </Card>

            {/* Product Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>

            {/* How to Use Guide */}
            {product.guideEnabled && product.guide && (
              <Card>
                <CardHeader>
                  <CardTitle>How to Use</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    {product.guide}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}