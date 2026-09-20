import { createClient } from "@/lib/supabase/server";
import Wishlist from "@/components/Wishlist";
import Tabs from "@/components/Tabs";
import type { Place } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GidileceklerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("wishlist")
    .select("place_id, created_at, places(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const places = ((data ?? []) as unknown as { places: Place }[]).map((r) => r.places);

  return (
    <>
      <div className="app">
        <header className="head">
          <h1 className="wordmark display">
            Gidilecekler<span>.</span>
          </h1>
          <div className="head-stat">{places.length} mekan</div>
        </header>
        <Wishlist userId={user!.id} places={places} />
      </div>
      <Tabs />
    </>
  );
}
