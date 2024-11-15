'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserList from '@/components/admin/users/UserList';
import ResellerList from '@/components/admin/users/ResellerList';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddUserDialog from '@/components/admin/users/AddUserDialog';

export default function UsersPage() {
  const [addUserOpen, setAddUserOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, resellers, and permissions
          </p>
        </div>
        <Button onClick={() => setAddUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="resellers">Resellers</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UserList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Resellers</CardTitle>
            </CardHeader>
            <CardContent>
              <ResellerList status="active" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reseller Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ResellerList status="pending" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
    </div>
  );
}