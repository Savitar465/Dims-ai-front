export type DimsEstado = "borrador" | "enviada" | "aprobada"

export interface DimsResumen {
  id: string
  proveedor: string
  fecha: string
  valor: number
  estado: DimsEstado
}

export interface DashboardData {
  recientes: DimsResumen[]
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
  /** true cuando la IA ya evaluó este ítem (haya o no encontrado subpartida). */
  clasificada: boolean
  /** Justificación devuelta por la IA en la última clasificación. */
  razon?: string
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

/** Modalidad del declarante (`tipoUsuarioDims`). */
export type TipoUsuarioDims = "general" | "noPresencial" | "menajeDomestico"

export interface DimsImportador {
  tipoDocumento?: string
  numeroDocumento?: string
  nombreRazonSocial?: string
  domicilio?: string
}

export interface DimsTransaccion {
  valorFobUsd?: number
  fleteDeclaradoSiNo?: boolean
  fleteUsd?: number
  seguroDeclaradoSiNo?: boolean
  seguroUsd?: number
  cantidadBultos?: number
  pesoBruto?: number
  pesoNeto?: number
}

export interface Dims {
  /** Referencia interna del borrador. NO es el código DIMS: ese lo asigna SUMA. */
  id: string
  /** Código oficial asignado por SUMA al transmitir. Ausente en borrador. */
  codigoDims?: string
  estado: DimsEstado
  facturaId?: string
  proveedor: string
  fecha: string
  nit?: string
  aduanaIngreso?: string
  regimen?: string
  modalidad?: string
  tipoUsuario?: TipoUsuarioDims
  importador?: DimsImportador
  departamentoDestino?: string
  paisUltimaProcedencia?: string
  parteRecepcionSiNo?: boolean
  parteRecepcion?: string
  transporteHastaFrontera?: string
  transaccion?: DimsTransaccion
  requiereInfAdicional?: boolean
  infAdicional?: string
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
