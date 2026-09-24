"use client";

import Link from "next/link";
import { CATEGORIES, type CategoryKey } from "@/lib/ranking";

type Common = {
  active: CategoryKey;
  counts?: Partial<Record<CategoryKey, number>>;
};

/**
 * Kategori seçici. İki kullanımı var:
 *
 * - `basePath` verilirse bağlantı olarak çalışır; seçim adres çubuğunda
 *   (?k=restoran) tutulur, böylece sayfa sunucuda doğru kategoriyle gelir
 *   ve paylaşılan bağlantı aynı kategoriyi açar.
 * - `onSelect` verilirse buton olarak çalışır; sayfa değişmeden seçim yapılır.
 */
export default function CategoryStrip(
  props: Common & ({ basePath: string; onSelect?: never } | { onSelect: (k: CategoryKey) => void; basePath?: never })
) {
  const { active, counts } = props;

  return (
    <div className="cat-strip" role="tablist" aria-label="Kategoriler">
      {CATEGORIES.map((c) => {
        const isActive = c.key === active;
        const n = counts?.[c.key];
        const label = `${c.label}${n !== undefined && n > 0 ? ` ${n}` : ""}`;

        if (props.onSelect) {
          return (
            <button
              key={c.key}
              type="button"
              className="cat-pill"
              data-active={isActive}
              role="tab"
              aria-selected={isActive}
              onClick={() => props.onSelect(c.key)}
            >
              {label}
            </button>
          );
        }

        return (
          <Link
            key={c.key}
            href={`${props.basePath}?k=${c.key}`}
            className="cat-pill"
            data-active={isActive}
            role="tab"
            aria-selected={isActive}
            scroll={false}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
