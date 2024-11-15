import { Suspense } from 'react';
import ProductList from '@/components/admin/ProductList';
import AddProductButton from '@/components/admin/AddProductButton';
import { Separator } from '@/components/ui/separator';
import { ProductsProvider } from '@/components/admin/ProductsContext';

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your game products and top-up items</p>
        </div>
        <AddProductButton />
      </div>
      <Separator className="my-6" />
      <ProductsProvider>
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductList />
        </Suspense>
      </ProductsProvider>
    </div>
  );
}