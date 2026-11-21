"use client";

import { ConsoleProvider } from "@/lib/console-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConsoleProvider>{children}</ConsoleProvider>;
}
