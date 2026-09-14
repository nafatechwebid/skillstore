/* ================================================================
   KONFIGURASI SUPABASE
   ================================================================
   Ambil 2 nilai ini dari: Supabase Dashboard > Project Settings > API
   - Project URL       -> isi SUPABASE_URL
   - anon public key   -> isi SUPABASE_ANON_KEY
   (anon key ini AMAN ditaruh di file publik — akses tulis tetap
   dibatasi oleh Row Level Security yang diatur di schema.sql)
   ================================================================ */

const SUPABASE_URL = 'https://sdsxrlgkdmzyltbwkoif.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc3hybGdrZG16eWx0Yndrb2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODE3NzIsImV4cCI6MjEwNDk1Nzc3Mn0.T7eWW0YnbExFAKUHl2EuUP78p-FEIkCExlSCyftr9ds';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
