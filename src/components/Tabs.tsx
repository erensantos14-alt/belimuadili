"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Üç sekme. "Profil" doğrudan kendi herkese açık profiline gidiyor —
 * yani başkalarının gördüğü sayfanın aynısını görüyorsun.
 */
export default function Tabs({ username }: { username: string | null }) {
  const pathname = usePathname();
  const profileHref = username ? `/u/${username}` : "/ayarlar";

  const tabs = [
    { href: "/", label: "Akış" },
    { href: "/ekle", label: "Ekle" },
    { href: profileHref, label: "Profil" },
  ];

  return (
    <nav className="tabs" aria-label="Bölümler">
      {tabs.map((t) => {
        const active =
          t.label === "Profil"
            ? pathname === profileHref || pathname === "/ayarlar"
            : pathname === t.href;
        return (
          <Link
            key={t.label}
            href={t.href}
            className="tab"
            data-active={active}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
