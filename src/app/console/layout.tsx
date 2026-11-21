import { ConsoleShell } from "@/components/console-shell";
import { ConsoleProvider } from "@/lib/console-store";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleProvider>
      <ConsoleShell>{children}</ConsoleShell>
    </ConsoleProvider>
  );
}
