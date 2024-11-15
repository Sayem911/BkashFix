import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function ResellerSignInError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-yellow-500">
            <Clock className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Pending Approval</CardTitle>
          </div>
          <CardDescription>
            Your reseller application is currently under review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Our admin team is reviewing your application. This process usually takes 24-48 hours.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-medium">What happens next?</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                  1
                </div>
                <span>Our admin team reviews your business details and credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                  2
                </div>
                <span>You&apos;ll receive an email notification once your application is approved</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                  3
                </div>
                <span>You can then sign in and start setting up your reseller store</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/reseller/signin">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Need help? Contact our{' '}
            <Link href="/support" className="text-primary hover:underline">
              support team
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}