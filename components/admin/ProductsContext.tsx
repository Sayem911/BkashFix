'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { IProduct } from '@/lib/models/product.model';

interface ProductsContextType {
  products: IProduct[];
  setProducts: (products: IProduct[]) => void;
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });

    // Set up SSE connection
    const eventSource = new EventSource('/api/sse');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'product_update') {
        setProducts((prev) => {
          const index = prev.findIndex((p) => p._id === data.product._id);
          if (index === -1) return [...prev, data.product];
          const newProducts = [...prev];
          newProducts[index] = data.product;
          return newProducts;
        });
      } else if (data.type === 'product_delete') {
        setProducts((prev) => prev.filter((p) => p._id !== data.productId));
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <ProductsContext.Provider value={{ products, setProducts, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}