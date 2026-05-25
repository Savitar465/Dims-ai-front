import { apiFetch } from "@/lib/api/client"
import type {
  Linea,
  LineaId,
  Subpartida,
  SubpartidaSearchResult,
} from "@/lib/types/dims"

export function listLineas(): Promise<Linea[]> {
  return apiFetch<Linea[]>("/arancel/lineas")
}

export function searchSubpartidas(
  q: string,
  linea?: LineaId,
): Promise<SubpartidaSearchResult> {
  return apiFetch<SubpartidaSearchResult>("/arancel/subpartidas", {
    query: { q, linea },
  })
}

export function getSubpartida(code: string): Promise<Subpartida> {
  return apiFetch<Subpartida>(`/arancel/subpartidas/${encodeURIComponent(code)}`)
}
