"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiAlertLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowRightLine,
  RiBuildingLine,
  RiBox3Line,
  RiCheckLine,
  RiFileTextLine,
  RiLineChartLine,
  RiPriceTag3Line,
  RiInformationLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AIBadge } from "../_components/domain"

type SectionId = "general" | "proveedor" | "transporte" | "items" | "liquidacion"

type Section = {
  id: SectionId
  label: string
  icon: React.ComponentType<{ className?: string }>
  complete: boolean
  attention?: number
}

interface DimsDataShape {
  cabecera: {
    numeroDIMS: string
    fechaPresentacion: string
    aduanaIngreso: string
    regimen: string
    modalidad: string
  }
  proveedor: { nombre: string; direccion: string; pais: string; rfc: string }
  factura: { numero: string }
  transporte: {
    medio: string
    pais_procedencia: string
    puerto_destino: string
    manifiesto: string | null
  }
  items: Array<{
    id: string
    item: number
    descripcion: string
    subtotal: number
    subpartida: string | null
    ga: number
  }>
  liquidacion: {
    cif: number
    ga: number
    iva: number
    ice: number
    total_tributos: number
    total_pagar_bob: number
  }
}

const SECTIONS: Section[] = [
  { id: "general", label: "Datos generales", icon: RiFileTextLine, complete: true },
  { id: "proveedor", label: "Proveedor", icon: RiBuildingLine, complete: true },
  { id: "transporte", label: "Transporte", icon: RiBox3Line, complete: true, attention: 1 },
  { id: "items", label: "Ítems", icon: RiPriceTag3Line, complete: true },
  { id: "liquidacion", label: "Liquidación", icon: RiLineChartLine, complete: true },
]

