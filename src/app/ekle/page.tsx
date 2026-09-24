import { getMe } from "@/lib/me";
import AddFlow from "@/components/AddFlow";
import Tabs from "@/components/Tabs";

export const dynamic = "force-dynamic";

export default async function EklePage() {
  const { user, username } = await getMe();

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
      <Tabs username={username} />
    </>
  );
}
