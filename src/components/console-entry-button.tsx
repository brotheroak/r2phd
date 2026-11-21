import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const HREF = "/console/semantic?tab=analyze&case=quality";

type Props = {
  size?: "nav" | "section";
  className?: string;
};

export function ConsoleEntryButton({ size = "nav", className }: Props) {
  const section = size === "section";
  return (
    <Link
      href={HREF}
      className={cn(
        "group relative inline-flex items-center overflow-hidden rounded-xl border border-ink/15 bg-ink text-white transition",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-[#0a3d3a]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        section
          ? "h-12 gap-3 px-5 text-base font-semibold"
          : "h-10 gap-2.5 px-3.5 text-sm font-semibold",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
          section ? "size-8" : "size-7",
        )}
      >
        <Terminal className={section ? "size-4" : "size-3.5"} strokeWidth={2.25} />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className={section ? "text-base" : "text-sm"}>콘솔 접속</span>
        {section ? (
          <span className="mt-1 text-[11px] font-normal tracking-wide text-white/65">
            Analyze · Catalog · Lock
          </span>
        ) : null}
      </span>
      <ArrowUpRight
        className={cn(
          "ml-1 text-white/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white",
          section ? "size-5" : "size-4",
        )}
      />
    </Link>
  );
}
