import { Button } from '@/components/ui/button';
import { Features } from '@/components/home/Features';
import { FeaturedProducts } from '@/components/store/FeaturedProducts';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500 tracking-tight">
              Level Up Your Gaming Experience
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto text-gray-400">
              Your one-stop destination for game cards, top-ups, and digital gaming products
            </p>
            <div className="mt-10">
              <Link href="/products">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
        <FeaturedProducts />
      </div>
    </div>
  );
}