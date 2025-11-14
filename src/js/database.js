import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvhvvfsdztamglnkhbsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aHZ2ZnNkenRhbWdsbmtoYnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzk5MjYsImV4cCI6MjA2NjkxNTkyNn0.4SyQx5sHLymx-_r_KEqqH4S5-xxxBlXtU-YS9hsolnk';

export const supabase = createClient(supabaseUrl, supabaseKey);
