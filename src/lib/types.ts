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
