"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiArrowRightLine,
  RiFileTextLine,
  RiInformationLine,
  RiMailLine,
  RiSearchLine,
  RiSparkling2Line,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { GlosarioTerm } from "@/lib/data/aduana"

export function AyudaView({ glosario }: { glosario: GlosarioTerm[] }) {
  const [q, setQ] = React.useState("")
  const [active, setActive] = React.useState(glosario[0].term)
  const [showTutorial, setShowTutorial] = React.useState(false)

  const filtered = glosario.filter(
    (g) =>
      g.term.toLowerCase().includes(q.toLowerCase()) ||
      g.def.toLowerCase().includes(q.toLowerCase())
  )
  const current = glosario.find((g) => g.term === active) ?? glosario[0]

  return (
    <>
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          icon={RiSparkling2Line}
          title="Tutorial interactivo"
          sub="Tu primera DIMS, paso a paso. 5 minutos."
          onClick={() => setShowTutorial(true)}
          accent
        />
        <ActionCard
          icon={RiFileTextLine}
          title="Ejemplos de DIMS"
          sub="3 DIMS modelo: electrónica, línea blanca, ropa"
        />
        <ActionCard
          icon={RiMailLine}
          title="Contacto directo"
          sub="Soporte por correo · Lun-Vie 8:00-17:00"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b p-3">
            <div className="relative">
              <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-[13px]"
                placeholder="Buscar término…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-1.5">
            {filtered.map((g) => (
              <button
                key={g.term}
                onClick={() => setActive(g.term)}
                className={cn(
                  "w-full rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
                  active === g.term
                    ? "bg-primary-soft text-primary"
                    : "hover:bg-surface-2"
                )}
              >
                {g.term}
              </button>
            ))}
            {filtered.length === 0 ? (
              <div className="px-5 py-5 text-center text-xs text-muted-foreground">
                Sin resultados
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <CardContent className="!p-0">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="m-0 font-serif text-[28px] tracking-tight">
                {current.term}
              </h2>
              <Badge variant="outline">Término aduanal</Badge>
            </div>
            <p className="m-0 text-[14.5px] leading-relaxed">
              {current.def}
            </p>

            {current.term === "DIMS" ? (
              <>
                <Separator className="my-4" />
                <div className="text-[13px] leading-relaxed text-foreground/75">
                  <strong className="text-foreground">¿Cuándo se usa?</strong>
                  <ul className="mt-1.5 list-disc pl-5">
                    <li>Importaciones con valor FOB hasta USD 10,000.</li>
                    <li>
                      Mercancías sin restricciones especiales (sin licencia
                      previa).
                    </li>
                    <li>
                      Despacho directo en aduana de frontera o aeropuerto.
                    </li>
                  </ul>
                </div>
              </>
            ) : null}

            {current.term === "CIF" ? (
              <>
                <Separator className="my-4" />
                <div className="rounded-md bg-surface-2 p-3 text-[12.5px]">
                  <div className="mb-1 font-medium">Fórmula:</div>
                  <code className="font-mono">
                    CIF = FOB + Flete internacional + Seguro
                  </code>
                </div>
              </>
            ) : null}

            <Separator className="my-4" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <RiInformationLine className="size-3" />
                Glosario · Aduana Nacional
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tutorial · Tu primera DIMS</DialogTitle>
          </DialogHeader>
          <div
            className="grid place-items-center rounded-md border border-dashed bg-[repeating-linear-gradient(135deg,var(--surface-2)_0_10px,color-mix(in_oklch,var(--surface-2)_60%,var(--background))_10px_20px)] font-mono text-[11px] text-muted-foreground"
            style={{ aspectRatio: "16/9" }}
          >
            video introductorio · 4:32
          </div>
          <div className="text-sm leading-relaxed text-foreground/75">
            En 5 minutos te guiamos por el flujo completo: cargar tu factura,
            revisar los datos extraídos por IA, generar el formulario DIMS y
            validarlo antes de presentarlo en SUMA.
          </div>
          <div className="mt-3 flex gap-4">
            {[
              "Cargar factura",
              "Revisar datos",
              "Generar DIMS",
              "Validar y enviar",
            ].map((s, i) => (
              <div key={s} className="flex-1 text-center text-xs text-foreground/75">
                <div className="mx-auto mb-1.5 grid size-7 place-items-center rounded-full bg-primary-soft font-semibold text-primary">
                  {i + 1}
                </div>
                {s}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTutorial(false)}>
              Más tarde
            </Button>
            <Button asChild onClick={() => setShowTutorial(false)}>
              <Link href="/factura">
                Empezar ahora
                <RiArrowRightLine />
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ActionCard({
  icon: Icon,
  title,
  sub,
  accent,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
  accent?: boolean
  onClick?: () => void
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer p-5 transition-shadow hover:shadow-md",
        accent &&
          "border-primary/25 bg-gradient-to-br from-primary-soft to-card"
      )}
    >
      <CardContent className="!p-0">
        <div
          className={cn(
            "mb-2.5 grid size-9 place-items-center rounded-[10px]",
            accent
              ? "bg-primary text-primary-foreground"
              : "bg-surface-2 text-foreground/75"
          )}
        >
          <Icon className="size-[18px]" />
        </div>
        <div className="mb-1 text-sm font-semibold">{title}</div>
        <div className="text-[12.5px] leading-relaxed text-foreground/75">
          {sub}
        </div>
      </CardContent>
    </Card>
  )
}
