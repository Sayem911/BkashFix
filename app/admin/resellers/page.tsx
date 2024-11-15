'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResellerList } from '@/components/admin/resellers/ResellerList';
import { ResellerStats } from '@/components/admin/resellers/ResellerStats';

export default function ResellersPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reseller Management</h1>
          <p className="text-muted-foreground">
            Manage resellers, review applications, and monitor performance
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <ResellerStats />

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="active">Active Resellers</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <ResellerList status="pending" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Resellers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResellerList status="active" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suspended">
            <Card>
              <CardHeader>
                <CardTitle>Suspended Resellers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResellerList status="suspended" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}