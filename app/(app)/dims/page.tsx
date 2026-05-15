import type { Metadata } from "next"

import { FACTURA_EJEMPLO, SUBPARTIDAS } from "@/lib/data/aduana"
import { DimsView } from "./_view"

export const metadata: Metadata = { title: "Generar DIMS · DIMS AI" }

export default function DimsPage() {
  const items = FACTURA_EJEMPLO.items.map((i, idx) => {
    const subp = SUBPARTIDAS.find((s) => s.code === i.subpartida)
    return {
      ...i,
      item: idx + 1,
      ga: subp ? +((i.subtotal * subp.arancel) / 100).toFixed(2) : 0,
    }
  })

  const dimsData = {
    cabecera: {
      numeroDIMS: "DIMS-2026-04823",
      fechaPresentacion: "2026-05-14",
      aduanaIngreso: "IQUIQUE-PISIGA",
      regimen: "IM4 - Importación a Consumo",
      modalidad: "Simplificada",
    },
    proveedor: FACTURA_EJEMPLO.proveedor,
    factura: FACTURA_EJEMPLO.factura,
    transporte: {
      medio: "Terrestre",
      pais_procedencia: "Chile",
      puerto_destino: "Pisiga",
      manifiesto: null as string | null,
    },
    items,
    liquidacion: {
      cif: 9225.0,
      ga: 692.5,
      iva: 1481.42,
      ice: 0,
      total_tributos: 2173.92,
      total_pagar_bob: 15022.16,
    },
  }

  return (
    <div>
      <DimsView data={dimsData} />
    </div>
  )
}
