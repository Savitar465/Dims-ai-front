import type { Metadata } from "next"

import { FACTURA_EJEMPLO } from "@/lib/data/aduana"
import { EditarView } from "./_view"

export const metadata: Metadata = { title: "Editar datos · DIMS AI" }

export default function EditarPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Revisar y editar datos
      </h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Corrige cualquier dato extraído incorrectamente. Los cambios se guardan
        automáticamente.
      </p>
      <EditarView factura={FACTURA_EJEMPLO} />
    </div>
  )
}
