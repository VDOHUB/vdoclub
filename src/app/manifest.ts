import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VDO CLUB",
    short_name: "VDO CLUB",
    description: "A ponte entre arquitetos e fornecedores",
    lang: "pt-BR",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#1a0e05",
    theme_color: "#1a0e05",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
