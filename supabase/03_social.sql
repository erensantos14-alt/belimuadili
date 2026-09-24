-- ============================================================
--  Sosyal katman — v0.2
--  Supabase → SQL Editor → New query → yapıştır → Run
--  01 ve 02'den SONRA çalıştırılır. Tekrar çalıştırmak güvenlidir.
-- ============================================================

-- ---------- entries → profiles ilişkisi ----------
-- Akışta "bu kaydı kim girdi" bilgisini tek sorguda çekebilmek için
-- entries.user_id'den profiles'a da bir bağ kuruyoruz. auth.users'a olan
-- mevcut bağ duruyor; bu ikincisi sadece sorgu kolaylığı sağlıyor.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'entries_user_id_profiles_fkey'
  ) then
    alter table public.entries
      add constraint entries_user_id_profiles_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

-- ---------- indeksler ----------
create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_followee_idx on public.follows (followee_id);
create index if not exists entries_recent_idx   on public.entries (user_id, created_at desc);
create index if not exists profiles_username_idx on public.profiles (lower(username));

-- ---------- kullanıcı adı kuralları ----------
-- 3-20 karakter, küçük harf, rakam ve alt çizgi.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_username_format'
  ) then
    alter table public.profiles
      add constraint profiles_username_format
      check (username ~ '^[a-z0-9_]{3,20}$');
  end if;
end $$;

-- Kullanıcı adını herkes değiştirebilsin ama başkasınınkini değil.
-- (01_schema.sql'deki "kendi profilini günceller" politikası bunu zaten
--  sağlıyor; burada with check ekleyerek id'nin değiştirilmesini de kapatıyoruz.)
drop policy if exists "kendi profilini günceller" on public.profiles;
create policy "kendi profilini günceller"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------- akış sorgusu ----------
-- Takip ettiklerinin son kayıtları, mekan ve profil bilgisiyle birlikte.
-- Tek çağrı olması hem hızlı hem de sayfalama yapmayı kolaylaştırıyor.
-- Not: dönüş sütunu "position" olamaz — PostgreSQL'de ayrılmış bir kelime.
-- Bu yüzden bucket_position diyoruz.
create or replace function public.feed(p_limit int default 40, p_before timestamptz default null)
returns table (
  entry_id        uuid,
  user_id         uuid,
  username        text,
  display_name    text,
  place_id        uuid,
  place_name      text,
  district        text,
  bucket          text,
  bucket_position int,
  bucket_size     bigint,
  note            text,
  created_at      timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select
    e.id,
    e.user_id,
    pr.username,
    pr.display_name,
    pl.id,
    pl.name,
    pl.district,
    e.bucket,
    e.position,
    (select count(*) from public.entries e2
      where e2.user_id = e.user_id and e2.bucket = e.bucket),
    e.note,
    e.created_at
  from public.entries e
  join public.profiles pr on pr.id = e.user_id
  join public.places   pl on pl.id = e.place_id
  where e.user_id in (
    select followee_id from public.follows where follower_id = auth.uid()
  )
  and (p_before is null or e.created_at < p_before)
  order by e.created_at desc
  limit least(greatest(p_limit, 1), 100);
$$;

-- ---------- önerilen kişiler ----------
-- Henüz takip etmediğin, en çok kaydı olan kullanıcılar.
create or replace function public.suggested_people(p_limit int default 10)
returns table (
  id           uuid,
  username     text,
  display_name text,
  entry_count  bigint
)
language sql
security invoker
set search_path = public
as $$
  select pr.id, pr.username, pr.display_name, count(e.id)
  from public.profiles pr
  left join public.entries e on e.user_id = pr.id
  where pr.id <> auth.uid()
    and pr.id not in (
      select followee_id from public.follows where follower_id = auth.uid()
    )
  group by pr.id, pr.username, pr.display_name
  order by count(e.id) desc, pr.created_at asc
  limit least(greatest(p_limit, 1), 50);
$$;
