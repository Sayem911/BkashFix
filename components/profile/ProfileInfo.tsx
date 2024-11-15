'use client';

import { useState } from 'react';
import { User } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';

interface ProfileInfoProps {
  user: User & {
    id?: string;
    role?: string;
    status?: string;
  };
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      // Handle success (e.g., show toast)
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error (e.g., show toast)
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback className="text-lg">
              {user.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Change Picture
          </Button>
        </div>

        {/* Account Type Badge */}
        <div className="flex items-center gap-2">
          <div className="text-sm px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} Account
          </div>
          <div className={`text-sm px-2.5 py-0.5 rounded-full ${
            user.status === 'active' 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
          }`}>
            {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </form>
  );
}