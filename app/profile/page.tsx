'use client';

import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { WalletOverview } from '@/components/profile/WalletOverview';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { Loader2, LayoutDashboard } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>
        {/* Dashboard Button for Admin/Reseller */}
        {session.user.role === 'admin' && (
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </Button>
        )}
        {session.user.role === 'reseller' && (
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/reseller">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Reseller Dashboard
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-900/50 border-purple-900/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-purple-900/20 bg-gray-900/50 backdrop-blur-sm">
            <ProfileInfo user={session.user} />
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-purple-900/20 bg-gray-900/50 backdrop-blur-sm">
            <OrderHistory />
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card className="border-purple-900/20 bg-gray-900/50 backdrop-blur-sm">
            <WalletOverview />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-purple-900/20 bg-gray-900/50 backdrop-blur-sm">
            <SecuritySettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}