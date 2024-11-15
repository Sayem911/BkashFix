'use client';

import { useProducts } from './ProductsContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Star, Zap, Clock } from 'lucide-react';
import Image from 'next/image';
import { ProductPopularity } from '@/types/product';
import { EditProductDialog } from './EditProductDialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProductList() {
  const { products, loading, setProducts } = useProducts();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Update local state
      setProducts(products.filter(p => p._id !== productId));

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const getPopularityIcon = (popularity: ProductPopularity) => {
    switch (popularity) {
      case ProductPopularity.FEATURED:
        return <Star className="h-4 w-4 text-yellow-500" />;
      case ProductPopularity.TRENDING:
        return <Zap className="h-4 w-4 text-blue-500" />;
      case ProductPopularity.NEW:
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-muted" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative w-full h-48">
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
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {product.region} • {product.category.replace(/_/g, ' ')}
                  </CardDescription>
                </div>
                {getPopularityIcon(product.popularity as ProductPopularity)}
              </div>
              
              <div className="mt-4 space-y-2">
                {product.subProducts.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {product.subProducts.length} variants available
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {product.isIDBased ? 'ID-based' : 'Standard'} delivery
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditProductDialog
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdate={(updatedProduct) => {
          setProducts(
            products.map((p) =>
              p._id === updatedProduct._id ? updatedProduct : p
            )
          );
        }}
      />
    </>
  );
}