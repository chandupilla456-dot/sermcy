import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ohipxbzlgspshoywnxyu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaXB4YnpsZ3Nwc2hveXdueHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTYzNTgsImV4cCI6MjA5MDI5MjM1OH0.OMGdHcfhiQMJK3mOfzjPGgolMch6pUw5Irmx7oHdXGI",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
