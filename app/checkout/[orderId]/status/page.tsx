import { PaymentStatus } from '@/components/checkout/PaymentStatus';

export default function CheckoutStatusPage({ 
  params 
}: { 
  params: { orderId: string } 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <PaymentStatus orderId={params.orderId} />
      </div>
    </div>
  );
}