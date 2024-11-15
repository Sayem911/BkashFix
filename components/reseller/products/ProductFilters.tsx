'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProductCategory, ProductPopularity } from '@/types/product';

export function ProductFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPopularity, setSelectedPopularity] = useState<string[]>([]);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="categories">
        <AccordionTrigger>Categories</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {Object.values(ProductCategory).map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    setSelectedCategories(
                      checked
                        ? [...selectedCategories, category]
                        : selectedCategories.filter((c) => c !== category)
                    );
                  }}
                />
                <Label htmlFor={category}>
                  {category.replace(/_/g, ' ')}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="popularity">
        <AccordionTrigger>Popularity</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {Object.values(ProductPopularity).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={status}
                  checked={selectedPopularity.includes(status)}
                  onCheckedChange={(checked) => {
                    setSelectedPopularity(
                      checked
                        ? [...selectedPopularity, status]
                        : selectedPopularity.filter((s) => s !== status)
                    );
                  }}
                />
                <Label htmlFor={status}>{status}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}