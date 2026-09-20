import type { MetadataRoute } from "next";

/**
 * Ana ekrana eklendiğinde uygulama gibi açılmasını sağlayan dosya.
 * Next bunu otomatik olarak /manifest.webmanifest adresinde yayınlıyor
 * ve sayfaya bağlıyor — ayrıca bir şey yapmaya gerek yok.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sıralama",
    short_name: "Sıralama",
    description: "Gittiğin kahvecileri sırala, arkadaşlarının listesini gör.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f1ec",
    theme_color: "#0e6a5e",
    lang: "tr",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
