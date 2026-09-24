-- ============================================================
--  Kategoriler — v0.4
--  Supabase → SQL Editor → New query → yapıştır → Run
--  01, 02, 03'ten SONRA. Tekrar çalıştırmak güvenlidir.
--
--  Değişen fikir: sıralama artık kategori içinde yapılıyor.
--  Bir kahveciyi restoranla karşılaştırmak anlamsız olduğu için
--  konum (position) kullanıcı + kategori + kova üçlüsüne göre tutuluyor.
-- ============================================================

-- ---------- entries.category ----------
-- Mekanın kategorisini kaydın üstüne kopyalıyoruz. Join'den kaçınmak için
-- değil — sıralama mantığının tek bir sütuna bakabilmesi için.
alter table public.entries add column if not exists category text;

update public.entries e
   set category = p.category
  from public.places p
 where p.id = e.place_id
   and e.category is distinct from p.category;

-- Artık boş kalamaz
do $$
begin
  if not exists (
    select 1 from public.entries where category is null
  ) then
    alter table public.entries alter column category set not null;
  end if;
end $$;

alter table public.entries alter column category set default 'kahve';

-- Eski indeksi kategoriyi içerenle değiştir
drop index if exists public.entries_user_order_idx;
create index if not exists entries_user_cat_order_idx
  on public.entries (user_id, category, bucket, position);

-- ============================================================
--  Sıraya yerleştirme — artık kategori içinde
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
  v_category text;
begin
  if uid is null then
    raise exception 'Giriş yapılmamış';
  end if;

  select category into v_category from public.places where id = p_place_id;
  if v_category is null then
    raise exception 'Mekan bulunamadı';
  end if;

  -- yalnızca aynı kategorideki kayıtlar kayıyor
  update public.entries
     set position = position + 1
   where user_id  = uid
     and category = v_category
     and bucket   = p_bucket
     and position >= p_position;

  insert into public.entries (user_id, place_id, category, bucket, position, note)
  values (uid, p_place_id, v_category, p_bucket, p_position, nullif(trim(p_note), ''))
  returning * into result;

  delete from public.wishlist where user_id = uid and place_id = p_place_id;

  return result;
end;
$$;

-- Silinince boşluğu kapat — yine kategori içinde
create or replace function public.close_entry_gap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.entries
     set position = position - 1
   where user_id  = old.user_id
     and category = old.category
     and bucket   = old.bucket
     and position > old.position;
  return old;
end;
$$;

drop trigger if exists on_entry_deleted on public.entries;
create trigger on_entry_deleted
  after delete on public.entries
  for each row execute function public.close_entry_gap();

-- ============================================================
--  Akış — kategori bilgisi ve kategoriye göre kova büyüklüğü
-- ============================================================
drop function if exists public.feed(int, timestamptz);

create or replace function public.feed(p_limit int default 40, p_before timestamptz default null)
returns table (
  entry_id        uuid,
  user_id         uuid,
  username        text,
  display_name    text,
  place_id        uuid,
  place_name      text,
  district        text,
  category        text,
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
    e.category,
    e.bucket,
    e.position,
    (select count(*) from public.entries e2
      where e2.user_id  = e.user_id
        and e2.category = e.category
        and e2.bucket   = e.bucket),
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

-- ============================================================
--  DÜZELTME: kısa e-posta adresleri kayıt olamıyordu
--
--  03_social.sql kullanıcı adına "3-20 karakter" kuralı koydu, ama
--  profil oluşturan tetikleyici adı e-postanın @ öncesinden türetiyor.
--  "iz@ornek.com" gibi bir adres iki harflik bir ad üretiyor, kural onu
--  reddediyor ve kayıt tamamen başarısız oluyordu.
--  Artık kısa adlar tamamlanıyor, uzunlar kırpılıyor.
-- ============================================================
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
  base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));

  if base = '' then
    base := 'kullanici';
  end if;

  -- kural en az 3 karakter istiyor
  if length(base) < 3 then
    base := base || 'kisi';
  end if;

  -- en fazla 20; sona sayı eklenebilmesi için pay bırak
  base := left(base, 16);

  candidate := base;
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

-- ---------- geçerli kategoriler ----------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'places_category_check'
  ) then
    alter table public.places
      add constraint places_category_check
      check (category in ('kahve', 'restoran', 'bar', 'firin', 'tatli'));
  end if;
end $$;
