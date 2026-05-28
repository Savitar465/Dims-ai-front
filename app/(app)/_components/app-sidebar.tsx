"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiAddLine, RiFileTextLine, RiHomeLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { DraftInProgress } from "@/lib/types/dims"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  hu?: string
}

const FLOW_HREFS = [
  "/flujo",
  "/factura",
  "/editar",
  "/dims",
  "/validar",
  "/exportar",
]

const STEP_SUBS: Record<string, string> = {
  factura: "Sube PDF o foto",
  editar: "Revisa lo extraído",
  dims: "IA arma el formulario",
  validar: "Confirma con SUMA",
  exportar: "Descarga o envía",
}

function NavLink({
  href,
  label,
  icon: Icon,
  hu,
  active,
}: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
        active
          ? "bg-primary-soft text-primary"
          : "text-foreground/70 hover:bg-surface-2 hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {hu ? (
        <span
          className={cn(
            "font-mono text-[10px]",
            active ? "text-primary/70" : "text-muted-foreground"
          )}
        >
          {hu}
        </span>
      ) : null}
    </Link>
  )
}

export function AppSidebar({ drafts }: { drafts: DraftInProgress[] }) {
  const pathname = usePathname() || "/"
  const inFlow = FLOW_HREFS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-card px-3 py-4">
      <div className="flex items-center gap-2.5 px-2 pb-4">
        <div className="grid size-8 place-items-center rounded-[9px] bg-gradient-to-br from-primary to-primary/70 font-serif text-lg text-primary-foreground italic shadow-inner">
          d
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold tracking-tight">
            DIMS AI
          </div>
          <div className="-mt-0.5 text-[11px] text-muted-foreground">
            Aduana Nacional · BO
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <NavLink
          href="/inicio"
          label="Inicio"
          icon={RiHomeLine}
          active={pathname === "/inicio" || pathname === "/"}
        />
        <NavLink
          href="/flujo"
          label="Flujo de declaración"
          icon={RiFileTextLine}
          active={inFlow}
        />
        <div className="px-1 pt-1.5">
          <Button asChild size="sm" className="w-full justify-center gap-1.5">
            <Link href="/factura">
              <RiAddLine className="size-3.5" />
              Nueva DIMS
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between px-2.5 pb-1.5 text-[10.5px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          <span>En proceso</span>
          <span className="font-mono text-[10px] tracking-normal normal-case">
            {drafts.length}
          </span>
        </div>
        {drafts.length === 0 ? (
          <div className="px-2.5 py-2 text-xs text-muted-foreground">
            No tienes DIMS en borrador.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {drafts.map((d) => {
              const pct = Math.round(((d.stepIdx + 1) / 5) * 100)
              return (
                <Link
                  key={d.id}
                  href={`/${d.stepScreen}`}
                  className="block rounded-md px-2.5 py-2 transition-colors hover:bg-surface-2"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <RiFileTextLine className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-[11.5px] font-semibold">
                      {d.id.replace("DIMS-", "")}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                      {d.stepIdx + 1}/5
                    </span>
                  </div>
                  <div className="truncate text-[11.5px] text-foreground/80">
                    {d.proveedor}
                  </div>
                  <div className="mb-1.5 text-[10.5px] text-muted-foreground">
                    {STEP_SUBS[d.stepScreen]}
                  </div>
                  <Progress value={pct} className="h-[3px]" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

export { FLOW_HREFS }
