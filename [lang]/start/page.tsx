import { notFound } from "next/navigation";
import { isLang, getUnits, STATIONS } from "@/lib/content";
import { t, COUNTRIES } from "@/lib/i18n";
import StartFlow from "@/components/StartFlow";
export const dynamic = "force-dynamic";
export default async function Start({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLang(lang)) notFound();
  const units = await getUnits(lang);
  // entry point per station = first visible unit of that station
  const entries = STATIONS.map((s) => ({ station: s, unit: units.find((u) => u.station === s)?.id ?? null }));
  return <main lang={lang}><StartFlow lang={lang} s={t(lang)} countries={COUNTRIES[lang]} entries={entries} /></main>;
}
