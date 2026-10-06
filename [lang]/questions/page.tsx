import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, getFaq, segments, PREVIEW } from "@/lib/content";
import { t } from "@/lib/i18n";
import Nav from "@/components/Nav";
export const dynamic = "force-dynamic";
export default async function Questions({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isLang(lang)) notFound();
  const s = t(lang), faq = await getFaq(lang);
  return (<main lang={lang}><Nav lang={lang} />{PREVIEW && <div className="draft">{s.draft}</div>}
    <h1>{s.questions}</h1>{faq.length === 0 && <p className="notice">{s.empty}</p>}
    {faq.map((f) => (<details key={f.id} className="card"><summary><strong>{f.q[lang]}</strong></summary>
      {segments(f.a[lang], lang).map((seg, i) => seg.kind === "text" ? <p key={i}>{seg.text}</p>
        : seg.kind === "quran" && !seg.missing ? <blockquote key={i} className="quran"><div className="ar" lang="ar">{seg.ar}</div><div>{seg.local}</div><div className="cite">{s.translation} {seg.translator} — [{seg.ref}]</div></blockquote>
        : seg.kind === "quran" ? <div key={i} className="quran muted">[{seg.ref}] {s.verseMissing}</div> : null)}
      <p className="muted">{f.linked_units.map((u) => <Link key={u} href={`/${lang}/unit/${u}`} style={{ marginInlineEnd: 10 }}>→ {u}</Link>)}
        · <Link href={`/${lang}/connect`}>{s.connect}</Link></p>
      <details className="muted"><summary>{s.sources}</summary>{f.sources.map((x) => <div key={x}>{x}</div>)}</details>
      <details className="muted" lang="ar" dir="rtl"><summary>العربية</summary><p><strong>{f.q.ar}</strong></p><p>{f.a.ar.replace(/\[\[[^\]]+\]\]/g, "")}</p></details>
    </details>))}
  </main>);
}
