"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Boxes,
  GitBranchPlus,
  Layers3,
  Link2,
  Table2,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { cn } from "@/lib/utils";

export const CONSOLE_TABS = [
  {
    id: "catalog",
    label: "Catalog",
    description: "스키마 · 테이블 · 컬럼",
    icon: Table2,
  },
  {
    id: "ontology",
    label: "Ontology",
    description: "의도 · 용어 · 컬럼 매핑",
    icon: Link2,
  },
  {
    id: "metrics",
    label: "Metrics",
    description: "측정값 · grain · 필터",
    icon: Layers3,
  },
  {
    id: "lineage",
    label: "Lineage",
    description: "엔터티 관계",
    icon: GitBranchPlus,
  },
] as const;

export type ConsoleTab = (typeof CONSOLE_TABS)[number]["id"];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as ConsoleTab | null) ?? "ontology";

  return (
    <div className="console-surface min-h-svh text-zinc-100 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="flex flex-col border-b border-white/10 bg-[#0b0d10] lg:min-h-svh lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#0f6b63] text-sm font-semibold text-white">
            IS
          </div>
          <div>
            <p className="text-sm font-medium tracking-tight">IntentSpec</p>
            <p className="text-[11px] text-zinc-500">Semantic Console</p>
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <p className="flex items-center gap-2 text-xs text-zinc-300">
              <Boxes className="size-3.5 text-[#5eead4]" />
              quality_lab
            </p>
            <p className="mt-1 pl-5 font-mono text-[10px] text-zinc-500">
              workspace · core
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 pb-4">
          <p className="mb-2 px-2 text-[10px] font-medium tracking-[0.16em] text-zinc-600 uppercase">
            Semantic
          </p>
          {CONSOLE_TABS.map((item) => {
            const active = tab === item.id;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={`/console/semantic?tab=${item.id}`}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 transition",
                  active
                    ? "bg-white/[0.09] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0 opacity-80" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 px-5 py-4">
          <StatusPill appearance="dark" />
          <Link
            href="/"
            className="block text-[11px] text-zinc-600 transition hover:text-zinc-400"
          >
            ← 소개 페이지
          </Link>
        </div>
      </aside>

      <div className="min-w-0 bg-[#111318]">{children}</div>
    </div>
  );
}
