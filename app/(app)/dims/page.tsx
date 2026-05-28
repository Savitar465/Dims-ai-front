import type { Metadata } from "next"
import Link from "next/link"
import { RiAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { generateDims, listDims } from "@/lib/services/dims"
import { getSubpartida } from "@/lib/services/arancel"
import type { Dims } from "@/lib/types/dims"
import { ApiError } from "@/lib/api/client"

import { DimsView } from "./_view"

export const metadata: Metadata = { title: "Generar DIMS · DIMS AI" }

const REGIMEN_LABELS: Record<string, string> = {
  IM4: "IM4 - Importación a Consumo",
  IM6: "IM6 - Reimportación",
  IM7: "IM7 - Depósito Aduanero",
}

const MODALIDAD_LABELS: Record<string, string> = {
  SIMPLIFICADA: "Simplificada",
  GENERAL: "General",
}

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
        <h1 className="text-2xl font-semibold tracking-tight">Generar DIMS</h1>
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

  const dimsData = {
    cabecera: {
      numeroDIMS: dims.id,
      fechaPresentacion: dims.fecha,
      aduanaIngreso: dims.aduanaIngreso ?? "IQUIQUE-PISIGA",
      regimen: dims.regimen
        ? (REGIMEN_LABELS[dims.regimen] ?? dims.regimen)
        : "IM4 - Importación a Consumo",
      modalidad: dims.modalidad
        ? (MODALIDAD_LABELS[dims.modalidad] ?? dims.modalidad)
        : "Simplificada",
    },
    proveedor: {
      nombre: dims.proveedor ?? "",
      direccion: "",
      pais: "",
      rfc: "",
    },
    factura: { numero: dims.facturaId ?? "" },
    transporte: {
      medio: "Terrestre",
      pais_procedencia: "",
      puerto_destino: "",
      manifiesto: null as string | null,
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
