"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Health = {
  mode: "live" | "demo";
  message: string;
};

export function StatusPill() {
  const [health, setHealth] = useState<Health | null>(null);

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
      <Badge variant="secondary" className="font-normal">
        연결 확인 중…
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={
        health.mode === "live"
          ? "border border-ok/30 bg-ok/10 font-normal text-ok"
          : "border border-signal/30 bg-signal/10 font-normal text-signal"
      }
      title={health.message}
    >
      {health.mode === "live" ? "Liner 연결됨" : "예시 모드"}
    </Badge>
  );
}
