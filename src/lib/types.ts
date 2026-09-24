import type { BucketKey } from "./ranking";

export type Place = {
  id: string;
  name: string;
  district: string | null;
  city: string;
  category: string;
};

export type Entry = {
  id: string;
  user_id: string;
  place_id: string;
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
  bucket: BucketKey;
  position: number;
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
