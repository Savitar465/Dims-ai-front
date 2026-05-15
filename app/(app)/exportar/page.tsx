import type { Metadata } from "next"

import { ExportarView } from "./_view"

export const metadata: Metadata = { title: "Exportar · DIMS AI" }

export default function ExportarPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Exportar DIMS{" "}
        <span className="font-mono text-base font-medium text-muted-foreground">
          · DIMS-2026-04823
        </span>
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Tu declaración está lista. Elige el formato para presentarla ante la
        Aduana Nacional.
      </p>
      <ExportarView />
    </div>
  )
}
