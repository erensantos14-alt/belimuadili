"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BUCKETS, formatScore, scoreFor, type BucketKey } from "@/lib/ranking";
import type { Entry } from "@/lib/types";

export default function RankedList({
  entries,
  emptyHint,
}: {
  entries: Entry[];
  emptyHint?: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("entries").delete().eq("id", id);
    setBusyId(null);
    if (error) {
      setError("Kayıt silinemedi. Bağlantını kontrol edip tekrar dene.");
      return;
    }
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <div className="empty">
        <strong>Liste boş</strong>
        {emptyHint ?? "Ekle sekmesinden ilk mekanını kaydet."} Sıralama ikinci
        mekandan itibaren başlar.
      </div>
    );
  }

  let rank = 0;

  return (
    <>
      {error && <div className="error">{error}</div>}
      {BUCKETS.map((bucket) => {
        const list = entries.filter((e) => e.bucket === bucket.key);
        if (list.length === 0) return null;

        return (
          <section key={bucket.key}>
            <div className="bucket-head">
              <span className={`dot ${bucket.key}`} />
              {bucket.label} · {list.length}
            </div>
            <ul className="list">
              {list.map((entry) => {
                rank += 1;
                const score = scoreFor(entry.bucket as BucketKey, entry.position, list.length);
                return (
                  <li className="row" key={entry.id}>
                    <div className="rank">{rank}</div>
                    <div className="row-main">
                      <div className="name">{entry.places.name}</div>
                      <div className="sub">
                        {entry.places.district && <span>{entry.places.district}</span>}
                        {entry.note && <span className="note-line">· {entry.note}</span>}
                      </div>
                    </div>
                    <div className="row-actions">
                      <div className="score" style={{ color: `var(--${bucket.tone})` }}>
                        {formatScore(score)}
                      </div>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`${entry.places.name} kaydını sil`}
                        disabled={busyId === entry.id}
                        onClick={() => remove(entry.id)}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
