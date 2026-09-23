import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPosts } from "@/lib/queries";
import { shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Remedies & wisdom",
  description: "Gentle, practical guidance on piles, skin conditions, kitchen remedies, prayer and whole-person health.",
};

export default async function RemediesPage() {
  const posts = await getPosts();
  return (
    <main className="flex-1">
      <section className="paper-grain">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 md:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf-dark">The retreat journal</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-forest sm:text-6xl md:mt-3">Remedies & wisdom</h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted md:mt-4 md:text-lg">
            Natural approaches to everyday health — for the body, the mind and the spirit.
          </p>
        </div>
        <div className="kente-stripe" />
      </section>
      <section className="mx-auto max-w-4xl divide-y divide-sand px-4 py-2 sm:px-6 md:py-10">
        {posts.map((post) => (
          <Link key={post.slug} href={`/remedies/${post.slug}`} className="group block py-5 md:py-8">
            <p className="text-xs font-semibold text-leaf-dark md:text-sm">
              {post.category} · {shortDate(post.publishedAt)} · {post.readMinutes} min read
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-forest group-hover:text-leaf-dark md:mt-2 md:text-3xl">{post.title}</h2>
            <p className="mt-1.5 text-sm text-muted md:mt-2 md:text-lg">{post.excerpt}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-forest">
              Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
