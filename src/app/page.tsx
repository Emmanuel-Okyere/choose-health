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

      <section id="shop" className="scroll-mt-20 py-20">
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

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Remedies & wisdom"
              title="From the retreat journal"
              intro="Practical, gentle guidance on everyday health — body, mind and spirit."
            />
            <Link href="/remedies" className="mb-10 inline-flex items-center gap-1.5 font-semibold text-leaf-dark hover:gap-2.5 transition-all">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((post, i) => (
              <Link
                key={post.slug}
                href={`/remedies/${post.slug}`}
                className={`group flex flex-col rounded-3xl p-7 transition hover:-translate-y-0.5 ${
                  ["bg-forest text-cream", "bg-kente/20 text-ink", "bg-sand text-ink"][i % 3]
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-widest ${i === 0 ? "text-leaf-light" : "text-leaf-dark"}`}>
                  {post.category}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-snug">{post.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${i === 0 ? "text-cream/75" : "text-muted"}`}>{post.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold">
                  Read · {post.readMinutes} min <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr]">
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
    <div className="mb-10 max-w-2xl">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-leaf-dark">
        <Leaf className="h-4 w-4" /> {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section className="paper-grain relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-leaf-dark shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cayenne" /> Restocked this week
          </p>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-forest sm:text-6xl lg:text-7xl">
            Choose Health.
            <br />
            <span className="italic text-leaf-dark">Choose Life.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/75">
            Natural remedies, pure spices and wholesome nuts & seeds — hand-picked by naturopath{" "}
            <strong className="text-forest">{site.doctor.name}</strong> and ready for pickup in Awoshie, Accra.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#shop" className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 font-semibold text-cream shadow-lg shadow-forest/20 hover:bg-forest-deep">
              Shop the restock <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink("Hello! I'd like to book a consultation with ND William Owusu.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-forest/15 bg-white px-6 py-3.5 font-semibold text-forest hover:border-forest/40"
            >
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Book a consultation
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          {/* Arched "doorway" portrait */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border-[10px] border-white bg-leaf/20 shadow-2xl">
            <Image
              src={site.doctor.photo}
              alt={`${site.doctor.name}, ${site.doctor.title}`}
              fill
              priority
              sizes="(max-width: 768px) 90vw, 380px"
              className="object-cover object-top"
            />
          </div>
          <div className="absolute -left-4 bottom-16 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-left-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Lead naturopath</p>
            <p className="font-display text-lg font-semibold text-forest">{site.doctor.name}</p>
          </div>
          <div className="absolute -right-3 top-10 rotate-3 rounded-2xl bg-cayenne px-4 py-3 text-white shadow-xl sm:-right-8">
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
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="rounded-2xl bg-cream p-2.5 text-leaf-dark">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-forest">{title}</p>
              <p className="text-sm text-muted">{text}</p>
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
    <section id="wholesale" className="scroll-mt-20 px-4 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-forest px-8 py-14 text-cream sm:px-14">
        <svg className="absolute -right-10 -top-10 h-72 w-72 text-leaf/25" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 95C20 80 18 35 58 10c22 25 17 62-8 85Z" fill="currentColor" />
        </svg>
        <div className="relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-kente">Wholesale & bulk</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              All nuts & seeds, available in bulk.
            </h2>
            <p className="mt-4 max-w-lg text-lg text-cream/75">
              Stocking a shop, running a juice bar, or feeding a big family? Ask for our wholesale price list —
              we&apos;ll reply on WhatsApp.
            </p>
            <a
              href={whatsappLink("Hello! Please send me your wholesale price list for nuts & seeds.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-kente px-6 py-3.5 font-semibold text-forest-deep hover:brightness-105"
            >
              <WhatsAppIcon /> Get wholesale prices
            </a>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {seeds.map((s) => (
              <li key={s} className="rounded-full border border-cream/25 bg-forest-deep/40 px-4 py-2 text-sm font-medium">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-20 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 md:grid-cols-[1fr_1.3fr]">
        <div className="relative mx-auto w-full max-w-xs">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-full bg-kente/40" />
          <div className="relative aspect-square overflow-hidden rounded-full border-8 border-white shadow-xl">
            <Image src={site.doctor.photo} alt={site.doctor.name} fill sizes="320px" className="object-cover" />
          </div>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-leaf-dark">
            <HandHeart className="h-4 w-4" /> Meet your naturopath
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl">
            {site.doctor.name}
          </h2>
          <p className="mt-1 text-lg font-medium text-leaf-dark">
            {site.doctor.title} · {site.legalName}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">
            At the Natural Health Retreat Reform Center we believe healing starts at home — on your plate, in your
            daily habits and in a peaceful heart. ND William Owusu combines naturopathic care, nutrition and
            prayerful support to help families across Accra live well, naturally.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-sand pt-8 text-center">
            {[
              ["Consultations", "Book on WhatsApp"],
              ["Remedies", "Herbs & spices"],
              ["Whole person", "Body · mind · spirit"],
            ].map(([a, b]) => (
              <div key={a}>
                <p className="font-display text-lg font-semibold text-forest">{a}</p>
                <p className="text-sm text-muted">{b}</p>
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
    <section id="visit" className="paper-grain scroll-mt-20 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Visit the retreat" title="Come say hello" />
          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-cayenne" />
              <div>
                <p className="font-display text-xl font-semibold text-forest">
                  {site.address.line1}, {site.address.line2}
                </p>
                <p className="text-muted">{site.address.city}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-1 h-6 w-6 shrink-0 text-cayenne" />
              <div className="space-y-1">
                {site.hours.map((h) => (
                  <p key={h.days}>
                    <span className="font-semibold text-forest">{h.days}:</span> <span className="text-muted">{h.time}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href={`tel:${site.phones[0].tel}`} className="flex items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-4 font-semibold text-cream hover:bg-forest-deep">
              <Phone className="h-5 w-5" /> Call {site.phones[0].display}
            </a>
            <a href={`tel:${site.phones[1].tel}`} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-semibold text-forest ring-1 ring-forest/15 hover:ring-forest/40">
              <Phone className="h-5 w-5" /> Call {site.phones[1].display}
            </a>
            <a
              href={site.whatsapp.catalog}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 font-semibold text-white hover:brightness-95 sm:col-span-2"
            >
              <WhatsAppIcon /> Browse our WhatsApp catalogue
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border-8 border-white shadow-xl">
          <iframe
            title="Map to Natural Health Retreat, Awoshie"
            src={mapSrc}
            className="h-full min-h-[380px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
