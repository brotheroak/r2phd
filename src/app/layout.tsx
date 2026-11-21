import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: "IntentSpec · 인간 ↔ AI 소통 | .EXE-THON",
  description:
    "애매한 질문을 선택지로 구체화해 사람과 AI의 간극을 줄입니다. 분석·연구·일상에 같은 소통 에이전트를 붙입니다.",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
