import type { Metadata } from "next"
import Link from "next/link"
import { RiAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { generateDims, listDims } from "@/lib/services/dims"
import { getSubpartida } from "@/lib/services/arancel"
import { getFactura } from "@/lib/services/facturas"
import type { Dims } from "@/lib/types/dims"
import type { Origen } from "@/lib/dims/campos"
import { ApiError } from "@/lib/api/client"

import { DimsView, type DimsDataShape } from "./_view"

export const metadata: Metadata = { title: "Preparar DIMS · DIMS AI" }

// The backend `Dims` is generated/calculated server-side. Resolve the target
// DIMS (explicit `?dims=` id, else the most recent draft), run `generate` so
// the liquidación is fresh, then adapt it to the shape DimsView renders.
async function loadDims(dimsId?: string): Promise<Dims | null> {
  let id = dimsId
  if (!id) {
    const { data } = await listDims({ estado: "borrador", pageSize: 1 })
    id = data[0]?.id
  }
  if (!id) return null

  try {
    return await generateDims(id)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

// Los catálogos del formulario usan el código pelado ("41", "4"). Borradores
// viejos guardaron el código junto al nombre ("41 - Importación a Consumo") y
// ese string no matchea ninguna opción del selector: se queda con el código.
function soloCodigo(valor?: string): string {
  if (!valor) return ""
  return valor.trim().split(/[\s-]/)[0] || ""
}

// El proveedor detallado y la logística viven en la factura de origen. Si no se
// puede leer, la DIMS se muestra igual con esos campos vacíos.
async function loadFactura(facturaId: string) {
  try {
    return await getFactura(facturaId)
  } catch {
    return null
  }
}

// Per-item GA needs each subpartida's tariff rate, which lives in the Arancel.
async function buildGaByCode(dims: Dims): Promise<Record<string, number>> {
  const codes = [
    ...new Set(
      (dims.items ?? [])
        .map((i) => i.subpartida)
        .filter((c): c is string => !!c)
    ),
  ]
  const entries = await Promise.all(
    codes.map(async (code) => {
      try {
        const sub = await getSubpartida(code)
        return [code, sub.arancel] as const
      } catch {
        return [code, 0] as const
      }
    })
  )
  return Object.fromEntries(entries)
}

export default async function DimsPage({
  searchParams,
}: {
  searchParams: Promise<{ dims?: string }>
}) {
  const { dims: dimsId } = await searchParams
  const dims = await loadDims(dimsId)

  if (!dims) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Preparar DIMS</h1>
        <Card className="mt-6 p-10 text-center">
          <CardContent className="!p-0">
            <div className="text-[15px] font-medium">
              No hay ninguna DIMS en borrador
            </div>
            <div className="mx-auto mt-1 max-w-md text-[13px] text-muted-foreground">
              Carga una factura para que la IA extraiga los datos y arme la
              declaración automáticamente.
            </div>
            <Button asChild className="mt-5">
              <Link href="/factura">
                <RiAddLine />
                Empezar nueva DIMS
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const gaByCode = await buildGaByCode(dims)
  const l = dims.liquidacion ?? {}
  const ga = l.ga ?? 0
  const iva = l.iva ?? 0
  const ice = l.ice ?? 0

  // `dims.id` es la referencia interna del borrador, NO el código DIMS: ese lo
  // asigna SUMA al presentar la declaración. Lo que la IA no pudo extraer de
  // los documentos queda vacío a propósito: el formulario lo marca pendiente en
  // vez de proponer un valor por defecto que nadie revisa.
  const tx = dims.transaccion ?? {}
  const imp = dims.importador ?? {}
  // El proveedor detallado (dirección, país, Tax ID) vive en la factura, no en
  // la DIMS: se lee de ahí para no volver a pedírselo al usuario.
  const factura = dims.facturaId ? await loadFactura(dims.facturaId) : null
  const prov = factura?.proveedor ?? {}

  // Un campo se marca "documento" solo si el valor llegó realmente de la
  // extracción. Régimen, modalidad y tipo de usuario los inicializa el backend
  // sin mirar ningún papel: van como "sugerido" y el usuario los confirma.
  //
  // Esto es solo para el primer render del borrador: en cuanto se guarda una
  // vez, el origen real viaja en la DIMS y esta reconstrucción no se usa —
  // si no, cada recarga pediría confirmar de nuevo lo que ya se revisó.
  const origenes: Record<string, Origen> = {}
  const marcar = (id: string, valor: unknown, origen: Origen = "documento") => {
    const vacio =
      valor === undefined || valor === null || valor === "" || valor === 0
    if (!vacio) origenes[id] = origen
  }

  marcar("general.tipoUsuario", dims.tipoUsuario, "sugerido")
  marcar("general.aduanaDespacho", dims.aduanaIngreso)
  marcar("general.regimen", dims.regimen, "sugerido")
  marcar("general.modalidad", dims.modalidad, "sugerido")
  marcar("general.parteRecepcion", dims.parteRecepcion)
  marcar("importador.tipoDocumento", imp.tipoDocumento)
  marcar("importador.numeroDocumento", imp.numeroDocumento ?? dims.nit)
  marcar("importador.nombreRazonSocial", imp.nombreRazonSocial)
  marcar("importador.domicilio", imp.domicilio)
  marcar("importador.departamentoDestino", dims.departamentoDestino)
  marcar("proveedor.nombre", dims.proveedor ?? prov.nombre)
  marcar("proveedor.direccion", prov.direccion)
  marcar("proveedor.pais", prov.pais)
  marcar("proveedor.rfc", prov.rfc)
  marcar("transporte.paisUltimaProcedencia", dims.paisUltimaProcedencia)
  marcar("transporte.medioHastaFrontera", dims.transporteHastaFrontera)
  marcar("transporte.manifiesto", dims.manifiesto)
  marcar("transaccion.valorFobUsd", tx.valorFobUsd ?? factura?.totales?.subtotal)
  marcar("transaccion.fleteUsd", tx.fleteUsd)
  marcar("transaccion.seguroUsd", tx.seguroUsd)
  marcar("transaccion.cantidadBultos", tx.cantidadBultos)
  marcar("transaccion.pesoBruto", tx.pesoBruto)
  marcar("transaccion.pesoNeto", tx.pesoNeto)

  // El backend calcula la confianza por campo al crear la DIMS, a partir de
  // cuántos documentos declararon el dato y de si coincidieron. Lo de abajo es
  // el respaldo para borradores creados antes de eso: reparte la confianza del
  // bloque entre los campos que salieron de él. Solo se anota donde el valor
  // vino de un papel: un campo vacío no tiene confianza que mostrar.
  const confianzas: Record<string, number> = {}
  const confiar = (ids: string[], valor?: number) => {
    if (valor === undefined) return
    for (const id of ids) if (origenes[id] === "documento") confianzas[id] = valor
  }

  confiar(
    ["proveedor.nombre", "proveedor.direccion", "proveedor.pais", "proveedor.rfc"],
    prov.confidence
  )
  confiar(
    [
      "importador.tipoDocumento",
      "importador.numeroDocumento",
      "importador.nombreRazonSocial",
      "importador.domicilio",
      "importador.departamentoDestino",
    ],
    factura?.importador?.confidence
  )
  confiar(
    [
      "transporte.paisUltimaProcedencia",
      "transporte.medioHastaFrontera",
      "transporte.manifiesto",
      "transaccion.cantidadBultos",
      "transaccion.pesoBruto",
      "transaccion.pesoNeto",
    ],
    factura?.logistica?.confidence
  )
  confiar(
    ["general.aduanaDespacho", "transaccion.valorFobUsd"],
    factura?.factura?.confidence
  )

  const dimsData: DimsDataShape = {
    ref: dims.id,
    general: {
      tipoUsuario: dims.tipoUsuario ?? "general",
      // Sin aduana extraída el campo queda vacío: elegir un paso de frontera
      // por el usuario cambia el país de procedencia y el medio de transporte.
      aduanaDespacho: dims.aduanaIngreso ?? "",
      regimen: soloCodigo(dims.regimen),
      modalidad: soloCodigo(dims.modalidad),
      parteRecepcionSiNo: dims.parteRecepcionSiNo ?? false,
      parteRecepcion: dims.parteRecepcion ?? "",
    },
    importador: {
      tipoDocumento: imp.tipoDocumento ?? "",
      numeroDocumento: imp.numeroDocumento ?? dims.nit ?? "",
      nombreRazonSocial: imp.nombreRazonSocial ?? "",
      domicilio: imp.domicilio ?? "",
      departamentoDestino: dims.departamentoDestino ?? "",
    },
    proveedor: {
      nombre: dims.proveedor ?? prov.nombre ?? "",
      direccion: prov.direccion ?? "",
      pais: prov.pais ?? "",
      rfc: prov.rfc ?? "",
    },
    transporte: {
      paisUltimaProcedencia: dims.paisUltimaProcedencia ?? "",
      medioHastaFrontera: soloCodigo(dims.transporteHastaFrontera),
      manifiesto: dims.manifiesto ?? null,
    },
    transaccion: {
      // El CIF incluye flete y seguro: usarlo como FOB infla la base imponible.
      // El respaldo correcto es el subtotal de la factura.
      valorFobUsd: tx.valorFobUsd ?? factura?.totales?.subtotal ?? 0,
      fleteDeclaradoSiNo: tx.fleteDeclaradoSiNo ?? false,
      fleteUsd: tx.fleteUsd ?? 0,
      seguroDeclaradoSiNo: tx.seguroDeclaradoSiNo ?? false,
      seguroUsd: tx.seguroUsd ?? 0,
      cantidadBultos: tx.cantidadBultos ?? 0,
      pesoBruto: tx.pesoBruto ?? 0,
      pesoNeto: tx.pesoNeto ?? 0,
    },
    items: (dims.items ?? []).map((item, idx) => {
      const subtotal = item.subtotal ?? 0
      const rate = item.subpartida ? (gaByCode[item.subpartida] ?? 0) : 0
      return {
        id: item.id,
        item: idx + 1,
        descripcion: item.descripcion,
        subtotal,
        subpartida: item.subpartida,
        ga: +((subtotal * rate) / 100).toFixed(2),
      }
    }),
    docSop: {
      documentos: dims.documentosSoporte ?? [],
      requiereInfAdicional: dims.requiereInfAdicional ?? false,
      infAdicional: dims.infAdicional ?? "",
    },
    liquidacion: {
      cif: l.cif ?? 0,
      ga,
      iva,
      ice,
      total_tributos: +(ga + iva + ice).toFixed(2),
      total_pagar_bob: l.totalBob ?? 0,
    },
  }

  return (
    <div>
      <DimsView
        data={dimsData}
        origenes={(dims.origenes as Record<string, Origen>) ?? origenes}
        confianzas={dims.confianzas ?? confianzas}
        facturaId={dims.facturaId}
        documentos={factura?.documentos ?? []}
      />
    </div>
  )
}
