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
