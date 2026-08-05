import { getVersionList } from "@/lib/almatsurat";

const SITE_URL = "https://almatsurat-zeta.vercel.app";

export default function sitemap() {
  const versions = getVersionList();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...versions.map((version) => ({
      url: `${SITE_URL}/${version.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
