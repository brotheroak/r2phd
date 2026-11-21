"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Health = {
  mode: "live" | "demo";
  message: string;
};

type Props = {
  appearance?: "light" | "dark";
};

export function StatusPill({ appearance = "light" }: Props) {
  const [health, setHealth] = useState<Health | null>(null);
  const dark = appearance === "dark";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) {
          setHealth({ mode: j.mode, message: j.message });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHealth({
            mode: "demo",
            message: "상태를 못 읽어서 예시 모드로 이어갑니다.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!health) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "font-normal",
          dark && "border border-white/10 bg-white/[0.04] text-zinc-400",
        )}
      >
        연결 확인 중…
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal",
        health.mode === "live"
          ? dark
            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border border-ok/30 bg-ok/10 text-ok"
          : dark
            ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
            : "border border-signal/30 bg-signal/10 text-signal",
      )}
      title={health.message}
    >
      {health.mode === "live" ? "Liner 연결됨" : "예시 모드"}
    </Badge>
  );
}
