import type { BucketKey, CategoryKey } from "./ranking";

export type Place = {
  id: string;
  name: string;
  district: string | null;
  city: string;
  category: CategoryKey;
};

export type Entry = {
  id: string;
  user_id: string;
  place_id: string;
  category: CategoryKey;
  bucket: BucketKey;
  position: number;
  note: string | null;
  visited_at: string;
  places: Place;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
};

/** feed() fonksiyonunun döndürdüğü satır. */
export type FeedRow = {
  entry_id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  place_id: string;
  place_name: string;
  district: string | null;
  category: CategoryKey;
  bucket: BucketKey;
  /** Kovadaki konum. "position" PostgreSQL'de ayrılmış kelime olduğu için bu ad. */
  bucket_position: number;
  bucket_size: number;
  note: string | null;
  created_at: string;
};

/** suggested_people() fonksiyonunun döndürdüğü satır. */
export type SuggestedPerson = {
  id: string;
  username: string;
  display_name: string | null;
  entry_count: number;
};
