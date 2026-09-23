import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const { next } = await props.searchParams;
  return (
    <main className="paper-grain flex flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-sand sm:p-10">
        <LogoMark className="mx-auto h-14 w-14 text-forest" />
        <h1 className="mt-4 text-center font-display text-3xl font-semibold text-forest">Admin sign in</h1>
        <p className="mb-8 mt-1 text-center text-sm text-muted">Manage orders for Natural Health Retreat</p>
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </main>
  );
}
