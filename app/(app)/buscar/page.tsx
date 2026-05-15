import type { Metadata } from "next"

import { LINEAS, SUBPARTIDAS } from "@/lib/data/aduana"
import { BuscarView } from "./_view"

export const metadata: Metadata = { title: "Buscar subpartidas · DIMS AI" }

export default function BuscarPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Buscar subpartida arancelaria
      </h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Describe el producto en lenguaje natural. La IA encuentra el código
        correcto en el Arancel de Importaciones.
      </p>
      <BuscarView subpartidas={SUBPARTIDAS} lineas={LINEAS} />
    </div>
  )
}
