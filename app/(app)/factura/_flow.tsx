"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiArrowRightLine,
  RiBox3Line,
  RiBuildingLine,
  RiCameraLine,
  RiCheckboxCircleFill,
  RiCheckLine,
  RiFileTextLine,
  RiImage2Line,
  RiInformationLine,
  RiLineChartLine,
  RiLockLine,
  RiPriceTag3Line,
  RiSparkling2Line,
  RiUploadCloud2Line,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { getFactura, uploadFactura } from "@/lib/services/facturas"
import type { Factura } from "@/lib/types/dims"
import { AIBadge, Confidence } from "../_components/domain"

type Step = "upload" | "processing" | "review"

export function FacturaFlow() {
  const [step, setStep] = React.useState<Step>("upload")
  const [progress, setProgress] = React.useState(0)
  const [dragOver, setDragOver] = React.useState(false)
  const [factura, setFactura] = React.useState<Factura | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Animate the progress bar while the upload/extraction is in flight; the
  // jump to 100% + review is driven by the real API response below.
  React.useEffect(() => {
    if (step !== "processing") return
    const t = setTimeout(
      () => setProgress((p) => Math.min(95, p + 6 + Math.random() * 10)),
      220
    )
    return () => clearTimeout(t)
  }, [step, progress])

  const handleFile = async (file?: File | null) => {
    if (!file) return
    setError(null)
    setStep("processing")
    setProgress(0)
    try {
      let result = await uploadFactura(file)
      let tries = 0
      while (result.estado === "procesando" && tries < 20) {
        await new Promise((r) => setTimeout(r, 800))
        result = await getFactura(result.id)
        tries++
      }
      if (result.estado === "error") {
        throw new Error("La extracción falló. Intenta con otro archivo.")
      }
      setFactura(result)
      setProgress(100)
      setStep("review")
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo procesar la factura."
      )
      setStep("upload")
      setProgress(0)
    }
  }

  const stepIdx = step === "upload" ? 0 : step === "processing" ? 1 : 2

  return (
    <div>
      <ProcessStepper
        labels={["Cargar", "Procesar", "Revisar"]}
        current={stepIdx}
      />

      {step === "upload" ? (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFile(e.dataTransfer.files?.[0])
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center transition-all",
              dragOver
                ? "border-primary bg-primary-soft"
                : "border-border bg-card"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
              <RiUploadCloud2Line className="size-6" />
            </div>
            <div className="text-base font-semibold tracking-tight">
              Arrastra tu factura aquí
            </div>
            <div className="text-sm text-muted-foreground">
              o haz clic para seleccionar · PDF, JPG, PNG · Máx 10 MB
            </div>
            {error ? (
              <div className="mt-1 text-sm font-medium text-destructive">
                {error}
              </div>
            ) : null}
            <div className="mt-2 flex gap-2">
              <Badge variant="outline">
                <RiFileTextLine />
                PDF
              </Badge>
              <Badge variant="outline">
                <RiImage2Line />
                JPG/PNG
              </Badge>
              <Badge variant="outline">
                <RiCameraLine />
                Foto
              </Badge>
            </div>
          </Card>

          <Card className="p-5">
            <CardContent className="!p-0">
              <div className="mb-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                ¿Qué extrae la IA?
              </div>
              {[
                {
                  icon: RiBuildingLine,
                  t: "Datos del proveedor",
                  s: "Nombre, dirección, país, RFC/Tax ID",
                },
                {
                  icon: RiFileTextLine,
                  t: "Información de factura",
                  s: "Número, fecha, moneda, incoterm",
                },
                {
                  icon: RiBox3Line,
                  t: "Ítems detallados",
                  s: "Descripción, cantidad, precio unitario, subtotal",
                },
                {
                  icon: RiPriceTag3Line,
                  t: "Sugerencia de subpartida",
                  s: "Para cada producto según descripción",
                },
                {
                  icon: RiLineChartLine,
                  t: "Totales y flete",
                  s: "Subtotal, flete, seguro, valor CIF",
                },
              ].map((row) => (
                <div key={row.t} className="flex items-start gap-3 py-2">
                  <div className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-2 text-foreground/70">
                    <row.icon className="size-3.5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{row.t}</div>
                    <div className="text-xs text-muted-foreground">{row.s}</div>
                  </div>
                </div>
              ))}
              <Separator className="my-3" />
              <div className="flex items-center gap-2.5 rounded-md bg-ai-soft px-3 py-2.5">
                <RiLockLine className="size-3.5 text-ai" />
                <div className="text-xs text-foreground/75">
                  Tu factura se procesa con confidencialidad. Cumplimos la Ley
                  Nº 2492 (CTB).
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === "processing" ? (
        <Card className="mt-6 p-12 text-center">
          <CardContent className="!p-0">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-ai-soft text-ai">
              <RiSparkling2Line className="size-7 animate-pulse" />
            </div>
            <div className="text-[17px] font-semibold tracking-tight">
              Procesando factura con IA
            </div>
            <div className="mt-1.5 text-sm text-muted-foreground">
              {progress < 30 && "Detectando estructura del documento…"}
              {progress >= 30 &&
                progress < 60 &&
                "Extrayendo datos del proveedor y productos…"}
              {progress >= 60 &&
                progress < 90 &&
                "Clasificando subpartidas arancelarias…"}
              {progress >= 90 && "Finalizando…"}
            </div>
            <div className="mx-auto mt-5 max-w-xs">
              <Progress value={progress} className="h-1.5" />
            </div>
            <div className="mt-2 font-mono text-[11px] text-muted-foreground tabular-nums">
              {Math.floor(progress)}%
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <RiCheckLine className="size-3 text-success" /> OCR completado
              </span>
              {progress > 30 ? (
                <span className="inline-flex items-center gap-1">
                  <RiCheckLine className="size-3 text-success" /> Tablas
                  detectadas
                </span>
              ) : null}
              {progress > 60 ? (
                <span className="inline-flex items-center gap-1">
                  <RiCheckLine className="size-3 text-success" /> 4 ítems
                  extraídos
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "review" && factura ? <Review factura={factura} /> : null}
    </div>
  )
}

function ProcessStepper({
  labels,
  current,
}: {
  labels: string[]
  current: number
}) {
  return (
    <Card className="!flex-row items-center gap-1 px-5 py-3">
      <CardContent className="!flex w-full !flex-row !items-center !gap-1 !p-0">
        {labels.map((s, i) => {
          const active = i === current
          const done = i < current
          return (
            <React.Fragment key={s}>
              <div className="flex shrink-0 items-center gap-2">
                <div
                  className={cn(
                    "grid size-[22px] place-items-center rounded-full text-[11px] font-semibold transition-colors",
                    done && "bg-success text-white",
                    active && "bg-primary text-primary-foreground",
                    !done && !active && "bg-surface-2 text-muted-foreground"
                  )}
                >
                  {done ? <RiCheckLine className="size-3" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s}
                </span>
              </div>
              {i < labels.length - 1 ? (
                <div
                  className={cn(
                    "mx-2 h-px min-w-2.5 flex-1",
                    done ? "bg-success" : "bg-border"
                  )}
                />
              ) : null}
            </React.Fragment>
          )
        })}
      </CardContent>
    </Card>
  )
}

function PlaceholderImg({
  label,
  ratio = "3/4",
}: {
  label: string
  ratio?: string
}) {
  return (
    <div
      className="grid place-items-center rounded-md border border-dashed border-border bg-[repeating-linear-gradient(135deg,var(--surface-2)_0_10px,color-mix(in_oklch,var(--surface-2)_60%,var(--background))_10px_20px)] font-mono text-[11px] text-muted-foreground"
      style={{ aspectRatio: ratio }}
    >
      {label}
    </div>
  )
}

function Review({ factura }: { factura: Factura }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
      <Card className="self-start p-4 lg:sticky lg:top-20">
        <CardContent className="!p-0">
          <div className="mb-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Documento original
          </div>
          <PlaceholderImg label="factura.pdf · pág 1/2" ratio="3/4" />
          <div className="mt-3 text-[11px] text-muted-foreground">
            Calidad detectada: <strong className="text-success">Alta</strong> ·
            Texto extraído al 96%
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
          <RiCheckboxCircleFill className="size-5 text-success" />
          <div className="text-[15px] font-semibold">Datos extraídos</div>
          <AIBadge title="Datos detectados por IA — revísalos en el siguiente paso" />
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            Confianza global:
            <Confidence value={89} />
          </div>
        </div>

        <Card className="mb-3.5 p-5">
          <CardContent className="!p-0">
            <div className="mb-2.5 flex items-center gap-2">
              <RiBuildingLine className="size-4 text-muted-foreground" />
              <div className="text-[13px] font-semibold">Proveedor</div>
              <Confidence
                value={factura.proveedor.confidence ?? 0}
                className="ml-auto"
              />
            </div>
            <div className="text-sm font-medium">
              {factura.proveedor.nombre}
            </div>
            <div className="mt-0.5 text-xs text-foreground/75">
              {factura.proveedor.direccion} · {factura.proveedor.pais}
            </div>
          </CardContent>
        </Card>

        <div className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <Card className="p-5">
            <CardContent className="!p-0">
              <div className="mb-2 flex items-center gap-2">
                <RiFileTextLine className="size-4 text-muted-foreground" />
                <div className="text-[13px] font-semibold">Factura</div>
                <Confidence
                  value={factura.factura.confidence ?? 0}
                  className="ml-auto"
                />
              </div>
              <div className="text-xs text-muted-foreground">Número</div>
              <div className="font-mono text-[13.5px] font-medium">
                {factura.factura.numero}
              </div>
              <div className="mt-2 flex gap-4 text-xs">
                {[
                  ["Fecha", factura.factura.fecha],
                  ["Incoterm", factura.factura.incoterm],
                  ["Moneda", factura.factura.moneda],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-muted-foreground">{k}</div>
                    <div className="font-medium tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardContent className="!p-0">
              <div className="mb-2.5 flex items-center gap-2">
                <RiLineChartLine className="size-4 text-muted-foreground" />
                <div className="text-[13px] font-semibold">Totales</div>
              </div>
              {[
                ["Subtotal", factura.totales.subtotal],
                ["Flete", factura.totales.flete],
                ["Seguro", factura.totales.seguro],
              ].map(([k, v]) => (
                <div
                  key={k as string}
                  className="flex justify-between py-0.5 text-[12.5px]"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono tabular-nums">
                    USD {((v as number) ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between text-[13.5px] font-semibold">
                <span>Valor CIF</span>
                <span className="font-mono tabular-nums">
                  USD {(factura.totales.cif ?? 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <RiBox3Line className="size-4 text-muted-foreground" />
            <div className="text-[13px] font-semibold">
              {factura.items.length} ítems detectados
            </div>
            <div className="ml-auto text-[11px] text-muted-foreground">
              {factura.items.filter((i) => i.confidence < 80).length} requieren
              revisión
            </div>
          </div>
          {factura.items.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5",
                i > 0 && "border-t border-border/60"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px]">{item.descripcion}</div>
                <div className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
                  {item.subpartida ?? (
                    <span className="text-destructive">Sin subpartida</span>
                  )}{" "}
                  · {item.cantidad} {item.unidad}
                </div>
              </div>
              <Confidence value={item.confidence ?? 0} />
            </div>
          ))}
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RiInformationLine className="size-3" />
            En el siguiente paso podrás editar y corregir cada dato extraído.
          </div>
          <Button asChild size="lg">
            <Link href={`/editar?factura=${encodeURIComponent(factura.id)}`}>
              Revisar y editar
              <RiArrowRightLine />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
