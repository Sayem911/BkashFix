import { Zap, Shield, Clock } from 'lucide-react';

const features = [
  {
    name: 'Instant Delivery',
    description: 'Get your gaming products instantly after payment',
    icon: Zap,
  },
  {
    name: 'Secure Transactions',
    description: 'Your purchases are protected with top-tier security',
    icon: Shield,
  },
  {
    name: '24/7 Support',
    description: 'Our gaming support team is always here to help',
    icon: Clock,
  },
];

export function Features() {
  return (
    <div className="py-24 bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-gray-900/70 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}