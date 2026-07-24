"use client"

import { usePathname } from "next/navigation"
import { RiArrowRightSLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"

const SCREENS: Record<string, { section: string; label: string; hu?: string }> = {
  "/": { section: "Inicio", label: "Inicio" },
  "/inicio": { section: "Inicio", label: "Inicio" },
  "/flujo": { section: "Flujo", label: "Flujo de declaración" },
  "/factura": { section: "Flujo", label: "Cargar factura", hu: "HU-003" },
  "/editar": { section: "Flujo", label: "Editar datos", hu: "HU-004" },
  "/dims": { section: "Flujo", label: "Preparar DIMS", hu: "HU-005" },
  "/validar": { section: "Flujo", label: "Validar", hu: "HU-006" },
  "/exportar": { section: "Flujo", label: "Exportar", hu: "HU-008" },
}

export function AppTopbar() {
  const pathname = usePathname() || "/"
  const screen = SCREENS[pathname] ?? SCREENS["/inicio"]

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/75 px-6 backdrop-blur">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <span>{screen.section}</span>
        <RiArrowRightSLine className="size-3" />
        <span className="font-medium text-foreground">{screen.label}</span>
        {screen.hu ? (
          <Badge variant="outline" className="font-mono text-[10px]">
            {screen.hu}
          </Badge>
        ) : null}
      </div>
    </header>
  )
}
