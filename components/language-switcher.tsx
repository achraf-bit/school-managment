"use client";

import { useLanguage } from "@/components/language-provider";
import { Locale } from "@/lib/translations";

const flags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
};

const labels: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggle = () => setLocale(locale === "en" ? "fr" : "en");

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium hover:bg-gray-100 transition-colors"
      title="Switch language"
    >
      <span>{flags[locale]}</span>
      <span>{labels[locale]}</span>
    </button>
  );
}
