import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BUCKET_ORDER } from "@/lib/ranking";
import type { Entry } from "@/lib/types";
import RankedList from "@/components/RankedList";
import Tabs from "@/components/Tabs";

export const dynamic = "force-dynamic";

export default async function ListemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: entryData }, { data: profile }] = await Promise.all([
    supabase
      .from("entries")
      .select("id, user_id, place_id, bucket, position, note, visited_at, places(*)")
      .eq("user_id", user!.id),
    supabase.from("profiles").select("username").eq("id", user!.id).single(),
  ]);

  const entries = ((entryData ?? []) as unknown as Entry[]).sort((a, b) => {
    const ba = BUCKET_ORDER.indexOf(a.bucket);
    const bb = BUCKET_ORDER.indexOf(b.bucket);
    return ba === bb ? a.position - b.position : ba - bb;
  });

  return (
    <>
      <div className="app">
        <header className="head">
          <h1 className="wordmark display">
            Listem<span>.</span>
          </h1>
          <div className="head-actions">
            <span className="head-stat">
              {entries.length === 0 ? "henüz kayıt yok" : `${entries.length} mekan`}
            </span>
            <Link className="head-link" href="/ayarlar">
              Ayarlar
            </Link>
          </div>
        </header>

        <RankedList entries={entries} />

        {profile?.username && entries.length > 0 && (
          <p className="hint">
            Listen{" "}
            <Link className="head-link" href={`/u/${profile.username}`}>
              /u/{profile.username}
            </Link>{" "}
            adresinde. Bu bağlantıyı paylaşabilirsin.
          </p>
        )}
      </div>
      <Tabs />
    </>
  );
}
