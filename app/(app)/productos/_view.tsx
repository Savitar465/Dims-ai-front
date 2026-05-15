"use client"

import * as React from "react"
import {
  RiAddLine,
  RiBox3Line,
  RiDeleteBin6Line,
  RiEditLine,
  RiFilterLine,
  RiSearchLine,
  RiUploadCloud2Line,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Linea, ProductoFavorito } from "@/lib/data/aduana"

export function ProductosView({
  productos: initial,
  lineas,
}: {
  productos: ProductoFavorito[]
  lineas: Linea[]
}) {
  const [productos, setProductos] = React.useState(initial)
  const [filtro, setFiltro] = React.useState("")
  const [showImport, setShowImport] = React.useState(false)

  const filtered = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.codigo.includes(filtro)
  )

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Productos recurrentes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus clasificaciones arancelarias guardadas. Reutilízalas al cargar
            nuevas facturas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <RiUploadCloud2Line />
            Importar Excel/CSV
          </Button>
          <Button>
            <RiAddLine />
            Nuevo
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o subpartida…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <RiFilterLine />
          Línea
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[2fr_1.4fr_1fr_0.8fr_80px] border-b bg-surface-2 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
          <div>Producto</div>
          <div>Subpartida</div>
          <div>Línea</div>
          <div>Importado</div>
          <div />
        </div>
        {filtered.map((p, i) => {
          const lineaInfo = lineas.find((l) => l.id === p.linea)!
          return (
            <div
              key={p.id}
              className={
                "grid grid-cols-[2fr_1.4fr_1fr_0.8fr_80px] items-center gap-2 px-4 py-3 " +
                (i > 0 ? "border-t border-border/60" : "")
              }
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-2 text-foreground/75">
                  <RiBox3Line className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium">
                    {p.nombre}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    Último uso: {p.ultimoUso}
                  </div>
                </div>
              </div>
              <div className="font-mono text-[12.5px] text-foreground/75">
                {p.codigo}
              </div>
              <div>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: lineaInfo.color,
                    color: lineaInfo.color,
                    background: "transparent",
                  }}
                >
                  {lineaInfo.label}
                </Badge>
              </div>
              <div className="text-[13px] tabular-nums">
                {p.vecesImportado}
                <span className="text-[11px] text-muted-foreground"> veces</span>
              </div>
              <div className="flex justify-end gap-0.5">
                <Button variant="ghost" size="icon-sm" title="Editar">
                  <RiEditLine />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setProductos((arr) => arr.filter((x) => x.id !== p.id))
                  }
                  title="Eliminar"
                >
                  <RiDeleteBin6Line />
                </Button>
              </div>
            </div>
          )
        })}
      </Card>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar productos desde archivo</DialogTitle>
          </DialogHeader>
          <div className="rounded-[10px] border-2 border-dashed bg-surface-2 p-8 text-center">
            <RiUploadCloud2Line className="mx-auto mb-2.5 size-7 text-muted-foreground" />
            <div className="mb-1 font-medium">Arrastra tu archivo aquí</div>
            <div className="text-xs text-muted-foreground">
              Formatos: .xlsx, .csv · Máx 10 MB
            </div>
          </div>
          <div className="text-xs leading-relaxed text-foreground/75">
            Columnas requeridas:{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5">nombre</code>,{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5">
              subpartida
            </code>
            . La IA validará los códigos contra el Arancel.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowImport(false)}>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
