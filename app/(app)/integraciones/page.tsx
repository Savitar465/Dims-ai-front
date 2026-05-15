import type { Metadata } from "next"

import { IntegracionesView } from "./_view"

export const metadata: Metadata = { title: "Integraciones · DIMS AI" }

export default function IntegracionesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Integraciones</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Conecta DIMS AI con tus sistemas existentes para eliminar duplicación de
        datos.
      </p>
      <IntegracionesView />
    </div>
  )
}
