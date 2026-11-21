import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const HREF = "/console/semantic?tab=analyze&case=quality";

type Props = {
  className?: string;
};

/** Single site CTA — sticky header only. Astryx-like pill, not a flat green chip. */
export function ConsoleEntryButton({ className }: Props) {
  return (
    <Link
      href={HREF}
      className={cn(
        "group inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white",
        "transition hover:bg-[#0a3d3a]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      콘솔 접속
      <ArrowUpRight className="size-4 opacity-80 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </Link>
  );
}
