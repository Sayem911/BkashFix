'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ProductCategory, ProductPopularity } from '@/types/product';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPopularity: string[];
  onPopularityChange: (popularity: string[]) => void;
  instantDeliveryOnly: boolean;
  onInstantDeliveryChange: (value: boolean) => void;
}

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  selectedPopularity,
  onPopularityChange,
  instantDeliveryOnly,
  onInstantDeliveryChange,
}: ProductFiltersProps) {
  const handleReset = () => {
    onCategoryChange('all');
    onPopularityChange([]);
    onInstantDeliveryChange(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={handleReset}
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Reset
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={selectedCategory}
              onValueChange={onCategoryChange}
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="popularity">
          <AccordionTrigger>Popularity</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.values(ProductPopularity).map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={status}
                    checked={selectedPopularity.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onPopularityChange([...selectedPopularity, status]);
                      } else {
                        onPopularityChange(selectedPopularity.filter(p => p !== status));
                      }
                    }}
                  />
                  <Label htmlFor={status}>
                    <Badge variant="outline" className="ml-2">
                      {status}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center space-x-2">
        <Switch
          id="instant-delivery"
          checked={instantDeliveryOnly}
          onCheckedChange={onInstantDeliveryChange}
        />
        <Label htmlFor="instant-delivery">Instant Delivery Only</Label>
      </div>
    </div>
  );
}