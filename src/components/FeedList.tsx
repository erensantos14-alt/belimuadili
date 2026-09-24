import Link from "next/link";
import { BUCKETS, formatScore, scoreFor } from "@/lib/ranking";
import { initial, relativeTime } from "@/lib/time";
import type { FeedRow } from "@/lib/types";

export default function FeedList({ rows }: { rows: FeedRow[] }) {
  return (
    <div>
      {rows.map((row) => {
        const bucket = BUCKETS.find((b) => b.key === row.bucket)!;
        const score = scoreFor(row.bucket, row.bucket_position, Number(row.bucket_size));
        const who = row.display_name || row.username;

        return (
          <article className="feed-card" key={row.entry_id}>
            <Link href={`/u/${row.username}`} className="avatar" aria-label={`${who} profili`}>
              {initial(row.display_name, row.username)}
            </Link>

            <div className="feed-body">
              <div className="feed-top">
                <Link href={`/u/${row.username}`} className="feed-who">
                  {who}
                </Link>
                <span className="feed-when">{relativeTime(row.created_at)}</span>
              </div>

              <div className="feed-place">{row.place_name}</div>

              <div className="feed-meta">
                {row.district && <span>{row.district}</span>}
                <span className={`dot ${row.bucket}`} />
                <span>{bucket.label}</span>
              </div>

              {row.note && <p className="feed-note">“{row.note}”</p>}
            </div>

            <div className="feed-score" style={{ color: `var(--${bucket.tone})` }}>
              {formatScore(score)}
            </div>
          </article>
        );
      })}
    </div>
  );
}
