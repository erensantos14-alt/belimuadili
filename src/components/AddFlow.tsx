"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BUCKETS,
  CATEGORIES,
  DEFAULT_CATEGORY,
  answer,
  categoryOf,
  finalPosition,
  formatScore,
  isDone,
  rivalIndex,
  scoreFor,
  startCompare,
  type BucketKey,
  type CategoryKey,
  type CompareState,
} from "@/lib/ranking";
import CategoryStrip from "./CategoryStrip";
import type { Entry, Place } from "@/lib/types";

type Step =
  | { name: "search" }
  | { name: "bucket"; place: Place }
  | { name: "compare"; place: Place; bucket: BucketKey; state: CompareState }
  | { name: "note"; place: Place; bucket: BucketKey; entry: Entry; position: number; asked: number };

export default function AddFlow({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [category, setCategory] = useState<CategoryKey>(DEFAULT_CATEGORY);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [step, setStep] = useState<Step>({ name: "search" });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kullanıcının mevcut kayıtları — karşılaştırmalar bunların üzerinden yürüyor.
  const loadEntries = useCallback(async () => {
    const { data } = await supabase
      .from("entries")
      .select("id, user_id, place_id, category, bucket, position, note, visited_at, places(*)")
      .eq("user_id", userId);
    setEntries((data ?? []) as unknown as Entry[]);
  }, [supabase, userId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Mekan arama — yazmayı bıraktıktan kısa süre sonra sorgula.
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
        .limit(12);
      setResults((data ?? []) as Place[]);
    }, 220);
    return () => clearTimeout(timer);
  }, [query, supabase, category]);

  // Karşılaştırmalar yalnızca aynı kategorideki kayıtlarla yapılıyor.
  const bucketList = (bucket: BucketKey) =>
    entries
      .filter((e) => e.bucket === bucket && e.category === category)
      .sort((a, b) => a.position - b.position);

  const counts: Partial<Record<CategoryKey, number>> = {};
  for (const c of CATEGORIES) {
    counts[c.key] = entries.filter((e) => e.category === c.key).length;
  }

  function reset() {
    setStep({ name: "search" });
    setQuery("");
    setResults([]);
    setNote("");
    setError(null);
  }

  /* ---------- mekan seçimi ---------- */

  function pickPlace(place: Place) {
    setError(null);
    setStep({ name: "bucket", place });
  }

  async function addCustomPlace() {
    const name = query.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("places")
      .insert({ name, city: "İstanbul", category, created_by: userId })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      setError("Mekan eklenemedi. Aynı isim zaten varsa arayıp seçebilirsin.");
      return;
    }
    pickPlace(data as Place);
  }

  /* ---------- kova seçimi ---------- */

  function pickBucket(place: Place, bucket: BucketKey) {
    const list = bucketList(bucket);
    const state = startCompare(list.length);
    if (isDone(state)) {
      save(place, bucket, 0, 0);
      return;
    }
    setStep({ name: "compare", place, bucket, state });
  }

  /* ---------- karşılaştırma ---------- */

  function respond(newIsBetter: boolean) {
    if (step.name !== "compare") return;
    const next = answer(step.state, newIsBetter);
    if (isDone(next)) {
      save(step.place, step.bucket, finalPosition(next), next.asked);
      return;
    }
    setStep({ ...step, state: next });
  }

  /* ---------- kaydet ---------- */

  async function save(place: Place, bucket: BucketKey, position: number, asked: number) {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .rpc("place_entry", {
        p_place_id: place.id,
        p_bucket: bucket,
        p_position: position,
        p_note: null,
      })
      .single();
    setBusy(false);

    if (error || !data) {
      setError("Kaydedilemedi. Bu mekan listende zaten olabilir.");
      setStep({ name: "search" });
      return;
    }

    await loadEntries();
    const entry = { ...(data as Entry), places: place };
    setStep({ name: "note", place, bucket, entry, position, asked });
  }

  async function saveNote() {
    if (step.name !== "note") return;
    const trimmed = note.trim();
    if (trimmed) {
      setBusy(true);
      await supabase.from("entries").update({ note: trimmed }).eq("id", step.entry.id);
      setBusy(false);
    }
    reset();
    router.refresh();
  }

  /* ================= ekranlar ================= */

  if (step.name === "bucket") {
    return (
      <Sheet
        kicker={`${step.place.name}${step.place.district ? ` · ${step.place.district}` : ""}`}
        kategori={category}
        onClose={reset}
      >
        <h2 className="sheet-q">Nasıldı?</h2>
        <div className="choices">
          {BUCKETS.map((b) => (
            <button
              key={b.key}
              type="button"
              className="choice"
              disabled={busy}
              onClick={() => pickBucket(step.place, b.key)}
            >
              <span className={`dot ${b.key}`} />
              <div>
                <div className="choice-name">{b.label}</div>
                <div className="choice-sub">{bucketList(b.key).length} mekan bu kovada</div>
              </div>
            </button>
          ))}
        </div>
        <p className="hint">Puan vermiyorsun. Kovayı seç, gerisini karşılaştırmalar halletsin.</p>
      </Sheet>
    );
  }

  if (step.name === "compare") {
    const list = bucketList(step.bucket);
    const rival = list[rivalIndex(step.state)];
    return (
      <Sheet
        kicker={BUCKETS.find((b) => b.key === step.bucket)!.label}
        progress={`${step.state.asked + 1} / ~${step.state.maxAsks}`}
        kategori={category}
        onClose={reset}
      >
        <h2 className="sheet-q">Hangisi daha iyiydi?</h2>
        <div className="choices">
          <button type="button" className="choice" disabled={busy} onClick={() => respond(true)}>
            <div>
              <div className="choice-name">{step.place.name}</div>
              <div className="choice-sub">{step.place.district || "yeni eklendi"}</div>
            </div>
          </button>
          <div className="vs">ya da</div>
          <button type="button" className="choice" disabled={busy} onClick={() => respond(false)}>
            <div>
              <div className="choice-name">{rival.places.name}</div>
              <div className="choice-sub">{rival.places.district || "kendi eklediğin mekan"}</div>
            </div>
          </button>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 14 }}
          disabled={busy}
          onClick={() => respond(true)}
        >
          Ayıramıyorum
        </button>
      </Sheet>
    );
  }

  if (step.name === "note") {
    const list = bucketList(step.bucket);
    const score = scoreFor(step.bucket, step.position, Math.max(list.length, 1));
    const overall =
      entries
        .slice()
        .sort((a, b) => a.position - b.position)
        .findIndex((e) => e.id === step.entry.id) + 1;

    return (
      <Sheet kicker="Eklendi" kategori={category} onClose={() => { reset(); router.refresh(); }}>
        <div className="verdict">
          <div className="verdict-score">{formatScore(score)}</div>
          <div className="verdict-pos">
            {step.place.name} · {BUCKETS.find((b) => b.key === step.bucket)!.label} kovanda{" "}
            <b>{step.position + 1}. sırada</b>
          </div>
          <div className="choice-sub" style={{ marginTop: 10 }}>
            {step.asked === 0
              ? "Bu kovadaki ilk mekan, karşılaştırmaya gerek olmadı."
              : `${step.asked} karşılaştırmada yerini buldu.`}
            {overall > 0 ? ` Listende toplam ${entries.length} mekan var.` : ""}
          </div>
        </div>

        <input
          className="note-in"
          style={{ marginTop: 14 }}
          placeholder="Kısa not — ne içtin, kiminle gittin?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="btn-row">
          <button type="button" className="btn" disabled={busy} onClick={saveNote}>
            {busy ? "Kaydediliyor…" : "Bitti"}
          </button>
        </div>
      </Sheet>
    );
  }

  /* ---------- arama ekranı ---------- */

  const rankedIds = new Set(entries.map((e) => e.place_id));
  const q = query.trim();
  const cat = categoryOf(category);

  return (
    <div data-kategori={category}>
      {error && <div className="error">{error}</div>}

      <CategoryStrip
        active={category}
        counts={counts}
        onSelect={(k) => {
          setCategory(k);
          setQuery("");
          setResults([]);
        }}
      />

      <div className="search">
        <span className="search-ico" aria-hidden="true">
          ⌕
        </span>
        <input
          id="placeSearch"
          type="search"
          autoComplete="off"
          placeholder={`${cat.label} ara — isim ya da semt…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {q.length < 2 && (
        <div className="empty">
          <strong>Bugün nereye gittin?</strong>
          Önce kategoriyi seç, sonra mekanın adını ya da semtini yazmaya başla.
        </div>
      )}

      {results.map((place) => {
        const already = rankedIds.has(place.id);
        return (
          <button
            key={place.id}
            type="button"
            className="result"
            disabled={already || busy}
            onClick={() => pickPlace(place)}
          >
            <div>
              <div className="name">{place.name}</div>
              <div className="sub">{place.district}</div>
            </div>
            {already ? <span className="done">listende</span> : <span className="plus">+</span>}
          </button>
        );
      })}

      {q.length >= 2 && results.length === 0 && (
        <button type="button" className="result" disabled={busy} onClick={addCustomPlace}>
          <div>
            <div className="name">“{q}” ekle</div>
            <div className="sub">listede yok — yeni {cat.one} olarak kaydet</div>
          </div>
          <span className="plus">+</span>
        </button>
      )}

      <p className="hint">
        Listede olmayan mekanı adını yazıp ekleyebilirsin. Eklediğin mekan herkesin
        aramasında çıkar. Sıralama her kategoride ayrı tutuluyor.
      </p>
    </div>
  );
}

/* ---------- tam ekran akış kabuğu ---------- */

function Sheet({
  kicker,
  progress,
  kategori,
  onClose,
  children,
}: {
  kicker: string;
  progress?: string;
  kategori: CategoryKey;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="sheet" role="dialog" aria-modal="true" data-kategori={kategori}>
      <div className="sheet-inner">
        <div className="sheet-top">
          <div className="sheet-kicker">{kicker}</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {progress && <span className="progress">{progress}</span>}
            <button
              type="button"
              className="icon-btn"
              style={{ marginLeft: 10 }}
              aria-label="Kapat"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
