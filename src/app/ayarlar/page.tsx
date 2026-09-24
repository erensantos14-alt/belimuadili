import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import SignOut from "@/components/SignOut";
import Tabs from "@/components/Tabs";

export const dynamic = "force-dynamic";

export default async function AyarlarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user!.id)
    .single();

  return (
    <>
      <div className="app">
        <header className="head">
          <h1 className="wordmark display">
            Ayarlar<span>.</span>
          </h1>
          <Link className="head-link" href="/">
            Akış
          </Link>
        </header>

        {profile && (
          <ProfileForm
            userId={user!.id}
            username={profile.username}
            displayName={profile.display_name}
          />
        )}

        <div className="foot">
          {user?.email} olarak giriş yaptın. <SignOut />
        </div>
      </div>
      <Tabs />
    </>
  );
}
