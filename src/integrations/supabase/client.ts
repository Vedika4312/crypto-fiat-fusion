// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rgqlhxumplndwpqtwrcq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncWxoeHVtcGxuZHdwcXR3cmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDE1MTQsImV4cCI6MjA1NjcxNzUxNH0.AO08Y8YIli6XrCKZ4h1c7l4O5C4vuJH_8AVbQt5wjZA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);