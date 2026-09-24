"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categoryOf, type CategoryKey } from "@/lib/ranking";
import type { Place } from "@/lib/types";

export default function Wishlist({
  userId,
  places,
  category,
}: {
  userId: string;
  places: Place[];
  category: CategoryKey;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedIds = useMemo(() => new Set(places.map((p) => p.id)), [places]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("places")
        .select("*")
        .eq("category", category)
        .or(`name.ilike.%${q}%,district.ilike.%${q}%`)
        .order("name")
        .limit(8);
      setResults((data ?? []) as Place[]);
    }, 220);
    return () => clearTimeout(timer);
  }, [query, supabase, category]);

  async function add(place: Place) {
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from("wishlist")
      .insert({ user_id: userId, place_id: place.id });
    setBusy(false);
    if (error) {
      setError("Eklenemedi. Bu mekan listende zaten olabilir.");
      return;
    }
    setQuery("");
    setResults([]);
    router.refresh();
  }

  async function remove(placeId: string) {
    setBusy(true);
    await supabase.from("wishlist").delete().eq("user_id", userId).eq("place_id", placeId);
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      {error && <div className="error">{error}</div>}

      <div className="search">
        <span className="search-ico" aria-hidden="true">
          ⌕
        </span>
        <input
          id="wishSearch"
          type="search"
          autoComplete="off"
          placeholder={`Gidilecekler listene ${categoryOf(category).one} ekle…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results
        .filter((p) => !savedIds.has(p.id))
        .map((place) => (
          <button
            key={place.id}
            type="button"
            className="result"
            disabled={busy}
            onClick={() => add(place)}
          >
            <div>
              <div className="name">{place.name}</div>
              <div className="sub">{place.district}</div>
            </div>
            <span className="plus">+</span>
          </button>
        ))}

      <div style={{ marginTop: 18 }}>
        {places.length === 0 ? (
          <div className="empty">
            <strong>Gidilecekler boş</strong>
            Birinin listesinde görüp aklında kalan yerleri buraya at.
          </div>
        ) : (
          <ul className="list">
            {places.map((place) => (
              <li className="row simple" key={place.id}>
                <div className="row-main">
                  <div className="name">{place.name}</div>
                  <div className="sub">{place.district || "kendi eklediğin mekan"}</div>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`${place.name} kaydını çıkar`}
                    disabled={busy}
                    onClick={() => remove(place.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="hint">
        Bir mekanı Ekle sekmesinden kaydettiğinde buradan otomatik olarak düşer.
      </p>
    </>
  );
}
