/** "3 sa önce", "dün", "12 Eyl" gibi kısa zaman etiketleri. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((Date.now() - then) / 60000);

  if (diffMin < 1) return "az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} sa önce`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "dün";
  if (diffDay < 7) return `${diffDay} gün önce`;

  return new Date(then).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

/** Ad yoksa kullanıcı adından baş harf üret. */
export function initial(displayName: string | null, username: string): string {
  const source = (displayName || username || "?").trim();
  return source.charAt(0);
}
