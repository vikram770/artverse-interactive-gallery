// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uvbfgvrgvgputsranakq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2YmZndnJndmdwdXRzcmFuYWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDk4NTQsImV4cCI6MjA2MDAyNTg1NH0.Xx_vZ0YuzGoqMwSAGqtYMF15aaBqmrxuRsKUDetKu2w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);