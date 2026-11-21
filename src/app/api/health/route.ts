import { NextResponse } from "next/server";
import { creditsBalance, hasLinerKey } from "@/lib/liner";

export const runtime = "nodejs";

export async function GET() {
  const keyed = hasLinerKey();
  if (!keyed) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      liner: { configured: false },
      message: "LINER_API_KEY 없음 — 데모 엔진으로 동작합니다.",
    });
  }

  const balance = await creditsBalance();
  return NextResponse.json({
    ok: true,
    mode: "live",
    liner: {
      configured: true,
      balanceOk: balance.ok,
      balanceUsd: balance.balanceUsd,
      error: balance.error,
    },
    message: balance.ok
      ? "Liner Model/Search API 연결됨"
      : "키는 있으나 잔액 조회 실패 — 요청 시 오류가 날 수 있습니다.",
  });
}
