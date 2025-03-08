
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const { sender_id, recipient_id, amount, currency, is_crypto, description } = await req.json()
    
    // Check for required fields
    if (!sender_id || !recipient_id || !amount || !currency) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. Check if recipient exists
    const { data: recipientExists, error: recipientError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipient_id)
      .single()
    
    if (recipientError || !recipientExists) {
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }
    
    // 2. Check if sender has sufficient balance
    const { data: senderBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', sender_id)
      .eq('currency', currency)
      .single()
    
    if (balanceError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sender balance' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }
    
    if (!senderBalance || Number(senderBalance.balance) < amount) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient balance. You need ${amount} ${currency} but only have ${senderBalance?.balance || 0}` 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }
    
    // Begin transaction operations
    // 1. Deduct from sender balance
    const { error: senderUpdateError } = await supabase
      .from('user_balances')
      .update({ 
        balance: Number(senderBalance.balance) - amount,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', sender_id)
      .eq('currency', currency)
    
    if (senderUpdateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update sender balance' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }
    
    // 2. Add to recipient balance
    // First check if recipient has a balance in this currency
    const { data: recipientBalance, error: recipientBalanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', recipient_id)
      .eq('currency', currency)
      .maybeSingle()
    
    if (recipientBalanceError) {
      // If we failed to get recipient balance but already deducted from sender,
      // we should revert the sender update
      await supabase
        .from('user_balances')
        .update({ 
          balance: Number(senderBalance.balance),
          last_updated: new Date().toISOString()
        })
        .eq('user_id', sender_id)
        .eq('currency', currency)
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recipient balance' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }
    
    let recipientUpdateError = null
    
    if (recipientBalance) {
      // Update existing balance
      const { error } = await supabase
        .from('user_balances')
        .update({ 
          balance: Number(recipientBalance.balance) + amount,
          last_updated: new Date().toISOString()
        })
        .eq('id', recipientBalance.id)
      
      recipientUpdateError = error
    } else {
      // Create new balance record
      const { error } = await supabase
        .from('user_balances')
        .insert({
          user_id: recipient_id,
          currency: currency,
          balance: amount,
          last_updated: new Date().toISOString()
        })
      
      recipientUpdateError = error
    }
    
    if (recipientUpdateError) {
      // If recipient update failed, revert sender update
      await supabase
        .from('user_balances')
        .update({ 
          balance: Number(senderBalance.balance),
          last_updated: new Date().toISOString()
        })
        .eq('user_id', sender_id)
        .eq('currency', currency)
      
      return new Response(
        JSON.stringify({ error: 'Failed to update recipient balance' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }
    
    // 3. Create transaction records for both sender and recipient
    // Sender transaction (send)
    const { data: senderTransaction, error: senderTransactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'send',
        status: 'completed',
        amount: amount,
        currency: currency,
        is_crypto: is_crypto || false,
        recipient_id: recipient_id,
        sender_id: sender_id,
        user_id: sender_id,
        description: description || 'Payment sent'
      })
      .select()
      .single()
    
    if (senderTransactionError) {
      console.error('Failed to create sender transaction, but balances were updated:', senderTransactionError)
    }
    
    // Recipient transaction (receive)
    const { data: recipientTransaction, error: recipientTransactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'receive',
        status: 'completed',
        amount: amount,
        currency: currency,
        is_crypto: is_crypto || false,
        recipient_id: recipient_id,
        sender_id: sender_id,
        user_id: recipient_id,
        description: description || 'Payment received'
      })
      .select()
      .single()
    
    if (recipientTransactionError) {
      console.error('Failed to create recipient transaction, but balances were updated:', recipientTransactionError)
    }
    
    // Return the transaction data
    return new Response(
      JSON.stringify({ 
        data: senderTransaction,
        message: 'Transaction completed successfully' 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error processing transaction:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})
