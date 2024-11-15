'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IProduct, ProductPopularity } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function FeaturedProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        '/api/products?popularity=' + ProductPopularity.FEATURED
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      setError('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-purple-900/20 bg-gray-900/50 backdrop-blur-sm animate-pulse">
            <div className="h-48 bg-gray-800" />
            <div className="p-4 space-y-4">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
              <div className="h-10 bg-gray-800 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchFeaturedProducts}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No featured products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link key={product._id} href={`/product/${product._id}`}>
          <Card className="overflow-hidden border-purple-900/20 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-all hover:scale-105">
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
                <Badge className="bg-purple-500">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-white">{product.title}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {product.region} • {product.category.replace(/_/g, ' ')}
              </p>
              
              {product.subProducts && product.subProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{product.subProducts[0].name}</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(product.subProducts[0].price, 'USD')}
                    </span>
                  </div>
                  {product.subProducts.length > 1 && (
                    <p className="text-xs text-gray-500">
                      +{product.subProducts.length - 1} more options
                    </p>
                  )}
                </div>
              )}

              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}