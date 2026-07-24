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
  RiFileList3Line,
  RiFileTextLine,
  RiLineChartLine,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiUser3Line,
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

type SectionId =
  | "general"
  | "importador"
  | "proveedor"
  | "transporte"
  | "transaccion"
  | "items"
  | "docsop"
  | "liquidacion"

type Section = {
  id: SectionId
  label: string
  icon: React.ComponentType<{ className?: string }>
  complete: boolean
  attention?: number
}

/** Tipo de usuario / modalidad del declarante (`tipoUsuarioDims`). */
type TipoUsuario = "general" | "noPresencial" | "menajeDomestico"
/** Tipo de aduana de despacho (`aduDepDs.tip`). Condiciona País de Última Procedencia. */
type AduanaTipo = "A" | "I" | "P" | "F" | "Z"

export interface DimsDataShape {
  /** Referencia interna del borrador. NO es el código DIMS: ese lo asigna SUMA. */
  ref: string
  general: {
    tipoUsuario: TipoUsuario
    aduanaDespacho: string
    aduanaTipo: AduanaTipo
    regimen: string
    /** Código de modalidad del régimen (`modReg.cod`): 4101, 4107, 9300, … */
    modalidad: string
    parteRecepcionSiNo: boolean
    parteRecepcion: string
  }
  importador: {
    tipoDocumento: string
    numeroDocumento: string
    nombreRazonSocial: string
    domicilio: string
    departamentoDestino: string
  }
  proveedor: { nombre: string; direccion: string; pais: string; rfc: string }
  transporte: {
    paisUltimaProcedencia: string
    medioHastaFrontera: string
    manifiesto: string | null
  }
  transaccion: {
    valorFobUsd: number
    fleteDeclaradoSiNo: boolean
    fleteUsd: number
    seguroDeclaradoSiNo: boolean
    seguroUsd: number
    cantidadBultos: number
    pesoBruto: number
    pesoNeto: number
  }
  items: Array<{
    id: string
    item: number
    descripcion: string
    subtotal: number
    subpartida: string | null
    ga: number
  }>
  docSop: { requiereInfAdicional: boolean; infAdicional: string }
  liquidacion: {
    cif: number
    ga: number
    iva: number
    ice: number
    total_tributos: number
    total_pagar_bob: number
  }
}

const TIPO_USUARIO_LABEL: Record<TipoUsuario, string> = {
  general: "Importación general",
  noPresencial: "No presencial / Menor cuantía",
  menajeDomestico: "Menaje doméstico",
}

// Modalidades del régimen (`modReg.cod`) con su límite de valor FOB de referencia.
const MODALIDADES: { cod: string; label: string; limite?: number }[] = [
  { cod: "4101", label: "4101 · Menor Cuantía General", limite: 2000 },
  { cod: "4103", label: "4103 · Menor Cuantía Especial", limite: 3500 },
  { cod: "4105", label: "4105 · Incentivos Ley 1391", limite: 35000 },
  { cod: "4106", label: "4106 · Incentivos Ley 1546" },
  { cod: "4107", label: "4107 · Abandono / Courier", limite: 1000 },
  { cod: "9100", label: "9100 · Tráfico Postal (Ingreso)" },
  { cod: "9200", label: "9200 · Servicio Expreso (Courier)" },
  { cod: "9300", label: "9300 · Menaje Doméstico", limite: 35000 },
]

const SECTIONS: Section[] = [
  { id: "general", label: "Datos generales", icon: RiFileTextLine, complete: true },
  { id: "importador", label: "Importador", icon: RiUser3Line, complete: true },
  { id: "proveedor", label: "Proveedor", icon: RiBuildingLine, complete: true },
  { id: "transporte", label: "Lugares y transporte", icon: RiBox3Line, complete: true, attention: 1 },
  { id: "transaccion", label: "Transacción y bultos", icon: RiMoneyDollarCircleLine, complete: true },
  { id: "items", label: "Ítems", icon: RiPriceTag3Line, complete: true },
  { id: "docsop", label: "Documentos soporte", icon: RiFileList3Line, complete: true },
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
            Preparar declaración DIMS{" "}
            <span className="font-mono text-base font-medium text-muted-foreground">
              · ref. {data.ref}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pre-llenada automáticamente con los datos de la factura y el arancel.
            Revisá los campos requeridos y los resaltados.
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

      <SumaNotice />

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,240px)_1fr]">
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

