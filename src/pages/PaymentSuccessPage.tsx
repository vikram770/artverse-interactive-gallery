
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const updateOrderStatus = async () => {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('stripe_session_id', sessionId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating order:', error);
        toast.error('Failed to update order status');
      } finally {
        setLoading(false);
      }
    };

    updateOrderStatus();
  }, [sessionId, navigate]);

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
