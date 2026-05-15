import type { Metadata } from "next"
import Link from "next/link"
import {
  RiAlertLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiLineChartLine,
  RiRefreshLine,
  RiSaveLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = { title: "Validar · DIMS AI" }

type CheckStatus = "ok" | "warn" | "error"

const CHECKS: { id: string; label: string; status: CheckStatus; detail: string }[] = [
  { id: "a", label: "Todos los campos obligatorios completados", status: "ok", detail: "48/48 campos requeridos" },
  { id: "b", label: "Subpartidas arancelarias válidas", status: "ok", detail: "4 ítems con código vigente del Arancel 2026" },
  { id: "c", label: "Coherencia de valores y cantidades", status: "ok", detail: "Subtotal coincide con suma de ítems" },
  { id: "d", label: "Número de manifiesto presente", status: "ok", detail: "MAN-2026-04887 validado" },
  { id: "e", label: "Verificación de valores de referencia", status: "warn", detail: 'El precio unitario de "Cargador USB-C" (USD 8.20) está 22% por debajo del valor de referencia para esta subpartida.' },
  { id: "f", label: "Documentos de respaldo", status: "warn", detail: "Falta adjuntar póliza de seguro internacional (opcional para CIF)." },
  { id: "g", label: "Cálculo de tributos", status: "ok", detail: "GA + IVA + ICE = USD 2,173.92" },
  { id: "h", label: "Importador habilitado en padrón", status: "ok", detail: "NIT vigente y sin observaciones" },
]

export default function ValidarPage() {
  const ok = CHECKS.filter((c) => c.status === "ok").length
  const warnings = CHECKS.filter((c) => c.status === "warn").length
  const errors = CHECKS.filter((c) => c.status === "error").length

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Validación pre-envío
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Revisión automática de consistencia y completitud antes de presentar la
        DIMS.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatusCard tone="success" count={ok} label="Verificaciones pasadas" />
        <StatusCard tone="warning" count={warnings} label="Advertencias" />
        <StatusCard tone="danger" count={errors} label="Errores" />
      </div>

      <Card className="mb-5 overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <RiCheckboxCircleLine className="size-4 text-muted-foreground" />
          <div className="text-[13px] font-semibold">
            Checklist de validación
          </div>
          <Button variant="ghost" size="sm" className="ml-auto">
            <RiRefreshLine />
            Volver a verificar
          </Button>
        </div>
        {CHECKS.map((c, i) => (
          <CheckRow key={c.id} check={c} first={i === 0} />
        ))}
      </Card>

      <Card className="mb-6 p-5">
        <CardContent className="!p-0">
          <div className="mb-4 flex items-center gap-2">
            <RiLineChartLine className="size-4 text-muted-foreground" />
            <div className="text-[13px] font-semibold">
              Simulación de impuestos
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SimCell label="Valor CIF" value="USD 9,225.00" />
            <SimCell
              label="GA + IVA + ICE"
              value="USD 2,173.92"
              sub="Bs 15,022.16"
            />
            <SimCell
              label="Carga tributaria"
              value="23.56%"
              sub="del valor CIF"
            />
            <SimCell label="Tipo de cambio BCB" value="6.91" sub="BOB/USD" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-3">
        <Button asChild variant="outline">
          <Link href="/dims">
            <RiArrowLeftSLine />
            Volver a editar
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <RiSaveLine />
            Guardar borrador
          </Button>
          <Button asChild disabled={errors > 0}>
            <Link
              href="/exportar"
              aria-disabled={errors > 0}
              className={cn(errors > 0 && "pointer-events-none opacity-50")}
            >
              Proceder a exportar
              <RiArrowRightLine />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatusCard({
  tone,
  count,
  label,
}: {
  tone: "success" | "warning" | "danger"
  count: number
  label: string
}) {
  const Icon = tone === "success" ? RiCheckboxCircleLine : tone === "warning" ? RiAlertLine : RiCloseLine
  const cls = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-destructive/10 text-destructive",
  }[tone]
  return (
    <Card className="p-5">
      <CardContent className="!flex !flex-row !items-center !gap-3.5 !p-0">
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", cls)}>
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-[26px] font-semibold leading-none tabular-nums tracking-tight">
            {count}
          </div>
          <div className="mt-1 text-[12.5px] text-foreground/75">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function CheckRow({
  check,
  first,
}: {
  check: (typeof CHECKS)[number]
  first: boolean
}) {
  const cls = {
    ok: "bg-success-soft text-success",
    warn: "bg-warning-soft text-warning",
    error: "bg-destructive/10 text-destructive",
  }[check.status]
  const Icon =
    check.status === "ok" ? RiCheckLine : check.status === "warn" ? RiAlertLine : RiCloseLine
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3.5",
        !first && "border-t border-border/60"
      )}
    >
      <div className={cn("mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-full", cls)}>
        <Icon className="size-3" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-medium">{check.label}</div>
        <div className="mt-0.5 text-[12.5px] text-foreground/75">
          {check.detail}
        </div>
      </div>
      {check.status !== "ok" ? (
        <Button variant="outline" size="sm">
          {check.status === "warn" ? "Revisar" : "Corregir"}
        </Button>
      ) : null}
    </div>
  )
}

function SimCell({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold tabular-nums">
        {value}
      </div>
      {sub ? (
        <div className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  )
}
