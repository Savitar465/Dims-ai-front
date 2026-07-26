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
  /**
   * Categoría del seed de demo. El Arancel 2026 no tiene un campo equivalente,
   * así que llega `null` para los códigos del arancel real.
   */
  linea: LineaId | null
  arancel: number
  iva: number
  ice: number
  gravamen: string

  // ── Arancel 2026 ─────────────────────────────────────────────────────────
  /** Ruta jerárquica completa: "Café... > Café tostado: > Molido". */
  ruta?: string
  /** Texto legal propio de la hoja; suele ser residual ("Los demás"). */
  descHoja?: string
  capitulo?: string
  descCapitulo?: string
  seccion?: string
  /** Unidad de medida declarable (kg, u, l...). */
  unidad?: string
  /** Descripciones mínimas que exige aduana para esta subpartida. */
  descripcionesMinimas?: string
  /** Presente solo si la mercancía está prohibida de importación. */
  prohibida?: string
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

/** Consignatario extraído del documento. Alimenta el importador de la DIMS. */
export interface FacturaImportador {
  tipoDocumento?: string
  numeroDocumento?: string
  nombreRazonSocial?: string
  domicilio?: string
  departamentoDestino?: string
  confidence?: Confidence
}

/** Datos de la carga: salen del packing list o de la guía, no de la factura. */
export interface FacturaLogistica {
  cantidadBultos?: number
  pesoBrutoKg?: number
  pesoNetoKg?: number
  /** Nº de manifiesto / guía aérea (AWB) / carta de porte. */
  manifiesto?: string
  paisUltimaProcedencia?: string
  /** 1 marítimo · 3 carretero · 4 aéreo · 5 postal o courier. */
  medioTransporte?: string
  confidence?: Confidence
}

export type FacturaDocumentoTipo =
  | "factura"
  | "packingList"
  | "guiaTransporte"
  | "otro"

export interface FacturaDocumento {
  /** Identificador dentro de la factura: con él se descarga el original. */
  id?: string
  nombre: string
  mimeType: string
  tipo: FacturaDocumentoTipo
  /** false cuando la IA no pudo sacar nada útil de ese archivo. */
  aporto: boolean
  /** Presente cuando el archivo original quedó guardado y se puede mostrar. */
  archivo?: string
  tamanoBytes?: number
}

export interface Factura {
  id: string
  estado: FacturaEstado
  proveedor: FacturaProveedor
  factura: FacturaCabecera
  items: FacturaItem[]
  totales: FacturaTotales
  importador?: FacturaImportador
  logistica?: FacturaLogistica
  documentos?: FacturaDocumento[]
}

export interface FacturaUpdate {
  proveedor?: FacturaProveedor
  factura?: FacturaCabecera
  totales?: FacturaTotales
  importador?: FacturaImportador
  logistica?: FacturaLogistica
}

export interface FacturaItemUpdate {
  descripcion?: string
  cantidad?: number
  unidad?: string
  precioUnit?: number
  subpartida?: string | null
  /**
   * Mandalo solo cuando la persona eligió el código a mano. El backend usa
   * esta marca para aprender la clasificación; el autoguardado NO debe
   * mandarla, porque reenvía la subpartida de todos los ítems y registraría
   * como confirmadas las sugerencias que nadie revisó.
   */
  subpartidaConfirmada?: boolean
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
  /** Nº de manifiesto de carga / guía de transporte. */
  manifiesto?: string
  transaccion?: DimsTransaccion
  requiereInfAdicional?: boolean
  infAdicional?: string
  /** Códigos de los documentos soporte que se van a adjuntar (CM-003, OT-001…). */
  documentosSoporte?: string[]
  items?: FacturaItem[]
  /** Origen de cada campo del formulario: qué revisó una persona y qué no. */
  origenes?: Record<string, string>
  /** Confianza de la extracción por campo (0–100), con las claves de `origenes`. */
  confianzas?: Record<string, number>
  liquidacion?: Liquidacion
  validacion?: ValidationResult
  creadaEn?: string
  actualizadaEn?: string
}

/**
 * Todo lo que el formulario puede modificar. Antes solo declaraba cinco campos
 * y el resto del borrador no tenía forma de llegar al backend.
 */
export interface DimsUpdate {
  proveedor?: string
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
  manifiesto?: string
  transaccion?: DimsTransaccion
  requiereInfAdicional?: boolean
  infAdicional?: string
  documentosSoporte?: string[]
  items?: FacturaItem[]
  origenes?: Record<string, string>
  confianzas?: Record<string, number>
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
