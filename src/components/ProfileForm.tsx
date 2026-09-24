"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function ProfileForm({
  userId,
  username,
  displayName,
}: {
  userId: string;
  username: string;
  displayName: string | null;
}) {
  const router = useRouter();
  const [handle, setHandle] = useState(username);
  const [name, setName] = useState(displayName ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const next = handle.trim().toLowerCase();
    if (!USERNAME_RE.test(next)) {
      setError("Kullanıcı adı 3-20 karakter olmalı; sadece küçük harf, rakam ve alt çizgi.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ username: next, display_name: name.trim() || null })
      .eq("id", userId);
    setBusy(false);

    if (error) {
      setError(
        error.code === "23505"
          ? "Bu kullanıcı adı alınmış, başka bir tane dene."
          : "Kaydedilemedi. Tekrar dener misin?"
      );
      return;
    }

    setHandle(next);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save}>
      {error && <div className="error">{error}</div>}
      {saved && <div className="ok">Kaydedildi. Profilin /u/{handle} adresinde.</div>}

      <label className="field" htmlFor="displayName">
        <span>Görünen ad</span>
        <input
          id="displayName"
          value={name}
          placeholder="Eren"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="field" htmlFor="username">
        <span>Kullanıcı adı</span>
        <input
          id="username"
          value={handle}
          placeholder="eren"
          autoCapitalize="none"
          autoCorrect="off"
          onChange={(e) => setHandle(e.target.value)}
        />
      </label>

      <p className="hint" style={{ margin: "0 2px 14px" }}>
        Profilin <b>/u/{handle || "kullaniciadi"}</b> adresinde yayınlanıyor.
      </p>

      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
