import { API_BASE_URL, apiFetch } from "@/lib/api/client"
import type {
  Factura,
  FacturaDocumento,
  FacturaItem,
  FacturaItemUpdate,
  FacturaUpdate,
} from "@/lib/types/dims"

/**
 * URL del archivo original tal como se subió. Se usa directamente en un `img`
 * o un `iframe`: el usuario mira el papel al lado del formulario en vez de
 * tener que confiar en lo que la IA leyó.
 *
 * Devuelve null cuando ese documento no quedó guardado en el servidor.
 */
export function documentoUrl(
  facturaId: string,
  documento: FacturaDocumento
): string | null {
  if (!documento.id || !documento.archivo) return null
  return `${API_BASE_URL}/facturas/${encodeURIComponent(
    facturaId
  )}/documentos/${encodeURIComponent(documento.id)}`
}

/**
 * Sube la factura y, opcionalmente, el packing list y la guía de transporte.
 * Cuantos más documentos se manden, más campos obligatorios de la DIMS quedan
 * pre-llenados: los pesos, los bultos y el nº de manifiesto casi nunca están
 * en la factura comercial.
 */
export function uploadFactura(archivos: File | File[]): Promise<Factura> {
  const lista = Array.isArray(archivos) ? archivos : [archivos]
  const form = new FormData()
  for (const archivo of lista) form.append("archivos", archivo)
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
