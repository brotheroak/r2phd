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
          setHealth({ mode: "demo", message: "상태 확인 실패 — 데모로 진행" });
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
          ? "border border-ok/30 bg-ok/10 text-ok font-normal"
          : "border border-signal/30 bg-signal/10 text-signal font-normal"
      }
      title={health.message}
    >
      {health.mode === "live" ? "Liner API 연결" : "데모 엔진"}
    </Badge>
  );
}
