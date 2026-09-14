/* ================================================================
   KONFIGURASI SUPABASE
   ================================================================
   Ambil 2 nilai ini dari: Supabase Dashboard > Project Settings > API
   - Project URL       -> isi SUPABASE_URL
   - anon public key   -> isi SUPABASE_ANON_KEY
   (anon key ini AMAN ditaruh di file publik — akses tulis tetap
   dibatasi oleh Row Level Security yang diatur di schema.sql)
   ================================================================ */

const SUPABASE_URL = 'GANTI_DENGAN_PROJECT_URL_ANDA';
const SUPABASE_ANON_KEY = 'GANTI_DENGAN_ANON_KEY_ANDA';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
