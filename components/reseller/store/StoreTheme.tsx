'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface StoreThemeProps {
  store: any;
  onUpdate: () => void;
}

export function StoreTheme({ store, onUpdate }: StoreThemeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      theme: {
        primaryColor: formData.get('primaryColor'),
        accentColor: formData.get('accentColor'),
        backgroundColor: formData.get('backgroundColor'),
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
        throw new Error(result.error || 'Failed to update theme');
      }

      toast({
        title: 'Success',
        description: 'Store theme updated successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Failed to update theme:', error);
      setError(error instanceof Error ? error.message : 'Failed to update theme');
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
          <CardTitle>Theme Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  defaultValue={store.theme.primaryColor}
                  className="w-12 p-1 h-10"
                />
                <Input
                  type="text"
                  value={store.theme.primaryColor}
                  readOnly
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  name="accentColor"
                  type="color"
                  defaultValue={store.theme.accentColor}
                  className="w-12 p-1 h-10"
                />
                <Input
                  type="text"
                  value={store.theme.accentColor}
                  readOnly
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  name="backgroundColor"
                  type="color"
                  defaultValue={store.theme.backgroundColor}
                  className="w-12 p-1 h-10"
                />
                <Input
                  type="text"
                  value={store.theme.backgroundColor}
                  readOnly
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Theme
        </Button>
      </div>
    </form>
  );
}