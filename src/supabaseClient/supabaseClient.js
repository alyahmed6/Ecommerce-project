
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xbbeydubojwddfbolmxj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYmV5ZHVib2p3ZGRmYm9sbXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDExNjksImV4cCI6MjA3Njg3NzE2OX0.wsX2AwyrHiroWZbB8YDk8ExmfJoty2KOcfKSgsMHxEk";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)