"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Sıralamam" },
  { href: "/ekle", label: "Ekle" },
  { href: "/gidilecekler", label: "Gidilecekler" },
];

export default function Tabs() {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Bölümler">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="tab"
          data-active={pathname === t.href}
          aria-current={pathname === t.href ? "page" : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
