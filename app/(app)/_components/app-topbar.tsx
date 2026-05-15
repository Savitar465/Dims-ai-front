"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiArrowRightSLine, RiNotification3Line, RiQuestionLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const SCREENS: Record<string, { section: string; label: string; hu?: string }> = {
  "/": { section: "Inicio", label: "Inicio" },
  "/inicio": { section: "Inicio", label: "Inicio" },
  "/flujo": { section: "Flujo", label: "Flujo de declaración" },
  "/factura": { section: "Flujo", label: "Cargar factura", hu: "HU-003" },
  "/editar": { section: "Flujo", label: "Editar datos", hu: "HU-004" },
  "/dims": { section: "Flujo", label: "Generar DIMS", hu: "HU-005" },
  "/validar": { section: "Flujo", label: "Validar", hu: "HU-006" },
  "/exportar": { section: "Flujo", label: "Exportar", hu: "HU-008" },
  "/buscar": { section: "Herramientas", label: "Subpartidas", hu: "HU-001" },
  "/productos": { section: "Herramientas", label: "Productos recurrentes", hu: "HU-002" },
  "/ayuda": { section: "Sistema", label: "Ayuda", hu: "HU-007" },
  "/integraciones": { section: "Sistema", label: "Integraciones", hu: "HU-012" },
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
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Notificaciones">
          <RiNotification3Line />
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/ayuda">
            <RiQuestionLine />
            Ayuda
          </Link>
        </Button>
      </div>
    </header>
  )
}
