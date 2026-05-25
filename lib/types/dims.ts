export type DimsEstado = "borrador" | "enviada" | "aprobada"

export interface DimsResumen {
  id: string
  proveedor: string
  fecha: string
  valor: number
  estado: DimsEstado
}

export interface DashboardStats {
  dimsEsteMes: { value: string; sub: string }
  tiempoPromedio: { value: string; sub: string }
  precisionIA: { value: string; sub: string }
  ahorroEstimado: { value: string; sub: string }
}

export interface AiInsight {
  titulo: string
  detalle: string
  ctaScreen: string
}

export interface DashboardData {
  proveedor: string
  draftsCount: number
  facturasExtraidas: number
  stats: DashboardStats
  recientes: DimsResumen[]
  insight: AiInsight | null
}

export type FlowStepId = "factura" | "editar" | "dims" | "validar" | "exportar"

export interface FlowStep {
  id: FlowStepId
  n: number
  title: string
  short: string
  detail: string
  duration: string
  hu: string
}

export interface DraftInProgress {
  id: string
  proveedor: string
  items: number
  valor: number
  actualizada: string
  stepIdx: number
  stepScreen: FlowStepId
  pendiente: string
}

export interface FlujoData {
  steps: FlowStep[]
  drafts: DraftInProgress[]
}

// ── Pagination ──────────────────────────────────────────────────────────────

export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  pagination: Pagination
}

// ── Arancel ──────────────────────────────────────────────────────────────────

export type LineaId = "blanca" | "negra" | "electronica"

export interface Linea {
  id: LineaId
  label: string
  color: string
}

export interface Subpartida {
  code: string
  desc: string
  linea: LineaId
  arancel: number
  iva: number
  ice: number
  gravamen: string
}

export interface SubpartidaMatch extends Subpartida {
  score?: number
  bestMatch?: boolean
}

export interface SubpartidaSearchResult {
  query: string
  resultados: SubpartidaMatch[]
}

// ── Facturas ───────────────────────────────────────────────────────────────

export type FacturaEstado = "procesando" | "extraida" | "error"

/** AI confidence level (0–100). */
export type Confidence = number

export interface FacturaProveedor {
  nombre?: string
  direccion?: string
  pais?: string
  rfc?: string
  confidence?: Confidence
}

export interface FacturaCabecera {
  numero?: string
  fecha?: string
  moneda?: string
  incoterm?: string
  puertoEmbarque?: string
  confidence?: Confidence
}

export interface FacturaItem {
  id: string
  descripcion: string
  cantidad: number
  unidad: string
  precioUnit: number
  subtotal: number
  subpartida: string | null
  confidence: Confidence
  aiSuggested: boolean
}

export interface FacturaTotales {
  subtotal?: number
  flete?: number
  seguro?: number
  cif?: number
}

export interface Factura {
  id: string
  estado: FacturaEstado
  proveedor: FacturaProveedor
  factura: FacturaCabecera
  items: FacturaItem[]
  totales: FacturaTotales
}

export interface FacturaUpdate {
  proveedor?: FacturaProveedor
  factura?: FacturaCabecera
  totales?: FacturaTotales
}

export interface FacturaItemUpdate {
  descripcion?: string
  cantidad?: number
  unidad?: string
  precioUnit?: number
  subpartida?: string | null
}

// ── DIMS ─────────────────────────────────────────────────────────────────────

export interface Liquidacion {
  cif?: number
  ga?: number
  iva?: number
  ice?: number
  totalBob?: number
}

export interface ValidationIssue {
  nivel: "error" | "advertencia" | "info"
  campo?: string
  mensaje: string
}

export interface ValidationResult {
  valido: boolean
  validadaEn?: string
  issues: ValidationIssue[]
}

export interface Dims {
  id: string
  estado: DimsEstado
  facturaId?: string
  proveedor: string
  fecha: string
  nit?: string
  aduanaIngreso?: string
  regimen?: string
  modalidad?: string
  items?: FacturaItem[]
  liquidacion?: Liquidacion
  validacion?: ValidationResult
  creadaEn?: string
  actualizadaEn?: string
}

export interface DimsUpdate {
  proveedor?: string
  nit?: string
  aduanaIngreso?: string
  regimen?: string
  modalidad?: string
  items?: FacturaItem[]
}

export interface CreateDimsInput {
  facturaId?: string
  subpartida?: string
}

export type ExportFormat = "xml" | "pdf" | "json" | "print"

export interface ExportResult {
  formato: ExportFormat
  url: string
  nombreArchivo?: string
  tamanoBytes?: number
  expiraEn?: string
}

// ── Productos / Glosario ──────────────────────────────────────────────────────

export interface ProductoFavorito {
  id: string
  nombre: string
  codigo: string
  linea: LineaId
  ultimoUso: string
  vecesImportado: number
}

export interface GlosarioTerm {
  term: string
  def: string
}