export function DimsView({ data }: { data: DimsDataShape }) {
  const [mode, setMode] = React.useState<"stepped" | "full">("stepped")
  const [step, setStep] = React.useState(0)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Generar formulario DIMS{" "}
            <span className="font-mono text-base font-medium text-muted-foreground">
              · {data.cabecera.numeroDIMS}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pre-llenado automáticamente con los datos de la factura y arancel.
            Revisa los campos resaltados.
          </p>
        </div>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "stepped", label: "Paso a paso" },
            { value: "full", label: "Vista completa" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,240px)_1fr]">
        <Card className="self-start p-2 lg:sticky lg:top-20">
          <CardContent className="!p-0">
            {SECTIONS.map((s, i) => {
              const active = mode === "stepped" ? step === i : false
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (mode === "stepped") setStep(i)
                    else
                      document
                        .getElementById("sec-" + s.id)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-foreground/75 hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "grid size-[22px] shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                      s.attention
                        ? "bg-warning-soft text-warning"
                        : s.complete
                        ? "bg-success-soft text-success"
                        : "bg-surface-2 text-muted-foreground"
                    )}
                  >
                    {s.attention ? (
                      <RiAlertLine className="size-3" />
                    ) : s.complete ? (
                      <RiCheckLine className="size-3" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="flex-1">{s.label}</span>
                  {s.attention ? (
                    <Badge
                      className="ml-auto bg-warning-soft text-warning"
                      variant="outline"
                    >
                      {s.attention}
                    </Badge>
                  ) : null}
                </button>
              )
            })}
            <Separator className="my-3" />
            <div className="px-1.5 pb-1">
              <div className="mb-1 text-[11px] text-muted-foreground">
                Progreso
              </div>
              <Progress value={88} className="h-1" />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>88% completo</span>
                <span>1 atención</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          {mode === "stepped" ? (
            <DimsSection sectionId={SECTIONS[step].id} data={data} />
          ) : (
            SECTIONS.map((s) => (
              <div
                key={s.id}
                id={"sec-" + s.id}
                className="mb-5 scroll-mt-20"
              >
                <DimsSection sectionId={s.id} data={data} />
              </div>
            ))
          )}

          {mode === "stepped" ? (
            <div className="mt-5 flex justify-between gap-2">
              <Button
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <RiArrowLeftSLine />
                Anterior
              </Button>
              {step < SECTIONS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Siguiente
                  <RiArrowRightSLine />
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/validar">
                    Validar DIMS
                    <RiArrowRightLine />
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-lg">
              <Badge className="bg-warning-soft text-warning">
                <RiAlertLine />1 campo requiere atención
              </Badge>
              <div className="ml-auto flex gap-2">
                <Button variant="outline">Guardar borrador</Button>
                <Button asChild>
                  <Link href="/validar">
                    Validar DIMS
                    <RiArrowRightLine />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DimsSection({
  sectionId,
  data,
}: {
  sectionId: SectionId
  data: DimsDataShape
}) {
  if (sectionId === "general") return <SectionGeneral data={data} />
  if (sectionId === "proveedor") return <SectionProveedor data={data} />
  if (sectionId === "transporte") return <SectionTransporte data={data} />
  if (sectionId === "items") return <SectionItems data={data} />
  return <SectionLiquidacion data={data} />
}

function SectionWrapper({
  title,
  icon: Icon,
  attention,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  attention?: boolean
  children: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <CardContent className="!p-0">
        <div className="mb-4 flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <div className="text-sm font-semibold">{title}</div>
          {attention ? (
            <Badge className="ml-auto bg-warning-soft text-warning">
              <RiAlertLine />
              Requiere atención
            </Badge>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function FieldRow({
  label,
  required,
  aiFilled,
  children,
}: {
  label: string
  required?: boolean
  aiFilled?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mb-3">
      <Label className="mb-1.5 text-xs">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
        {aiFilled ? <AIBadge /> : null}
      </Label>
      {children}
    </div>
  )
}

function SectionGeneral({ data }: { data: DimsDataShape }) {
  const d = data.cabecera
  return (
    <SectionWrapper title="Datos generales" icon={RiFileTextLine}>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow label="Número DIMS" required>
          <Input readOnly className="font-mono" defaultValue={d.numeroDIMS} />
        </FieldRow>
        <FieldRow label="Fecha de presentación" required aiFilled>
          <Input type="date" className="tabular-nums" defaultValue={d.fechaPresentacion} />
        </FieldRow>
        <FieldRow label="Aduana de ingreso" required>
          <Select defaultValue={d.aduanaIngreso}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "IQUIQUE-PISIGA",
                "ARICA-TAMBO QUEMADO",
                "YACUIBA",
                "VILLAZÓN",
                "EL ALTO",
              ].map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Régimen aduanero" required>
          <Select defaultValue={d.regimen}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "IM4 - Importación a Consumo",
                "IM6 - Reimportación",
                "IM7 - Depósito Aduanero",
              ].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Modalidad" required>
          <Segmented
            value={d.modalidad}
            onChange={() => {}}
            options={["Simplificada", "General"].map((v) => ({ value: v, label: v }))}
          />
        </FieldRow>
        <FieldRow label="Importador" required aiFilled>
          <Input defaultValue="María Quispe Mamani · NIT 7234182013" />
        </FieldRow>
      </div>
    </SectionWrapper>
  )
}

function SectionProveedor({ data }: { data: DimsDataShape }) {
  const p = data.proveedor
  return (
    <SectionWrapper title="Datos del proveedor" icon={RiBuildingLine}>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow label="Razón social" required aiFilled>
          <Input defaultValue={p.nombre} />
        </FieldRow>
        <FieldRow label="País de origen" required aiFilled>
          <Select defaultValue={p.pais}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["China", "Estados Unidos", "Brasil", "Chile"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <div className="md:col-span-2">
          <FieldRow label="Dirección" aiFilled>
            <Input defaultValue={p.direccion} />
          </FieldRow>
        </div>
        <FieldRow label="Tax ID / RFC" aiFilled>
          <Input className="font-mono" defaultValue={p.rfc} />
        </FieldRow>
        <FieldRow label="Tipo de relación">
          <Select defaultValue="No vinculado">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No vinculado">No vinculado</SelectItem>
              <SelectItem value="Vinculado">Vinculado</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
    </SectionWrapper>
  )
}

function SectionTransporte({ data }: { data: DimsDataShape }) {
  const t = data.transporte
  return (
    <SectionWrapper title="Datos de transporte" icon={RiBox3Line} attention>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow label="Medio de transporte" required aiFilled>
          <Select defaultValue={t.medio}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Terrestre", "Aéreo", "Marítimo", "Multimodal"].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="País de procedencia" required aiFilled>
          <Input defaultValue={t.pais_procedencia} />
        </FieldRow>
        <FieldRow label="Puerto/Aduana destino" required>
          <Input defaultValue={t.puerto_destino} />
        </FieldRow>
        <FieldRow label="Nº manifiesto de carga" required>
          <Input
            placeholder="Ej: MAN-2026-04887"
            className="border-warning bg-warning-soft"
          />
          <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-warning">
            <RiAlertLine className="size-3" />
            Campo obligatorio. Búscalo en la guía de transporte.
          </div>
        </FieldRow>
      </div>
    </SectionWrapper>
  )
}

function SectionItems({ data }: { data: DimsDataShape }) {
  return (
    <SectionWrapper title="Ítems declarados" icon={RiPriceTag3Line}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Subpartida</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Valor FOB</TableHead>
              <TableHead className="text-right">GA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono tabular-nums">
                  {String(item.item).padStart(3, "0")}
                </TableCell>
                <TableCell className="font-mono">
                  {item.subpartida ?? <span className="text-destructive">—</span>}
                </TableCell>
                <TableCell>{item.descripcion}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  USD {item.subtotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  USD {item.ga.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionWrapper>
  )
}

function SectionLiquidacion({ data }: { data: DimsDataShape }) {
  const l = data.liquidacion
  return (
    <SectionWrapper title="Liquidación de tributos" icon={RiLineChartLine}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          {[
            ["Valor CIF", l.cif],
            ["Gravamen Arancelario (GA)", l.ga],
            ["IVA (14.94%)", l.iva],
            ["ICE", l.ice],
          ].map(([k, v]) => (
            <div
              key={k as string}
              className="flex justify-between border-b border-border/60 py-2"
            >
              <span className="text-[13px] text-foreground/75">{k}</span>
              <span className="font-mono text-[13.5px] tabular-nums font-medium">
                USD {(v as number).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-semibold">
            <span className="text-[13.5px]">Total tributos a pagar</span>
            <span className="font-mono text-[15px] tabular-nums text-primary">
              USD {l.total_tributos.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl bg-primary-soft p-5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-primary">
            Total a pagar
          </div>
          <div className="mt-1 font-serif text-4xl tabular-nums tracking-tight text-primary">
            Bs{" "}
            {l.total_pagar_bob.toLocaleString("es-BO", {
              minimumFractionDigits: 2,
            })}
          </div>
          <div className="mt-1.5 text-xs text-foreground/75">
            Tipo de cambio: 6.91 BOB/USD · BCB del día
          </div>
          <Separator className="my-3" />
          <div className="flex items-start gap-2 text-xs text-foreground/75">
            <RiInformationLine className="mt-0.5 size-3.5 shrink-0" />
            <div>
              Esta es una simulación. El monto definitivo se confirma al
              presentar la DIMS en SUMA.
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
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
            "rounded-[5px] px-3 py-1 text-[12.5px] font-medium transition-colors",
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
