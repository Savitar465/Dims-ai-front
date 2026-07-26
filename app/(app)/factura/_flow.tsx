"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiAlertLine,
  RiArrowRightLine,
  RiBox3Line,
  RiBuildingLine,
  RiCameraLine,
  RiCheckboxCircleFill,
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiImage2Line,
  RiInformationLine,
  RiLineChartLine,
  RiLockLine,
  RiPriceTag3Line,
  RiSparkling2Line,
  RiTruckLine,
  RiUser3Line,
  RiUploadCloud2Line,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  clasificarSubpartidas,
  esExtraccionFallida,
  getFactura,
  uploadFactura,
  type DocumentoNoLeido,
} from "@/lib/services/facturas"
import type { Factura } from "@/lib/types/dims"
import {
  DOC_TIPO_LABEL,
  VisorDocumentos,
} from "../_components/visor-documentos"
import { AIBadge, Confidence } from "../_components/domain"

type Step = "upload" | "processing" | "review"
type Phase = "extracting" | "classifying"

const MAX_ARCHIVOS = 5

/**
 * Lo que se le muestra al usuario cuando la carga falla. `documentos` viene del
 * 422 del backend y dice qué archivo falló y por qué: sin eso, con tres
 * documentos cargados el usuario no sabe cuál tiene que volver a subir.
 */
interface ErrorCarga {
  mensaje: string
  documentos: DocumentoNoLeido[]
}

/** Códigos donde el mismo archivo puede funcionar en un segundo intento. */
const CODIGOS_REINTENTABLES = ["ia_sin_respuesta", "respuesta_ilegible"]

