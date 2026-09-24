"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FollowButton({
  meId,
  targetId,
  initialFollowing,
}: {
  meId: string;
  targetId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  if (meId === targetId) return null;

  async function toggle() {
    setBusy(true);
    const supabase = createClient();
    const next = !following;

    const { error } = next
      ? await supabase.from("follows").insert({ follower_id: meId, followee_id: targetId })
      : await supabase
          .from("follows")
          .delete()
          .eq("follower_id", meId)
          .eq("followee_id", targetId);

    setBusy(false);
    if (error) return;

    setFollowing(next);
    router.refresh();
  }

  return (
    <button
      type="button"
      className="follow-btn"
      data-following={following}
      disabled={busy}
      onClick={toggle}
    >
      {following ? "Takiptesin" : "Takip et"}
    </button>
  );
}
