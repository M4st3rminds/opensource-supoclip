type Translate = (key: string, values?: Record<string, string | number>) => string;

const FAQ_KEYS = ["sources", "selection", "minutes", "publishing", "watermark", "languages", "selfHost", "cancel"] as const;

/** Landing page FAQ, shared by the page and its FAQPage structured data. */
export function getLandingFaqs(t: Translate) {
  // Monetization is disabled in this local build; use the permissive limits.
  const values = {
    proHours: 90,
    creatorHours: 180,
  };
  return FAQ_KEYS.map((key) => ({
    key,
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`, values),
  }));
}
