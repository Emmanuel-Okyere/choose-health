"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppFab";
import { site, whatsappLink } from "@/lib/site";

const topics = [
  {
    key: "product",
    label: "Ask about a product",
    message:
      "Hello Natural Health Retreat, I would like to know if you have [product name] in stock and the price. Thank you.",
  },
  {
    key: "wholesale",
    label: "Wholesale / bulk order",
    message:
      "Hello Natural Health Retreat, I am interested in buying nuts and seeds in bulk. Please send me your wholesale price list. Thank you.",
  },
  {
    key: "delivery",
    label: "Delivery",
    message:
      "Hello Natural Health Retreat, do you deliver to [your area]? I would like to place an order. Thank you.",
  },
];

export function ContactWhatsApp() {
  const [topic, setTopic] = useState(topics[0].key);
  const [name, setName] = useState("");
  const [message, setMessage] = useState(topics[0].message);

  function pickTopic(key: string) {
    setTopic(key);
    setMessage(topics.find((t) => t.key === key)!.message);
  }

  const fullMessage = name.trim() ? `${message}\n\n— ${name.trim()}` : message;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl ring-1 ring-sand sm:p-10 md:rounded-[2rem]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white md:h-12 md:w-12">
          <WhatsAppIcon className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-forest md:text-2xl">Message us on WhatsApp</h3>
          <p className="hidden text-sm text-muted sm:block">
            Pick a topic, edit the message if you like, and send. It opens WhatsApp to {site.phones[1].display}.
          </p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:mt-6 sm:flex-wrap sm:px-0" role="radiogroup" aria-label="What is your message about?">
        {topics.map((t) => (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={topic === t.key}
            onClick={() => pickTopic(t.key)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
              topic === t.key
                ? "border-forest bg-forest text-cream"
                : "border-forest/20 text-forest hover:border-forest/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-semibold sm:mt-6">
        Your name (optional)
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="mt-1.5 w-full rounded-xl border border-sand bg-paper px-4 py-3 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-sand bg-paper px-4 py-3 leading-relaxed outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20"
        />
      </label>

      <a
        href={whatsappLink(fullMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 sm:mt-6 sm:py-3.5 font-semibold text-white hover:brightness-95 sm:w-auto"
      >
        <Send className="h-4 w-4" /> Send on WhatsApp
      </a>
    </div>
  );
}
