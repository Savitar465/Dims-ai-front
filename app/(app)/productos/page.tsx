import type { Metadata } from "next"

import { LINEAS, PRODUCTOS_FAV } from "@/lib/data/aduana"
import { ProductosView } from "./_view"

export const metadata: Metadata = { title: "Productos recurrentes · DIMS AI" }

export default function ProductosPage() {
  return (
    <div>
      <ProductosView productos={PRODUCTOS_FAV} lineas={LINEAS} />
    </div>
  )
}
