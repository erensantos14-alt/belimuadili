import { createClient } from "@/lib/supabase/server";
import AddFlow from "@/components/AddFlow";
import Tabs from "@/components/Tabs";

export const dynamic = "force-dynamic";

export default async function EklePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="app">
        <header className="head">
          <h1 className="wordmark display">
            Ekle<span>.</span>
          </h1>
        </header>
        <AddFlow userId={user!.id} />
      </div>
      <Tabs />
    </>
  );
}
