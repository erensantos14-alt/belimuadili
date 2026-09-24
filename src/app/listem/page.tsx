import { redirect } from "next/navigation";
import { getMe } from "@/lib/me";

/** Eski adres. Liste artık profilin içinde. */
export default async function ListemPage() {
  const { username } = await getMe();
  redirect(username ? `/u/${username}` : "/ayarlar");
}
