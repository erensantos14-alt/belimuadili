"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Akış" },
  { href: "/listem", label: "Listem" },
  { href: "/ekle", label: "Ekle" },
  { href: "/gidilecekler", label: "Gidilecekler" },
];

export default function Tabs() {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Bölümler">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
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
