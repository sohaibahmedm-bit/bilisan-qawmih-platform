import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { reviewerFor } from "@/lib/reviewStore";
import { reviewItem } from "@/lib/content";
import ReviewPanel from "@/components/ReviewPanel";
import Chip from "@/components/Chip";
export const dynamic = "force-dynamic";

export default async function ReviewItem({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const who = reviewerFor((await cookies()).get("bq_review")?.value);
  if (!who) redirect("/review");
  const { id } = await params;
  const r = await reviewItem(id); if (!r) notFound();
  const sp = await searchParams;
  const def = who.role === "linguist" ? who.langs[0] : "ar";
  const lang = (["ar", "sw", "ha"].includes(sp.lang ?? "") ? sp.lang : def) as "ar" | "sw" | "ha";
  const src: any = r.unit ?? r.faq;
  const fields: { field: string; ar: string; local: string }[] = r.unit
    ? [{ field: "title", ar: r.unit.title.ar, local: r.unit.title[lang] }, ...r.unit.body.ar.map((p, i) => ({ field: `body.${i}`, ar: p, local: r.unit!.body[lang][i] }))]
    : [{ field: "q", ar: r.faq!.q.ar, local: r.faq!.q[lang] }, { field: "a", ar: r.faq!.a.ar, local: r.faq!.a[lang] }];
  const canEdit = (who.role === "sharia" && lang === "ar") || (who.role === "linguist" && who.langs.includes(lang));
  const canJudge = who.role === "sharia" || (who.langs.includes(lang) && lang !== "ar");
  return (<main>
    <p><Link href="/review">← Review</Link></p>
    <h1 dir="rtl">{src.title?.ar ?? src.q.ar}</h1>
    <p className="muted">{id} · level {src.level} · {(["ar", "sw", "ha"] as const).map((l) => <span key={l} style={{ marginInlineEnd: 12 }}><Link href={`?lang=${l}`} style={{ fontWeight: l === lang ? 800 : 400 }}>{l.toUpperCase()}</Link> <Chip s={r.state[l]} /></span>)}</p>
    {src.review_flags?.length > 0 && <div className="card"><strong>Flags · ملاحظات للمراجع</strong><ul>{src.review_flags.map((f: string) => <li key={f}>{f}</li>)}</ul></div>}
    <details className="card"><summary>Sources · المصادر</summary><ul>{src.sources.map((s: string) => <li key={s}>{s}</li>)}</ul>{src.bayyinat_match && <p className="muted">{src.bayyinat_match}</p>}</details>
    <ReviewPanel item={id} lang={lang} fields={fields} canEdit={canEdit} canJudge={canJudge} />
    {r.unit && <details className="card"><summary>Quiz · أسئلة الفهم</summary>{r.unit.quiz.map((q, i) => <div key={i}><p dir="rtl">{q.q.ar} — <strong>{q.options.ar[q.answer]}</strong></p>{lang !== "ar" && <p>{q.q[lang]} — <strong>{q.options[lang][q.answer]}</strong></p>}</div>)}<p className="muted">Quiz edits: request changes with a note.</p></details>}
    <section className="card"><h2>History · السجل</h2>{r.events.length === 0 ? <p className="muted">—</p> :
      <ul>{r.events.map((e, i) => <li key={i}><code>{e.at.slice(0, 16).replace("T", " ")}</code> · {e.lang.toUpperCase()} · {e.reviewer} · <strong>{e.action}</strong>{e.field ? ` (${e.field})` : ""}{e.note ? ` — ${e.note}` : ""}</li>)}</ul>}</section>
  </main>);
}
