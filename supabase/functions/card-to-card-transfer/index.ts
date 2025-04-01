
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
    const { card_id, recipient_card_number, amount, description } = await req.json();

    if (!card_id || !recipient_card_number || !amount) {
      throw new Error('Missing required fields: card_id, recipient_card_number, amount');
    }

    // Verify the sender card belongs to the user
    const { data: senderCard, error: senderCardError } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('id', card_id)
      .eq('user_id', user.id)
      .single();

    if (senderCardError || !senderCard) {
      throw new Error('Sender card not found or does not belong to user');
    }

    // Check if sender has sufficient balance
    if (senderCard.balance < amount) {
      throw new Error(`Insufficient balance. Available: ${senderCard.balance} ${senderCard.currency}`);
    }

    // Find recipient card by card number
    const { data: recipientCard, error: recipientCardError } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('card_number', recipient_card_number)
      .single();

    if (recipientCardError || !recipientCard) {
      throw new Error('Recipient card not found');
    }

    // Make sure both cards use the same currency
    if (senderCard.currency !== recipientCard.currency) {
      throw new Error(`Currency mismatch. Sender: ${senderCard.currency}, Recipient: ${recipientCard.currency}`);
    }

    // Start a transaction
    const { data: transactionResult, error: transactionError } = await supabase.rpc(
      'process_card_to_card_transfer',
      {
        p_sender_card_id: card_id,
        p_recipient_card_id: recipientCard.id,
        p_amount: amount,
        p_description: description || 'Card transfer'
      }
    );

    if (transactionError) {
      throw transactionError;
    }

    console.log(`Card-to-card transfer processed`, transactionResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully transferred ${amount} ${senderCard.currency} to recipient card`,
        transaction: transactionResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing card-to-card transfer:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
