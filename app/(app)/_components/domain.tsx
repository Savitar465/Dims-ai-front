// Small domain-specific compositions used across multiple screens.
// They wrap shadcn primitives, not new UI patterns.

import { RiSparkling2Line } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Confidence({
  value,
  showPct = true,
  className,
}: {
  value: number
  showPct?: boolean
  className?: string
}) {
  const v = Math.max(0, Math.min(100, value))
  const color = v < 60 ? "bg-destructive" : v < 85 ? "bg-warning" : "bg-success"
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="h-1 w-9 overflow-hidden rounded-full bg-surface-2">
        <span className={cn("block h-full rounded-full", color)} style={{ width: `${v}%` }} />
      </span>
      {showPct ? (
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {v}%
        </span>
      ) : null}
    </span>
  )
}

export function AIBadge({ title }: { title?: string }) {
  return (
    <Badge
      variant="outline"
      title={title ?? "Sugerido por IA"}
      className="border-ai/25 bg-ai-soft text-ai"
    >
      <RiSparkling2Line className="size-2.5!" />
      IA
    </Badge>
  )
}
