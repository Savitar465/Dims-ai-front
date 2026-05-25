import { apiFetch } from "@/lib/api/client"
import type {
  CreateDimsInput,
  Dims,
  DimsEstado,
  DimsResumen,
  DimsUpdate,
  ExportFormat,
  ExportResult,
  Paginated,
  ValidationResult,
} from "@/lib/types/dims"

export function listDims(params?: {
  estado?: DimsEstado
  q?: string
  page?: number
  pageSize?: number
}): Promise<Paginated<DimsResumen>> {
  return apiFetch<Paginated<DimsResumen>>("/dims", { query: params })
}

export function createDims(input: CreateDimsInput): Promise<Dims> {
  return apiFetch<Dims>("/dims", { method: "POST", body: input })
}

export function getDims(dimsId: string): Promise<Dims> {
  return apiFetch<Dims>(`/dims/${encodeURIComponent(dimsId)}`)
}

export function updateDims(dimsId: string, patch: DimsUpdate): Promise<Dims> {
  return apiFetch<Dims>(`/dims/${encodeURIComponent(dimsId)}`, {
    method: "PUT",
    body: patch,
  })
}

export function deleteDims(dimsId: string): Promise<void> {
  return apiFetch<void>(`/dims/${encodeURIComponent(dimsId)}`, { method: "DELETE" })
}

export function generateDims(dimsId: string): Promise<Dims> {
  return apiFetch<Dims>(`/dims/${encodeURIComponent(dimsId)}/generate`, {
    method: "POST",
  })
}

export function validateDims(dimsId: string): Promise<ValidationResult> {
  return apiFetch<ValidationResult>(`/dims/${encodeURIComponent(dimsId)}/validate`, {
    method: "POST",
  })
}

export function exportDims(dimsId: string, formato: ExportFormat): Promise<ExportResult> {
  return apiFetch<ExportResult>(`/dims/${encodeURIComponent(dimsId)}/export`, {
    method: "POST",
    body: { formato },
  })
}

export function emailDims(
  dimsId: string,
  destinatario: string,
  formato: ExportFormat,
): Promise<void> {
  return apiFetch<void>(`/dims/${encodeURIComponent(dimsId)}/email`, {
    method: "POST",
    body: { destinatario, formato },
  })
}

export function submitDims(dimsId: string): Promise<Dims> {
  return apiFetch<Dims>(`/dims/${encodeURIComponent(dimsId)}/submit`, {
    method: "POST",
  })
}
