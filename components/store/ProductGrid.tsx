'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IProduct, ProductCategory } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Zap, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductGridProps {
  search: string;
  selectedCategory?: string;
  selectedPopularity?: string[];
  instantDeliveryOnly?: boolean;
}

export function ProductGrid({ 
  search, 
  selectedCategory,
  selectedPopularity,
  instantDeliveryOnly 
}: ProductGridProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedPopularity, instantDeliveryOnly]);

  const fetchProducts = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedPopularity?.length) {
        selectedPopularity.forEach(p => params.append('popularity', p));
      }
      if (instantDeliveryOnly) {
        params.append('instantDelivery', 'true');
      }

      const response = await fetch(`/api/products?${params.toString()}`);
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-muted" />
            <div className="p-4 space-y-4">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <Link key={product._id} href={`/product/${product._id}`}>
          <Card className="overflow-hidden hover:bg-accent transition-colors">
            <div className="relative h-48">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {product.instantDelivery && (
                  <Badge variant="secondary">
                    <Zap className="w-3 h-3 mr-1" />
                    Instant
                  </Badge>
                )}
                {product.popularity === 'FEATURED' && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{product.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {product.region} • {product.category.replace(/_/g, ' ')}
              </p>
              
              {product.subProducts && product.subProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{product.subProducts[0].name}</span>
                    <span className="font-semibold">
                      {formatCurrency(product.subProducts[0].price, 'USD')}
                    </span>
                  </div>
                  {product.subProducts.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      +{product.subProducts.length - 1} more options
                    </p>
                  )}
                </div>
              )}

              <Button className="w-full mt-4">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}