export function FacturaFlow() {
  const [step, setStep] = React.useState<Step>("upload")
  const [phase, setPhase] = React.useState<Phase>("extracting")
  const [progress, setProgress] = React.useState(0)
  const [dragOver, setDragOver] = React.useState(false)
  const [archivos, setArchivos] = React.useState<File[]>([])
  const [factura, setFactura] = React.useState<Factura | null>(null)
  const [error, setError] = React.useState<ErrorCarga | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Animate the progress bar while a phase is in flight; the jump to 100%
  // and the phase transition are driven by the real API responses below.
  React.useEffect(() => {
    if (step !== "processing") return
    const t = setTimeout(
      () => setProgress((p) => Math.min(95, p + 6 + Math.random() * 10)),
      220
    )
    return () => clearTimeout(t)
  }, [step, progress])

  const agregarArchivos = (nuevos: FileList | null) => {
    if (!nuevos?.length) return
    setError(null)
    setArchivos((actuales) => {
      // Se descartan repetidos por nombre+tamaño: arrastrar dos veces el mismo
      // PDF duplicaría el costo de extracción sin aportar nada.
      const clave = (f: File) => `${f.name}:${f.size}`
      const vistos = new Set(actuales.map(clave))
      const sumados = [...nuevos].filter((f) => !vistos.has(clave(f)))
      return [...actuales, ...sumados].slice(0, MAX_ARCHIVOS)
    })
  }

  const quitarArchivo = (idx: number) =>
    setArchivos((a) => a.filter((_, i) => i !== idx))

  const procesar = async () => {
    if (archivos.length === 0) return
    setError(null)
    setStep("processing")
    setPhase("extracting")
    setProgress(0)
    try {
      let result = await uploadFactura(archivos)
      let tries = 0
      while (result.estado === "procesando" && tries < 20) {
        await new Promise((r) => setTimeout(r, 800))
        result = await getFactura(result.id)
        tries++
      }
      // El upload que no pudo leer nada responde 422 y cae en el catch. Este
      // caso queda para la extracción diferida: el POST devolvió "procesando"
      // y el fallo recién se ve al consultar la factura, sin motivo por
      // documento porque ese detalle solo viaja en el error del upload.
      if (result.estado === "error") {
        setError({
          mensaje:
            "No pudimos leer los documentos. Probá con una foto más nítida o con el PDF original.",
          documentos: (result.documentos ?? [])
            .filter((d) => !d.aporto)
            .map((d) => ({
              nombre: d.nombre,
              codigo: d.error?.codigo ?? "sin_datos",
              mensaje:
                d.error?.mensaje ??
                "La IA no reconoció datos aprovechables en este documento.",
            })),
        })
        setStep("upload")
        setProgress(0)
        return
      }

      setPhase("classifying")
      setProgress(0)
      const classified = await clasificarSubpartidas(result.id)

      setFactura(classified)
      setProgress(100)
      setStep("review")
    } catch (e) {
      // El backend ya redacta el motivo de cada archivo: mostrarlo tal cual es
      // mucho más útil que el genérico de antes, que le pedía una foto más
      // nítida incluso cuando el problema era que la IA estaba sin cuota.
      const fallida = esExtraccionFallida(e)
      setError(
        fallida
          ? { mensaje: fallida.mensaje, documentos: fallida.documentos }
          : {
              mensaje:
                e instanceof Error ? e.message : "No se pudo procesar la factura.",
              documentos: [],
            }
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
          <div>
            <Card
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                agregarArchivos(e.dataTransfer.files)
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center transition-all",
                dragOver
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                hidden
                onChange={(e) => {
                  agregarArchivos(e.target.files)
                  e.target.value = ""
                }}
              />
              <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                <RiUploadCloud2Line className="size-6" />
              </div>
              <div className="text-base font-semibold tracking-tight">
                Arrastrá acá tus documentos
              </div>
              <div className="text-sm text-muted-foreground">
                o hacé clic para elegirlos · PDF, JPG o PNG · hasta{" "}
                {MAX_ARCHIVOS} archivos de 10 MB
              </div>
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

            {archivos.length > 0 ? (
              <Card className="mt-3 p-3">
                <CardContent className="!p-0">
                  {archivos.map((f, i) => (
                    <div
                      key={`${f.name}:${f.size}`}
                      className={cn(
                        "flex items-center gap-2.5 py-1.5",
                        i > 0 && "border-t border-border/60"
                      )}
                    >
                      <RiFileTextLine className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {f.name}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {(f.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        aria-label={`Quitar ${f.name}`}
                        onClick={() => quitarArchivo(i)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-destructive"
                      >
                        <RiCloseLine className="size-4" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {error ? (
              <Card className="mt-3 border-destructive/40 bg-destructive-soft p-3">
                <CardContent className="!p-0">
                  <div className="flex gap-2.5">
                    <RiErrorWarningLine className="mt-px size-4 shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-destructive">
                        {error.mensaje}
                      </p>
                      {error.documentos.length > 0 ? (
                        <ul className="mt-2 space-y-1.5">
                          {error.documentos.map((d, i) => (
                            <li
                              key={`${d.nombre}:${i}`}
                              className="text-[13px] text-muted-foreground"
                            >
                              <span className="font-medium text-foreground">
                                {d.nombre}
                              </span>
                              {" — "}
                              {d.mensaje}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {error.documentos.some((d) =>
                        CODIGOS_REINTENTABLES.includes(d.codigo)
                      ) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={procesar}
                        >
                          Reintentar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Button
              size="lg"
              className="mt-3 w-full"
              disabled={archivos.length === 0}
              onClick={procesar}
            >
              <RiSparkling2Line />
              {archivos.length === 0
                ? "Cargá al menos un documento"
                : archivos.length === 1
                  ? "Extraer datos del documento"
                  : `Extraer datos de los ${archivos.length} documentos`}
            </Button>
          </div>

          <Card className="p-5">
            <CardContent className="!p-0">
              <div className="mb-1 text-[13px] font-semibold">
                Cargá todos los documentos que tengas
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                La factura sola no alcanza para llenar la DIMS: los pesos, los
                bultos y el nº de guía casi nunca están en ella. Si sumás estos
                documentos, no vas a tener que tipearlos.
              </p>
              {[
                {
                  icon: RiFileTextLine,
                  t: "Factura comercial",
                  s: "Proveedor, importador, productos, montos e Incoterm",
                  req: true,
                },
                {
                  icon: RiBox3Line,
                  t: "Packing list",
                  s: "Cantidad de bultos, peso bruto y peso neto",
                },
                {
                  icon: RiTruckLine,
                  t: "Guía de transporte (AWB, B/L o carta de porte)",
                  s: "Nº de manifiesto, país de embarque y medio de transporte",
                },
              ].map((row) => (
                <div key={row.t} className="flex items-start gap-3 py-2">
                  <div className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-2 text-foreground/70">
                    <row.icon className="size-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium">
                      {row.t}
                      {row.req ? (
                        <Badge variant="outline" className="text-[10px]">
                          Necesaria
                        </Badge>
                      ) : (
                        <span className="text-[11px] font-normal text-muted-foreground">
                          si la tenés
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{row.s}</div>
                  </div>
                </div>
              ))}
              <Separator className="my-3" />
              <div className="mb-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Además, la IA sugiere
              </div>
              <div className="flex items-start gap-3">
                <div className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-2 text-foreground/70">
                  <RiPriceTag3Line className="size-3.5" />
                </div>
                <div>
                  <div className="text-[13px] font-medium">
                    El código arancelario de cada producto
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Según su descripción, para calcular los impuestos
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center gap-2.5 rounded-md bg-ai-soft px-3 py-2.5">
                <RiLockLine className="size-3.5 text-ai" />
                <div className="text-xs text-foreground/75">
                  Tus documentos se procesan con confidencialidad. Cumplimos la
                  Ley Nº 2492 (CTB).
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
              {phase === "extracting"
                ? "Extrayendo datos de la factura"
                : "Clasificando subpartidas"}
            </div>
            <div className="mt-1.5 text-sm text-muted-foreground">
              {phase === "extracting" ? (
                <>
                  {progress < 40 && "Detectando la estructura de cada documento…"}
                  {progress >= 40 &&
                    progress < 80 &&
                    "Leyendo proveedor, importador, productos, pesos y bultos…"}
                  {progress >= 80 && "Cruzando los datos de los documentos…"}
                </>
              ) : (
                <>
                  {progress < 50 &&
                    "Consultando catálogo arancelario NANDINA…"}
                  {progress >= 50 &&
                    progress < 90 &&
                    "Asignando subpartidas a cada producto…"}
                  {progress >= 90 && "Finalizando…"}
                </>
              )}
            </div>
            <div className="mx-auto mt-5 max-w-xs">
              <Progress value={progress} className="h-1.5" />
            </div>
            <div className="mt-2 font-mono text-[11px] text-muted-foreground tabular-nums">
              {Math.floor(progress)}%
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {archivos.map((f) => (
                <span key={f.name} className="inline-flex items-center gap-1">
                  <RiFileTextLine className="size-3" />
                  {f.name}
                </span>
              ))}
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


/**
 * Los campos obligatorios de la DIMS que se intentan sacar de los documentos.
 * Los que quedan vacíos se muestran igual, para que el usuario sepa desde acá
 * qué le va a faltar completar a mano.
 */
function camposDims(factura: Factura) {
  const imp = factura.importador ?? {}
  const log = factura.logistica ?? {}
  const fmtKg = (v?: number) =>
    v === undefined || v === null ? null : `${v.toLocaleString("es-BO")} kg`

  return {
    importador: [
      ["A nombre de", imp.nombreRazonSocial ?? null],
      ["NIT / documento", imp.numeroDocumento ?? null],
      ["Domicilio", imp.domicilio ?? null],
      ["Departamento de destino", imp.departamentoDestino ?? null],
    ] as [string, string | null][],
    carga: [
      [
        "Bultos",
        log.cantidadBultos !== undefined ? String(log.cantidadBultos) : null,
      ],
      ["Peso bruto", fmtKg(log.pesoBrutoKg)],
      ["Peso neto", fmtKg(log.pesoNetoKg)],
      ["Nº de guía", log.manifiesto ?? null],
      ["País de despacho", log.paisUltimaProcedencia ?? null],
    ] as [string, string | null][],
  }
}

function BloqueCampos({
  titulo,
  icon: Icon,
  confianza,
  campos,
}: {
  titulo: string
  icon: React.ComponentType<{ className?: string }>
  confianza?: number
  campos: [string, string | null][]
}) {
  return (
    <Card className="p-5">
      <CardContent className="!p-0">
        <div className="mb-2.5 flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <div className="text-[13px] font-semibold">{titulo}</div>
          <Confidence value={confianza ?? 0} className="ml-auto" />
        </div>
        {campos.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-3 py-1 text-[12.5px]"
          >
            <span className="text-muted-foreground">{k}</span>
            {v ? (
              <span className="truncate text-right font-medium">{v}</span>
            ) : (
              <span className="shrink-0 text-right text-warning">
                Aun por completar
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Review({ factura }: { factura: Factura }) {
  const documentos = factura.documentos ?? []
  const campos = camposDims(factura)
  const faltantes = [...campos.importador, ...campos.carga].filter(
    ([, v]) => !v
  ).length

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
      <Card className="self-start p-4 lg:sticky lg:top-20">
        <CardContent className="!p-0">
          <div className="mb-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Documentos cargados
          </div>
          <VisorDocumentos facturaId={factura.id} documentos={documentos} />
          <div className="mt-3 space-y-1.5">
            {documentos.map((d) => (
              <div
                key={d.nombre}
                className="flex items-start gap-1.5 text-[11px]"
              >
                {d.aporto ? (
                  <RiCheckLine className="mt-0.5 size-3 shrink-0 text-success" />
                ) : (
                  <RiAlertLine className="mt-0.5 size-3 shrink-0 text-warning" />
                )}
                <span className="min-w-0">
                  <span className="block truncate">{d.nombre}</span>
                  <span className="text-muted-foreground">
                    {d.aporto
                      ? DOC_TIPO_LABEL[d.tipo]
                      : "No pudimos leer datos de este archivo"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
          <RiCheckboxCircleFill className="size-5 text-success" />
          <div className="text-[15px] font-semibold">Datos extraídos</div>
          <AIBadge title="Datos detectados por IA — los revisás en el siguiente paso" />
          <div className="ml-auto text-xs text-muted-foreground">
            {faltantes === 0
              ? "Sacamos todos los datos de la declaración"
              : `${faltantes} ${faltantes === 1 ? "dato" : "datos"} no estaban en los documentos`}
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

        {/* Importador y carga: los campos obligatorios de la DIMS que antes
            había que tipear a mano porque no se extraían de ningún documento. */}
        <div className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <BloqueCampos
            titulo="Importador (a quién llega)"
            icon={RiUser3Line}
            confianza={factura.importador?.confidence}
            campos={campos.importador}
          />
          <BloqueCampos
            titulo="Carga y transporte"
            icon={RiTruckLine}
            confianza={factura.logistica?.confidence}
            campos={campos.carga}
          />
        </div>

        <Card className="mb-4">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <RiBox3Line className="size-4 text-muted-foreground" />
            <div className="text-[13px] font-semibold">
              {factura.items.length}{" "}
              {factura.items.length === 1
                ? "producto detectado"
                : "productos detectados"}
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
