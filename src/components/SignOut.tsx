"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOut() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <button type="button" className="link-btn" onClick={signOut}>
      Çıkış yap
    </button>
  );
}
