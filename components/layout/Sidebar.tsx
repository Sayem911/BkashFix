'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import {
  Home,
  Package,
  CreditCard,
  Zap,
  ShoppingCart,
  User,
  Box,
  LogOut,
  HeadphonesIcon,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useCart } from '@/hooks/use-cart';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'All Products', icon: Package },
  { href: '/cards', label: 'Game Cards', icon: CreditCard },
  { href: '/top-ups', label: 'Top Ups', icon: Zap },
];

const accountNavItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/orders', label: 'Orders', icon: Box },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { itemCount } = useCart();

  // Don't show the sidebar in admin or reseller routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/reseller')) {
    return null;
  }

  return (
    <div className="w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            VertexBazar
          </Link>
        </div>

        <div className="flex-1 px-4 space-y-4">
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-2',
                    pathname === item.href && 'bg-primary/10 text-primary'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Link href="/cart">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2',
                  pathname === '/cart' && 'bg-primary/10 text-primary'
                )}
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                Cart
              </Button>
            </Link>
          </nav>

          {session ? (
            <div className="pt-4">
              <div className="px-2 py-2 text-xs font-semibold text-muted-foreground">
                Account
              </div>
              <nav className="space-y-1">
                {accountNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-2',
                        pathname === item.href && 'bg-primary/10 text-primary'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          ) : (
            <div className="pt-4 space-y-2">
              <div className="px-2 py-2 text-xs font-semibold text-muted-foreground">
                Account
              </div>
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
              <HeadphonesIcon className="h-4 w-4" />
              Need Help?
            </div>
            <Button variant="link" className="text-primary p-0 h-auto text-sm font-normal">
              Gaming Support 24/7
            </Button>
          </div>

          {session && (
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}