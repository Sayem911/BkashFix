'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Shield, Smartphone, Key, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SecuritySettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [setupPasswordData, setSetupPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const isGoogleUser = !session?.user?.password;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (setupPasswordData.password !== setupPasswordData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: setupPasswordData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set up password');
      }

      setSetupPasswordData({
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set up password');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      setTwoFactorEnabled(!twoFactorEnabled);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and authentication methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Google Account Password Setup */}
        {isGoogleUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Set Up Password</h3>
            </div>
            <Alert>
              <AlertDescription>
                You're signed in with Google. Setting up a password will allow you to sign in with either method.
              </AlertDescription>
            </Alert>
            <form onSubmit={handlePasswordSetup} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={setupPasswordData.password}
                    onChange={(e) => setSetupPasswordData({
                      ...setupPasswordData,
                      password: e.target.value
                    })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={setupPasswordData.confirmPassword}
                    onChange={(e) => setSetupPasswordData({
                      ...setupPasswordData,
                      confirmPassword: e.target.value
                    })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set Up Password
              </Button>
            </form>
          </div>
        )}

        {/* Password Change Section (for non-Google users or Google users with password set up) */}
        {!isGoogleUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </div>
        )}

        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-purple-900/20 p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Authenticator App</span>
              </div>
              <p className="text-sm text-gray-400">
                Secure your account with an authenticator app
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
        </div>

        {/* Active Sessions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Active Sessions</h3>
          </div>
          <div className="rounded-lg border border-purple-900/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-gray-400">
                  Last active: Just now
                </p>
              </div>
              <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                End Session
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}