'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ProductCategory, ProductPopularity, IProduct } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditProductDialogProps {
  product: IProduct | null;
  onClose: () => void;
  onUpdate: (product: IProduct) => void;
}

export function EditProductDialog({ product, onClose, onUpdate }: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [subProducts, setSubProducts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setImagePreview(product.imageUrl);
      setSubProducts(product.subProducts);
    } else {
      setImagePreview('');
      setSubProducts([]);
    }
  }, [product]);

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

  const updateSubProduct = (index: number, field: string, value: any) => {
    const updated = [...subProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSubProducts(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product?._id) return;

    setLoading(true);
    setError('');

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const data = {
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

      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      onUpdate(updatedProduct);
      onClose();

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
      
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
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
                  defaultValue={product.title}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={product.category}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Select name="popularity" defaultValue={product.popularity}>
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
                  defaultValue={product.region}
                />
              </div>

              <div>
                <Label htmlFor="countryCode">Country Code</Label>
                <Input
                  required
                  id="countryCode"
                  name="countryCode"
                  defaultValue={product.countryCode}
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
              defaultValue={product.description}
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
            </div>
          </div>

          <Separator />

          {/* Additional Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="instantDelivery"
                name="instantDelivery"
                defaultChecked={product.instantDelivery}
              />
              <Label htmlFor="instantDelivery">Instant Delivery Available</Label>
            </div>

            <div>
              <Label htmlFor="importantNote">Important Note</Label>
              <Input
                id="importantNote"
                name="importantNote"
                defaultValue={product.importantNote}
              />
            </div>

            <div>
              <Label htmlFor="guide">Usage Guide</Label>
              <Textarea
                id="guide"
                name="guide"
                defaultValue={product.guide}
                className="h-32"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="guideEnabled"
                name="guideEnabled"
                defaultChecked={product.guideEnabled}
              />
              <Label htmlFor="guideEnabled">Show Guide to Customers</Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating Product...' : 'Update Product'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}