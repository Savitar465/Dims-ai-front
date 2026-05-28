"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiAlertLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiBuildingLine,
  RiBox3Line,
  RiCheckLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiFileTextLine,
  RiLoader4Line,
  RiSparkling2Line,
  RiAddLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { FacturaEjemplo, FacturaItem } from "@/lib/data/aduana"
import { updateFactura, updateFacturaItem } from "@/lib/services/facturas"
import { searchSubpartidas } from "@/lib/services/arancel"
import type { SubpartidaMatch } from "@/lib/types/dims"
import { AIBadge, Confidence } from "../_components/domain"

type EditableItem = FacturaItem & { errors: string[] }

function validate(item: FacturaItem): string[] {
  const errs: string[] = []
  if (!item.subpartida) errs.push("subpartida")
  if (item.precioUnit < 0.1) errs.push("precio_bajo")
  if (!item.descripcion?.trim()) errs.push("descripcion")
  return errs
}

type SaveState = "saved" | "saving" | "error"

export function EditarView({
  factura,
  facturaId,
}: {
  factura: FacturaEjemplo
  facturaId?: string
}) {
  const [items, setItems] = React.useState<EditableItem[]>(() =>
    factura.items.map((i) => ({ ...i, errors: validate(i) }))
  )
  const [proveedor, setProveedor] = React.useState(factura.proveedor)
  const [doc, setDoc] = React.useState(factura.factura)
  const [saveState, setSaveState] = React.useState<SaveState>("saved")
  const [sugFor, setSugFor] = React.useState<string | null>(null)

  // Persist header + every item to the backend. Without a facturaId (example
  // fallback / no backend) there's nothing to save, so just report "saved".
  const persist = React.useCallback(async () => {
    if (!facturaId) {
      setSaveState("saved")
      return
    }
    setSaveState("saving")
    try {
      await updateFactura(facturaId, {
        proveedor: {
          nombre: proveedor.nombre,
          direccion: proveedor.direccion,
          pais: proveedor.pais,
          rfc: proveedor.rfc,
        },
        factura: {
          numero: doc.numero,
          fecha: doc.fecha,
          moneda: doc.moneda,
          incoterm: doc.incoterm,
          puertoEmbarque: doc.puertoEmbarque,
        },
      })
      await Promise.all(
        items.map((it) =>
          updateFacturaItem(facturaId, it.id, {
            descripcion: it.descripcion,
            cantidad: it.cantidad,
            unidad: it.unidad,
            precioUnit: it.precioUnit,
            subpartida: it.subpartida,
          })
        )
      )
      setSaveState("saved")
    } catch {
      setSaveState("error")
    }
  }, [facturaId, proveedor, doc, items])

  // Debounced auto-save: skip the initial mount, then save 800ms after the
  // last edit.
  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    setSaveState("saving")
    const t = setTimeout(() => void persist(), 800)
    return () => clearTimeout(t)
  }, [persist])

  const updateItem = (id: string, field: keyof FacturaItem, val: unknown) => {
    setItems((arr) =>
      arr.map((it) => {
        if (it.id !== id) return it
        const next = { ...it, [field]: val } as EditableItem
        if (field === "cantidad" || field === "precioUnit") {
          next.subtotal = +(next.cantidad * next.precioUnit).toFixed(2)
        }
        next.errors = validate(next)
        return next
      })
    )
  }

  const applySuggestion = (id: string, code: string) => {
    setItems((arr) =>
      arr.map((it) =>
        it.id === id
          ? {
              ...it,
              subpartida: code,
              confidence: 92,
              errors: validate({ ...it, subpartida: code }),
            }
          : it
      )
    )
    setSugFor(null)
  }

  const errorCount = items.reduce((s, i) => s + i.errors.length, 0)
  const lowConf = items.filter((i) => i.confidence > 0 && i.confidence < 80).length
  const subtotal = items.reduce((s, i) => s + (i.subtotal || 0), 0)
  const sugItem = items.find((i) => i.id === sugFor) ?? null

  return (
    <>
      <div className="my-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {errorCount > 0 ? (
            <Badge variant="destructive">
              <RiAlertLine />
              {errorCount} {errorCount === 1 ? "campo" : "campos"} con error
            </Badge>
          ) : null}
          {lowConf > 0 ? (
            <Badge className="bg-warning-soft text-warning hover:bg-warning-soft">
              <RiEyeLine />
              {lowConf} con confianza baja
            </Badge>
          ) : null}
          {errorCount === 0 && lowConf === 0 ? (
            <Badge className="bg-success-soft text-success hover:bg-success-soft">
              <RiCheckLine />
              Todo correcto
            </Badge>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {saveState === "saving" ? (
            <>
              <RiLoader4Line className="size-3 animate-spin" /> Guardando…
            </>
          ) : saveState === "error" ? (
            <span className="flex items-center gap-1 text-destructive">
              <RiAlertLine className="size-3" /> Error al guardar
            </span>
          ) : (
            <>
              <RiCheckLine className="size-3 text-success" /> Guardado automáticamente
            </>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardContent className="!p-0">
            <div className="mb-3.5 flex items-center gap-2">
              <RiBuildingLine className="size-4 text-muted-foreground" />
              <div className="text-[13px] font-semibold">Proveedor</div>
            </div>
            <div className="flex flex-col gap-3">
              <Field label="Nombre" required>
                <Input
                  value={proveedor.nombre}
                  onChange={(e) =>
                    setProveedor({ ...proveedor, nombre: e.target.value })
                  }
                />
              </Field>
              <Field label="Dirección">
                <Input
                  value={proveedor.direccion}
                  onChange={(e) =>
                    setProveedor({ ...proveedor, direccion: e.target.value })
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="País">
                  <Select
                    value={proveedor.pais}
                    onValueChange={(v) => setProveedor({ ...proveedor, pais: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["China", "Estados Unidos", "Brasil", "Chile", "Perú"].map(
                        (c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tax ID / RFC">
                  <Input
                    className="font-mono"
                    value={proveedor.rfc}
                    onChange={(e) =>
                      setProveedor({ ...proveedor, rfc: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-5">
          <CardContent className="!p-0">
            <div className="mb-3.5 flex items-center gap-2">
              <RiFileTextLine className="size-4 text-muted-foreground" />
              <div className="text-[13px] font-semibold">Datos de factura</div>
            </div>
            <Field label="Número" required>
              <Input
                className="font-mono"
                value={doc.numero}
                onChange={(e) => setDoc({ ...doc, numero: e.target.value })}
              />
            </Field>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Fecha emisión" required>
                <Input
                  type="date"
                  className="tabular-nums"
                  value={doc.fecha}
                  onChange={(e) => setDoc({ ...doc, fecha: e.target.value })}
                />
              </Field>
              <Field label="Moneda" required>
                <Select
                  value={doc.moneda}
                  onValueChange={(v) => setDoc({ ...doc, moneda: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "BOB", "CNY"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Incoterm">
                <Select
                  value={doc.incoterm}
                  onValueChange={(v) => setDoc({ ...doc, incoterm: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["FOB", "CIF", "EXW", "DDP"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Puerto embarque">
                <Input
                  value={doc.puertoEmbarque}
                  onChange={(e) =>
                    setDoc({ ...doc, puertoEmbarque: e.target.value })
                  }
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <RiBox3Line className="size-4 text-muted-foreground" />
          <div className="text-[13px] font-semibold">Ítems de la factura</div>
          <Button variant="outline" size="sm" className="ml-auto">
            <RiAddLine />
            Agregar ítem
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[34%]">Descripción</TableHead>
                <TableHead className="w-20 text-right">Cant.</TableHead>
                <TableHead className="w-[70px]">Unidad</TableHead>
                <TableHead className="w-28 text-right">P. unitario</TableHead>
                <TableHead className="w-28 text-right">Subtotal</TableHead>
                <TableHead className="w-[200px]">Subpartida</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <ItemRow
                  key={it.id}
                  item={it}
                  onUpdate={updateItem}
                  onShowSug={() => setSugFor(it.id)}
                  onRemove={() =>
                    setItems((arr) => arr.filter((x) => x.id !== it.id))
                  }
                />
              ))}
            </TableBody>
            <tfoot>
              <tr className="bg-surface-2 text-[12px] font-medium">
                <td colSpan={4} className="px-3 py-2.5 text-right text-muted-foreground">
                  Subtotal
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums font-semibold">
                  USD {subtotal.toFixed(2)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </Table>
        </div>
      </Card>

      <div className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-lg">
        <Button asChild variant="outline">
          <Link href="/factura">
            <RiArrowLeftSLine />
            Volver
          </Link>
        </Button>
        <div className="text-[12.5px] text-muted-foreground">
          {items.length} ítems · USD {subtotal.toFixed(2)}
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => void persist()}
            disabled={saveState === "saving"}
          >
            Guardar borrador
          </Button>
          <Button asChild disabled={errorCount > 0}>
            <Link
              href="/dims"
              aria-disabled={errorCount > 0}
              className={cn(errorCount > 0 && "pointer-events-none opacity-50")}
            >
              Continuar a DIMS
              <RiArrowRightLine />
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={!!sugFor} onOpenChange={(o) => !o && setSugFor(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sugerencias de subpartida</DialogTitle>
          </DialogHeader>
          {sugItem ? (
            <SuggestionsList
              item={sugItem}
              onApply={(c) => applySuggestion(sugItem.id, c)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

function ItemRow({
  item,
  onUpdate,
  onShowSug,
  onRemove,
}: {
  item: EditableItem
  onUpdate: (id: string, field: keyof FacturaItem, val: unknown) => void
  onShowSug: () => void
  onRemove: () => void
}) {
  const hasErrors = item.errors.length > 0
  const lowConf = item.confidence > 0 && item.confidence < 80

  return (
    <TableRow
      className={cn(
        hasErrors && "bg-destructive/5",
        !hasErrors && lowConf && "bg-warning-soft/40"
      )}
    >
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Input
            className="h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1"
            value={item.descripcion}
            onChange={(e) => onUpdate(item.id, "descripcion", e.target.value)}
          />
          {item.aiSuggested ? <AIBadge /> : null}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          className="h-7 border-0 bg-transparent px-1 text-right font-mono tabular-nums shadow-none focus-visible:ring-1"
          value={item.cantidad}
          onChange={(e) => onUpdate(item.id, "cantidad", +e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          className="h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1"
          value={item.unidad}
          onChange={(e) => onUpdate(item.id, "unidad", e.target.value)}
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          step="0.01"
          className="h-7 border-0 bg-transparent px-1 text-right font-mono tabular-nums shadow-none focus-visible:ring-1"
          value={item.precioUnit}
          onChange={(e) => onUpdate(item.id, "precioUnit", +e.target.value)}
        />
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums font-medium">
        {item.subtotal?.toFixed(2)}
      </TableCell>
      <TableCell>
        {item.subpartida ? (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12.5px]">{item.subpartida}</span>
            {lowConf ? (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onShowSug}
                title="Ver sugerencias"
              >
                <RiSparkling2Line className="text-ai" />
              </Button>
            ) : null}
            <Confidence value={item.confidence} showPct={false} />
          </div>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={onShowSug}
          >
            <RiSparkling2Line />
            Sugerir
          </Button>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <RiDeleteBin6Line />
        </Button>
      </TableCell>
    </TableRow>
  )
}

function SuggestionsList({
  item,
  onApply,
}: {
  item: EditableItem
  onApply: (code: string) => void
}) {
  const [matches, setMatches] = React.useState<SubpartidaMatch[]>([])
  const [status, setStatus] = React.useState<"loading" | "done" | "error">(
    "loading"
  )

  React.useEffect(() => {
    let active = true
    searchSubpartidas(item.descripcion)
      .then((res) => {
        if (!active) return
        setMatches(res.resultados.slice(0, 4))
        setStatus("done")
      })
      .catch(() => {
        if (active) setStatus("error")
      })
    return () => {
      active = false
    }
  }, [item.descripcion])

  return (
    <div>
      <div className="mb-3.5 rounded-md bg-surface-2 p-3 text-[13px]">
        <div className="mb-0.5 text-[11.5px] text-muted-foreground">
          Producto a clasificar:
        </div>
        <div className="font-medium">{item.descripcion}</div>
      </div>
      <div className="mb-2.5 flex items-center gap-2">
        <RiSparkling2Line className="size-3.5 text-ai" />
        <div className="text-[12.5px] font-medium">
          {status === "loading"
            ? "Buscando coincidencias por IA…"
            : `Top ${matches.length} coincidencias por IA`}
        </div>
      </div>
      {status === "loading" ? (
        <div className="flex items-center gap-2 px-1 py-3 text-[12.5px] text-muted-foreground">
          <RiLoader4Line className="size-3.5 animate-spin" />
          Analizando la descripción del producto…
        </div>
      ) : status === "error" ? (
        <div className="flex items-center gap-2 px-1 py-3 text-[12.5px] text-destructive">
          <RiAlertLine className="size-3.5" />
          No se pudieron obtener sugerencias. Intenta de nuevo.
        </div>
      ) : matches.length === 0 ? (
        <div className="px-1 py-3 text-[12.5px] text-muted-foreground">
          No se encontraron coincidencias para esta descripción.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {matches.map((m, i) => (
            <div
              key={m.code}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="font-mono text-[13px] font-semibold text-primary">
                    {m.code}
                  </span>
                  {m.bestMatch ?? i === 0 ? (
                    <AIBadge title="Mejor coincidencia" />
                  ) : null}
                </div>
                <div className="text-[12.5px] text-foreground/75">{m.desc}</div>
              </div>
              <Button size="sm" onClick={() => onApply(m.code)}>
                Aplicar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
