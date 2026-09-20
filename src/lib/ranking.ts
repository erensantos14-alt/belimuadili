/**
 * Sıralama mantığı — uygulamanın kalbi.
 *
 * Kullanıcı puan vermiyor. Üç kovadan birini seçiyor, sonra o kovadaki
 * mekanlarla ikili karşılaştırma yapıyor. Puan, kovadaki konumdan türüyor.
 *
 * Karşılaştırma sayısı: ikili arama olduğu için n mekan ≈ log2(n) soru.
 * 8 mekan → 3 soru, 32 mekan → 5 soru.
 */

export type BucketKey = "iyi" | "orta" | "kotu";

export type Bucket = {
  key: BucketKey;
  label: string;
  lo: number;
  hi: number;
  tone: "good" | "mid" | "bad";
};

export const BUCKETS: Bucket[] = [
  { key: "iyi", label: "Beğendim", lo: 6.8, hi: 10.0, tone: "good" },
  { key: "orta", label: "İdare eder", lo: 3.4, hi: 6.7, tone: "mid" },
  { key: "kotu", label: "Beğenmedim", lo: 0.0, hi: 3.3, tone: "bad" },
];

export const BUCKET_ORDER: BucketKey[] = ["iyi", "orta", "kotu"];

export function bucketOf(key: BucketKey): Bucket {
  const b = BUCKETS.find((x) => x.key === key);
  if (!b) throw new Error(`Bilinmeyen kova: ${key}`);
  return b;
}

/**
 * Bir kaydın puanı: kovanın aralığı içinde, konumuna göre.
 * Kovanın tek mekanı ise aralığın tepesini alır.
 */
export function scoreFor(bucket: BucketKey, position: number, bucketSize: number): number {
  const b = bucketOf(bucket);
  if (bucketSize <= 1) return b.hi;
  const clamped = Math.min(Math.max(position, 0), bucketSize - 1);
  return b.hi - (b.hi - b.lo) * (clamped / (bucketSize - 1));
}

export function formatScore(n: number): string {
  return n.toFixed(1);
}

/**
 * İkili arama ile yerleştirme.
 *
 * Kullanımı iki adımlı: önce `start` ile durumu kur, sonra her cevapta
 * `answer` çağır. `done` true olunca `position` nihai konumdur.
 */
export type CompareState = {
  lo: number;
  hi: number;
  asked: number;
  maxAsks: number;
};

export function startCompare(bucketSize: number): CompareState {
  return {
    lo: 0,
    hi: bucketSize,
    asked: 0,
    maxAsks: Math.max(1, Math.ceil(Math.log2(bucketSize + 1))),
  };
}

export function isDone(s: CompareState): boolean {
  return s.lo >= s.hi;
}

/** Şu an hangi rakiple karşılaştırılacak — kovadaki indeks. */
export function rivalIndex(s: CompareState): number {
  return (s.lo + s.hi) >> 1;
}

/**
 * @param newIsBetter yeni mekan rakipten iyiyse true.
 *                    Kararsızsa `true` gönder — üste koyar, kullanıcı
 *                    sonradan taşıyabilir.
 */
export function answer(s: CompareState, newIsBetter: boolean): CompareState {
  const mid = rivalIndex(s);
  return {
    ...s,
    asked: s.asked + 1,
    lo: newIsBetter ? s.lo : mid + 1,
    hi: newIsBetter ? mid : s.hi,
  };
}

export function finalPosition(s: CompareState): number {
  return s.lo;
}
