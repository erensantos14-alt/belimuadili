import { createClient } from "./supabase/server";

/**
 * Giriş yapmış kullanıcı ve profil bilgisi.
 * Sekme çubuğu "Profil" bağlantısını kurmak için kullanıcı adına ihtiyaç
 * duyuyor, o yüzden her sayfa bunu çağırıyor.
 */
export async function getMe() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, username: null as string | null };

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  return { user, username: (data?.username as string | undefined) ?? null };
}
