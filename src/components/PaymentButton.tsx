
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  CreditCard, 
  Globe, 
  Smartphone,
  Bank,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaymentButtonProps {
  artworkId: string;
  price: number;
}

const PaymentButton = ({ artworkId, price }: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { artworkId }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
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
          <Bank className="w-4 h-4 mr-1" />
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
                Buy Now - ${price}
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuItem className="flex items-center" onClick={handlePayment}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Credit Card</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Visa Card</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment}>
            <Smartphone className="mr-2 h-4 w-4" />
            <span>Google Pay</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment}>
            <Bank className="mr-2 h-4 w-4" />
            <span>Net Banking</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center" onClick={handlePayment}>
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
