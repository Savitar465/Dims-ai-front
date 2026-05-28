import type { Metadata } from "next"

import { FACTURA_EJEMPLO, type FacturaEjemplo } from "@/lib/data/aduana"
import { getFactura } from "@/lib/services/facturas"
import type { Factura } from "@/lib/types/dims"
import { ApiError } from "@/lib/api/client"
import { EditarView } from "./_view"

export const metadata: Metadata = { title: "Editar datos · DIMS AI" }

// Map the backend `Factura` (all header fields optional) onto the shape
// EditarView renders, filling blanks so the controlled inputs stay controlled.
function adaptFactura(f: Factura): FacturaEjemplo {
  return {
    proveedor: {
      nombre: f.proveedor.nombre ?? "",
      direccion: f.proveedor.direccion ?? "",
      pais: f.proveedor.pais ?? "",
      rfc: f.proveedor.rfc ?? "",
      confidence: f.proveedor.confidence ?? 0,
    },
    factura: {
      numero: f.factura.numero ?? "",
      fecha: f.factura.fecha ?? "",
      moneda: f.factura.moneda ?? "",
      incoterm: f.factura.incoterm ?? "",
      puertoEmbarque: f.factura.puertoEmbarque ?? "",
      confidence: f.factura.confidence ?? 0,
    },
    items: f.items,
    totales: {
      subtotal: f.totales.subtotal ?? 0,
      flete: f.totales.flete ?? 0,
      seguro: f.totales.seguro ?? 0,
      cif: f.totales.cif ?? 0,
    },
  }
}

async function loadFactura(facturaId?: string): Promise<FacturaEjemplo> {
  if (!facturaId) return FACTURA_EJEMPLO
  try {
    return adaptFactura(await getFactura(facturaId))
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return FACTURA_EJEMPLO
    throw err
  }
}

export default async function EditarPage({
  searchParams,
}: {
  searchParams: Promise<{ factura?: string }>
}) {
  const { factura: facturaId } = await searchParams
  const factura = await loadFactura(facturaId)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Revisar y editar datos
      </h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Corrige cualquier dato extraído incorrectamente. Los cambios se guardan
        automáticamente.
      </p>
      <EditarView factura={factura} facturaId={facturaId} />
    </div>
  )
}
