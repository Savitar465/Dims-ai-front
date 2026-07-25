"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import Link from "next/link"
import {
  RiAlertLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowRightLine,
  RiBuildingLine,
  RiBox3Line,
  RiCheckDoubleLine,
  RiCheckLine,
  RiCornerDownRightLine,
  RiErrorWarningLine,
  RiEyeLine,
  RiSparkling2Line,
  RiFileList3Line,
  RiFileSearchLine,
  RiFileTextLine,
  RiLineChartLine,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiUser3Line,
  RiInformationLine,
  RiLoader4Line,
  RiQuestionLine,
  RiSearchLine,
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  ADUANAS_DESPACHO,
  DEPARTAMENTOS,
  DOCUMENTOS_SOPORTE,
  MEDIOS_TRANSPORTE,
  MODALIDADES,
  REGIMENES,
  TIPOS_DOCUMENTO,
  TIPOS_USUARIO,
  buscarGlosario,
  type TipoUsuario,
} from "@/lib/data/aduana"
import { PAISES, buscarPais } from "@/lib/data/paises"
import {
  esAduanaFronteriza,
  escribirCampo,
  evaluarDims,
  leerCampo,
  mapaDeCampos,
  siguientePendiente,
  type DimsFormState,
  type EstadoCampo,
  type Origen,
  type SectionId,
} from "@/lib/dims/campos"
import { modalidadesDe, sugerencias, type Sugerencia } from "@/lib/dims/derivar"
import { aDimsUpdate, huella } from "@/lib/dims/guardar"
import { updateDims } from "@/lib/services/dims"
import { searchSubpartidas } from "@/lib/services/arancel"
import { updateFacturaItem } from "@/lib/services/facturas"
import type { DimsUpdate, SubpartidaMatch } from "@/lib/types/dims"
import type { FacturaDocumento } from "@/lib/types/dims"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { VisorDocumentos } from "../_components/visor-documentos"
import { AIBadge } from "../_components/domain"

export interface DimsDataShape {
  /** Referencia interna del borrador. NO es el código DIMS: ese lo asigna SUMA. */
  ref: string
  general: {
    tipoUsuario: TipoUsuario
    aduanaDespacho: string
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
  docSop: {
    /** Códigos de `DOCUMENTOS_SOPORTE` ya marcados en el borrador. */
    documentos: string[]
    requiereInfAdicional: boolean
    infAdicional: string
  }
  liquidacion: {
    cif: number
    ga: number
    iva: number
    ice: number
    total_tributos: number
    total_pagar_bob: number
  }
}

type SeccionMeta = {
  id: SectionId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Los títulos también hablan en lenguaje común; el nombre oficial de cada
// bloque queda dentro de la sección.
const SECCIONES: SeccionMeta[] = [
  { id: "general", label: "Sobre el trámite", icon: RiFileTextLine },
  { id: "importador", label: "Tus datos", icon: RiUser3Line },
  { id: "proveedor", label: "Quién te vendió", icon: RiBuildingLine },
  { id: "transporte", label: "Cómo llegó", icon: RiBox3Line },
  { id: "transaccion", label: "Montos, pesos y bultos", icon: RiMoneyDollarCircleLine },
  { id: "items", label: "Productos", icon: RiPriceTag3Line },
  { id: "docsop", label: "Documentos", icon: RiFileList3Line },
  { id: "liquidacion", label: "Impuestos a pagar", icon: RiLineChartLine },
]

function estadoInicial(data: DimsDataShape): DimsFormState {
  return {
    general: {
      tipoUsuario: data.general.tipoUsuario,
      aduanaDespacho: data.general.aduanaDespacho,
      regimen: data.general.regimen,
      modalidad: data.general.modalidad,
      parteRecepcionSiNo: data.general.parteRecepcionSiNo,
      parteRecepcion: data.general.parteRecepcion,
    },
    importador: { ...data.importador },
    proveedor: { ...data.proveedor, relacion: "No vinculado" },
    transporte: {
      paisUltimaProcedencia: data.transporte.paisUltimaProcedencia,
      medioHastaFrontera: data.transporte.medioHastaFrontera,
      manifiesto: data.transporte.manifiesto ?? "",
    },
    transaccion: { ...data.transaccion },
    docsop: {
      documentos: [...data.docSop.documentos],
      requiereInfAdicional: data.docSop.requiereInfAdicional,
      infAdicional: data.docSop.infAdicional,
    },
  }
}

type Grupo = keyof DimsFormState
type Setter = <G extends Grupo>(grupo: G, patch: Partial<DimsFormState[G]>) => void

type EstadoGuardado = "sinCambios" | "guardando" | "guardado" | "error"

/**
 * Guarda el borrador solo cuando algo cambió de verdad, con un respiro para no
 * mandar una petición por tecla. Antes nada de lo que el usuario completaba
 * sobrevivía a recargar la página: el botón "Guardar borrador" no hacía nada.
 */
function useAutoguardado(dimsId: string, update: DimsUpdate) {
  const [estado, setEstado] = React.useState<EstadoGuardado>("sinCambios")
  // La huella de lo último confirmado por el servidor. Arranca en null para
  // que el primer render no dispare un guardado de algo que no se tocó.
  const guardado = React.useRef<string | null>(null)

  const guardar = React.useCallback(
    async (cuerpo: DimsUpdate) => {
      const firma = huella(cuerpo)
      setEstado("guardando")
      try {
        await updateDims(dimsId, cuerpo)
        guardado.current = firma
        setEstado("guardado")
      } catch {
        setEstado("error")
      }
    },
    [dimsId]
  )

  React.useEffect(() => {
    const firma = huella(update)
    if (guardado.current === null) {
      guardado.current = firma
      return
    }
    if (guardado.current === firma) return
    const t = setTimeout(() => void guardar(update), 1200)

    // Cambiar de pestaña o cerrarla dentro del respiro perdía lo último que se
    // escribió. En un trámite donde hay que ir a buscar papeles a otro lado eso
    // pasa todo el tiempo, así que ahí se guarda sin esperar.
    const alOcultar = () => {
      if (document.visibilityState !== "hidden") return
      if (guardado.current === firma) return
      clearTimeout(t)
      void guardar(update)
    }
    document.addEventListener("visibilitychange", alOcultar)
    return () => {
      clearTimeout(t)
      document.removeEventListener("visibilitychange", alOcultar)
    }
  }, [update, guardar])

  return {
    estado,
    /** Fuerza el guardado ya, sin esperar el respiro (botón o salida). */
    guardarAhora: React.useCallback(() => guardar(update), [guardar, update]),
  }
}

function IndicadorGuardado({ estado }: { estado: EstadoGuardado }) {
  if (estado === "sinCambios") return null
  if (estado === "guardando") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
        <RiLoader4Line className="size-3.5 animate-spin" />
        Guardando…
      </span>
    )
  }
  if (estado === "guardado") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-success">
        <RiCheckLine className="size-3.5" />
        Borrador guardado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] text-destructive">
      <RiErrorWarningLine className="size-3.5" />
      No pudimos guardar. Seguí completando e intentá de nuevo.
    </span>
  )
}

type ItemDims = DimsDataShape["items"][number]

interface SeccionProps {
  data: DimsDataShape
  form: DimsFormState
  set: Setter
  campos: Record<string, EstadoCampo>
  /** Por qué una regla dedujo cada campo. Se muestra donde está el valor. */
  motivos: Record<string, Sugerencia>
  confirmar: (id: string) => void
  /** Ítems vigentes: cambian cuando se clasifica un producto desde acá. */
  items: ItemDims[]
  facturaId?: string
  /** Devuelve false si el servidor rechazó el código: la fila vuelve atrás. */
  asignarSubpartida: (
    itemId: string,
    codigo: string,
    arancel: number
  ) => Promise<boolean>
}

