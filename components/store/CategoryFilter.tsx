'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProductCategory } from '@/types/product';

export function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Categories</h3>
      <RadioGroup
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all">All Games</Label>
        </div>
        {Object.values(ProductCategory).map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <RadioGroupItem value={category} id={category} />
            <Label htmlFor={category}>{category.replace(/_/g, ' ')}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}