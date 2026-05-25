import { apiFetch } from "@/lib/api/client"
import type { FlujoData } from "@/lib/types/dims"

export function getFlujoData(): Promise<FlujoData> {
  return apiFetch<FlujoData>("/flujo")
}
