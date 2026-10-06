import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, getUnits, STATIONS, PREVIEW } from "@/lib/content";
import { t } from "@/lib/i18n";
import Nav from "@/components/Nav";
export const dynamic = "force-dynamic";
export default async function Journey({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLang(lang)) notFound();
  const s = t(lang), units = await getUnits(lang);
  return (<main lang={lang}><Nav lang={lang} />{PREVIEW && <div className="draft">{s.draft}</div>}
    <h1>{s.journey}</h1>
    {units.length === 0 && <p className="notice">{s.empty}</p>}
    <ol className="stations">{STATIONS.map((st) => (<li key={st}><h3 style={{ margin: "4px 0" }}>{s.stations[st]}</h3>
      <ul>{units.filter((u) => u.station === st).map((u) => <li key={u.id}><Link href={`/${lang}/unit/${u.id}`}>{u.title[lang]}</Link></li>)}</ul>
      {st === "shahada" && <Link className="btn ghost" href={`/${lang}/connect`}>{s.connect}</Link>}</li>))}</ol>
  </main>);
}
