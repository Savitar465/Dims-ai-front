import type { Metadata } from "next"

import { FACTURA_EJEMPLO } from "@/lib/data/aduana"
import { FacturaFlow } from "./_flow"

export const metadata: Metadata = { title: "Cargar factura · DIMS AI" }

export default function FacturaPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Cargar factura</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Sube tu factura comercial. La IA extrae proveedor, productos, cantidades, valores y propone subpartidas.
      </p>
      <FacturaFlow factura={FACTURA_EJEMPLO} />
    </div>
  )
}
