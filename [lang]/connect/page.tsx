import { notFound } from "next/navigation";
import { isLang } from "@/lib/content";
import { t, COUNTRIES } from "@/lib/i18n";
import Nav from "@/components/Nav";
import MosqueFinder from "@/components/MosqueFinder";
export const dynamic = "force-dynamic";
export default async function Connect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLang(lang)) notFound();
  const s = t(lang);
  return (<main lang={lang}><Nav lang={lang} />
    <section className="card"><h1>{s.daiTitle}</h1><p>{s.daiBody}</p></section>
    <section className="card"><h2>{s.mosques}</h2><MosqueFinder label={s.findMosques} note={s.osmNote} countries={COUNTRIES[lang]} /></section>
  </main>);
}
