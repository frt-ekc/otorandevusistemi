import Image from "next/image";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { getAyarlar } from "@/lib/db";
import { SENDIKALAR, SENDIKA_LOGOLARI } from "@/lib/sendikalar";
import {
  ARAC_TURLERI,
  LASTIK_ADETLERI,
  TAMIR_FIYATI,
  formatTL,
  lastikAdediEtiketi,
  paketHesapla,
  type AracTuru
} from "@/lib/lastikPaketleri";
import TireBadge from "@/components/site/TireBadge";
import MarqueeBand from "@/components/site/MarqueeBand";
import Reveal from "@/components/site/Reveal";
import CountUp from "@/components/site/CountUp";
import SiteFooter from "@/components/site/SiteFooter";
import { OGLE_MOLASI_METNI } from "@/lib/calisma";
import { ADRES_TARIF, ADRES_VARSAYILAN, TELEFON_GORUNEN, TELEFON_LINK, WHATSAPP_LINK, YOL_TARIFI_LINK } from "@/components/site/contact";

export const dynamic = "force-dynamic";

const ADIMLAR = [
  {
    baslik: "Online randevu alın",
    metin: "Araç türünü ve lastik sayısını seçin, fiyatı görün, size uygun saati ayırtın."
  },
  {
    baslik: "Sendika kartınızla gelin",
    metin: "Seçtiğiniz saatte dükkâna gelin; sıra beklemeden aracınızı alalım."
  },
  {
    baslik: "Değişim ve balans",
    metin: "Lastikleriniz sökülüp takılır, balansı yapılır. Patlak lastikse tamir edilir."
  },
  {
    baslik: "Yola çıkın",
    metin: "Ödemeyi dükkânda yaparsınız. Gördüğünüz fiyat, ödediğiniz fiyattır."
  }
];

