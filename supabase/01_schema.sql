-- ============================================================
--  Sıralama — veritabanı şeması
--  Supabase panelinde: SQL Editor → yeni sorgu → bunu yapıştır → Run
--  Tek seferlik çalıştırılır. Tekrar çalıştırmak güvenlidir.
-- ============================================================

-- ---------- profiller ----------
-- auth.users Supabase'in kendi tablosu. Kullanıcıya ait herkese açık
-- bilgiler (kullanıcı adı, görünen ad) burada durur.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Yeni kullanıcı kaydolunca profili otomatik açılsın.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  -- e-postanın @ öncesini kullanıcı adı tabanı yap, sadece harf/rakam/alt çizgi
  base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if base = '' then base := 'kullanici'; end if;
  candidate := base;

  -- aynı isim varsa sonuna sayı ekle
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, new.raw_user_meta_data ->> 'full_name');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- mekanlar ----------
-- Herkesin paylaştığı tek mekan havuzu. Kullanıcı da ekleyebilir.
create table if not exists public.places (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  district   text,
  city       text not null default 'İstanbul',
  category   text not null default 'kahve',   -- ileride: restoran, bar, tatlı...
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists places_category_city_idx on public.places (category, city);
-- Aynı isim + semt iki kez eklenmesin
create unique index if not exists places_unique_idx
  on public.places (lower(name), lower(coalesce(district, '')), city);

-- ---------- kayıtlar (gidilen mekanlar) ----------
-- position: kullanıcının o kovasındaki sıra (0 = kovanın en iyisi)
create table if not exists public.entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  place_id   uuid not null references public.places(id) on delete cascade,
  bucket     text not null check (bucket in ('iyi', 'orta', 'kotu')),
  position   int  not null,
  note       text,
  photo_path text,
  visited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create index if not exists entries_user_order_idx
  on public.entries (user_id, bucket, position);

-- ---------- gidilecekler ----------
create table if not exists public.wishlist (
  user_id    uuid not null references auth.users(id) on delete cascade,
  place_id   uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- ---------- takip (sosyal katman, v0.2'de kullanılacak) ----------
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

-- ============================================================
--  Sıraya yerleştirme
--  Yeni kayıt kovanın p_position'ına giriyor; altındaki herkes
--  bir basamak aşağı kayıyor. Tek işlemde olması şart, yoksa
--  iki cihazdan aynı anda eklerken sıra bozulur.
-- ============================================================
create or replace function public.place_entry(
  p_place_id uuid,
  p_bucket   text,
  p_position int,
  p_note     text default null
)
returns public.entries
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.entries;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Giriş yapılmamış';
  end if;

  -- yeni kaydın altında kalanları bir aşağı it
  update public.entries
     set position = position + 1
   where user_id = uid
     and bucket  = p_bucket
     and position >= p_position;

  insert into public.entries (user_id, place_id, bucket, position, note)
  values (uid, p_place_id, p_bucket, p_position, nullif(trim(p_note), ''))
  returning * into result;

  -- artık gidileceklerde durmasına gerek yok
  delete from public.wishlist where user_id = uid and place_id = p_place_id;

  return result;
end;
$$;

-- Kayıt silinince kovadaki boşluğu kapat
create or replace function public.close_entry_gap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.entries
     set position = position - 1
   where user_id = old.user_id
     and bucket  = old.bucket
     and position > old.position;
  return old;
end;
$$;

drop trigger if exists on_entry_deleted on public.entries;
create trigger on_entry_deleted
  after delete on public.entries
  for each row execute function public.close_entry_gap();

-- ============================================================
--  Satır bazlı güvenlik (RLS)
--  Bunlar olmadan herkes herkesin verisini değiştirebilir.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.places   enable row level security;
alter table public.entries  enable row level security;
alter table public.wishlist enable row level security;
alter table public.follows  enable row level security;

-- profiller: herkes okur, kişi kendi profilini günceller
drop policy if exists "profiller herkese açık" on public.profiles;
create policy "profiller herkese açık"
  on public.profiles for select using (true);

drop policy if exists "kendi profilini günceller" on public.profiles;
create policy "kendi profilini günceller"
  on public.profiles for update using (auth.uid() = id);

-- mekanlar: herkes okur, giriş yapan ekler
drop policy if exists "mekanlar herkese açık" on public.places;
create policy "mekanlar herkese açık"
  on public.places for select using (true);

drop policy if exists "giriş yapan mekan ekler" on public.places;
create policy "giriş yapan mekan ekler"
  on public.places for insert to authenticated with check (auth.uid() = created_by);

-- kayıtlar: herkes okur (arkadaş listeleri için), kişi kendininkini yazar
drop policy if exists "kayıtlar okunabilir" on public.entries;
create policy "kayıtlar okunabilir"
  on public.entries for select using (true);

drop policy if exists "kendi kaydını ekler" on public.entries;
create policy "kendi kaydını ekler"
  on public.entries for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "kendi kaydını günceller" on public.entries;
create policy "kendi kaydını günceller"
  on public.entries for update using (auth.uid() = user_id);

drop policy if exists "kendi kaydını siler" on public.entries;
create policy "kendi kaydını siler"
  on public.entries for delete using (auth.uid() = user_id);

-- gidilecekler: sadece sahibi görür ve değiştirir
drop policy if exists "kendi gideceklerini görür" on public.wishlist;
create policy "kendi gideceklerini görür"
  on public.wishlist for select using (auth.uid() = user_id);

drop policy if exists "kendi gideceklerini yazar" on public.wishlist;
create policy "kendi gideceklerini yazar"
  on public.wishlist for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "kendi gideceklerini siler" on public.wishlist;
create policy "kendi gideceklerini siler"
  on public.wishlist for delete using (auth.uid() = user_id);

-- takip: herkes görür, kişi kendi takibini yönetir
drop policy if exists "takipler okunabilir" on public.follows;
create policy "takipler okunabilir"
  on public.follows for select using (true);

drop policy if exists "kendi takibini ekler" on public.follows;
create policy "kendi takibini ekler"
  on public.follows for insert to authenticated with check (auth.uid() = follower_id);

drop policy if exists "kendi takibini bırakır" on public.follows;
create policy "kendi takibini bırakır"
  on public.follows for delete using (auth.uid() = follower_id);