/**
 * El código/número DIMS no se genera acá: lo asigna el sistema SUMA de la
 * Aduana Nacional al presentar la declaración. Este aviso lo deja explícito.
 */
function SumaNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3">
      <RiInformationLine className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="text-[12.5px] leading-relaxed text-foreground/80">
        <span className="font-semibold text-foreground">
          El código DIMS no se genera en esta plataforma.
        </span>{" "}
        Acá solo preparás y validás la declaración. El número oficial lo asigna
        el sistema <strong>SUMA</strong> de la Aduana Nacional cuando presentás
        la DIMS. Mientras tanto se identifica con la referencia interna del
        borrador.
      </div>
    </div>
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
  if (sectionId === "importador") return <SectionImportador data={data} />
  if (sectionId === "proveedor") return <SectionProveedor data={data} />
  if (sectionId === "transporte") return <SectionTransporte data={data} />
  if (sectionId === "transaccion") return <SectionTransaccion data={data} />
  if (sectionId === "items") return <SectionItems data={data} />
  if (sectionId === "docsop") return <SectionDocSop data={data} />
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
  hint,
  children,
}: {
  label: string
  required?: boolean
  aiFilled?: boolean
  hint?: string
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
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  )
}

function SectionGeneral({ data }: { data: DimsDataShape }) {
  const g = data.general
  const [tipoUsuario, setTipoUsuario] = React.useState<TipoUsuario>(g.tipoUsuario)
  const [modalidad, setModalidad] = React.useState(g.modalidad)
  const [parteSiNo, setParteSiNo] = React.useState(g.parteRecepcionSiNo)

  const modInfo = MODALIDADES.find((m) => m.cod === modalidad)
  // Menaje doméstico fija el régimen y exige Parte de Recepción (reglas del doc).
  const menaje = tipoUsuario === "menajeDomestico"

  return (
    <SectionWrapper title="Datos generales" icon={RiFileTextLine}>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow
          label="Modalidad del declarante"
          required
          hint="Define límites de valor y documentos soporte obligatorios."
        >
          <Select
            value={tipoUsuario}
            onValueChange={(v) => setTipoUsuario(v as TipoUsuario)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TIPO_USUARIO_LABEL) as TipoUsuario[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TIPO_USUARIO_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <FieldRow label="Aduana de despacho" required>
          <Select defaultValue={g.aduanaDespacho}>
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

        <FieldRow
          label="Destino / Régimen aduanero"
          required
          hint={menaje ? "Fijado en régimen 93 (Menaje Doméstico)." : undefined}
        >
          <Select defaultValue={menaje ? "93 - Menaje Doméstico" : g.regimen} disabled={menaje}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "41 - Importación a Consumo",
                "91 - Tráfico Postal / Courier",
                "93 - Menaje Doméstico",
              ].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <FieldRow
          label="Modalidad del régimen"
          required
          hint={
            modInfo?.limite
              ? `Valor FOB máximo de referencia: USD ${modInfo.limite.toLocaleString("es-BO")}.`
              : undefined
          }
        >
          <Select value={modalidad} onValueChange={setModalidad}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODALIDADES.map((m) => (
                <SelectItem key={m.cod} value={m.cod}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <FieldRow label="¿Tiene Parte de Recepción?" required>
          <Segmented
            value={parteSiNo ? "si" : "no"}
            onChange={(v) => setParteSiNo(v === "si")}
            options={[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ]}
          />
        </FieldRow>

        <FieldRow
          label="Nº de Parte de Recepción"
          required={parteSiNo}
          hint={!parteSiNo ? "Se habilita cuando la DIMS tiene Parte de Recepción." : undefined}
        >
          <Input
            key={String(parteSiNo)}
            disabled={!parteSiNo}
            placeholder={parteSiNo ? "Ej: PR-2026-001842" : "—"}
            className="font-mono"
            defaultValue={parteSiNo ? g.parteRecepcion : ""}
          />
        </FieldRow>
      </div>
    </SectionWrapper>
  )
}

function SectionImportador({ data }: { data: DimsDataShape }) {
  const im = data.importador
  return (
    <SectionWrapper title="Datos del importador" icon={RiUser3Line}>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow label="Tipo de documento" required>
          <Select defaultValue={im.tipoDocumento}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["NIT", "CI - Cédula de Identidad", "CEX - Carnet de Extranjería"].map(
                (t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Número de documento" required>
          <Input className="font-mono" defaultValue={im.numeroDocumento} />
        </FieldRow>
        <div className="md:col-span-2">
          <FieldRow label="Nombre / Razón social" required aiFilled>
            <Input defaultValue={im.nombreRazonSocial} />
          </FieldRow>
        </div>
        <div className="md:col-span-2">
          <FieldRow label="Domicilio legal" required>
            <Input defaultValue={im.domicilio} />
          </FieldRow>
        </div>
        <FieldRow label="Departamento de destino" required>
          <Select defaultValue={im.departamentoDestino}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "La Paz",
                "Santa Cruz",
                "Cochabamba",
                "Oruro",
                "Potosí",
                "Chuquisaca",
                "Tarija",
                "Beni",
                "Pando",
              ].map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  // País de última procedencia: habilitado/requerido solo en aduana A/I/P;
  // en Frontera (F) o Zona Franca (Z) se asigna automáticamente.
  const fronteriza =
    data.general.aduanaTipo === "F" || data.general.aduanaTipo === "Z"

  return (
    <SectionWrapper title="Lugares y transporte" icon={RiBox3Line} attention>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow
          label="País de última procedencia"
          required={!fronteriza}
          aiFilled={!fronteriza}
          hint={
            fronteriza
              ? "Aduana de frontera/zona franca: se asigna automáticamente."
              : "No se permite seleccionar Bolivia."
          }
        >
          <Input defaultValue={t.paisUltimaProcedencia} disabled={fronteriza} />
        </FieldRow>
        <FieldRow
          label="Transporte hasta la frontera"
          required
          aiFilled
          hint="Régimen 41 aéreo → 4 · frontera → 3 · régimen 91 → 5 (postal/courier)."
        >
          <Select defaultValue={t.medioHastaFrontera}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "3 - Carretero",
                "4 - Aéreo",
                "5 - Postal o Courier",
                "1 - Marítimo",
              ].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <div className="md:col-span-2">
          <FieldRow label="Nº manifiesto de carga" required>
            <Input
              placeholder="Ej: MAN-2026-04887"
              className="border-warning bg-warning-soft"
              defaultValue={t.manifiesto ?? ""}
            />
            <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-warning">
              <RiAlertLine className="size-3" />
              Campo obligatorio. Búscalo en la guía de transporte.
            </div>
          </FieldRow>
        </div>
      </div>
    </SectionWrapper>
  )
}

function SectionTransaccion({ data }: { data: DimsDataShape }) {
  const tx = data.transaccion
  const [fleteSiNo, setFleteSiNo] = React.useState(tx.fleteDeclaradoSiNo)
  const [seguroSiNo, setSeguroSiNo] = React.useState(tx.seguroDeclaradoSiNo)

  return (
    <SectionWrapper title="Información de la transacción" icon={RiMoneyDollarCircleLine}>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow label="Valor FOB total (USD)" required aiFilled>
          <Input
            type="number"
            className="font-mono tabular-nums"
            defaultValue={tx.valorFobUsd}
          />
        </FieldRow>

        <FieldRow label="¿Flete pagado hasta lugar de importación?">
          <Segmented
            value={fleteSiNo ? "si" : "no"}
            onChange={(v) => setFleteSiNo(v === "si")}
            options={[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ]}
          />
        </FieldRow>
        <FieldRow
          label="Flete declarado (USD)"
          required={fleteSiNo}
          hint={!fleteSiNo ? "Se calcula por parámetrica cuando no está declarado." : undefined}
        >
          <Input
            key={"flete-" + String(fleteSiNo)}
            type="number"
            disabled={!fleteSiNo}
            className="font-mono tabular-nums"
            defaultValue={fleteSiNo ? tx.fleteUsd : undefined}
          />
        </FieldRow>

        <FieldRow label="¿Tiene costo de seguro?">
          <Segmented
            value={seguroSiNo ? "si" : "no"}
            onChange={(v) => setSeguroSiNo(v === "si")}
            options={[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ]}
          />
        </FieldRow>
        <FieldRow
          label="Seguro declarado (USD)"
          required={seguroSiNo}
          hint={!seguroSiNo ? "Se calcula la base imponible del seguro." : undefined}
        >
          <Input
            key={"seguro-" + String(seguroSiNo)}
            type="number"
            disabled={!seguroSiNo}
            className="font-mono tabular-nums"
            defaultValue={seguroSiNo ? tx.seguroUsd : undefined}
          />
        </FieldRow>

        <FieldRow label="Cantidad total de bultos" required hint="Debe ser mayor a 0.">
          <Input
            type="number"
            min={1}
            className="font-mono tabular-nums"
            defaultValue={tx.cantidadBultos}
          />
        </FieldRow>
        <FieldRow
          label="Peso bruto total (kg)"
          required
          hint="Máx. 40 kg en modalidades courier/postal."
        >
          <Input
            type="number"
            className="font-mono tabular-nums"
            defaultValue={tx.pesoBruto}
          />
        </FieldRow>
        <FieldRow
          label="Peso neto total (kg)"
          required
          hint="Debe ser menor o igual al peso bruto."
        >
          <Input
            type="number"
            className="font-mono tabular-nums"
            defaultValue={tx.pesoNeto}
          />
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

function SectionDocSop({ data }: { data: DimsDataShape }) {
  const [requiere, setRequiere] = React.useState(data.docSop.requiereInfAdicional)

  const DOCS = [
    { cod: "CM-003", label: "Factura Comercial" },
    { cod: "CM-004", label: "Factura de Compra Local" },
    { cod: "CM-007", label: "Declaración Jurada" },
    { cod: "OT-001", label: "Parte de Recepción" },
  ]

  return (
    <SectionWrapper title="Documentos soporte" icon={RiFileList3Line}>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DOCS.map((doc) => (
          <label
            key={doc.cod}
            className="flex items-center gap-2.5 rounded-md border px-3 py-2 text-[13px]"
          >
            <input type="checkbox" className="size-3.5 accent-primary" />
            <span className="font-mono text-[11px] text-muted-foreground">
              {doc.cod}
            </span>
            <span>{doc.label}</span>
          </label>
        ))}
      </div>
      <p className="mb-4 text-[11.5px] text-muted-foreground">
        En modalidad no presencial es obligatorio adjuntar al menos uno de
        CM-003, CM-004 o CM-007.
      </p>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <FieldRow label="¿Requiere información adicional?">
          <Segmented
            value={requiere ? "si" : "no"}
            onChange={(v) => setRequiere(v === "si")}
            options={[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ]}
          />
        </FieldRow>
        <div className="md:col-span-2">
          <FieldRow
            label="Información adicional"
            required={requiere}
            hint={!requiere ? "Se habilita al marcar “Sí”." : undefined}
          >
            <Input
              disabled={!requiere}
              defaultValue={requiere ? data.docSop.infAdicional : ""}
            />
          </FieldRow>
        </div>
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
              Esta es una simulación. El monto definitivo y el código DIMS se
              confirman al presentar la declaración en SUMA.
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
