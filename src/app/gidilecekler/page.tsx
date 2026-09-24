import { redirect } from "next/navigation";
import { getMe } from "@/lib/me";

/** Eski adres. Gidilecekler artık profilin içinde. */
export default async function GidileceklerPage() {
  const { username } = await getMe();
  redirect(username ? `/u/${username}` : "/ayarlar");
}
