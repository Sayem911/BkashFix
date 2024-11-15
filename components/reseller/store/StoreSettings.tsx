'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface StoreSettingsProps {
  store: any;
  onUpdate: () => void;
}

export function StoreSettings({ store, onUpdate }: StoreSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      settings: {
        autoFulfillment: formData.get('autoFulfillment') === 'on',
        lowBalanceAlert: parseFloat(formData.get('lowBalanceAlert') as string),
        defaultMarkup: parseFloat(formData.get('defaultMarkup') as string),
        minimumMarkup: parseFloat(formData.get('minimumMarkup') as string),
        maximumMarkup: parseFloat(formData.get('maximumMarkup') as string),
      }
    };

    try {
      const response = await fetch('/api/reseller/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update store');
      }

      toast({
        title: 'Success',
        description: 'Store settings updated successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Failed to update store:', error);
      setError(error instanceof Error ? error.message : 'Failed to update store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={store.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Store Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={store.description}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input
                id="defaultMarkup"
                name="defaultMarkup"
                type="number"
                min="0"
                step="0.1"
                defaultValue={store.settings.defaultMarkup}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumMarkup">Minimum Markup (%)</Label>
              <Input
                id="minimumMarkup"
                name="minimumMarkup"
                type="number"
                min="0"
                step="0.1"
                defaultValue={store.settings.minimumMarkup}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumMarkup">Maximum Markup (%)</Label>
              <Input
                id="maximumMarkup"
                name="maximumMarkup"
                type="number"
                min="0"
                step="0.1"
                defaultValue={store.settings.maximumMarkup}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Order Fulfillment</Label>
              <p className="text-sm text-muted-foreground">
                Automatically fulfill orders when payment is received
              </p>
            </div>
            <Switch
              name="autoFulfillment"
              defaultChecked={store.settings.autoFulfillment}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowBalanceAlert">Low Balance Alert ($)</Label>
            <Input
              id="lowBalanceAlert"
              name="lowBalanceAlert"
              type="number"
              min="0"
              step="0.01"
              defaultValue={store.settings.lowBalanceAlert}
              required
            />
            <p className="text-sm text-muted-foreground">
              Get notified when your balance falls below this amount
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}