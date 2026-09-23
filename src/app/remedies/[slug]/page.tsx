import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Prose } from "@/components/Prose";
import { WhatsAppIcon } from "@/components/WhatsAppFab";
import { getPost } from "@/lib/queries";
import { shortDate } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/remedies/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage(props: PageProps<"/remedies/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-14">
        <Link href="/remedies" className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-dark hover:gap-2.5 transition-all">
          <ArrowLeft className="h-4 w-4" /> All remedies
        </Link>
        <p className="mt-5 text-xs font-bold md:mt-8 md:text-sm uppercase tracking-[0.2em] text-leaf-dark">{post.category}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl md:mt-3">{post.title}</h1>
        <p className="mt-3 text-sm text-muted md:mt-4 md:text-base">
          By {site.doctor.name} · {shortDate(post.publishedAt)} · {post.readMinutes} min read
        </p>
        <div className="kente-stripe my-6 rounded-full md:my-10" />
        <Prose body={post.body} />

        <aside className="mt-12 flex gap-3 rounded-2xl bg-sand/70 p-5 text-sm text-ink/75">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-leaf-dark" />
          <p>
            This article is general wellbeing information, not a diagnosis. If symptoms are severe, persistent or
            worrying, please see a qualified health professional.
          </p>
        </aside>

        <div className="mt-8 rounded-2xl bg-forest p-5 text-cream md:mt-10 md:rounded-3xl md:p-8">
          <h2 className="font-display text-2xl font-semibold">Want personal advice?</h2>
          <p className="mt-2 text-cream/75">Book a consultation with {site.doctor.name} — in person in Awoshie or over WhatsApp.</p>
          <a
            href={whatsappLink(`Hello! I read "${post.title}" and would like to book a consultation.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-kente px-5 py-3 font-semibold text-forest-deep"
          >
            <WhatsAppIcon /> Book on WhatsApp
          </a>
        </div>
      </article>
    </main>
  );
}
