import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BUCKETS, BUCKET_ORDER, formatScore, scoreFor } from "@/lib/ranking";
import { initial } from "@/lib/time";
import FollowButton from "@/components/FollowButton";
import Tabs from "@/components/Tabs";
import type { Entry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!profile) notFound();

  const [{ data: entryData }, { count: followers }, { count: followingCount }, { data: rel }] =
    await Promise.all([
      supabase
        .from("entries")
        .select("id, user_id, place_id, bucket, position, note, visited_at, places(*)")
        .eq("user_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followee_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", user!.id)
        .eq("followee_id", profile.id)
        .maybeSingle(),
    ]);

  const entries = ((entryData ?? []) as unknown as Entry[]).sort((a, b) => {
    const ba = BUCKET_ORDER.indexOf(a.bucket);
    const bb = BUCKET_ORDER.indexOf(b.bucket);
    return ba === bb ? a.position - b.position : ba - bb;
  });

  const isMe = user!.id === profile.id;
  let rank = 0;

  return (
    <>
      <div className="app">
        <header className="head">
          <Link className="head-link" href="/">
            ← Akış
          </Link>
          {isMe && (
            <Link className="head-link" href="/ayarlar">
              Ayarlar
            </Link>
          )}
        </header>

        <div className="profile-hero">
          <div className="avatar lg">{initial(profile.display_name, profile.username)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="profile-name">{profile.display_name || profile.username}</h1>
            <div className="profile-handle">@{profile.username}</div>
          </div>
          <FollowButton
            meId={user!.id}
            targetId={profile.id}
            initialFollowing={Boolean(rel)}
          />
        </div>

        <div className="stat-row">
          <span className="stat">
            <b>{entries.length}</b> mekan
          </span>
          <span className="stat">
            <b>{followers ?? 0}</b> takipçi
          </span>
          <span className="stat">
            <b>{followingCount ?? 0}</b> takip
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="empty">
            <strong>Liste boş</strong>
            {isMe
              ? "Ekle sekmesinden ilk mekanını kaydet."
              : "Bu kişi henüz bir mekan kaydetmemiş."}
          </div>
        ) : (
          BUCKETS.map((bucket) => {
            const list = entries.filter((e) => e.bucket === bucket.key);
            if (list.length === 0) return null;

            return (
              <section key={bucket.key}>
                <div className="bucket-head">
                  <span className={`dot ${bucket.key}`} />
                  {bucket.label} · {list.length}
                </div>
                <ul className="list">
                  {list.map((entry) => {
                    rank += 1;
                    const score = scoreFor(entry.bucket, entry.position, list.length);
                    return (
                      <li className="row" key={entry.id}>
                        <div className="rank">{rank}</div>
                        <div className="row-main">
                          <div className="name">{entry.places.name}</div>
                          <div className="sub">
                            {entry.places.district && <span>{entry.places.district}</span>}
                            {entry.note && <span className="note-line">· {entry.note}</span>}
                          </div>
                        </div>
                        <div className="score" style={{ color: `var(--${bucket.tone})` }}>
                          {formatScore(score)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>
      <Tabs />
    </>
  );
}
