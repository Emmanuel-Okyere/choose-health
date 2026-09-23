import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, Flame, HandHeart, Leaf, MapPin, Phone, Smartphone, Truck } from "lucide-react";
import { RestockTicker } from "@/components/RestockTicker";
import { ProductCatalog } from "@/components/ProductCatalog";
import { WhatsAppIcon } from "@/components/WhatsAppFab";
import { ContactWhatsApp } from "@/components/ContactWhatsApp";
import { getPosts, getProducts } from "@/lib/queries";
import { site, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, posts] = await Promise.all([getProducts(), getPosts()]);

  return (
    <main>
      <RestockTicker />
      <Hero />
      <TrustStrip />

      <section id="shop" className="scroll-mt-14 py-8 md:scroll-mt-20 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="The shop"
            title="Fresh on the shelf"
            intro="Hand-picked spices, detox powders, balms, nuts and seeds. Add to your basket and pay with Mobile Money or cash at pickup."
          />
          <ProductCatalog products={products} />
        </div>
      </section>

      <Wholesale />
      <About />

      <section className="py-8 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Remedies & wisdom"
              title="From the retreat journal"
              intro="Practical, gentle guidance on everyday health — body, mind and spirit."
            />
            <Link href="/remedies" className="mb-5 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-leaf-dark transition-all hover:gap-2.5 md:mb-10 md:text-base">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Swipeable on phones, grid from md up */}
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
            {posts.slice(0, 3).map((post, i) => (
              <Link
                key={post.slug}
                href={`/remedies/${post.slug}`}
                className={`group flex w-[78%] shrink-0 snap-start flex-col rounded-2xl p-5 transition hover:-translate-y-0.5 md:w-auto md:rounded-3xl md:p-7 ${
                  ["bg-forest text-cream", "bg-kente/20 text-ink", "bg-sand text-ink"][i % 3]
                }`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-widest md:text-xs ${i === 0 ? "text-leaf-light" : "text-leaf-dark"}`}>
                  {post.category}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug md:mt-3 md:text-2xl">{post.title}</h3>
                <p className={`mt-2 line-clamp-3 text-sm leading-relaxed md:mt-3 ${i === 0 ? "text-cream/75" : "text-muted"}`}>{post.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold md:pt-6">
                  Read · {post.readMinutes} min <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-14 pb-8 md:scroll-mt-20 md:pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-2 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] md:gap-10">
          <SectionHeading
            eyebrow="Contact us"
            title="Questions? Just ask."
            intro="Consultations, product questions, wholesale or delivery — send us a message and we'll reply on WhatsApp, usually the same day (Mon–Thu)."
          />
          <ContactWhatsApp />
        </div>
      </section>

      <Visit />
    </main>
  );
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mb-5 max-w-2xl md:mb-10">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-dark md:text-sm">
        <Leaf className="h-3.5 w-3.5 md:h-4 md:w-4" /> {eyebrow}
      </p>
      <h2 className="mt-1.5 font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-forest md:mt-3 md:text-5xl">{title}</h2>
      {intro && <p className="mt-2 text-sm leading-relaxed text-muted md:mt-4 md:text-lg">{intro}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section className="paper-grain relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-6 pt-6 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pb-20 md:pt-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-leaf-dark shadow-sm md:px-3.5 md:py-1.5 md:text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cayenne" /> Restocked this week
          </p>
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-forest sm:text-6xl md:mt-6 lg:text-7xl">
            Choose Health.
            <br />
            <span className="italic text-leaf-dark">Choose Life.</span>
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink/75 md:mt-6 md:text-lg">
            Natural remedies, pure spices and wholesome nuts & seeds — hand-picked by naturopath{" "}
            <strong className="text-forest">{site.doctor.name}</strong> and ready for pickup in Awoshie, Accra.
          </p>

          {/* Phone-only doctor card (the big portrait is desktop-only) */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/85 p-2.5 pr-3 shadow-sm ring-1 ring-sand md:hidden">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-leaf/40">
              <Image src={site.doctor.photo} alt={site.doctor.name} fill sizes="56px" className="object-cover object-top" priority />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-semibold text-forest">{site.doctor.name}</p>
              <p className="text-xs text-muted">Lead naturopath · Mon–Thu 9–5</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-cayenne px-2 py-1 text-[10px] font-bold uppercase text-white">
              <Flame className="h-3 w-3" /> New stock
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 md:mt-8 md:flex md:flex-wrap md:gap-3">
            <Link href="#shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-semibold text-cream shadow-lg shadow-forest/20 hover:bg-forest-deep md:px-6 md:py-3.5 md:text-base">
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink("Hello! I'd like to book a consultation with ND William Owusu.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest/15 bg-white px-4 py-3 text-sm font-semibold text-forest hover:border-forest/40 md:px-6 md:py-3.5 md:text-base"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366] md:h-5 md:w-5" /> <span>Consult<span className="hidden md:inline">ation</span></span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-sm md:block">
          {/* Arched "doorway" portrait */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border-[10px] border-white bg-leaf/20 shadow-2xl">
            <Image
              src={site.doctor.photo}
              alt={`${site.doctor.name}, ${site.doctor.title}`}
              fill
              priority
              sizes="380px"
              className="object-cover object-top"
            />
          </div>
          <div className="absolute -left-10 bottom-16 rounded-2xl bg-white px-4 py-3 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Lead naturopath</p>
            <p className="font-display text-lg font-semibold text-forest">{site.doctor.name}</p>
          </div>
          <div className="absolute -right-8 top-10 rotate-3 rounded-2xl bg-cayenne px-4 py-3 text-white shadow-xl">
            <p className="flex items-center gap-1.5 font-display text-lg font-semibold leading-tight">
              RESTOCKED! <Flame className="h-5 w-5 fill-kente text-kente" aria-hidden="true" />
            </p>
            <p className="text-xs text-white/85">Cayenne · Turmeric · Charcoal</p>
          </div>
          <div className="absolute -bottom-5 right-6 flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm text-cream shadow-lg">
            <Clock className="h-4 w-4 text-kente" /> Mon–Thu · 9–5
          </div>
        </div>
      </div>
      <div className="kente-stripe" />
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Leaf, title: "Natural goodness", text: "Pure spices, powders, nuts & seeds" },
    { icon: BadgeCheck, title: "Trusted brands", text: "Badia, Aman-Rock, Skinner's & more" },
    { icon: Smartphone, title: "MoMo accepted", text: "Or pay cash when you pick up" },
    { icon: Truck, title: "Pickup & delivery", text: "Collect in Awoshie or we send it" },
  ];
  return (
    <section className="border-b border-sand bg-white">
      {/* Swipeable chips on phones, 4-column row from md up */}
      <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 md:grid md:grid-cols-4 md:gap-6 md:py-8">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex shrink-0 items-center gap-2 rounded-full bg-cream px-3 py-1.5 md:items-start md:gap-3 md:rounded-none md:bg-transparent md:p-0">
            <span className="text-leaf-dark md:rounded-2xl md:bg-cream md:p-2.5">
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
            </span>
            <div>
              <p className="whitespace-nowrap text-xs font-semibold text-forest md:text-base">{title}</p>
              <p className="hidden text-sm text-muted md:block">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Wholesale() {
  const seeds = ["Chia", "Flax", "Cashew", "Tiger nuts", "Groundnuts", "Pumpkin seeds", "Sesame", "Almonds"];
  return (
    <section id="wholesale" className="scroll-mt-14 px-4 sm:px-6 md:scroll-mt-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-forest px-5 py-7 text-cream sm:px-14 md:rounded-[2.5rem] md:py-14">
        <svg className="absolute -right-10 -top-10 h-44 w-44 text-leaf/25 md:h-72 md:w-72" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 95C20 80 18 35 58 10c22 25 17 62-8 85Z" fill="currentColor" />
        </svg>
        <div className="relative grid gap-5 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-kente md:text-sm">Wholesale & bulk</p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight md:mt-3 md:text-5xl">
              All nuts & seeds, available in bulk.
            </h2>
            <p className="mt-2 max-w-lg text-sm text-cream/75 md:mt-4 md:text-lg">
              Stocking a shop, running a juice bar, or feeding a big family? Ask for our wholesale price list —
              we&apos;ll reply on WhatsApp.
            </p>
          </div>
          <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:gap-2.5 md:overflow-visible md:px-0">
            {seeds.map((s) => (
              <li key={s} className="shrink-0 rounded-full border border-cream/25 bg-forest-deep/40 px-3 py-1.5 text-xs font-medium md:px-4 md:py-2 md:text-sm">
                {s}
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink("Hello! Please send me your wholesale price list for nuts & seeds.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-kente px-6 py-3 text-sm font-semibold text-forest-deep hover:brightness-105 md:col-start-1 md:row-start-2 md:w-fit md:py-3.5 md:text-base"
          >
            <WhatsAppIcon /> Get wholesale prices
          </a>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-14 py-8 md:scroll-mt-20 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-5 px-4 sm:px-6 md:grid-cols-[1fr_1.3fr] md:gap-14">
        <div className="relative mx-auto hidden w-full max-w-xs md:block">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-full bg-kente/40" />
          <div className="relative aspect-square overflow-hidden rounded-full border-8 border-white shadow-xl">
            <Image src={site.doctor.photo} alt={site.doctor.name} fill sizes="320px" className="object-cover" />
          </div>
        </div>
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-dark md:text-sm">
            <HandHeart className="h-3.5 w-3.5 md:h-4 md:w-4" /> Meet your naturopath
          </p>
          <div className="mt-3 flex items-center gap-4 md:mt-0 md:block">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md md:hidden">
              <Image src={site.doctor.photo} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-forest md:mt-3 md:text-5xl">
                {site.doctor.name}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-leaf-dark md:mt-1 md:text-lg">
                {site.doctor.title}
                <span className="hidden md:inline"> · {site.legalName}</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/75 md:mt-6 md:text-lg">
            At the Natural Health Retreat Reform Center we believe healing starts at home — on your plate, in your
            daily habits and in a peaceful heart. ND William Owusu combines naturopathic care, nutrition and
            prayerful support to help families across Accra live well, naturally.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-sand pt-5 text-center md:mt-8 md:gap-4 md:pt-8">
            {[
              ["Consultations", "Book on WhatsApp"],
              ["Remedies", "Herbs & spices"],
              ["Whole person", "Body · mind · spirit"],
            ].map(([a, b]) => (
              <div key={a}>
                <p className="font-display text-sm font-semibold text-forest md:text-lg">{a}</p>
                <p className="text-xs text-muted md:text-sm">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Visit() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.address.mapQuery)}&output=embed`;
  return (
    <section id="visit" className="paper-grain scroll-mt-14 py-8 md:scroll-mt-20 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2 md:gap-10">
        <div>
          <SectionHeading eyebrow="Visit the retreat" title="Come say hello" />
          <div className="space-y-4 md:space-y-6">
            <div className="flex gap-3 md:gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cayenne md:mt-1 md:h-6 md:w-6" />
              <div>
                <p className="font-display font-semibold text-forest md:text-xl">
                  {site.address.line1}, {site.address.line2}
                </p>
                <p className="text-sm text-muted md:text-base">{site.address.city}</p>
              </div>
            </div>
            <div className="flex gap-3 md:gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cayenne md:mt-1 md:h-6 md:w-6" />
              <div className="space-y-1 text-sm md:text-base">
                {site.hours.map((h) => (
                  <p key={h.days}>
                    <span className="font-semibold text-forest">{h.days}:</span> <span className="text-muted">{h.time}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5 md:mt-8 md:gap-3">
            {site.phones.map((p, i) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold md:px-5 md:py-4 md:text-base ${
                  i === 0 ? "bg-forest text-cream hover:bg-forest-deep" : "bg-white text-forest ring-1 ring-forest/15 hover:ring-forest/40"
                }`}
              >
                <Phone className="h-4 w-4 md:h-5 md:w-5" /> {p.display}
              </a>
            ))}
            <a
              href={site.whatsapp.catalog}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:brightness-95 md:py-4 md:text-base"
            >
              <WhatsAppIcon /> Browse our WhatsApp catalogue
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border-4 border-white shadow-xl md:rounded-[2rem] md:border-8">
          <iframe
            title="Map to Natural Health Retreat, Awoshie"
            src={mapSrc}
            className="h-56 w-full md:h-full md:min-h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
