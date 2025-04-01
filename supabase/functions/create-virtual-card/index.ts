
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      throw new Error('Invalid user token');
    }

    const user = userData.user;

    // Parse request body
    const { name, currency } = await req.json();

    if (!name || !currency) {
      throw new Error('Missing required fields: name, currency');
    }

    // Generate card details
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();

    // Insert the virtual card record
    const { data: cardData, error: cardError } = await supabase
      .from('virtual_cards')
      .insert({
        user_id: user.id,
        name,
        card_number: cardNumber,
        cvv,
        expiry_date: expiryDate,
        balance: 0,
        currency,
        active: true
      })
      .select()
      .single();

    if (cardError) {
      throw cardError;
    }

    console.log(`Virtual card created for user ${user.id}`, cardData);

    return new Response(
      JSON.stringify({
        card: {
          id: cardData.id,
          name: cardData.name,
          card_number: cardData.card_number,
          expiry_date: cardData.expiry_date,
          currency: cardData.currency,
          balance: cardData.balance,
          active: cardData.active,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating virtual card:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper function to generate a random card number
function generateCardNumber(): string {
  const prefix = "4111"; // Using a known test prefix
  let cardNumber = prefix;
  
  // Generate 12 more digits
  for (let i = 0; i < 12; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }
  
  return cardNumber;
}

// Helper function to generate a 3-digit CVV
function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

// Helper function to generate an expiry date 3 years from now
function generateExpiryDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  return date.toISOString();
}
