"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FileSearch,
  Layers3,
  LayoutDashboard,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/console",
    label: "분석 콘솔",
    description: "질문 → 기준 → SQL → 점검",
    icon: FileSearch,
    exact: true,
  },
  {
    href: "/console/semantic",
    label: "시맨틱 레이어",
    description: "카탈로그 · 온톨로지 · 지표",
    icon: Layers3,
    exact: false,
  },
] as const;

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border/70 bg-ink text-white lg:min-h-svh lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-5">
          <Link href="/" className="block">
            <p className="font-display text-2xl text-white">IntentSpec</p>
            <p className="mt-0.5 text-xs text-white/50">콘솔</p>
          </Link>
          <div className="lg:mt-4">
            <StatusPill />
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-3 lg:pb-6">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-[180px] items-start gap-3 rounded-xl px-3 py-2.5 transition lg:min-w-0",
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/65 hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-white/45">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
          <p className="flex items-center gap-2 text-xs text-white/45">
            <Boxes className="size-3.5" />
            quality_lab · 가상 카탈로그
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white"
          >
            <LayoutDashboard className="size-3.5" />
            소개 페이지로
          </Link>
        </div>
      </aside>

      <div className="min-w-0 bg-transparent">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
