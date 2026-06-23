import { notFound } from "next/navigation";
import VersionScreen from "@/components/version-screen";
import { getCollection, getTheme, getVersionList } from "@/lib/almatsurat";

export function generateStaticParams() {
  return getVersionList().map((version) => ({ version: version.slug }));
}

export async function generateMetadata({ params }) {
  const { version } = await params;
  const theme = getTheme(version);
  return {
    title: `${theme.label} | Almatsurat Web`,
    description: theme.subtitle,
  };
}

export default async function VersionPage({ params }) {
  const { version } = await params;
  const data = getCollection(version);
  if (!data) {
    notFound();
  }

  const theme = getTheme(version);
  return <VersionScreen data={data} theme={theme} />;
}
