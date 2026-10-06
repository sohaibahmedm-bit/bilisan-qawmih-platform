import { NextResponse } from "next/server";
import { reviewerFor } from "@/lib/reviewStore";
export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const url = new URL("/review", req.url);
  if (!reviewerFor(token)) { url.searchParams.set("e", "1"); return NextResponse.redirect(url, 303); }
  const res = NextResponse.redirect(url, 303);
  res.cookies.set("bq_review", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 3 });
  return res;
}
export async function DELETE() { const r = NextResponse.json({ ok: true }); r.cookies.delete("bq_review"); return r; }
