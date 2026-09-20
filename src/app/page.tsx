import { createClient } from "@/lib/supabase/server";
import { BUCKET_ORDER } from "@/lib/ranking";
import type { Entry } from "@/lib/types";
import RankedList from "@/components/RankedList";
import Tabs from "@/components/Tabs";
import SignOut from "@/components/SignOut";

export const dynamic = "force-dynamic";

export default async function SiralamamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("entries")
    .select("id, user_id, place_id, bucket, position, note, visited_at, places(*)")
    .eq("user_id", user!.id);

  // Kovalar arası sıra JS tarafında: önce kova, sonra kova içi konum.
  const entries = ((data ?? []) as unknown as Entry[]).sort((a, b) => {
    const ba = BUCKET_ORDER.indexOf(a.bucket);
    const bb = BUCKET_ORDER.indexOf(b.bucket);
    return ba === bb ? a.position - b.position : ba - bb;
  });

  return (
    <>
      <div className="app">
        <header className="head">
          <h1 className="wordmark display">
            Sıralama<span>.</span>
          </h1>
          <div className="head-stat">
            {entries.length === 0 ? "henüz kayıt yok" : `${entries.length} mekan`}
          </div>
        </header>

        <RankedList entries={entries} />

        <div className="foot">
          {user?.email} olarak giriş yaptın. <SignOut />
        </div>
      </div>
      <Tabs />
    </>
  );
}
