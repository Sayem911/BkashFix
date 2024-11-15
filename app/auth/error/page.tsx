import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-purple-900/20 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-red-500">Authentication Error</CardTitle>
          <CardDescription className="text-gray-400">
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">
            This could be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Invalid credentials</li>
              <li>Account not found</li>
              <li>Account suspended</li>
              <li>Authentication service unavailable</li>
            </ul>
          </p>
          <div className="flex space-x-4">
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}