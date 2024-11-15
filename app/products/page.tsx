'use client';

import { useState } from 'react';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductFilters } from '@/components/store/ProductFilters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPopularity, setSelectedPopularity] = useState<string[]>([]);
  const [instantDeliveryOnly, setInstantDeliveryOnly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground mt-2">Browse our collection of game cards and top-ups</p>
        </div>

        {/* Mobile Filter Button & Search */}
        <div className="lg:hidden flex gap-4 mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ProductFilters
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedPopularity={selectedPopularity}
                  onPopularityChange={setSelectedPopularity}
                  instantDeliveryOnly={instantDeliveryOnly}
                  onInstantDeliveryChange={setInstantDeliveryOnly}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-20 p-6">
              <ProductFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedPopularity={selectedPopularity}
                onPopularityChange={setSelectedPopularity}
                instantDeliveryOnly={instantDeliveryOnly}
                onInstantDeliveryChange={setInstantDeliveryOnly}
              />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search Bar */}
            <Card>
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </Card>

            {/* Product Grid */}
            <ProductGrid 
              search={search}
              selectedCategory={selectedCategory}
              selectedPopularity={selectedPopularity}
              instantDeliveryOnly={instantDeliveryOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}