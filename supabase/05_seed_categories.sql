-- ============================================================
--  Restoran, bar, fırın/pastane, tatlı/dondurma mekanları
--  04'ten SONRA çalıştır. Tekrar çalıştırmak güvenlidir.
--
--  Kaynaklar: Müdavim "20 İstanbul mekanı", OGGUSTO "en yeni mekanlar",
--  Yemek.com Kadıköy / pastane / dondurmacı listeleri,
--  Onedio ve Obilet kokteyl bar listeleri.
-- ============================================================

-- ---------- restoran ----------
insert into public.places (name, district, city, category) values
  ('Tünel Lokantası',            'Asmalımescit',   'İstanbul', 'restoran'),
  ('Lina Anatolian Kitchen',     'Karaköy',        'İstanbul', 'restoran'),
  ('Sen''den İstanbul',          'Karaköy',        'İstanbul', 'restoran'),
  ('1924 İstanbul',              'Beyoğlu',        'İstanbul', 'restoran'),
  ('Aşeka Karaköy',              'Karaköy',        'İstanbul', 'restoran'),
  ('Barnathan İstanbul',         'Galata',         'İstanbul', 'restoran'),
  ('Karas Wine Bar & Bites',     'Tarlabaşı',      'İstanbul', 'restoran'),
  ('Kün Restaurant',             'Zeytinburnu',    'İstanbul', 'restoran'),
  ('Lokanta Feriye',             'Ortaköy',        'İstanbul', 'restoran'),
  ('Mikla',                      'Pera',           'İstanbul', 'restoran'),
  ('Monteverdi Ristorante',      'Beşiktaş',       'İstanbul', 'restoran'),
  ('Okra İstanbul',              'Taksim',         'İstanbul', 'restoran'),
  ('Restoran Modern',            'Karaköy',        'İstanbul', 'restoran'),
  ('Roof Mezzepotamia',          'Sirkeci',        'İstanbul', 'restoran'),
  ('Sentez Restaurant',          'Sultanahmet',    'İstanbul', 'restoran'),
  ('Sunset Grill & Bar',         'Ulus',           'İstanbul', 'restoran'),
  ('Serica Restaurant',          'Karaköy',        'İstanbul', 'restoran'),
  ('Süreyya Lokanta',            'Ataşehir',       'İstanbul', 'restoran'),
  ('Topaz İstanbul',             'Gümüşsuyu',      'İstanbul', 'restoran'),
  ('Çiya Sofrası',               'Kadıköy',        'İstanbul', 'restoran'),
  ('Hane Kadıköy',               'Kadıköy',        'İstanbul', 'restoran'),
  ('Ethem Efendi Kahvaltı',      'Erenköy',        'İstanbul', 'restoran'),
  ('Bop Breakfast of Pan',       'Yeldeğirmeni',   'İstanbul', 'restoran'),
  ('FABESCO Restaurant & Cafe',  'Kadıköy',        'İstanbul', 'restoran'),
  ('Strada',                     'Suadiye',        'İstanbul', 'restoran'),
  ('Mutfakkoz',                  'Kozyatağı',      'İstanbul', 'restoran'),
  ('Nazende Cadde',              'Caddebostan',    'İstanbul', 'restoran'),
  ('Dazu',                       'Nişantaşı',      'İstanbul', 'restoran'),
  ('Lucente Ristorante Italiano','Gümüşsuyu',      'İstanbul', 'restoran'),
  ('Kanti All Day Eatery',       'Yeniköy',        'İstanbul', 'restoran'),
  ('Chikka Chicken',             'Etiler',         'İstanbul', 'restoran'),
  ('Banca Unione',               'Karaköy',        'İstanbul', 'restoran'),
  ('Abelia',                     'Karaköy',        'İstanbul', 'restoran'),
  ('Salsura Sea Food',           'Yeniköy',        'İstanbul', 'restoran'),
  ('Tek Kebapçı',                'Etiler',         'İstanbul', 'restoran'),
  ('Østre',                      'Cihangir',       'İstanbul', 'restoran'),
  ('Suimaki',                    'Teşvikiye',      'İstanbul', 'restoran'),
  ('Neroli Daylight Kitchen',    'Teşvikiye',      'İstanbul', 'restoran'),
  ('Hodan',                      'Nişantaşı',      'İstanbul', 'restoran'),
  ('Arogan',                     'Tarabya',        'İstanbul', 'restoran'),
  ('Flock',                      'Nişantaşı',      'İstanbul', 'restoran')
on conflict do nothing;

