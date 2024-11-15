'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Upload, DollarSign } from 'lucide-react';
import { ProductCategory, ProductPopularity } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SubProduct {
  name: string;
  price: number;
  originalPrice: number;
  stockQuantity?: number;
  inStock: boolean;
}

export default function AddProductButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSubProduct = () => {
    setSubProducts([
      ...subProducts,
      {
        name: '',
        price: 0,
        originalPrice: 0,
        stockQuantity: undefined,
        inStock: true,
      },
    ]);
  };

  const removeSubProduct = (index: number) => {
    setSubProducts(subProducts.filter((_, i) => i !== index));
  };

  const updateSubProduct = (index: number, field: keyof SubProduct, value: any) => {
    const updated = [...subProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSubProducts(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (subProducts.length === 0) {
      setError('At least one sub-product is required');
      setLoading(false);
      return;
    }

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const productData = {
        title: formData.get('title'),
        description: formData.get('description'),
        guide: formData.get('guide'),
        guideEnabled: formData.get('guideEnabled') === 'on',
        imageUrl: imagePreview,
        region: formData.get('region'),
        instantDelivery: formData.get('instantDelivery') === 'on',
        importantNote: formData.get('importantNote'),
        category: formData.get('category'),
        popularity: formData.get('popularity') || ProductPopularity.REGULAR,
        countryCode: formData.get('countryCode'),
        displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
        subProducts: subProducts,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create product');
      }

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      setOpen(false);
      resetForm();
      
      // Refresh the page to show the new product
      window.location.reload();
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to create product');
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubProducts([]);
    setImagePreview('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Gaming Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  required
                  id="title"
                  name="title"
                  placeholder="e.g., Mobile Legends Diamonds"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProductCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="popularity">Popularity Status</Label>
                <Select name="popularity" defaultValue={ProductPopularity.REGULAR}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProductPopularity).map((status) => (
                      <SelectItem key={status} value={status}>
                        <Badge
                          variant="outline"
                          className={cn(
                            status === ProductPopularity.FEATURED &&
                              'bg-yellow-500/10 text-yellow-500',
                            status === ProductPopularity.TRENDING &&
                              'bg-blue-500/10 text-blue-500',
                            status === ProductPopularity.NEW &&
                              'bg-green-500/10 text-green-500'
                          )}
                        >
                          {status}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  required
                  id="region"
                  name="region"
                  placeholder="e.g., Global, SEA, NA"
                />
              </div>

              <div>
                <Label htmlFor="countryCode">Country Code</Label>
                <Input
                  required
                  id="countryCode"
                  name="countryCode"
                  placeholder="e.g., US, SG, MY"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Product Image</Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-muted-foreground/25 px-6 py-10">
                <div className="text-center">
                  {imagePreview ? (
                    <div className="relative w-40 h-40 mx-auto">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => setImagePreview('')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="flex flex-col text-sm">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              required
              id="description"
              name="description"
              placeholder="Detailed description of the product..."
              className="h-32"
            />
          </div>

          {/* Sub-Products */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Product Variants</Label>
              <Button type="button" onClick={addSubProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {subProducts.map((subProduct, index) => (
                <div
                  key={index}
                  className="relative p-4 border rounded-lg bg-card"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Variant Name</Label>
                      <Input
                        placeholder="e.g., 100 Diamonds"
                        value={subProduct.name}
                        onChange={(e) =>
                          updateSubProduct(index, 'name', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Stock Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Leave empty for unlimited"
                        value={subProduct.stockQuantity || ''}
                        onChange={(e) =>
                          updateSubProduct(
                            index,
                            'stockQuantity',
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Selling Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={subProduct.price}
                          onChange={(e) =>
                            updateSubProduct(index, 'price', parseFloat(e.target.value))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Cost Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={subProduct.originalPrice}
                          onChange={(e) =>
                            updateSubProduct(
                              index,
                              'originalPrice',
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={subProduct.inStock}
                        onCheckedChange={(checked) =>
                          updateSubProduct(index, 'inStock', checked)
                        }
                      />
                      <Label>In Stock</Label>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSubProduct(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {subProducts.length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">No variants added yet</p>
                  <Button type="button" variant="outline" onClick={addSubProduct} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Variant
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Additional Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="instantDelivery" name="instantDelivery" />
              <Label htmlFor="instantDelivery">Instant Delivery Available</Label>
            </div>

            <div>
              <Label htmlFor="importantNote">Important Note</Label>
              <Input
                id="importantNote"
                name="importantNote"
                placeholder="Any important information for customers"
              />
            </div>

            <div>
              <Label htmlFor="guide">Usage Guide</Label>
              <Textarea
                id="guide"
                name="guide"
                placeholder="How to use or redeem the product..."
                className="h-32"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="guideEnabled" name="guideEnabled" />
              <Label htmlFor="guideEnabled">Show Guide to Customers</Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Product...' : 'Create Product'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}