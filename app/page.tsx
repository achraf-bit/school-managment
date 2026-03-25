"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t("homeTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("homeSubtitle")}</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/login" className="rounded bg-primary px-6 py-2 text-white hover:bg-primary/90">
            {t("login")}
          </Link>
          <Link href="/register" className="rounded border border-primary px-6 py-2 text-primary hover:bg-primary/10">
            {t("register")}
          </Link>
        </div>
      </div>
    </div>
  );
}
