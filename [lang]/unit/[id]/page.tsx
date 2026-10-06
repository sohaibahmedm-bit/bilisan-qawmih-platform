import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, getUnit, getUnits, segments, PREVIEW, type Lang } from "@/lib/content";
import { t } from "@/lib/i18n";
import Nav from "@/components/Nav";
import Quiz from "@/components/Quiz";
import ArabicToggle from "@/components/ArabicToggle";

export const dynamic = "force-dynamic";

function Para({ text, lang, s }: { text: string; lang: Lang; s: ReturnType<typeof t> }) {
  return (<>{segments(text, lang).map((seg, i) => {
    if (seg.kind === "text") return <p key={i}>{seg.text}</p>;
    if (seg.kind === "shahada") return (<div key={i} className="shahada"><div className="ar" lang="ar">{seg.ar}</div><div className="muted">{seg.translit}</div></div>);
    if (seg.missing) return <div key={i} className="quran muted">[{seg.ref}] {s.verseMissing}</div>;
    return (<blockquote key={i} className="quran"><div className="ar" lang="ar">{seg.ar}</div><div>{seg.local}</div>
      <div className="cite">{s.translation} {seg.translator} — [{seg.ref}]</div></blockquote>);
  })}</>);
}

export default async function UnitPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params; if (!isLang(lang)) notFound();
  const u = await getUnit(lang, id); if (!u) notFound();
  const s = t(lang), list = await getUnits(lang), i = list.findIndex((x) => x.id === id);
  const prev = list[i - 1], next = list[i + 1];
  const arabic = u.body.ar.map((p) => p.replace(/\[\[[^\]]+\]\]/g, "").trim()).filter(Boolean);
  return (<main lang={lang}><Nav lang={lang} />{PREVIEW && <div className="draft">{s.draft}</div>}
    <p className="muted">{s.stations[u.station as keyof typeof s.stations]} · {u.order} / {list.length}</p>
    <h1>{u.title[lang]}</h1>
    <ArabicToggle label={s.showArabic} title={u.title.ar} paragraphs={arabic}>
      {u.body[lang].map((p, k) => <Para key={k} text={p} lang={lang} s={s} />)}
    </ArabicToggle>
    <section className="card"><h2>{s.quiz}</h2><Quiz items={u.quiz.map((q) => ({ q: q.q[lang], options: q.options[lang], answer: q.answer }))} ok={s.correct} ko={s.wrong} /></section>
    <details className="muted"><summary>{s.sources}</summary><ul>{u.sources.map((x) => <li key={x}>{x}</li>)}</ul></details>
    <div className="row">{prev ? <Link className="btn ghost" href={`/${lang}/unit/${prev.id}`}>{s.prevUnit}</Link> : <span />}
      {next ? <Link className="btn" href={`/${lang}/unit/${next.id}`}>{s.nextUnit}</Link> : <Link className="btn" href={`/${lang}/connect`}>{s.connect}</Link>}</div>
  </main>);
}
