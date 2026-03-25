"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, Users, GraduationCap, BookOpen, Package, UserPlus, DollarSign, Menu, X, Wallet, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/components/language-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: Home },
    { href: "/dashboard/students", label: t("students"), icon: Users },
    { href: "/dashboard/teachers", label: t("teachers"), icon: GraduationCap },
    { href: "/dashboard/classes", label: t("classes"), icon: BookOpen },
    { href: "/dashboard/packs", label: t("packs"), icon: Package },
    { href: "/dashboard/enrollments", label: t("enrollments"), icon: UserPlus },
    { href: "/dashboard/payments", label: t("payments"), icon: DollarSign },
    { href: "/dashboard/teacher-payments", label: t("teacherPayments"), icon: Wallet },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r bg-gray-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 lg:p-6 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-bold">School Management</h2>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 px-3 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3 space-y-1">
          <div className="px-3 py-2">
            <LanguageSwitcher />
          </div>
          <Link
            href="/dashboard/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
            {t("settings")}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
          >
            <LogOut className="h-5 w-5" />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 w-full">
        <div className="border-b bg-white p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-sm lg:text-lg font-semibold truncate">Welcome, {session.user?.name}</h1>
            </div>
          </div>
        </div>
        <div className="p-3 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