export function DimsView({
  data,
  origenes: origenesIniciales,
  confianzas,
  facturaId,
  documentos = [],
}: {
  data: DimsDataShape
  /** De dónde salió cada valor precargado. Lo arma el adaptador del servidor. */
  origenes?: Record<string, Origen>
  /** Certeza de la IA por campo (0–100), solo en los leídos de un documento. */
  confianzas?: Record<string, number>
  /** Factura de origen: permite mostrar los documentos junto al formulario. */
  facturaId?: string
  documentos?: FacturaDocumento[]
}) {
  const [verDocumentos, setVerDocumentos] = React.useState(false)
  const [mode, setMode] = React.useState<"stepped" | "full">("stepped")
  const [step, setStep] = React.useState(0)
  const [form, setForm] = React.useState<DimsFormState>(() => estadoInicial(data))
  // Los productos se pueden clasificar sin salir de la declaración, así que su
  // subpartida deja de ser un dato de solo lectura del servidor.
  const [items, setItems] = React.useState<ItemDims[]>(data.items)
  const [origenes, setOrigenes] = React.useState<Record<string, Origen>>(
    () => ({ ...origenesIniciales })
  )

  // Tocar un campo lo vuelve propio del usuario: deja de ser una sugerencia
  // pendiente de revisar y las reglas ya no lo pisan.
  const set = React.useCallback<Setter>((grupo, patch) => {
    setForm((f) => ({ ...f, [grupo]: { ...f[grupo], ...patch } }))
    setOrigenes((o) => {
      const next = { ...o }
      for (const campo of Object.keys(patch)) next[`${grupo}.${campo}`] = "usuario"
      return next
    })
  }, [])

  const confirmar = React.useCallback((id: string) => {
    setOrigenes((o) => ({ ...o, [id]: "usuario" }))
  }, [])

  // Reglas de la normativa: rellenan lo que se puede deducir de las respuestas
  // anteriores, sin tocar nunca lo que vino de un documento ni lo que el
  // usuario escribió. Se resuelven en el render y no en el estado, así el valor
  // sigue siempre al contexto: cambiar la aduana cambia el país de procedencia
  // y el medio de transporte sin que quede un valor viejo pegado.
  //
  // Varias pasadas porque las reglas se encadenan: el tipo de usuario fija el
  // régimen y el régimen fija la modalidad.
  const derivado = React.useMemo(() => {
    let f = form
    const o: Record<string, Origen> = { ...origenes }
    for (let pasada = 0; pasada < 3; pasada++) {
      let hubo = false
      for (const [id, sugerencia] of Object.entries(sugerencias(f))) {
        if (o[id] === "usuario" || o[id] === "documento") continue
        if (leerCampo(f, id) === sugerencia.valor) continue
        f = escribirCampo(f, id, sugerencia.valor)
        o[id] = "sugerido"
        hubo = true
      }
      if (!hubo) break
    }
    return { form: f, origenes: o, motivos: sugerencias(f) }
  }, [form, origenes])

  const { form: formVigente, motivos } = derivado

  // Asignar el código acá y no en la factura evita mandar al usuario a otra
  // pantalla justo donde le señalamos el problema. El valor se persiste en la
  // factura, que es de donde la DIMS toma los ítems al regenerarse.
  const asignarSubpartida = React.useCallback(
    async (itemId: string, codigo: string, arancel: number) => {
      const previo = items.find((i) => i.id === itemId)
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                subpartida: codigo,
                ga: +((i.subtotal * arancel) / 100).toFixed(2),
              }
            : i
        )
      )
      if (!facturaId) return true
      try {
        await updateFacturaItem(facturaId, itemId, { subpartida: codigo })
        return true
      } catch {
        // Sin esto la fila quedaría mostrando un código que el servidor nunca
        // aceptó, y el usuario se enteraría recién al validar.
        if (previo) {
          setItems((prev) => prev.map((i) => (i.id === itemId ? previo : i)))
        }
        return false
      }
    },
    [items, facturaId]
  )

  const itemsSinSubpartida = items.filter((i) => !i.subpartida).length
  const subpartidas = React.useMemo(
    () => items.map((i) => i.subpartida).filter((c): c is string => !!c),
    [items]
  )
  const resumen = React.useMemo(
    () =>
      evaluarDims({
        form: formVigente,
        itemsSinSubpartida,
        subpartidas,
        origenes: derivado.origenes,
        confianzas,
      }),
    [formVigente, itemsSinSubpartida, subpartidas, derivado.origenes, confianzas]
  )
  const campos = React.useMemo(() => mapaDeCampos(resumen), [resumen])

  // Preguntar menos: las secciones que el trámite elegido no necesita no se
  // muestran ni ocupan un paso. El índice del paso se recorta acá porque
  // cambiar de tipo de usuario puede acortar la lista bajo los pies.
  const secciones = React.useMemo(
    () => SECCIONES.filter((s) => resumen.porSeccion[s.id].aplica),
    [resumen]
  )
  const ordenSecciones = React.useMemo(
    () => secciones.map((s) => s.id),
    [secciones]
  )
  const paso = Math.min(step, secciones.length - 1)
  // Todo lo que el botón "ir al siguiente" todavía puede visitar, incluidos los
  // de poca confianza: no bloquean la validación pero sí son trabajo pendiente.
  const porResolver =
    resumen.errores.length +
    resumen.pendientes +
    resumen.porConfirmar +
    resumen.aRevisar.length

  const update = React.useMemo(
    () => aDimsUpdate(formVigente, derivado.origenes),
    [formVigente, derivado.origenes]
  )
  const { estado: estadoGuardado, guardarAhora } = useAutoguardado(
    data.ref,
    update
  )

  // Solo tiene sentido ofrecer el visor si quedó guardado algún original.
  const puedeVerDocumentos = Boolean(
    facturaId && documentos.some((d) => d.id && d.archivo)
  )

  const confirmarTodo = () => {
    setOrigenes((o) => {
      const next = { ...o }
      for (const c of resumen.campos) if (c.porConfirmar) next[c.spec.id] = "usuario"
      return next
    })
  }

  const irAlSiguientePendiente = () => {
    const objetivo = siguientePendiente(
      resumen,
      ordenSecciones,
      mode === "stepped" ? secciones[paso]?.id : undefined
    )
    if (!objetivo) return
    // En modo paso a paso el campo destino puede vivir en una sección que aún
    // no está montada: hay que forzar el cambio de paso antes de buscarlo.
    if (mode === "stepped") {
      flushSync(() => setStep(ordenSecciones.indexOf(objetivo.spec.seccion)))
    }
    const el = document.getElementById(objetivo.spec.id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
    el?.focus({ preventScroll: true })
  }

  const seccionProps: Omit<SeccionProps, "data"> = {
    form: formVigente,
    set,
    campos,
    motivos,
    confirmar,
    items,
    facturaId,
    asignarSubpartida,
  }

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
            {resumen.listaParaValidar ? (
              <>
                Los {resumen.requeridos} datos obligatorios están completos y
                revisados. Ya podés validar.
              </>
            ) : (
              <>
                Sacamos {resumen.completos} de {resumen.requeridos} datos
                obligatorios de tus documentos.
                {resumen.errores.length > 0 ? (
                  <>
                    {" "}
                    Hay{" "}
                    <strong className="text-destructive">
                      {resumen.errores.length}
                    </strong>{" "}
                    que la aduana no aceptaría como {resumen.errores.length === 1 ? "está" : "están"}.
                  </>
                ) : null}
                {resumen.pendientes > 0 ? (
                  <>
                    {" "}
                    Te {resumen.pendientes === 1 ? "falta" : "faltan"}{" "}
                    <strong className="text-foreground">
                      {resumen.pendientes}
                    </strong>
                    .
                  </>
                ) : null}
                {resumen.porConfirmar > 0 ? (
                  <>
                    {" "}
                    Y hay{" "}
                    <strong className="text-foreground">
                      {resumen.porConfirmar}
                    </strong>{" "}
                    que completamos por vos y{" "}
                    {resumen.porConfirmar === 1
                      ? "necesita que lo confirmes"
                      : "necesitan que los confirmes"}
                    .
                  </>
                ) : null}
                {resumen.aRevisar.length > 0 ? (
                  <>
                    {" "}
                    De los que leímos de tus documentos,{" "}
                    <strong className="text-foreground">
                      {resumen.aRevisar.length}
                    </strong>{" "}
                    {resumen.aRevisar.length === 1
                      ? "no lo leímos con total certeza: conviene que lo compares"
                      : "no los leímos con total certeza: conviene que los compares"}{" "}
                    con el papel.
                  </>
                ) : null}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IndicadorGuardado estado={estadoGuardado} />
          {puedeVerDocumentos ? (
            <Button
              variant={verDocumentos ? "default" : "outline"}
              size="sm"
              onClick={() => setVerDocumentos((v) => !v)}
            >
              <RiFileSearchLine />
              {verDocumentos ? "Ocultar mis documentos" : "Ver mis documentos"}
            </Button>
          ) : null}
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "stepped", label: "Paso a paso" },
              { value: "full", label: "Vista completa" },
            ]}
          />
        </div>
      </div>

      <SumaNotice />

      <div
        className={cn(
          "mt-5 grid grid-cols-1 gap-6",
          verDocumentos
            ? "lg:grid-cols-[minmax(0,220px)_1fr_minmax(0,360px)]"
            : "lg:grid-cols-[minmax(0,240px)_1fr]"
        )}
      >
        <Card className="self-start p-2 lg:sticky lg:top-20">
          <CardContent className="!p-0">
            {secciones.map((s, i) => {
              const active = mode === "stepped" ? paso === i : false
              const estado = resumen.porSeccion[s.id]
              const Icon = s.icon
              // Una sección que no pide nada no puede estar completa ni
              // incompleta: se muestra neutra en vez de sumar un "Completo"
              // permanente que no dice nada.
              if (estado.informativa) {
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
                    <div className="grid size-[22px] shrink-0 place-items-center rounded-full bg-surface-2 text-muted-foreground">
                      <RiLineChartLine className="size-3" />
                    </div>
                    <span className="flex-1">{s.label}</span>
                    <Icon className="size-3.5 shrink-0 opacity-40" />
                  </button>
                )
              }
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
                      estado.errores
                        ? "bg-destructive-soft text-destructive"
                        : estado.pendientes
                          ? "bg-warning-soft text-warning"
                          : estado.porConfirmar
                            ? "bg-ai-soft text-ai"
                            : estado.aRevisar
                              ? "bg-surface-2 text-muted-foreground"
                              : "bg-success-soft text-success"
                    )}
                  >
                    {estado.errores ? (
                      <RiErrorWarningLine className="size-3" />
                    ) : estado.pendientes ? (
                      <RiAlertLine className="size-3" />
                    ) : estado.porConfirmar ? (
                      <RiEyeLine className="size-3" />
                    ) : estado.aRevisar ? (
                      <RiSearchLine className="size-3" />
                    ) : (
                      <RiCheckLine className="size-3" />
                    )}
                  </div>
                  <span className="flex-1">{s.label}</span>
                  <Icon className="size-3.5 shrink-0 opacity-40" />
                  {estado.errores ? (
                    <Badge
                      className="ml-auto bg-destructive-soft text-destructive"
                      variant="outline"
                    >
                      {estado.errores}
                    </Badge>
                  ) : estado.pendientes ? (
                    <Badge
                      className="ml-auto bg-warning-soft text-warning"
                      variant="outline"
                    >
                      {estado.pendientes}
                    </Badge>
                  ) : estado.porConfirmar ? (
                    <Badge
                      className="ml-auto bg-ai-soft text-ai"
                      variant="outline"
                    >
                      {estado.porConfirmar}
                    </Badge>
                  ) : estado.aRevisar ? (
                    <Badge
                      className="ml-auto bg-surface-2 text-muted-foreground"
                      variant="outline"
                      title="Datos que la IA leyó con poca certeza"
                    >
                      {estado.aRevisar}
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
              <Progress value={resumen.porcentaje} className="h-1" />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>{resumen.porcentaje}% completo</span>
                <span>
                  {resumen.completos}/{resumen.requeridos}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2.5 w-full"
                disabled={porResolver === 0}
                onClick={irAlSiguientePendiente}
              >
                <RiCornerDownRightLine />
                {porResolver === 0
                  ? "Todo completo"
                  : `Ir al siguiente (${porResolver})`}
              </Button>
              {resumen.porConfirmar > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1.5 w-full text-ai hover:bg-ai-soft"
                  onClick={confirmarTodo}
                >
                  <RiCheckDoubleLine />
                  Confirmar los {resumen.porConfirmar} sugeridos
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div>
          {mode === "stepped" ? (
            <DimsSection
              sectionId={secciones[paso].id}
              data={data}
              {...seccionProps}
            />
          ) : (
            secciones.map((s) => (
              <div key={s.id} id={"sec-" + s.id} className="mb-5 scroll-mt-20">
                <DimsSection sectionId={s.id} data={data} {...seccionProps} />
              </div>
            ))
          )}

          {mode === "stepped" ? (
            <div className="mt-5 flex justify-between gap-2">
              <Button
                variant="outline"
                disabled={paso === 0}
                onClick={() => setStep(Math.max(0, paso - 1))}
              >
                <RiArrowLeftSLine />
                Anterior
              </Button>
              <div className="flex items-center gap-2">
                {/* El botón de guardar también acá: antes solo existía en vista
                    completa y el modo por defecto es el paso a paso. */}
                <Button
                  variant="outline"
                  disabled={estadoGuardado === "guardando"}
                  onClick={() => void guardarAhora()}
                >
                  Guardar borrador
                </Button>
                {paso < secciones.length - 1 ? (
                  <Button onClick={() => setStep(paso + 1)}>
                    Siguiente
                    <RiArrowRightSLine />
                  </Button>
                ) : (
                  <Button
                    asChild
                    disabled={!resumen.listaParaValidar}
                    onClick={() => void guardarAhora()}
                  >
                    <Link href="/validar">
                      Validar DIMS
                      <RiArrowRightLine />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-lg">
              {resumen.listaParaValidar ? (
                <Badge className="bg-success-soft text-success">
                  <RiCheckLine />
                  Todos los datos obligatorios están completos
                </Badge>
              ) : (
                <button
                  onClick={irAlSiguientePendiente}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium hover:brightness-95",
                    resumen.errores.length > 0
                      ? "bg-destructive-soft text-destructive"
                      : resumen.pendientes > 0
                        ? "bg-warning-soft text-warning"
                        : "bg-ai-soft text-ai"
                  )}
                >
                  {resumen.errores.length > 0 ? (
                    <>
                      <RiErrorWarningLine className="size-3.5" />
                      {resumen.errores.length === 1
                        ? "1 dato no cumple una regla de la aduana"
                        : `${resumen.errores.length} datos no cumplen reglas de la aduana`}
                    </>
                  ) : resumen.pendientes > 0 ? (
                    <>
                      <RiAlertLine className="size-3.5" />
                      {resumen.pendientes === 1
                        ? "Falta 1 dato obligatorio"
                        : `Faltan ${resumen.pendientes} datos obligatorios`}
                    </>
                  ) : (
                    <>
                      <RiEyeLine className="size-3.5" />
                      {resumen.porConfirmar === 1
                        ? "Queda 1 dato por confirmar"
                        : `Quedan ${resumen.porConfirmar} datos por confirmar`}
                    </>
                  )}
                  <RiArrowRightLine className="size-3.5" />
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={estadoGuardado === "guardando"}
                  onClick={() => void guardarAhora()}
                >
                  Guardar borrador
                </Button>
                <Button
                  asChild
                  disabled={!resumen.listaParaValidar}
                  // Se guarda antes de salir para que la validación corra sobre
                  // lo que el usuario ve, no sobre el último autoguardado.
                  onClick={() => void guardarAhora()}
                >
                  <Link href="/validar">
                    Validar DIMS
                    <RiArrowRightLine />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {verDocumentos && facturaId ? (
          <Card className="self-start p-4 lg:sticky lg:top-20">
            <CardContent className="!p-0">
              <div className="mb-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Tus documentos
              </div>
              <p className="mb-3 text-[11.5px] leading-relaxed text-muted-foreground">
                Compará cada dato con el papel original antes de confirmarlo.
              </p>
              <VisorDocumentos facturaId={facturaId} documentos={documentos} />
            </CardContent>
          </Card>
        ) : null}
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
  ...props
}: SeccionProps & { sectionId: SectionId }) {
  if (sectionId === "general") return <SectionGeneral {...props} />
  if (sectionId === "importador") return <SectionImportador {...props} />
  if (sectionId === "proveedor") return <SectionProveedor {...props} />
  if (sectionId === "transporte") return <SectionTransporte {...props} />
  if (sectionId === "transaccion") return <SectionTransaccion {...props} />
  if (sectionId === "items") return <SectionItems {...props} />
  if (sectionId === "docsop") return <SectionDocSop {...props} />
  return <SectionLiquidacion {...props} />
}

function SectionWrapper({
  title,
  subtitle,
  icon: Icon,
  pendientes = 0,
  errores = 0,
  informativa = false,
  children,
}: {
  title: string
  /** Nombre oficial del bloque en la DIMS, para quien ya conoce el trámite. */
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  pendientes?: number
  errores?: number
  /** No pide datos: sin badge de estado, porque no hay nada que completar. */
  informativa?: boolean
  children: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <CardContent className="!p-0">
        <div className="mb-4 flex items-center gap-2">
          <Icon className="mt-0.5 size-4 shrink-0 self-start text-muted-foreground" />
          <div>
            <div className="text-sm font-semibold">{title}</div>
            {subtitle ? (
              <div className="text-[11px] text-muted-foreground">{subtitle}</div>
            ) : null}
          </div>
          {informativa ? null : errores ? (
            <Badge className="ml-auto bg-destructive-soft text-destructive">
              <RiErrorWarningLine />
              {errores === 1 ? "1 dato a revisar" : `${errores} datos a revisar`}
            </Badge>
          ) : pendientes ? (
            <Badge className="ml-auto bg-warning-soft text-warning">
              <RiAlertLine />
              {pendientes === 1
                ? "Falta 1 dato"
                : `Faltan ${pendientes} datos`}
            </Badge>
          ) : (
            <Badge className="ml-auto bg-success-soft text-success">
              <RiCheckLine />
              Completo
            </Badge>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

/**
 * Toda la copy (pregunta, nombre técnico y ayuda) sale de `CAMPOS`, igual que
 * el estado de obligatoriedad: la vista no redefine ninguno de los dos.
 *
 * El badge de origen tampoco se decide acá: sale de `campo.origen`, así que un
 * campo vacío nunca puede quedar anunciado como "leído por la IA".
 */
function Campo({
  campo,
  ayuda,
  motivo,
  onConfirmar,
  full,
  children,
}: {
  campo: EstadoCampo
  /** Ayuda contextual que reemplaza a la del catálogo (reglas por modalidad). */
  ayuda?: string
  /** Explicación de la regla que dedujo el valor, cuando hubo una. */
  motivo?: Sugerencia
  onConfirmar?: () => void
  full?: boolean
  children: React.ReactNode
}) {
  const texto = ayuda ?? campo.spec.ayuda
  const leidoDelDocumento = campo.origen === "documento" && campo.completo
  return (
    <div className={cn("mb-3", full && "md:col-span-2")}>
      <Label htmlFor={campo.spec.id} className="mb-1 items-start gap-1.5">
        <span className="text-[13px] leading-snug font-medium">
          {campo.spec.label}
          {campo.requerido ? (
            <span className="text-destructive">*</span>
          ) : (
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
              (opcional)
            </span>
          )}
        </span>
        {leidoDelDocumento ? (
          <AIBadge
            title={
              campo.confianza !== undefined
                ? `Leído de tus documentos con ${campo.confianza}% de certeza`
                : undefined
            }
          />
        ) : null}
        {campo.aRevisar ? (
          <Badge variant="outline" className="text-muted-foreground">
            <RiSearchLine />
            Verificalo
          </Badge>
        ) : null}
        {campo.pendiente ? (
          <Badge className="bg-warning-soft text-warning">Falta</Badge>
        ) : null}
        {campo.porConfirmar ? (
          <Badge className="bg-ai-soft text-ai">
            <RiSparkling2Line />
            Lo completamos por vos
          </Badge>
        ) : null}
        {campo.problema?.nivel === "error" ? (
          <Badge className="bg-destructive-soft text-destructive">
            <RiErrorWarningLine />
            Revisar
          </Badge>
        ) : null}
      </Label>
      <TerminoTecnico tecnico={campo.spec.tecnico} />
      {children}
      {campo.problema ? (
        <div
          className={cn(
            "mt-1.5 flex items-start gap-2 rounded-md px-2.5 py-2 text-[11.5px] leading-relaxed",
            campo.problema.nivel === "error"
              ? "bg-destructive-soft text-destructive"
              : "bg-warning-soft text-warning"
          )}
        >
          <RiErrorWarningLine className="mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">{campo.problema.mensaje}</span>
        </div>
      ) : null}
      {campo.aRevisar ? (
        <div className="mt-1.5 flex items-start gap-2 rounded-md bg-surface-2 px-2.5 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
          <RiSearchLine className="mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">
            Lo sacamos de tus documentos, pero no lo leímos con total certeza
            {campo.confianza !== undefined ? ` (${campo.confianza}%)` : ""}.
            Comparalo con el papel antes de seguir.
          </span>
        </div>
      ) : null}
      {campo.porConfirmar ? (
        <div className="mt-1.5 flex flex-wrap items-start gap-2 rounded-md bg-ai-soft px-2.5 py-2">
          <RiSparkling2Line className="mt-0.5 size-3.5 shrink-0 text-ai" />
          <span className="min-w-0 flex-1 text-[11.5px] leading-relaxed text-foreground/80">
            {motivo?.motivo ??
              "Dejamos elegida la opción más común porque no figuraba en tus documentos. Revisala y confirmá."}
          </span>
          {onConfirmar ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 shrink-0 px-2 text-[11.5px]"
              onClick={onConfirmar}
            >
              <RiCheckLine />
              Está bien
            </Button>
          ) : null}
        </div>
      ) : null}
      {texto ? (
        <div className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          {texto}
        </div>
      ) : null}
    </div>
  )
}

/**
 * El nombre oficial del campo en la DIMS es el lugar natural para colgar la
 * definición: es justo la palabra que el usuario no entiende. El GLOSARIO ya
 * existía y no estaba enlazado desde ninguna parte.
 */
function TerminoTecnico({ tecnico }: { tecnico?: string }) {
  if (!tecnico) return null
  const glosario = buscarGlosario(tecnico)
  const linea = <>En la DIMS: {tecnico}</>
  const estilo = "mb-1.5 text-[10.5px] tracking-wide uppercase"

  if (!glosario) {
    return <div className={cn(estilo, "text-muted-foreground/70")}>{linea}</div>
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              estilo,
              "flex items-center gap-1 text-muted-foreground/70 underline decoration-dotted underline-offset-2 hover:text-foreground"
            )}
          >
            {linea}
            <RiQuestionLine className="size-3 shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="block max-w-xs normal-case">
          <span className="font-semibold">{glosario.term}</span>
          <span className="mt-0.5 block leading-relaxed opacity-90">
            {glosario.def}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Marca visual del input según falte, choque con una regla o esté sin revisar. */
function estiloPendiente(campo: EstadoCampo) {
  if (campo.problema?.nivel === "error") return "border-destructive"
  if (campo.pendiente) return "border-warning bg-warning-soft"
  if (campo.porConfirmar) return "border-ai"
  return undefined
}

function SectionGeneral({ form, set, campos, motivos, confirmar }: SeccionProps) {
  const g = form.general
  // Menaje doméstico fija el régimen y exige Parte de Recepción (reglas del doc).
  const menaje = g.tipoUsuario === "menajeDomestico"
  const modInfo = MODALIDADES.find((m) => m.cod === g.modalidad)
  // Solo las modalidades del régimen elegido: ofrecer las 8 obliga a entender
  // la diferencia entre "4103" y "9200" para descartar las que no aplican.
  const modalidades = modalidadesDe(g.regimen)

  return (
    <SectionWrapper
      title="Sobre el trámite"
      subtitle="Datos generales de la declaración"
      icon={RiFileTextLine}
      pendientes={contar(campos, "general")}
      errores={contarErrores(campos, "general")}
    >
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Campo
          campo={campos["general.tipoUsuario"]}
          motivo={motivos["general.tipoUsuario"]}
          onConfirmar={() => confirmar("general.tipoUsuario")}
        >
          <Select
            value={g.tipoUsuario}
            onValueChange={(v) => {
              const tipoUsuario = v as TipoUsuario
              set("general", {
                tipoUsuario,
                // El menaje siempre va por régimen 93 y con Parte de Recepción.
                ...(tipoUsuario === "menajeDomestico"
                  ? { regimen: "93", parteRecepcionSiNo: true }
                  : {}),
              })
            }}
          >
            <SelectTrigger
              id="general.tipoUsuario"
              className={estiloPendiente(campos["general.tipoUsuario"])}
            >
              <SelectValue placeholder="Elegí una opción" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_USUARIO.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <OpcionConDetalle label={t.label} detalle={t.detalle} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo
          campo={campos["general.aduanaDespacho"]}
          motivo={motivos["general.aduanaDespacho"]}
          onConfirmar={() => confirmar("general.aduanaDespacho")}
        >
          <Select
            value={g.aduanaDespacho}
            onValueChange={(v) => set("general", { aduanaDespacho: v })}
          >
            <SelectTrigger
              id="general.aduanaDespacho"
              className={estiloPendiente(campos["general.aduanaDespacho"])}
            >
              <SelectValue placeholder="Elegí por dónde entró" />
            </SelectTrigger>
            <SelectContent>
              {agrupar(ADUANAS_DESPACHO).map(([grupo, aduanas]) => (
                <SelectGroup key={grupo}>
                  <SelectLabel>{grupo}</SelectLabel>
                  {aduanas.map((a) => (
                    <SelectItem key={a.cod} value={a.cod}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo
          campo={campos["general.regimen"]}
          motivo={motivos["general.regimen"]}
          onConfirmar={() => confirmar("general.regimen")}
          ayuda={
            menaje
              ? "Fijado automáticamente porque estás trayendo tu mudanza."
              : undefined
          }
        >
          <Select
            value={g.regimen}
            disabled={menaje}
            onValueChange={(v) => set("general", { regimen: v })}
          >
            <SelectTrigger
              id="general.regimen"
              className={estiloPendiente(campos["general.regimen"])}
            >
              <SelectValue placeholder="Elegí qué vas a hacer" />
            </SelectTrigger>
            <SelectContent>
              {REGIMENES.map((r) => (
                <SelectItem key={r.cod} value={r.cod}>
                  <OpcionConDetalle label={r.label} detalle={r.detalle} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo
          campo={campos["general.modalidad"]}
          motivo={motivos["general.modalidad"]}
          onConfirmar={() => confirmar("general.modalidad")}
          ayuda={
            modInfo?.limite
              ? `Con este trámite podés importar hasta USD ${modInfo.limite.toLocaleString(
                  "es-BO"
                )}${modInfo.pesoMaxKg ? ` y hasta ${modInfo.pesoMaxKg} kg` : ""}.`
              : undefined
          }
        >
          <Select
            value={g.modalidad}
            onValueChange={(v) => set("general", { modalidad: v })}
          >
            <SelectTrigger
              id="general.modalidad"
              className={estiloPendiente(campos["general.modalidad"])}
            >
              <SelectValue placeholder="Elegí el tipo de trámite" />
            </SelectTrigger>
            <SelectContent>
              {modalidades.map((m) => (
                <SelectItem key={m.cod} value={m.cod}>
                  <OpcionConDetalle label={m.label} detalle={m.detalle} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <div className="md:col-span-2">
          <Campo
            campo={campos["general.parteRecepcionSiNo"]}
            ayuda={
              menaje
                ? "En una mudanza el comprobante del depósito es obligatorio, así que queda marcado en “Sí”."
                : undefined
            }
          >
            <Segmented
              value={g.parteRecepcionSiNo ? "si" : "no"}
              disabled={menaje}
              onChange={(v) =>
                set("general", { parteRecepcionSiNo: v === "si" })
              }
              options={[
                { value: "si", label: "Sí, lo tengo" },
                { value: "no", label: "No tengo" },
              ]}
            />
          </Campo>

          {/* También cuando el usuario dijo que no lo tiene pero el trámite lo
              exige: si no, quedaría un obligatorio invisible imposible de
              completar. */}
          {g.parteRecepcionSiNo || campos["general.parteRecepcion"].requerido ? (
            <div className="ml-4 border-l-2 border-border pl-4">
              <Campo
                campo={campos["general.parteRecepcion"]}
                motivo={motivos["general.parteRecepcion"]}
                onConfirmar={() => confirmar("general.parteRecepcion")}
              >
                <Input
                  id="general.parteRecepcion"
                  placeholder="Ej: PR-2026-001842"
                  className={cn(
                    "font-mono",
                    estiloPendiente(campos["general.parteRecepcion"])
                  )}
                  value={g.parteRecepcion}
                  onChange={(e) =>
                    set("general", { parteRecepcion: e.target.value })
                  }
                />
              </Campo>
            </div>
          ) : null}
        </div>
      </div>
    </SectionWrapper>
  )
}

/**
 * Ata cada `Campo` a su id: estado, explicación de la regla que lo dedujo y
 * acción de confirmar salen todos del mismo lugar, sin repetirlo por campo.
 */
function usarCampos({ campos, motivos, confirmar }: SeccionProps) {
  return (id: string) => ({
    campo: campos[id],
    motivo: motivos[id],
    onConfirmar: () => confirmar(id),
  })
}

function SectionImportador(props: SeccionProps) {
  const { form, set, campos } = props
  const im = form.importador
  const c = usarCampos(props)
  return (
    <SectionWrapper
      title="Tus datos"
      subtitle="Datos del importador"
      icon={RiUser3Line}
      pendientes={contar(campos, "importador")}
      errores={contarErrores(campos, "importador")}
    >
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Campo {...c("importador.tipoDocumento")}>
          <Select
            value={im.tipoDocumento}
            onValueChange={(v) => set("importador", { tipoDocumento: v })}
          >
            <SelectTrigger
              id="importador.tipoDocumento"
              className={estiloPendiente(campos["importador.tipoDocumento"])}
            >
              <SelectValue placeholder="Elegí tu documento" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_DOCUMENTO.map((t) => (
                <SelectItem key={t.cod} value={t.cod}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo {...c("importador.numeroDocumento")}>
          <Input
            id="importador.numeroDocumento"
            placeholder="Ej: 1023456789"
            className={cn(
              "font-mono",
              estiloPendiente(campos["importador.numeroDocumento"])
            )}
            value={im.numeroDocumento}
            onChange={(e) =>
              set("importador", { numeroDocumento: e.target.value })
            }
          />
        </Campo>

        <Campo {...c("importador.nombreRazonSocial")} full>
          <Input
            id="importador.nombreRazonSocial"
            placeholder="Nombre completo o razón social"
            className={estiloPendiente(campos["importador.nombreRazonSocial"])}
            value={im.nombreRazonSocial}
            onChange={(e) =>
              set("importador", { nombreRazonSocial: e.target.value })
            }
          />
        </Campo>

        <Campo {...c("importador.domicilio")} full>
          <Input
            id="importador.domicilio"
            placeholder="Ej: Av. Arce 2345, La Paz"
            className={estiloPendiente(campos["importador.domicilio"])}
            value={im.domicilio}
            onChange={(e) => set("importador", { domicilio: e.target.value })}
          />
        </Campo>

        <Campo {...c("importador.departamentoDestino")}>
          <Select
            value={im.departamentoDestino}
            onValueChange={(v) => set("importador", { departamentoDestino: v })}
          >
            <SelectTrigger
              id="importador.departamentoDestino"
              className={estiloPendiente(
                campos["importador.departamentoDestino"]
              )}
            >
              <SelectValue placeholder="Elegí el departamento" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTAMENTOS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
      </div>
    </SectionWrapper>
  )
}

function SectionProveedor(props: SeccionProps) {
  const { form, set, campos } = props
  const p = form.proveedor
  const c = usarCampos(props)
  return (
    <SectionWrapper
      title="Quién te vendió"
      subtitle="Datos del proveedor"
      icon={RiBuildingLine}
      pendientes={contar(campos, "proveedor")}
      errores={contarErrores(campos, "proveedor")}
    >
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Campo {...c("proveedor.nombre")}>
          <Input
            id="proveedor.nombre"
            placeholder="Nombre de la empresa vendedora"
            className={estiloPendiente(campos["proveedor.nombre"])}
            value={p.nombre}
            onChange={(e) => set("proveedor", { nombre: e.target.value })}
          />
        </Campo>

        <Campo {...c("proveedor.pais")}>
          <PaisInput
            campo={campos["proveedor.pais"]}
            value={p.pais}
            placeholder="Empezá a escribir: China, Brasil…"
            onChange={(pais) => set("proveedor", { pais })}
          />
        </Campo>

        <Campo {...c("proveedor.direccion")} full>
          <Input
            id="proveedor.direccion"
            value={p.direccion}
            onChange={(e) => set("proveedor", { direccion: e.target.value })}
          />
        </Campo>

        <Campo {...c("proveedor.rfc")}>
          <Input
            id="proveedor.rfc"
            className="font-mono"
            value={p.rfc}
            onChange={(e) => set("proveedor", { rfc: e.target.value })}
          />
        </Campo>

        <Campo {...c("proveedor.relacion")}>
          <Segmented
            value={p.relacion}
            onChange={(v) => set("proveedor", { relacion: v })}
            options={[
              { value: "No vinculado", label: "No" },
              { value: "Vinculado", label: "Sí" },
            ]}
          />
        </Campo>
      </div>
    </SectionWrapper>
  )
}

function SectionTransporte(props: SeccionProps) {
  const { form, set, campos } = props
  const t = form.transporte
  const c = usarCampos(props)
  // País de última procedencia: habilitado/requerido solo en aduana A/I/P;
  // en Frontera (F) o Zona Franca (Z) se asigna automáticamente.
  const fronteriza = esAduanaFronteriza(form.general.aduanaDespacho)

  return (
    <SectionWrapper
      title="Cómo llegó"
      subtitle="Lugares y transporte"
      icon={RiBox3Line}
      pendientes={contar(campos, "transporte")}
      errores={contarErrores(campos, "transporte")}
    >
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Campo
          {...c("transporte.paisUltimaProcedencia")}
          ayuda={
            fronteriza
              ? "Como la mercadería entra por un paso de frontera, la aduana lo asigna sola: no hace falta que lo completes."
              : undefined
          }
        >
          <PaisInput
            campo={campos["transporte.paisUltimaProcedencia"]}
            value={t.paisUltimaProcedencia}
            placeholder="Empezá a escribir: China, Chile…"
            disabled={fronteriza}
            onChange={(paisUltimaProcedencia) =>
              set("transporte", { paisUltimaProcedencia })
            }
          />
        </Campo>

        <Campo {...c("transporte.medioHastaFrontera")}>
          <Select
            value={t.medioHastaFrontera}
            onValueChange={(v) => set("transporte", { medioHastaFrontera: v })}
          >
            <SelectTrigger
              id="transporte.medioHastaFrontera"
              className={estiloPendiente(
                campos["transporte.medioHastaFrontera"]
              )}
            >
              <SelectValue placeholder="Elegí cómo llegó" />
            </SelectTrigger>
            <SelectContent>
              {MEDIOS_TRANSPORTE.map((m) => (
                <SelectItem key={m.cod} value={m.cod}>
                  <OpcionConDetalle label={m.label} detalle={m.detalle} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <Campo {...c("transporte.manifiesto")} full>
          <Input
            id="transporte.manifiesto"
            placeholder="Ej: MAN-2026-04887"
            className={cn(
              "font-mono",
              estiloPendiente(campos["transporte.manifiesto"])
            )}
            value={t.manifiesto}
            onChange={(e) => set("transporte", { manifiesto: e.target.value })}
          />
        </Campo>
      </div>
    </SectionWrapper>
  )
}

function SectionTransaccion(props: SeccionProps) {
  const { form, set, campos } = props
  const tx = form.transaccion
  const c = usarCampos(props)

  return (
    <SectionWrapper
      title="Montos, pesos y bultos"
      subtitle="Información de la transacción"
      icon={RiMoneyDollarCircleLine}
      pendientes={contar(campos, "transaccion")}
      errores={contarErrores(campos, "transaccion")}
    >
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Campo {...c("transaccion.valorFobUsd")} full>
          <NumeroInput
            campo={campos["transaccion.valorFobUsd"]}
            value={tx.valorFobUsd}
            prefijo="USD"
            onChange={(valorFobUsd) => set("transaccion", { valorFobUsd })}
          />
        </Campo>

        <div className="md:col-span-2">
          <Campo {...c("transaccion.fleteDeclaradoSiNo")}>
            <Segmented
              value={tx.fleteDeclaradoSiNo ? "si" : "no"}
              onChange={(v) =>
                set("transaccion", { fleteDeclaradoSiNo: v === "si" })
              }
              options={[
                { value: "si", label: "Sí, ya lo incluía" },
                { value: "no", label: "No, lo pagué aparte" },
              ]}
            />
          </Campo>
          {tx.fleteDeclaradoSiNo ? (
            <div className="ml-4 border-l-2 border-border pl-4">
              <Campo {...c("transaccion.fleteUsd")}>
                <NumeroInput
                  campo={campos["transaccion.fleteUsd"]}
                  value={tx.fleteUsd}
                  prefijo="USD"
                  onChange={(fleteUsd) => set("transaccion", { fleteUsd })}
                />
              </Campo>
            </div>
          ) : (
            <p className="mb-3 text-[11.5px] text-muted-foreground">
              El costo del envío lo vamos a estimar con la tabla oficial de la
              aduana.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Campo {...c("transaccion.seguroDeclaradoSiNo")}>
            <Segmented
              value={tx.seguroDeclaradoSiNo ? "si" : "no"}
              onChange={(v) =>
                set("transaccion", { seguroDeclaradoSiNo: v === "si" })
              }
              options={[
                { value: "si", label: "Sí" },
                { value: "no", label: "No" },
              ]}
            />
          </Campo>
          {tx.seguroDeclaradoSiNo ? (
            <div className="ml-4 border-l-2 border-border pl-4">
              <Campo {...c("transaccion.seguroUsd")}>
                <NumeroInput
                  campo={campos["transaccion.seguroUsd"]}
                  value={tx.seguroUsd}
                  prefijo="USD"
                  onChange={(seguroUsd) => set("transaccion", { seguroUsd })}
                />
              </Campo>
            </div>
          ) : (
            <p className="mb-3 text-[11.5px] text-muted-foreground">
              Sin seguro declarado, la aduana calcula un monto de referencia.
            </p>
          )}
        </div>

        <Campo {...c("transaccion.cantidadBultos")}>
          <NumeroInput
            campo={campos["transaccion.cantidadBultos"]}
            value={tx.cantidadBultos}
            onChange={(cantidadBultos) =>
              set("transaccion", { cantidadBultos })
            }
          />
        </Campo>

        <div className="hidden md:block" />

        <Campo {...c("transaccion.pesoBruto")}>
          <NumeroInput
            campo={campos["transaccion.pesoBruto"]}
            value={tx.pesoBruto}
            sufijo="kg"
            onChange={(pesoBruto) => set("transaccion", { pesoBruto })}
          />
        </Campo>

        <Campo {...c("transaccion.pesoNeto")}>
          <NumeroInput
            campo={campos["transaccion.pesoNeto"]}
            value={tx.pesoNeto}
            sufijo="kg"
            onChange={(pesoNeto) => set("transaccion", { pesoNeto })}
          />
        </Campo>
      </div>
    </SectionWrapper>
  )
}

function SectionItems({
  campos,
  items,
  facturaId,
  asignarSubpartida,
}: SeccionProps) {
  const campo = campos["items.subpartidas"]
  const sinClasificar = items.filter((i) => !i.subpartida).length
  // El buscador se abre sobre el producto que se está mirando: mandar al
  // usuario al paso de edición de la factura era sacarlo de la declaración
  // justo donde le estábamos señalando el problema.
  const [abierto, setAbierto] = React.useState<string | null>(null)
  const [fallo, setFallo] = React.useState(false)
  const [asignados, setAsignados] = React.useState(0)
  const enFoco = items.find((i) => i.id === abierto)

  return (
    <SectionWrapper
      title="Productos"
      subtitle="Ítems declarados"
      icon={RiPriceTag3Line}
      pendientes={contar(campos, "items")}
      errores={contarErrores(campos, "items")}
    >
      <div
        id={campo.spec.id}
        tabIndex={-1}
        className="scroll-mt-24 outline-none"
      >
        {sinClasificar > 0 ? (
          <div className="mb-3 flex items-start gap-2 rounded-md bg-warning-soft px-3 py-2 text-[12px] text-warning">
            <RiAlertLine className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {sinClasificar === 1
                ? "Un producto todavía no tiene código arancelario."
                : `${sinClasificar} productos todavía no tienen código arancelario.`}{" "}
              Sin ese código no podemos calcular su impuesto. Buscalo acá mismo,
              en la fila del producto.
            </span>
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Código arancelario</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Impuesto (GA)</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono tabular-nums">
                    {String(item.item).padStart(3, "0")}
                  </TableCell>
                  <TableCell className="font-mono">
                    {item.subpartida ?? (
                      <span className="text-destructive">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    USD {item.subtotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    USD {item.ga.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={item.subpartida ? "ghost" : "outline"}
                      size="sm"
                      onClick={() =>
                        setAbierto((a) => (a === item.id ? null : item.id))
                      }
                    >
                      <RiSearchLine />
                      {item.subpartida ? "Cambiar" : "Buscar código"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {fallo ? (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive-soft px-3 py-2 text-[12px] text-destructive">
            <RiErrorWarningLine className="mt-0.5 size-3.5 shrink-0" />
            <span>
              No pudimos guardar el código en el servidor, así que el producto
              quedó como estaba. Probá de nuevo.
            </span>
          </div>
        ) : null}
        {asignados > 0 && !fallo ? (
          <p className="mt-3 text-[11.5px] text-muted-foreground">
            El impuesto de cada producto se muestra con la tasa del código que
            elegiste. El total de la declaración se recalcula al validarla.
          </p>
        ) : null}

        {enFoco ? (
          <BuscadorSubpartida
            key={enFoco.id}
            descripcion={enFoco.descripcion}
            asignado={enFoco.subpartida}
            puedeGuardar={Boolean(facturaId)}
            onElegir={async (code, arancel) => {
              setAbierto(null)
              const ok = await asignarSubpartida(enFoco.id, code, arancel)
              setFallo(!ok)
              if (ok) setAsignados((n) => n + 1)
            }}
            onCerrar={() => setAbierto(null)}
          />
        ) : null}
      </div>
    </SectionWrapper>
  )
}

/**
 * Búsqueda de subpartida para un producto concreto. Arranca sola con la
 * descripción del producto porque es la consulta que el usuario iba a escribir
 * igual, y muestra el arancel de cada opción: es lo que cambia el impuesto.
 */
function BuscadorSubpartida({
  descripcion,
  asignado,
  puedeGuardar,
  onElegir,
  onCerrar,
}: {
  descripcion: string
  asignado: string | null
  /** Sin factura de origen el código se aplica en pantalla pero no se guarda. */
  puedeGuardar: boolean
  onElegir: (code: string, arancel: number) => void | Promise<void>
  onCerrar: () => void
}) {
  const [q, setQ] = React.useState(descripcion)
  // Arranca buscando la descripción del producto, así que el estado inicial ya
  // es "cargando": no hay un momento vacío antes del primer resultado.
  const [estado, setEstado] = React.useState<"loading" | "done" | "error">(
    "loading"
  )
  const [matches, setMatches] = React.useState<SubpartidaMatch[]>([])

  const aplicar = (resultados: SubpartidaMatch[]) => {
    setMatches(resultados.slice(0, 6))
    setEstado("done")
  }

  const buscar = async (query: string) => {
    const texto = query.trim()
    if (!texto) return
    setEstado("loading")
    try {
      aplicar((await searchSubpartidas(texto)).resultados)
    } catch {
      setEstado("error")
    }
  }

  React.useEffect(() => {
    let vigente = true
    searchSubpartidas(descripcion.trim())
      .then((r) => vigente && aplicar(r.resultados))
      .catch(() => vigente && setEstado("error"))
    return () => {
      vigente = false
    }
  }, [descripcion])

  return (
    <div className="mt-3 rounded-lg border p-3.5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-[13px] font-medium">
          Código arancelario de “{descripcion}”
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={onCerrar}
        >
          Cerrar
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          autoFocus
          value={q}
          placeholder="Describí el producto: “refrigerador doméstico”"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void buscar(q)
            }
          }}
        />
        <Button
          variant="outline"
          disabled={estado === "loading" || !q.trim()}
          onClick={() => void buscar(q)}
        >
          {estado === "loading" ? (
            <RiLoader4Line className="animate-spin" />
          ) : (
            <RiSearchLine />
          )}
          Buscar
        </Button>
      </div>

      {!puedeGuardar ? (
        <p className="mt-2 text-[11.5px] text-warning">
          Este borrador no está vinculado a una factura, así que el código va a
          quedar solo en esta pantalla.
        </p>
      ) : null}

      {estado === "error" ? (
        <p className="mt-2 text-[12px] text-destructive">
          No pudimos buscar. Probá de nuevo.
        </p>
      ) : null}
      {estado === "done" && matches.length === 0 ? (
        <p className="mt-2 text-[12px] text-muted-foreground">
          Ningún código coincide. Probá con otras palabras: qué es y de qué
          material está hecho.
        </p>
      ) : null}

      <div className="mt-2.5 grid grid-cols-1 gap-1.5">
        {matches.map((m) => (
          <button
            key={m.code}
            type="button"
            onClick={() => onElegir(m.code, m.arancel)}
            className={cn(
              "flex items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors hover:bg-surface-2",
              m.code === asignado && "border-primary bg-primary-soft"
            )}
          >
            <span className="font-mono text-[12.5px] font-semibold text-primary">
              {m.code}
            </span>
            <span className="min-w-0 flex-1 text-[12.5px] leading-snug">
              {m.desc}
            </span>
            <span className="shrink-0 text-[11.5px] text-muted-foreground">
              {m.gravamen}
            </span>
            {m.bestMatch ? (
              <Badge className="shrink-0 bg-ai-soft text-ai">
                <RiSparkling2Line />
                Sugerido
              </Badge>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}

function SectionDocSop(props: SeccionProps) {
  const { form, set, campos } = props
  const c = usarCampos(props)
  const marcados = form.docsop.documentos

  const alternar = (cod: string) => {
    set("docsop", {
      documentos: marcados.includes(cod)
        ? marcados.filter((x) => x !== cod)
        : [...marcados, cod],
    })
  }

  return (
    <SectionWrapper
      title="Documentos"
      subtitle="Documentos soporte"
      icon={RiFileList3Line}
      pendientes={contar(campos, "docsop")}
      errores={contarErrores(campos, "docsop")}
    >
      <Campo {...c("docsop.documentos")}>
        <div
          id="docsop.documentos"
          tabIndex={-1}
          className="grid scroll-mt-24 grid-cols-1 gap-2 outline-none sm:grid-cols-2"
        >
          {DOCUMENTOS_SOPORTE.map((doc) => {
            const activo = marcados.includes(doc.cod)
            return (
              <label
                key={doc.cod}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-[13px] transition-colors",
                  activo
                    ? "border-primary bg-primary-soft"
                    : "hover:bg-surface-2",
                  !activo &&
                    campos["docsop.documentos"].problema?.nivel === "error" &&
                    doc.acreditaValor &&
                    "border-destructive/50"
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-3.5 accent-primary"
                  checked={activo}
                  onChange={() => alternar(doc.cod)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block">{doc.label}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {doc.ayuda}
                  </span>
                </span>
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  {doc.cod}
                </span>
              </label>
            )
          })}
        </div>
      </Campo>

      <Campo {...c("docsop.requiereInfAdicional")}>
        <Segmented
          value={form.docsop.requiereInfAdicional ? "si" : "no"}
          onChange={(v) =>
            set("docsop", { requiereInfAdicional: v === "si" })
          }
          options={[
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
          ]}
        />
      </Campo>
      {form.docsop.requiereInfAdicional ? (
        <div className="ml-4 border-l-2 border-border pl-4">
          <Campo {...c("docsop.infAdicional")}>
            <Input
              id="docsop.infAdicional"
              className={estiloPendiente(campos["docsop.infAdicional"])}
              value={form.docsop.infAdicional}
              onChange={(e) => set("docsop", { infAdicional: e.target.value })}
            />
          </Campo>
        </div>
      ) : null}
    </SectionWrapper>
  )
}

function SectionLiquidacion({ data }: SeccionProps) {
  const l = data.liquidacion
  return (
    <SectionWrapper
      title="Impuestos a pagar"
      subtitle="Liquidación de tributos"
      icon={RiLineChartLine}
      informativa
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          {[
            ["Valor de la mercadería con flete y seguro (CIF)", l.cif],
            ["Impuesto de importación (GA)", l.ga],
            ["IVA (14.94%)", l.iva],
            ["Impuesto a consumos específicos (ICE)", l.ice],
          ].map(([k, v]) => (
            <div
              key={k as string}
              className="flex justify-between gap-3 border-b border-border/60 py-2"
            >
              <span className="text-[13px] text-foreground/75">{k}</span>
              <span className="font-mono text-[13.5px] font-medium tabular-nums">
                USD {(v as number).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-semibold">
            <span className="text-[13.5px]">Total de impuestos</span>
            <span className="font-mono text-[15px] tabular-nums text-primary">
              USD {l.total_tributos.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl bg-primary-soft p-5">
          <div className="text-[11px] font-medium tracking-wider text-primary uppercase">
            Total a pagar
          </div>
          <div className="mt-1 font-serif text-4xl tracking-tight tabular-nums text-primary">
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

/**
 * Acepta lo que la gente escribe de verdad: "3140", "3.140,50", "3,140.50".
 * El último separador manda como decimal y los anteriores son de miles.
 */
function aNumero(texto: string): number {
  const limpio = texto.replace(/[^\d.,]/g, "")
  const ultimo = Math.max(limpio.lastIndexOf("."), limpio.lastIndexOf(","))
  if (ultimo === -1) return Number(limpio) || 0
  const entero = limpio.slice(0, ultimo).replace(/[.,]/g, "")
  const decimal = limpio.slice(ultimo + 1).replace(/[.,]/g, "")
  // "1.500" es mil quinientos, no uno coma cinco: tres dígitos detrás de un
  // separador igual a los anteriores son miles. En "12.345,678" el último es
  // distinto, así que ahí sí manda como decimal.
  const anteriores = limpio.slice(0, ultimo).match(/[.,]/g) ?? []
  const mismoSeparador = anteriores.every((c) => c === limpio[ultimo])
  if (decimal.length === 3 && mismoSeparador) {
    return Number(entero + decimal) || 0
  }
  return Number(`${entero}.${decimal}`) || 0
}

const formatearNumero = (n: number) =>
  n.toLocaleString("es-BO", { maximumFractionDigits: 2 })

/**
 * Número con separador de miles y unidad a la vista. Con `type="number"` un
 * valor de cinco cifras se leía como un bloque de dígitos y nada decía si
 * estaba en dólares o en kilos. Mientras el campo está enfocado se muestra el
 * texto crudo, así escribir no pelea contra el formateo.
 */
function NumeroInput({
  campo,
  value,
  prefijo,
  sufijo,
  onChange,
}: {
  campo: EstadoCampo
  value: number
  /** Unidad delante del número: "USD". */
  prefijo?: string
  /** Unidad detrás del número: "kg". */
  sufijo?: string
  onChange: (v: number) => void
}) {
  const [borrador, setBorrador] = React.useState<string | null>(null)
  const mostrado = borrador ?? (value === 0 ? "" : formatearNumero(value))
  const unidad =
    "pointer-events-none absolute inset-y-0 flex items-center text-[12px] font-medium text-muted-foreground"

  return (
    <div className="relative">
      {prefijo ? (
        <span className={cn(unidad, "left-0 pl-3")}>{prefijo}</span>
      ) : null}
      <Input
        id={campo.spec.id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        className={cn(
          "font-mono tabular-nums",
          prefijo && "pl-12",
          sufijo && "pr-9",
          estiloPendiente(campo)
        )}
        value={mostrado}
        onFocus={() => setBorrador(value === 0 ? "" : String(value))}
        onChange={(e) => {
          setBorrador(e.target.value)
          onChange(aNumero(e.target.value))
        }}
        onBlur={() => setBorrador(null)}
      />
      {sufijo ? (
        <span className={cn(unidad, "right-0 pr-3")}>{sufijo}</span>
      ) : null}
    </div>
  )
}

/**
 * País: texto con sugerencias del catálogo ISO. Al salir del campo se cambia
 * por el nombre oficial ("china" → "China") para que la declaración no lleve
 * la variante que traía la factura. Sigue aceptando texto libre: un país mal
 * escrito se avisa, pero no se bloquea al usuario.
 */
function PaisInput({
  campo,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  campo: EstadoCampo
  value: string
  placeholder?: string
  disabled?: boolean
  onChange: (v: string) => void
}) {
  return (
    <>
      <Input
        id={campo.spec.id}
        list="catalogo-paises"
        autoComplete="off"
        placeholder={placeholder}
        className={estiloPendiente(campo)}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          const pais = buscarPais(e.target.value)
          if (pais && pais.nombre !== e.target.value) onChange(pais.nombre)
        }}
      />
      <datalist id="catalogo-paises">
        {PAISES.map((p) => (
          <option key={p.cod} value={p.nombre} />
        ))}
      </datalist>
    </>
  )
}

/** Opción de select: la frase en lenguaje común arriba, el código SUMA abajo. */
function OpcionConDetalle({
  label,
  detalle,
}: {
  label: string
  detalle: string
}) {
  return (
    <span className="flex flex-col items-start gap-0">
      <span>{label}</span>
      <span className="text-[11px] text-muted-foreground">{detalle}</span>
    </span>
  )
}

function contar(campos: Record<string, EstadoCampo>, seccion: SectionId) {
  return Object.values(campos).filter(
    (c) => c.spec.seccion === seccion && c.pendiente
  ).length
}

function contarErrores(campos: Record<string, EstadoCampo>, seccion: SectionId) {
  return Object.values(campos).filter(
    (c) => c.spec.seccion === seccion && c.problema?.nivel === "error"
  ).length
}

function agrupar<T extends { grupo: string }>(items: T[]): [string, T[]][] {
  const mapa = new Map<string, T[]>()
  for (const item of items) {
    const actual = mapa.get(item.grupo)
    if (actual) actual.push(item)
    else mapa.set(item.grupo, [item])
  }
  return [...mapa.entries()]
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap rounded-md border bg-surface-2 p-0.5",
        disabled && "opacity-60"
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[5px] px-3 py-1 text-[12.5px] font-medium transition-colors",
            value === opt.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            disabled && "cursor-not-allowed"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
