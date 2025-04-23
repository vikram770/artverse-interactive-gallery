
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body with proper error handling
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    const { artworkId } = reqBody;
    
    if (!artworkId) {
      return new Response(
        JSON.stringify({ error: "Missing artwork ID" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    // Initialize Stripe with proper API version
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration error" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Database configuration error" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );

    // Get artwork details with error handling
    const { data: artwork, error: artworkError } = await supabaseClient
      .from('artworks')
      .select('title,price,image_url,artist_id')
      .eq('id', artworkId)
      .single();

    if (artworkError || !artwork) {
      return new Response(
        JSON.stringify({ error: "Artwork not found" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Validate artwork price to ensure it's a valid number
    const price = Number(artwork.price);
    if (isNaN(price) || price <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid artwork price" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (userError || !user) {
          console.error("Auth error:", userError);
          // We don't return an error here, as we support guest checkout
        } else {
          userId = user.id;
        }
      } catch (authError) {
        console.error("Auth verification error:", authError);
        // Continue with guest checkout
      }
    }

    // Secure origin URL for redirects
    const origin = req.headers.get('origin');
    if (!origin) {
      return new Response(
        JSON.stringify({ error: "Missing origin header" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create Stripe session with proper security settings
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: artwork.title,
              images: artwork.image_url ? [artwork.image_url] : [],
              description: `Art purchase from gallery`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/artwork/${artworkId}`,
      client_reference_id: artworkId,
      payment_intent_data: {
        metadata: {
          artwork_id: artworkId,
          user_id: userId || 'guest',
        },
      },
    });

    // Create order record with appropriate validation
    try {
      await supabaseClient.from('orders').insert({
        user_id: userId,
        artwork_id: artworkId,
        artist_id: artwork.artist_id,
        amount: Math.round(price * 100),
        stripe_session_id: session.id,
        status: 'pending',
        payment_method: 'card',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (orderError) {
      console.error("Failed to create order record:", orderError);
      // We proceed even if the order creation fails, as the payment can still be processed
      // The success page will handle reconciliation
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Payment processing failed" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
