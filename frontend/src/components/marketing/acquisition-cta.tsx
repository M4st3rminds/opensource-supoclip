import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function AcquisitionCta({ slug, locale }: { slug: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "seo.conversion" });
  const pro = { priceMonthly: 9, minuteLimit: 600, resolution: 720 };
  return (
    <section aria-labelledby="start-your-workflow" className="mt-14 rounded-2xl border bg-muted/25 p-6 sm:p-8">
      <h2 id="start-your-workflow" className="text-2xl font-bold tracking-tight">{t(`${slug}.title`)}</h2>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{t(`${slug}.body`)}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-semibold">{t("hostedTitle")}</h3>
          <p className="text-sm leading-7 text-muted-foreground">{t("hostedBody", { price: pro.priceMonthly, hours: pro.minuteLimit / 60, resolution: pro.resolution })}</p>
          <Link href="/" className="inline-flex rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background">{t(`${slug}.button`)}</Link>
          <Link href="/" className="ml-4 inline-block text-sm font-medium underline underline-offset-4">{t("plans")}</Link>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">{t("selfHostTitle")}</h3>
          <p className="text-sm leading-7 text-muted-foreground">{t("selfHostBody")}</p>
          <Link href="/blog/self-host-supoclip-docker" className="inline-flex rounded-lg border px-5 py-3 text-sm font-semibold">{t("selfHostButton")}</Link>
        </div>
      </div>
    </section>
  );
}
