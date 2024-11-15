'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Globe, ExternalLink } from 'lucide-react';

interface StoreDomainProps {
  store: any;
  onUpdate: () => void;
}

export function StoreDomain({ store, onUpdate }: StoreDomainProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      domain: formData.get('domain'),
      subdomain: formData.get('subdomain'),
    };

    try {
      const response = await fetch('/api/reseller/store/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update domain');
      }

      toast({
        title: 'Success',
        description: 'Domain settings updated successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Failed to update domain:', error);
      setError(error instanceof Error ? error.message : 'Failed to update domain');
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
          <CardTitle>Domain Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Store Subdomain</Label>
              <div className="flex gap-2">
                <Input
                  id="subdomain"
                  name="subdomain"
                  defaultValue={store.subdomain}
                  required
                  className="flex-1"
                />
                <span className="flex items-center text-muted-foreground">
                  .yourdomain.com
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your store will be accessible at this subdomain
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  name="domain"
                  defaultValue={store.domain || ''}
                  placeholder="store.example.com"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Point your custom domain to our servers for a branded experience
              </p>
            </div>
          </div>

          {store.domain && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">DNS Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">CNAME Record</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md font-mono text-sm">
                    reseller-stores.yourdomain.com
                  </div>
                </div>
                
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Add these DNS records to your domain provider to connect your custom domain.
                  </AlertDescription>
                </Alert>

                {store.domain && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`https://${store.domain}`, '_blank')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Your Store
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Domain Settings
        </Button>
      </div>
    </form>
  );
}