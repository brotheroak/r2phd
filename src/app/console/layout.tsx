import { Suspense } from "react";
import { ConsoleShell } from "@/components/console-shell";

function ConsoleFallback() {
  return (
    <div className="console-surface flex min-h-svh items-center justify-center text-sm text-zinc-500">
      콘솔 불러오는 중…
    </div>
  );
}

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ConsoleFallback />}>
      <ConsoleShell>{children}</ConsoleShell>
    </Suspense>
  );
}
