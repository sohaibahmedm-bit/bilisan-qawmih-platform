import Link from "next/link";
import { cookies } from "next/headers";
import { reviewerFor, STORE } from "@/lib/reviewStore";
import { reviewBoard } from "@/lib/content";
import Chip from "@/components/Chip";
export const dynamic = "force-dynamic";
export const metadata = { title: "Review | بلسان قومه", robots: { index: false } };

export default async function Review({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const who = reviewerFor((await cookies()).get("bq_review")?.value);
  const { e } = await searchParams;
  if (!who) return (<main><h1>Review · المراجعة</h1>
    <form className="card" method="post" action="/api/review/login">
      <label>Reviewer code · رمز المراجع<br /><input name="token" type="password" className="choice" required autoComplete="off" /></label>
      <div className="row"><span />{e && <span style={{ color: "var(--warn)" }}>Invalid code · رمز غير صحيح</span>}<button className="btn">Sign in · دخول</button></div>
    </form>
    {!process.env.REVIEW_TOKENS && <p className="notice">Local demo codes: <code>demo-sharia</code>, <code>demo-sw</code>, <code>demo-ha</code> (disabled on the live site).</p>}
  </main>);
  const board = await reviewBoard();
  const count = (l: "ar" | "sw" | "ha") => board.filter((b) => b.state[l] === "approved").length;
  return (<main><h1>Review · المراجعة</h1>
    <p className="muted">{who.name} — {who.role === "sharia" ? "Sharia reviewer · المراجع الشرعي" : `Native reviewer · المراجع اللغوي (${who.langs.join(", ")})`} · store: {STORE}</p>
    <p className="notice">A text goes live only when its Arabic source is approved by the sharia reviewer AND the local text is approved by both the sharia and native reviewers. Any edit resets approvals.<br />
      لا يُنشر نص إلا باعتماد المصدر العربي من المراجع الشرعي، واعتماد النص المحلي من المراجعَين الشرعي واللغوي. أي تعديل يُسقط الاعتماد السابق.</p>
    <p><strong>Approved · المعتمد:</strong> AR {count("ar")}/{board.length} · SW {count("sw")}/{board.length} · HA {count("ha")}/{board.length}</p>
    <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr><th style={{ textAlign: "start" }}>Item</th><th>AR</th><th>SW</th><th>HA</th></tr></thead>
      <tbody>{board.map((b) => (<tr key={b.id} style={{ borderTop: "1px solid var(--line)" }}>
        <td style={{ padding: "8px 4px" }}><Link href={`/review/${b.id}`}>{b.id}</Link> <span dir="rtl">{b.title.ar}</span></td>
        {(["ar", "sw", "ha"] as const).map((l) => <td key={l} align="center"><Link href={`/review/${b.id}?lang=${l}`}><Chip s={b.state[l]} /></Link></td>)}
      </tr>))}</tbody></table></div>
  </main>);
}
