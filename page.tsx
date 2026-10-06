import Link from "next/link";
import { t } from "@/lib/i18n";
export default function Home() {
  const ar = t("ar");
  return (<main>
    <p className="muted" dir="rtl">{ar.brand} — {ar.tagline}</p>
    <h1>Bilisan Qawmih</h1>
    <div className="grid">
      <Link className="choice" href="/sw/start" lang="sw"><strong>Kiswahili</strong><br /><span className="muted">{t("sw").tagline}</span></Link>
      <Link className="choice" href="/ha/start" lang="ha"><strong>Hausa</strong><br /><span className="muted">{t("ha").tagline}</span></Link>
    </div>
    <p className="notice" lang="sw">{t("sw").aiNotice}</p>
    <p className="notice" lang="ha">{t("ha").aiNotice}</p>
    <p className="notice" dir="rtl">{ar.aiNotice} {ar.judges}</p>
  </main>);
}
