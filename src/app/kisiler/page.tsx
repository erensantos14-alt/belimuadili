import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PeopleSearch from "@/components/PeopleSearch";
import Tabs from "@/components/Tabs";
import type { SuggestedPerson } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function KisilerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: suggestedData }, { data: followData }, { data: me }] = await Promise.all([
    supabase.rpc("suggested_people", { p_limit: 12 }),
    supabase.from("follows").select("followee_id").eq("follower_id", user!.id),
    supabase.from("profiles").select("username").eq("id", user!.id).single(),
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
            Akış
          </Link>
        </header>

        <PeopleSearch
          meId={user!.id}
          suggested={suggested}
          followingIds={followingIds}
        />

        {me?.username && (
          <p className="hint">
            Senin bağlantın: <b>/u/{me.username}</b> — arkadaşlarına bunu gönder,
            listeni görüp seni takip edebilsinler.
          </p>
        )}
      </div>
      <Tabs />
    </>
  );
}
