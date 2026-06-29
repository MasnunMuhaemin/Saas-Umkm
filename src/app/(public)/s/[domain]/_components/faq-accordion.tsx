"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/types/storefront-content";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                className={`flex-none text-primary transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && faq.answer && (
              <div className="px-5 pb-5 -mt-1 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
