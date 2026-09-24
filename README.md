# Sıralama

Gittiğin kahvecileri sırala, arkadaşlarının listesini gör. Beli'nin mekaniği,
İstanbul için.

Puan vermiyorsun: üç kovadan birini seçiyorsun (Beğendim / İdare eder /
Beğenmedim), sonra o kovadaki mekanlarla ikili karşılaştırma yapıyorsun. Puan
kovadaki konumundan türüyor. İkili arama olduğu için 32 mekanlık listede bile
5 soru yetiyor.

**Teknoloji:** Next.js 16 · Supabase (veritabanı + giriş) · Vercel (yayın)

---

## Kurulum — sırayla

### 1. Supabase projesini hazırla

1. [supabase.com](https://supabase.com) → yeni proje aç (ücretsiz plan yeterli).
   Bölge olarak **Frankfurt** seç, İstanbul'a en yakını.
2. Sol menüden **SQL Editor** → **New query**.
3. Bu repodaki `supabase/01_schema.sql` dosyasının içeriğini yapıştır → **Run**.
4. Yeni bir sorgu aç, `supabase/02_seed_places.sql` içeriğini yapıştır → **Run**.
   Bu, 46 İstanbul kahvecisini yükler.
5. Yeni bir sorgu aç, `supabase/03_social.sql` içeriğini yapıştır → **Run**.
   Takip, akış ve profil için gereken ekler. (Kurulumu daha önce yaptıysan
   sadece bunu çalıştırman yeterli — diğer ikisini tekrar çalıştırmaya gerek yok.)
6. **Project Settings → API Keys** sayfasından şu ikisini kopyala:
   - **Project URL** (Data API sayfasında) — `https://xxxx.supabase.co`
   - **Publishable key** — `sb_publishable_` ile başlar

> Supabase 2025'te anahtarları yeniden adlandırdı. Eskiden `anon public` denen
> şeyin yeni adı **publishable key**. Eski projelerde hâlâ `anon` görünüyorsa o
> da çalışır, aynı yere yazılır. İkisi de gizli değil — tarayıcıda çalışmak
> üzere tasarlanmışlar, veriyi koruyan şey şemadaki RLS politikaları.
>
> **Secret key** (eski adıyla `service_role`) bambaşka bir şey: her kuralı
> aşar. Onu hiçbir yere, hiçbir koşulda koyma.

### 2. E-posta giriş bağlantısını aç

Supabase → **Authentication → Sign In / Providers** → **Email** açık olsun,
**Confirm email** işaretli kalsın. Şifre kullanmıyoruz; giriş e-postaya gelen
bağlantıyla oluyor.

Sonra **Authentication → URL Configuration**:

- **Site URL**: yayına aldıktan sonra Vercel adresin (örn. `https://siralama.vercel.app`)
- **Redirect URLs**: aşağıdaki ikisini ekle
  - `http://localhost:3000/auth/callback`
  - `https://<vercel-adresin>/auth/callback`

### 3. GitHub'a koy

Yeni bir repo aç (private olabilir), bu klasördeki dosyaları yükle.
`node_modules` ve `.next` klasörlerini yükleme — zaten `.gitignore` içindeler.

### 4. Vercel'e bağla

1. [vercel.com](https://vercel.com) → GitHub hesabınla giriş yap → **Add New → Project**
2. Repoyu seç, **Import**
3. **Environment Variables** bölümüne üçünü gir:

   | Ad | Değer |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable anahtarı |
   | `NEXT_PUBLIC_SITE_URL` | Vercel'in verdiği adres |

4. **Deploy**

İlk yayından sonra Vercel sana bir adres verir. O adresi Supabase'deki
**Site URL** ve **Redirect URLs** alanlarına yazmayı unutma, yoksa giriş
bağlantısı çalışmaz.

### Yerelde çalıştırmak istersen (zorunlu değil)

```bash
npm install
cp .env.local.example .env.local   # sonra içini doldur
npm run dev
```

---

## Dosya düzeni

```
supabase/
  01_schema.sql        tablolar, RLS politikaları, sıraya yerleştirme fonksiyonu
  02_seed_places.sql   46 İstanbul kahvecisi
  03_social.sql        takip/akış/profil ekleri, feed() ve suggested_people()

src/lib/
  ranking.ts           kovalar, puan hesabı, ikili arama — uygulamanın kalbi
  time.ts              "3 sa önce" gibi zaman etiketleri
  types.ts             veri tipleri
  supabase/            tarayıcı ve sunucu istemcileri

src/app/
  page.tsx             Akış — takip ettiklerinin son kayıtları
  listem/              kendi sıralaman
  ekle/                mekan ara + kayıt akışı
  gidilecekler/        gidilecekler listesi
  kisiler/             kişi arama ve öneriler
  u/[username]/        herkese açık profil sayfası
  ayarlar/             kullanıcı adı, görünen ad, çıkış
  giris/               e-posta ile giriş
  auth/callback/       giriş bağlantısının döndüğü yer
  globals.css          tüm tasarım tokenları burada
  manifest.ts          ana ekrana eklenince uygulama gibi açılması için

src/components/
  AddFlow.tsx          kova seçimi → karşılaştırma → sonuç
  RankedList.tsx       sıralı liste
  FeedList.tsx         akış kartları
  PeopleSearch.tsx     kişi arama + öneriler
  FollowButton.tsx     takip et / bırak
  ProfileForm.tsx      kullanıcı adı ve görünen ad
  Wishlist.tsx         gidilecekler
  Tabs.tsx             alt menü

scripts/
  make_icons.py        uygulama simgesini üretir
```

Renkleri değiştirmek istersen tek yer: `src/app/globals.css` en üstteki
`:root` bloğu. Karanlık tema da oradan.

Karşılaştırma sayısını değiştirmek istersen: `src/lib/ranking.ts`.

---

## Bu sürümde olmayanlar

Sıradaki iş, önem sırasıyla:

1. **Fotoğraf** — `entries.photo_path` alanı hazır; Supabase Storage bağlanacak.
2. **Mekan sayfası** — kimler gitmiş, arkadaş ortalaması, Ara / Instagram /
   Yol tarifi butonları.
3. **Kategoriler** — `places.category` hazır; şimdilik sadece `kahve` dolu.
   Bar ve restoran eklenecek, her kategori kendi sıralamasıyla.
4. **Damak uyumu** — iki kişinin ortak mekanlardaki sıralama benzerliği.
5. **Kaydı yeniden sıralama** — mevcut bir kaydın yerini sonradan değiştirmek.

Bilerek yapılmayanlar: rezervasyon entegrasyonu, liderlik tablosu, streak,
harita. Kullanıcı yoğunluğu olmadan hiçbiri anlam taşımıyor.
