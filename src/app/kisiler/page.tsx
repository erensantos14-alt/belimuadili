import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMe } from "@/lib/me";
import PeopleSearch from "@/components/PeopleSearch";
import Tabs from "@/components/Tabs";
import type { SuggestedPerson } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function KisilerPage() {
  const supabase = await createClient();
  const { user, username } = await getMe();

  const [{ data: suggestedData }, { data: followData }] = await Promise.all([
    supabase.rpc("suggested_people", { p_limit: 12 }),
    supabase.from("follows").select("followee_id").eq("follower_id", user!.id),
  ]);

  const suggested = (suggestedData ?? []) as SuggestedPerson[];
  const followingIds = (followData ?? []).map((f) => f.followee_id as string);

  return (
    <>
      <div className="app">
        <header className="head">
          <h1 className="wordmark display">
            Kişi bul<span>.</span>
          </h1>
          <Link className="head-link" href="/">
            ← Akış
          </Link>
        </header>

        <PeopleSearch meId={user!.id} suggested={suggested} followingIds={followingIds} />

        {username && (
          <p className="hint">
            Senin bağlantın: <b>/u/{username}</b> — arkadaşlarına bunu gönder. Giriş
            yapmadan da açılıyor, listeni görüp sonra kaydolabilirler.
          </p>
        )}
      </div>
      <Tabs username={username} />
    </>
  );
}
