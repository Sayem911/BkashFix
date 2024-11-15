'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreSettings } from '@/components/reseller/store/StoreSettings';
import { StoreTheme } from '@/components/reseller/store/StoreTheme';
import { StoreDomain } from '@/components/reseller/store/StoreDomain';
import { Loader2 } from 'lucide-react';

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const response = await fetch('/api/reseller/store');
      if (!response.ok) throw new Error('Failed to fetch store');
      const data = await response.json();
      setStore(data);
    } catch (error) {
      console.error('Failed to fetch store:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Store not found. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">
          Customize your store appearance and settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <StoreSettings store={store} onUpdate={fetchStore} />
        </TabsContent>

        <TabsContent value="theme">
          <StoreTheme store={store} onUpdate={fetchStore} />
        </TabsContent>

        <TabsContent value="domain">
          <StoreDomain store={store} onUpdate={fetchStore} />
        </TabsContent>
      </Tabs>
    </div>
  );
}