-- ---------- bar ----------
insert into public.places (name, district, city, category) values
  ('Spago',                        'Nişantaşı',    'İstanbul', 'bar'),
  ('Moretenders Cocktail Crib',    'Asmalımescit', 'İstanbul', 'bar'),
  ('Alancha',                      'Beşiktaş',     'İstanbul', 'bar'),
  ('Alexandra Cocktail Bar',       'Arnavutköy',   'İstanbul', 'bar'),
  ('Geyik Coffee & Cocktail Bar',  'Cihangir',     'İstanbul', 'bar'),
  ('Chicki Boom',                  'Etiler',       'İstanbul', 'bar'),
  ('Efendi',                       'Topağacı',     'İstanbul', 'bar'),
  ('11 Kadıköy Cocktails',         'Moda',         'İstanbul', 'bar'),
  ('Rustyfork',                    'Etiler',       'İstanbul', 'bar'),
  ('Nor',                          'Moda',         'İstanbul', 'bar'),
  ('Monkey İstanbul',              'Karaköy',      'İstanbul', 'bar'),
  ('Sky Karaköy',                  'Karaköy',      'İstanbul', 'bar'),
  ('Serkonsül',                    'Karaköy',      'İstanbul', 'bar'),
  ('Topside Bar',                  'Galata',       'İstanbul', 'bar'),
  ('Ritim Roof',                   'Beyoğlu',      'İstanbul', 'bar'),
  ('360 İstanbul',                 'Beyoğlu',      'İstanbul', 'bar'),
  ('Ernest Bar',                   'Beyoğlu',      'İstanbul', 'bar'),
  ('Tiny Drinkery House',          'Akaretler',    'İstanbul', 'bar'),
  ('Zihni Bar',                    'Beşiktaş',     'İstanbul', 'bar'),
  ('Joker No:19',                  'Nişantaşı',    'İstanbul', 'bar'),
  ('Lelabbo',                      'Moda',         'İstanbul', 'bar'),
  ('Mathilda''s Cocktail Bar',     'Kadıköy',      'İstanbul', 'bar'),
  ('Fahri Konsolos',               'Kadıköy',      'İstanbul', 'bar'),
  ('Easy',                         'Arnavutköy',   'İstanbul', 'bar'),
  ('Gizli Kalsın',                 'Emirgan',      'İstanbul', 'bar'),
  ('The Townhouse',                'Suadiye',      'İstanbul', 'bar'),
  ('Allen Kitchen & Cocktail',     'Bağdat Caddesi','İstanbul','bar'),
  ('Korto İstanbul',               'Kuruçeşme',    'İstanbul', 'bar'),
  ('Nardis Jazz Club',             'Galata',       'İstanbul', 'bar'),
  ('Goose No.25',                  'Kuruçeşme',    'İstanbul', 'bar'),
  ('16ROOF',                       'Beşiktaş',     'İstanbul', 'bar'),
  ('Tone',                         'Asmalımescit', 'İstanbul', 'bar'),
  ('because.',                     'Kuruçeşme',    'İstanbul', 'bar'),
  ('Sazzou',                       'Harbiye',      'İstanbul', 'bar'),
  ('Jordi',                        'Yeniköy',      'İstanbul', 'bar'),
  ('Dandy',                        'Kuruçeşme',    'İstanbul', 'bar'),
  ('Bordel',                       'Asmalımescit', 'İstanbul', 'bar'),
  ('Dama',                         'Nişantaşı',    'İstanbul', 'bar'),
  ('Tutta',                        'Asmalımescit', 'İstanbul', 'bar'),
  ('Tango & Cash',                 'Nişantaşı',    'İstanbul', 'bar')
on conflict do nothing;

-- ---------- fırın / pastane ----------
insert into public.places (name, district, city, category) values
  ('Grandma Coffee and Bakery',   'Nişantaşı',  'İstanbul', 'firin'),
  ('Naan Bakeshop',               'Moda',       'İstanbul', 'firin'),
  ('B.blok',                      'Beşiktaş',   'İstanbul', 'firin'),
  ('Pim Patisserie',              'Karaköy',    'İstanbul', 'firin'),
  ('Dandin Bakery',               'Beyoğlu',    'İstanbul', 'firin'),
  ('La Patisserie Lune',          'Teşvikiye',  'İstanbul', 'firin'),
  ('Patisserie de Pera',          'Tepebaşı',   'İstanbul', 'firin'),
  ('Cloud Nine Patisserie',       'Galata',     'İstanbul', 'firin'),
  ('Pastel',                      'Bebek',      'İstanbul', 'firin'),
  ('Grandpa',                     'Bebek',      'İstanbul', 'firin'),
  ('Bröd',                        'Teşvikiye',  'İstanbul', 'firin'),
  ('Meşhur Kireçburnu Fırını',    'Sarıyer',    'İstanbul', 'firin')
on conflict do nothing;

-- ---------- tatlı / dondurma ----------
insert into public.places (name, district, city, category) values
  ('Girandola',                   'Arnavutköy',   'İstanbul', 'tatli'),
  ('Mua Gelatieri D''Italia',     'Yeniköy',      'İstanbul', 'tatli'),
  ('Bebek Mini Dondurma',         'Bebek',        'İstanbul', 'tatli'),
  ('Serez Dondurmacısı',          'Sahrayıcedit', 'İstanbul', 'tatli'),
  ('Vero Gelato',                 'Caddebostan',  'İstanbul', 'tatli'),
  ('Gelateria Bonacci',           'Bomonti',      'İstanbul', 'tatli'),
  ('icon Dondurma',               'Kadıköy',      'İstanbul', 'tatli'),
  ('Lu Gelato & Pasticceria',     'Göktürk',      'İstanbul', 'tatli'),
  ('Paseo Gelato & Sorbet',       'Caddebostan',  'İstanbul', 'tatli'),
  ('Özkaymak Dondurma',           'Pendik',       'İstanbul', 'tatli')
on conflict do nothing;
