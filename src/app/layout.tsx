import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "IntentSpec · 의도명세 | .EXE-THON",
  description:
    "연구 질문의 분석 의도가 데이터 처리 과정에서에서 깨지지 않게, 모호함을 고정하고 SQL·검증 항목으로 잠그는 에이전트.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
