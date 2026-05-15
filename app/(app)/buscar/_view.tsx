"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiCloseLine,
  RiFileTextLine,
  RiFileCopyLine,
  RiInformationLine,
  RiSearchLine,
  RiSparkling2Line,
  RiStarLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { Linea, Subpartida } from "@/lib/data/aduana"
import { AIBadge } from "../_components/domain"

type LineaFilter = "todos" | Linea["id"]

const SUGGESTIONS = [
  "Refrigerador",
  "Laptop",
  "Smartphone",
  "Televisor LED",
  "Horno microondas",
]

export function BuscarView({
  subpartidas,
  lineas,
}: {
  subpartidas: Subpartida[]
  lineas: Linea[]
}) {
  const [query, setQuery] = React.useState("")
  const [linea, setLinea] = React.useState<LineaFilter>("todos")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [searching, setSearching] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)

  React.useEffect(() => {
    if (!query.trim()) {
      setShowResults(false)
      return
    }
    setSearching(true)
    const t = setTimeout(() => {
      setSearching(false)
      setShowResults(true)
    }, 450)
    return () => clearTimeout(t)
  }, [query])

  const results = React.useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    let r = subpartidas.filter(
      (s) =>
        s.desc.toLowerCase().includes(q) ||
        s.code.includes(q) ||
        (q.includes("lap") && s.code.startsWith("8471")) ||
        (q.includes("refri") && s.code.startsWith("8418")) ||
        (q.includes("tele") && s.code.startsWith("8528")) ||
        (q.includes("cel") && s.code.startsWith("8517.13")) ||
        (q.includes("phone") && s.code.startsWith("8517.13")) ||
        (q.includes("horno") && s.code.startsWith("8516.50")) ||
        (q.includes("lava") && s.code.startsWith("8450"))
    )
    if (linea !== "todos") r = r.filter((s) => s.linea === linea)
    return r
  }, [query, linea, subpartidas])

  return (
    <>
      <Card className="!flex-row mb-4 items-center gap-1 p-1">
        <CardContent className="!flex !flex-row !items-center !gap-1 !p-0 w-full">
          <div className="px-3 text-muted-foreground">
            {searching ? (
              <RiSparkling2Line className="size-[18px] animate-pulse text-ai" />
            ) : (
              <RiSearchLine className="size-[18px]" />
            )}
          </div>
          <Input
            autoFocus
            className="h-11 flex-1 border-0 bg-transparent text-[15px] shadow-none focus-visible:ring-0"
            placeholder={`Ej: "laptop 14 pulgadas", "refrigerador doble puerta", "8471"…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuery("")}
              className="mr-1"
            >
              <RiCloseLine />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Filtrar por línea:
        </span>
        <Segmented<LineaFilter>
          value={linea}
          onChange={setLinea}
          options={[
            { value: "todos", label: "Todos" },
            { value: "blanca", label: "Blanca" },
            { value: "negra", label: "Negra" },
            { value: "electronica", label: "Electrónica" },
          ]}
        />
      </div>

      {!query ? (
        <Card className="p-5">
          <CardContent className="!p-0">
            <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Sugerencias
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  asChild
                  className="cursor-pointer px-3 py-1.5 text-[13px]"
                >
                  <button type="button" onClick={() => setQuery(s)}>
                    <RiSearchLine />
                    {s}
                  </button>
                </Badge>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex items-start gap-3">
              <RiInformationLine className="mt-0.5 size-4 text-muted-foreground" />
              <div className="text-[13px] leading-relaxed text-foreground/75">
                También puedes pegar la descripción exacta de tu factura. La IA
                hace coincidencia semántica con la nomenclatura NANDINA del
                Arancel boliviano.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {searching ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          <RiSparkling2Line className="mx-auto mb-2 size-5 animate-pulse text-ai" />
          <div>Buscando en el Arancel de Importaciones…</div>
        </div>
      ) : null}

      {showResults && !searching ? (
        <>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="text-[13px] text-muted-foreground">
              <strong className="text-foreground">{results.length}</strong>{" "}
              {results.length === 1 ? "resultado" : "resultados"} para{" "}
              <em>&quot;{query}&quot;</em>
            </div>
            <AIBadge title="Búsqueda asistida por IA con coincidencia semántica" />
          </div>

          {results.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent className="!p-0">
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-surface-2 text-foreground/75">
                  <RiSearchLine />
                </div>
                <div className="text-[15px] font-medium">Sin coincidencias</div>
                <div className="mt-1 text-[13px] text-muted-foreground">
                  Prueba con términos más generales o ajusta los filtros.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((r, i) => {
                const isSel = selected === r.code
                const lineaInfo = lineas.find((l) => l.id === r.linea)!
                return (
                  <Card
                    key={r.code}
                    onClick={() => setSelected(r.code)}
                    className={cn(
                      "cursor-pointer p-4 transition-all",
                      isSel && "border-primary ring-2 ring-primary/30"
                    )}
                  >
                    <CardContent className="!p-0">
                      <div className="flex flex-wrap items-start gap-3.5">
                        <div className="min-w-[220px] flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[14px] font-semibold text-primary">
                              {r.code}
                            </span>
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: lineaInfo.color,
                                color: lineaInfo.color,
                                background: "transparent",
                              }}
                            >
                              {lineaInfo.label}
                            </Badge>
                            {i === 0 ? (
                              <AIBadge title="Mejor coincidencia según la IA" />
                            ) : null}
                          </div>
                          <div className="text-[13.5px] leading-relaxed">
                            {r.desc}
                          </div>
                        </div>
                        <div className="min-w-[130px] shrink-0 text-right">
                          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Carga tributaria
                          </div>
                          <div className="mt-1 font-mono text-[13.5px] tabular-nums font-medium">
                            {r.gravamen}
                          </div>
                          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                            + IVA 14.94%
                          </div>
                        </div>
                      </div>

                      {isSel ? (
                        <>
                          <Separator className="my-3" />
                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm">
                              <Link href="/dims">
                                <RiFileTextLine />
                                Usar en nueva DIMS
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              <RiStarLine />
                              Guardar como recurrente
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (typeof navigator !== "undefined") {
                                  navigator.clipboard?.writeText(r.code)
                                }
                              }}
                            >
                              <RiFileCopyLine />
                              Copiar código
                            </Button>
                          </div>
                        </>
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      ) : null}
    </>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-md border bg-surface-2 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[5px] px-2.5 py-1 text-[12px] font-medium transition-colors",
            value === opt.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
