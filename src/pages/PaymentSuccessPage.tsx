
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing payment confirmation details");
      setLoading(false);
      return;
    }

    const updateOrderStatus = async () => {
      try {
        // First verify the session is valid and belongs to this user
        if (currentUser) {
          // Only verify ownership if a user is logged in
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .eq('user_id', currentUser.id)
            .single();

          if (orderError || !orderData) {
            // If session doesn't belong to user or doesn't exist
            console.error('Order verification error:', orderError);
            setError("Unable to verify payment. Please contact support.");
            setLoading(false);
            return;
          }
        }

        // If verification passed or guest checkout, update the order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', sessionId);

        if (updateError) throw updateError;
        
      } catch (error) {
        console.error('Error updating order:', error);
        setError("Failed to update order status");
        toast.error('Payment verification failed');
      } finally {
        setLoading(false);
      }
    };

    updateOrderStatus();
  }, [sessionId, navigate, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-8" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Payment Verification Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => navigate('/')}>
              Return to Gallery
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/')}>
              Return to Gallery
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              View Your Orders
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
