import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addEvent, reviewerFor, type Action } from "@/lib/reviewStore";
import { reviewItem } from "@/lib/content";

const markers = (t: string) => (t.match(/\[\[[^\]]+\]\]/g) || []).sort().join("|");
const HOOKS = /[ɓɗƙƴƁƊƘƳ]/;

export async function POST(req: Request) {
  const who = reviewerFor((await cookies()).get("bq_review")?.value);
  if (!who) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const b = await req.json() as { item: string; lang: "ar" | "sw" | "ha"; action: Action; field?: string; after?: string; note?: string };
  if (!["approve", "reject", "edit"].includes(b.action)) return NextResponse.json({ error: "bad action" }, { status: 400 });

  // Permissions: sharia reviewer = Arabic source + meaning of every language; linguist = own language only, never Arabic.
  if (who.role === "linguist" && (b.lang === "ar" || !who.langs.includes(b.lang)))
    return NextResponse.json({ error: "not allowed for this language" }, { status: 403 });
  if (b.action === "edit" && who.role === "sharia" && b.lang !== "ar")
    return NextResponse.json({ error: "local-language edits are made by the native reviewer" }, { status: 403 });
  if (b.action === "reject" && !b.note?.trim()) return NextResponse.json({ error: "a reason is required" }, { status: 400 });

  const cur = await reviewItem(b.item);
  if (!cur) return NextResponse.json({ error: "unknown item" }, { status: 404 });

  let before: string | undefined;
  if (b.action === "edit") {
    if (!b.field || b.after == null || !b.note?.trim()) return NextResponse.json({ error: "field, text and reason are required" }, { status: 400 });
    const [f, idx] = b.field.split(".");
    const src: any = cur.unit ?? cur.faq;
    before = f === "body" ? src.body?.[b.lang]?.[Number(idx)] : src[f]?.[b.lang];
    if (before == null) return NextResponse.json({ error: "unknown field" }, { status: 400 });
    // Qur'an / Shahada markers must survive any edit unchanged (verses are never typed by hand).
    if (markers(before) !== markers(b.after)) return NextResponse.json({ error: "Qur'an/Shahada markers [[...]] must stay exactly as they are" }, { status: 422 });
    if (b.lang === "ha" && HOOKS.test(before) && !HOOKS.test(b.after)) return NextResponse.json({ error: "Hausa hooked letters (ɓ ɗ ƙ ƴ) were lost" }, { status: 422 });
  }
  await addEvent({ item: b.item, lang: b.lang, role: who.role, reviewer: who.name, action: b.action, field: b.field, before, after: b.after, note: b.note, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
