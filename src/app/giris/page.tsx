"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });

    setBusy(false);
    if (error) {
      setError("Bağlantı gönderilemedi. E-postanı kontrol edip tekrar dene.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-wrap">
        <h1 className="auth-title display">Postana baktın mı?</h1>
        <p className="auth-sub">
          <strong>{email}</strong> adresine bir giriş bağlantısı gönderdik. Bağlantıya
          tıkladığında doğrudan içeri gireceksin — şifre yok.
        </p>
        <button className="btn btn-ghost" type="button" onClick={() => setSent(false)}>
          Başka bir adres kullan
        </button>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <h1 className="auth-title display">Sıralama</h1>
      <p className="auth-sub">
        Gittiğin kahvecileri sırala, arkadaşlarının listesini gör. Şifre yok — e-posta
        adresine bir giriş bağlantısı geliyor.
      </p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={submit}>
        <label className="field" htmlFor="email">
          <span>E-posta</span>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="sen@ornek.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button className="btn" type="submit" disabled={busy || !email.trim()}>
          {busy ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
        </button>
      </form>
    </div>
  );
}
