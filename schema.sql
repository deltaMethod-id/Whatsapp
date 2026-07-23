-- Buat tabel messages di Supabase (public schema)
create table if not exists public.messages (
  id bigserial primary key,
  username text not null,
  content text not null,
  created_at timestamptz default now()
);

-- (Pilihan) Jika Anda ingin semua orang bisa membaca/menulis tanpa autentikasi untuk demo:
-- Di Supabase dashboard -> Table Editor -> Policies, disable Row Level Security (RLS)
-- atau buat policy "Allow public select/insert" jika RLS diaktifkan.
