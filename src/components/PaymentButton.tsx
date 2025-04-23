
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  CreditCard, 
  Globe, 
  Smartphone,
  Ban,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store";

interface PaymentButtonProps {
  artworkId: string;
  price: number;
}

const PaymentButton = ({ artworkId, price }: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuthStore();

  const handlePayment = async () => {
    if (!artworkId) {
      toast.error('Missing artwork information');
      return;
    }
    
    try {
      setLoading(true);
      
      // Add a validation check for the price
      if (isNaN(Number(price)) || Number(price) <= 0) {
        throw new Error('Invalid price for this artwork');
      }
      
      // Add a timeout to prevent infinite loading if there's a network issue
      const timeoutId = setTimeout(() => {
        setLoading(false);
        toast.error('Payment request timed out. Please try again.');
      }, 15000);
      
      // Include auth token if user is logged in
      const options = currentUser ? {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      } : undefined;
      
      // Call the payment function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { artworkId },
        ...options
      });

      clearTimeout(timeoutId);

      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe checkout 
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from payment service');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <CreditCard className="w-4 h-4 mr-1" />
          <span>Card Payment</span>
        </div>
        <div className="flex items-center">
          <Smartphone className="w-4 h-4 mr-1" />
          <span>Google Pay</span>
        </div>
        <div className="flex items-center">
          <Ban className="w-4 h-4 mr-1" />
          <span>Net Banking</span>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Buy Now - ${typeof price === 'number' ? price.toFixed(2) : price}
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuItem className="flex items-center" onClick={handlePayment} disabled={loading}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Credit Card</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment} disabled={loading}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Visa Card</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment} disabled={loading}>
            <Smartphone className="mr-2 h-4 w-4" />
            <span>Google Pay</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment} disabled={loading}>
            <Ban className="mr-2 h-4 w-4" />
            <span>Net Banking</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment} disabled={loading}>
            <Globe className="mr-2 h-4 w-4" />
            <span>Bank Transfer</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <p className="text-xs text-center text-gray-500">
        Secure checkout powered by Stripe
      </p>
    </div>
  );
};

export default PaymentButton;
