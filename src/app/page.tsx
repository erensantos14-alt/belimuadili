import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/me";
import FeedList from "@/components/FeedList";
import Tabs from "@/components/Tabs";
import type { FeedRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AkisPage() {
  const supabase = await createClient();
  const { username } = await getMe();

  const [{ data: feedData }, { count: followCount }] = await Promise.all([
    supabase.rpc("feed", { p_limit: 40 }),
    supabase.from("follows").select("*", { count: "exact", head: true }),
  ]);

  const rows = (feedData ?? []) as FeedRow[];
  const following = followCount ?? 0;

  return (
    <>
      <div className="app">
        <header className="head">
          <h1 className="wordmark display">
            Akış<span>.</span>
          </h1>
          <Link className="head-link" href="/kisiler">
            Kişi bul
          </Link>
        </header>

        {rows.length > 0 ? (
          <FeedList rows={rows} />
        ) : following === 0 ? (
          <div className="empty">
            <strong>Akışın boş</strong>
            Uygulamanın asıl işi arkadaşlarının nereye gittiğini göstermek. Birilerini
            takip etmeden burası boş kalır.
            <div style={{ marginTop: 16 }}>
              <Link
                className="btn"
                href="/kisiler"
                style={{ display: "inline-block", width: "auto" }}
              >
                Kişi bul
              </Link>
            </div>
          </div>
        ) : (
          <div className="empty">
            <strong>Henüz kayıt yok</strong>
            Takip ettiklerin bir yere gittiğinde burada göreceksin. Sen de kendi
            listeni doldurmaya başlayabilirsin.
          </div>
        )}
      </div>
      <Tabs username={username} />
    </>
  );
}