export default async function HomePage() {
  const ayarlar = await getAyarlar();
  const araclar = Object.keys(ARAC_TURLERI) as AracTuru[];

  return (
    <div className="min-h-screen overflow-x-clip">
      <TopNav />

      <main>
        {/* HERO */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:pb-16 lg:pt-14">
          <div>
            <p className="animate-rise text-sm font-semibold text-brand-gold" style={{ animationDelay: "50ms" }}>
              Malatya · Battalgazi
            </p>
            <h1
              className="mt-4 animate-rise text-[2.6rem] font-extrabold leading-[0.98] text-brand-text sm:text-6xl lg:text-[4.1rem]"
              style={{ animationDelay: "120ms" }}
            >
              Lastik değişimi ve balans,{" "}
              <span className="text-brand-gold">sıra beklemeden.</span>
            </h1>
            <p
              className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-brand-muted sm:text-lg"
              style={{ animationDelay: "200ms" }}
            >
              {SENDIKALAR.join(", ").replace(/, ([^,]*)$/, " ve $1")} üyelerine özel fiyatlar. Randevunuzu alın,
              sıra beklemeden gelin.
            </p>
            <p className="mt-3 animate-rise text-sm text-brand-muted" style={{ animationDelay: "240ms" }}>
              Balans dahil lastik değişimi {formatTL(paketHesapla("degisim", "binek", 1)!.fiyat)}&apos;den başlayan fiyatlarla.{" "}
              <a href="#fiyatlar" className="text-brand-text underline decoration-white/30 underline-offset-4 hover:decoration-brand-gold">
                Fiyat listesi
              </a>
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
              <Link
                href="/randevu"
                className="rounded-full bg-brand-gold px-8 py-4 text-base font-bold text-brand-dark shadow-[0_10px_30px_rgba(250,204,21,0.25)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Randevu al
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-7 py-4 text-base font-semibold text-brand-text transition-colors hover:border-white/30 hover:bg-white/5"
              >
                WhatsApp&apos;tan sor
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg animate-rise grid-cols-3 gap-4 border-t border-white/10 pt-6" style={{ animationDelay: "360ms" }}>
              <div>
                <dt className="text-xs text-brand-muted">Tecrübe</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-brand-text sm:text-3xl">
                  <CountUp to={20} suffix="+ yıl" />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-brand-muted">Balans</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-brand-text sm:text-3xl">Dahil</dd>
              </div>
              <div>
                <dt className="text-xs text-brand-muted">Anlaşmalı sendika</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-brand-text sm:text-3xl">
                  <CountUp to={SENDIKALAR.length} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-rise lg:max-w-none" style={{ animationDelay: "200ms" }}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10">
              <Image
                src="/ototakmasökme.png"
                alt="Fırat Oto Lastik'te lastik değişimi"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/70 via-transparent to-transparent" />
            </div>
            <TireBadge className="absolute -bottom-10 -left-3 w-28 sm:-left-10 sm:w-40" />
          </div>
        </section>

        <MarqueeBand
          items={["Lastik değişimi", "Balans dahil", "Patlak lastik tamiri", "Binek araç", "Pikap ve minibüs", "Sendika üyelerine özel"]}
        />

        {/* ANLAŞMALI KURUMLAR */}
        <section id="kurumlar" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 lg:pt-24">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-tight text-brand-text sm:text-4xl">Anlaşmalı kurumlarımız</h2>
            <p className="mt-4 max-w-xl text-brand-muted">
              Aşağıdaki sendikaların üyeleri özel fiyatlardan yararlanır. Randevu alırken sendikanızı seçmeniz yeterli.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {SENDIKALAR.map((s) => {
                const logo = SENDIKA_LOGOLARI[s];
                return (
                  <li
                    key={s}
                    className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-brand-slate p-5 text-center sm:p-6"
                  >
                    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-24 sm:w-24">
                      {logo ? (
                        <Image src={logo} alt={`${s} logosu`} fill sizes="96px" className="object-contain p-2" />
                      ) : (
                        <span className="font-display text-2xl font-extrabold text-brand-dark">
                          {s
                            .split(/[\s-]+/)
                            .filter((k) => k && k !== "Sendikası")
                            .slice(0, 2)
                            .map((k) => k[0])
                            .join("")}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold leading-snug text-brand-text">{s}</span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 text-sm text-brand-muted">
              Randevu almak için önce hizmet seçiniz, ardından araç ve lastik sayısını belirleyip size uygun saati ayırtınız.{" "}
              <Link href="/randevu" className="font-semibold text-brand-gold underline-offset-4 hover:underline">
                Hemen randevu al →
              </Link>
            </p>
          </Reveal>
        </section>

        {/* FİYATLAR */}
        <section id="fiyatlar" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-3xl font-extrabold leading-tight text-brand-text sm:text-4xl">Fiyat listesi</h2>
                <p className="mt-4 text-brand-muted">
                  Fiyatlara balans dahildir. Ödemeyi işlem sonrası dükkânda yaparsınız.
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {SENDIKALAR.map((s) => (
                  <li key={s} className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-brand-muted">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-brand-slate">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-brand-muted">
                    <th scope="col" className="px-5 py-3 font-medium sm:px-8">Hizmet</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium sm:px-8">Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {araclar.flatMap((arac) =>
                    LASTIK_ADETLERI.map((adet) => {
                      const p = paketHesapla("degisim", arac, adet)!;
                      return (
                        <tr key={`${arac}-${adet}`}>
                          <th scope="row" className="px-5 py-4 font-normal sm:px-8">
                            <span className="block font-semibold text-brand-text">
                              {ARAC_TURLERI[arac].ad} · {lastikAdediEtiketi(adet).toLocaleLowerCase("tr-TR")}
                            </span>
                            <span className="text-sm text-brand-muted">
                              {ARAC_TURLERI[arac].aciklama} · {p.balansAdedi} balans dahil
                            </span>
                          </th>
                          <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-brand-text sm:px-8">
                            {formatTL(p.fiyat)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                  <tr>
                    <th scope="row" className="px-5 py-4 font-normal sm:px-8">
                      <span className="block font-semibold text-brand-text">Patlak lastik tamiri</span>
                      <span className="text-sm text-brand-muted">Binek ve ticari araçlar</span>
                    </th>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-brand-text sm:px-8">
                      {formatTL(TAMIR_FIYATI)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-brand-muted">Fiyatlar anlaşmalı sendika üyeleri içindir.</p>
              <Link
                href="/randevu"
                className="rounded-full bg-brand-gold px-6 py-3.5 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5"
              >
                Randevu al
              </Link>
            </div>
          </Reveal>
        </section>

        {/* NASIL ÇALIŞIR */}
        <section className="border-y border-white/10 bg-[#171614]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Reveal>
              <h2 className="max-w-xl text-3xl font-extrabold leading-tight text-brand-text sm:text-5xl">
                Randevudan yola dört adım
              </h2>
            </Reveal>
            <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {ADIMLAR.map((a, i) => (
                <li key={a.baslik} className="bg-[#171614] p-6 sm:p-8">
                  <Reveal delay={i * 100}>
                    <span className="font-display text-5xl font-extrabold text-brand-gold/90">{i + 1}</span>
                    <h3 className="mt-5 text-lg font-bold text-brand-text">{a.baslik}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">{a.metin}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* KONUM */}
        <section id="konum" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-stretch">
            <Reveal>
              <div className="flex h-full flex-col">
                <h2 className="text-3xl font-extrabold leading-tight text-brand-text sm:text-5xl">Dükkânımız</h2>
                <p className="mt-4 text-lg text-brand-text">{ayarlar?.adres ?? ADRES_VARSAYILAN}</p>
                <p className="text-brand-muted">{ADRES_TARIF}</p>

                <dl className="mt-8 space-y-3 border-t border-white/10 pt-6">
                  <div className="flex justify-between gap-4"><dt className="text-brand-muted">Hafta içi</dt><dd className="font-semibold">{ayarlar?.hafta_ici ?? "09:00 - 18:00"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-brand-muted">Cumartesi</dt><dd className="font-semibold">{ayarlar?.cumartesi ?? "09:00 - 16:00"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-brand-muted">Pazar</dt><dd className="font-semibold">{ayarlar?.pazar ?? "Kapalı"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-brand-muted">Öğle arası</dt><dd className="font-semibold">{OGLE_MOLASI_METNI}</dd></div>
                </dl>

                <div className="mt-8 flex flex-wrap gap-3 lg:mt-auto lg:pt-8">
                  <a
                    href={YOL_TARIFI_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-brand-gold px-6 py-3.5 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5"
                  >
                    Yol tarifi al
                  </a>
                  <a
                    href={TELEFON_LINK}
                    className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-brand-text transition-colors hover:bg-white/5"
                  >
                    {ayarlar?.telefon ?? TELEFON_GORUNEN}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-[320px] overflow-hidden rounded-3xl border border-white/10 lg:h-full lg:min-h-[420px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d787.9482594645065!2d38.31385462923506!3d38.35730500000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDIxJzI2LjMiTiAzOMKwMTgnNTEuMiJF!5e0!3m2!1str!2str!4v1707865000000!5m2!1str!2str"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(0.4) contrast(1.05)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Fırat Oto Lastik konumu"
                />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter ayarlar={ayarlar} />
    </div>
  );
}
