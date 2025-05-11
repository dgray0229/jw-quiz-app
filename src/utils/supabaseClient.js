// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://aoeniduyezvpjomlauqg.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZW5pZHV5ZXp2cGpvbWxhdXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDEwNjgsImV4cCI6MjA2MjM3NzA2OH0.J_e9BfoPaOFpus9tw8buFH8G7EM1x2dDFxgzVVScJqI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);