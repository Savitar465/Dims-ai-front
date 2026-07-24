import type { Metadata } from "next"
import Link from "next/link"
import { RiAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { generateDims, listDims } from "@/lib/services/dims"
import { getSubpartida } from "@/lib/services/arancel"
import type { Dims } from "@/lib/types/dims"
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
  // asigna SUMA al presentar la declaración. Muchos campos requeridos aún no
  // están en el backend; se pre-llenan vacíos para que el agente los complete.
  const tx = dims.transaccion ?? {}
  const imp = dims.importador ?? {}

  const dimsData: DimsDataShape = {
    ref: dims.id,
    general: {
      tipoUsuario: dims.tipoUsuario ?? "general",
      aduanaDespacho: dims.aduanaIngreso ?? "IQUIQUE-PISIGA",
      aduanaTipo: "F",
      regimen: dims.regimen ?? "41 - Importación a Consumo",
      modalidad: dims.modalidad ?? "4101",
      parteRecepcionSiNo: dims.parteRecepcionSiNo ?? true,
      parteRecepcion: dims.parteRecepcion ?? "",
    },
    importador: {
      tipoDocumento: imp.tipoDocumento ?? "NIT",
      numeroDocumento: imp.numeroDocumento ?? dims.nit ?? "",
      nombreRazonSocial: imp.nombreRazonSocial ?? "",
      domicilio: imp.domicilio ?? "",
      departamentoDestino: dims.departamentoDestino ?? "La Paz",
    },
    proveedor: {
      nombre: dims.proveedor ?? "",
      direccion: "",
      pais: "",
      rfc: "",
    },
    transporte: {
      paisUltimaProcedencia: dims.paisUltimaProcedencia ?? "",
      medioHastaFrontera: dims.transporteHastaFrontera ?? "3 - Carretero",
      manifiesto: null,
    },
    transaccion: {
      valorFobUsd: tx.valorFobUsd ?? l.cif ?? 0,
      fleteDeclaradoSiNo: tx.fleteDeclaradoSiNo ?? true,
      fleteUsd: tx.fleteUsd ?? 0,
      seguroDeclaradoSiNo: tx.seguroDeclaradoSiNo ?? false,
      seguroUsd: tx.seguroUsd ?? 0,
      cantidadBultos: tx.cantidadBultos ?? 1,
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
      <DimsView data={dimsData} />
    </div>
  )
}
