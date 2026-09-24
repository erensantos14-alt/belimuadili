"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { initial } from "@/lib/time";
import FollowButton from "./FollowButton";
import type { Profile, SuggestedPerson } from "@/lib/types";

type Row = Profile & { entry_count?: number };

export default function PeopleSearch({
  meId,
  suggested,
  followingIds,
}: {
  meId: string;
  suggested: SuggestedPerson[];
  followingIds: string[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Row[] | null>(null);

  const followSet = useMemo(() => new Set(followingIds), [followingIds]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .neq("id", meId)
        .limit(20);
      setResults((data ?? []) as Row[]);
    }, 220);
    return () => clearTimeout(timer);
  }, [query, supabase, meId]);

  const shown: Row[] = results ?? suggested;

  return (
    <>
      <div className="search">
        <span className="search-ico" aria-hidden="true">
          ⌕
        </span>
        <input
          id="peopleSearch"
          type="search"
          autoComplete="off"
          placeholder="Kullanıcı adı ya da isim ara…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results === null && suggested.length > 0 && (
        <div className="bucket-head">Öneriler</div>
      )}

      {shown.length === 0 ? (
        <div className="empty">
          <strong>{results === null ? "Henüz kimse yok" : "Sonuç yok"}</strong>
          {results === null
            ? "Uygulamayı kullanan başka biri olmadan burası boş. Arkadaşlarına kendi profil bağlantını gönder."
            : "Bu isimde bir kullanıcı bulunamadı."}
        </div>
      ) : (
        shown.map((person) => (
          <div className="person-row" key={person.id}>
            <Link href={`/u/${person.username}`} className="avatar">
              {initial(person.display_name, person.username)}
            </Link>
            <div className="person-body">
              <Link href={`/u/${person.username}`} className="person-name">
                {person.display_name || person.username}
              </Link>
              <div className="person-sub">
                @{person.username}
                {person.entry_count !== undefined && Number(person.entry_count) > 0
                  ? ` · ${person.entry_count} mekan`
                  : ""}
              </div>
            </div>
            <FollowButton
              meId={meId}
              targetId={person.id}
              initialFollowing={followSet.has(person.id)}
            />
          </div>
        ))
      )}
    </>
  );
}
