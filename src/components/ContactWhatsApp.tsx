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
    <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-sand sm:p-10">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white">
          <WhatsAppIcon className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-2xl font-semibold text-forest">Message us on WhatsApp</h3>
          <p className="text-sm text-muted">
            Pick a topic, edit the message if you like, and send. It opens WhatsApp to {site.phones[1].display}.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="What is your message about?">
        {topics.map((t) => (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={topic === t.key}
            onClick={() => pickTopic(t.key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              topic === t.key
                ? "border-forest bg-forest text-cream"
                : "border-forest/20 text-forest hover:border-forest/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label className="mt-6 block text-sm font-semibold">
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
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-sand bg-paper px-4 py-3 leading-relaxed outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20"
        />
      </label>

      <a
        href={whatsappLink(fullMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white hover:brightness-95 sm:w-auto"
      >
        <Send className="h-4 w-4" /> Send on WhatsApp
      </a>
    </div>
  );
}
