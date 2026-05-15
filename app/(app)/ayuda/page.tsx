import type { Metadata } from "next"

import { GLOSARIO } from "@/lib/data/aduana"
import { AyudaView } from "./_view"

export const metadata: Metadata = { title: "Ayuda · DIMS AI" }

export default function AyudaPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Centro de ayuda</h1>
      <p className="mt-1 mb-7 text-sm text-muted-foreground">
        Glosario aduanal, ejemplos de llenado y tutoriales interactivos.
      </p>
      <AyudaView glosario={GLOSARIO} />
    </div>
  )
}
