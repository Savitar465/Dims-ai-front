import { apiFetch } from "@/lib/api/client"
import type {
  Factura,
  FacturaItem,
  FacturaItemUpdate,
  FacturaUpdate,
} from "@/lib/types/dims"

export function uploadFactura(archivo: File): Promise<Factura> {
  const form = new FormData()
  form.append("archivo", archivo)
  return apiFetch<Factura>("/facturas", { method: "POST", rawBody: form })
}

export function getFactura(facturaId: string): Promise<Factura> {
  return apiFetch<Factura>(`/facturas/${encodeURIComponent(facturaId)}`)
}

export function updateFactura(
  facturaId: string,
  patch: FacturaUpdate,
): Promise<Factura> {
  return apiFetch<Factura>(`/facturas/${encodeURIComponent(facturaId)}`, {
    method: "PUT",
    body: patch,
  })
}

export function updateFacturaItem(
  facturaId: string,
  itemId: string,
  patch: FacturaItemUpdate,
): Promise<FacturaItem> {
  return apiFetch<FacturaItem>(
    `/facturas/${encodeURIComponent(facturaId)}/items/${encodeURIComponent(itemId)}`,
    { method: "PUT", body: patch },
  )
}

export function clasificarSubpartidas(facturaId: string): Promise<Factura> {
  return apiFetch<Factura>(
    `/facturas/${encodeURIComponent(facturaId)}/clasificar-subpartidas`,
    { method: "POST" },
  )
}

export interface CreateFacturaItemInput {
  descripcion: string
  cantidad?: number
  unidad?: string
  precioUnit?: number
  subpartida?: string | null
}

export function createFacturaItem(
  facturaId: string,
  input: CreateFacturaItemInput,
): Promise<FacturaItem> {
  return apiFetch<FacturaItem>(
    `/facturas/${encodeURIComponent(facturaId)}/items`,
    { method: "POST", body: input },
  )
}
