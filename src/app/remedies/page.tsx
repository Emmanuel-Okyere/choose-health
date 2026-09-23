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
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-leaf-dark">The retreat journal</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-forest sm:text-6xl">Remedies & wisdom</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Natural approaches to everyday health — for the body, the mind and the spirit.
          </p>
        </div>
        <div className="kente-stripe" />
      </section>
      <section className="mx-auto max-w-4xl divide-y divide-sand px-4 py-10 sm:px-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/remedies/${post.slug}`} className="group block py-8">
            <p className="text-sm font-semibold text-leaf-dark">
              {post.category} · {shortDate(post.publishedAt)} · {post.readMinutes} min read
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-forest group-hover:text-leaf-dark">{post.title}</h2>
            <p className="mt-2 text-lg text-muted">{post.excerpt}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-forest">
              Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
