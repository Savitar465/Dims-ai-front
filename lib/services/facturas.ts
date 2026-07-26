import { API_BASE_URL, ApiError, apiFetch } from "@/lib/api/client"
import type {
  ExtraccionErrorCodigo,
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

/** Un documento que no se pudo leer, tal como lo detalla el 422 del upload. */
export interface DocumentoNoLeido {
  id?: string
  nombre: string
  codigo: ExtraccionErrorCodigo | string
  mensaje: string
}

export interface ExtraccionFallida {
  /** Mensaje general, ya redactado por el backend. */
  mensaje: string
  /**
   * La factura quedó guardada con sus archivos aunque no se haya podido leer
   * nada: con este id se puede mostrar el original y reintentar sobre ella.
   */
  facturaId: string
  documentos: DocumentoNoLeido[]
}

/**
 * ¿El fallo es "no pudimos leer los documentos" y no un error de red o del
 * servidor? El backend lo devuelve como 422 `extraccion_fallida` con el motivo
 * de cada archivo; distinguirlo importa porque acá el usuario sí puede hacer
 * algo (subir otra versión, reintentar), y merece que se lo digamos.
 */
export function esExtraccionFallida(e: unknown): ExtraccionFallida | null {
  if (!(e instanceof ApiError) || e.code !== "extraccion_fallida") return null
  const d = e.details as
    | { facturaId?: unknown; documentos?: unknown }
    | undefined
  const documentos = Array.isArray(d?.documentos)
    ? (d.documentos as DocumentoNoLeido[]).filter(
        (doc) => doc && typeof doc.mensaje === "string"
      )
    : []
  return {
    mensaje: e.message,
    facturaId: typeof d?.facturaId === "string" ? d.facturaId : "",
    documentos,
  }
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
