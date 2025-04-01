
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
    const { card_id, amount, currency, direction } = await req.json();

    if (!card_id || !amount || !currency) {
      throw new Error('Missing required fields: card_id, amount, currency');
    }

    // Validate the direction
    if (direction !== 'account_to_card' && direction !== 'card_to_account') {
      throw new Error('Invalid direction. Must be "account_to_card" or "card_to_account"');
    }

    // Verify the card belongs to the user
    const { data: cardData, error: cardError } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('id', card_id)
      .eq('user_id', user.id)
      .single();

    if (cardError || !cardData) {
      throw new Error('Card not found or does not belong to user');
    }

    // Make sure the card currency matches
    if (cardData.currency !== currency) {
      throw new Error(`Card currency (${cardData.currency}) doesn't match requested currency (${currency})`);
    }

    // Start a transaction
    const { data: transactionResult, error: transactionError } = await supabase.rpc(
      'process_card_funding',
      {
        p_user_id: user.id,
        p_card_id: card_id,
        p_amount: amount,
        p_currency: currency,
        p_direction: direction
      }
    );

    if (transactionError) {
      throw transactionError;
    }

    console.log(`Virtual card funding processed for user ${user.id}`, transactionResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: direction === 'account_to_card' 
          ? `Successfully added ${amount} ${currency} to card` 
          : `Successfully transferred ${amount} ${currency} to account`,
        transaction: transactionResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing card funding:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
