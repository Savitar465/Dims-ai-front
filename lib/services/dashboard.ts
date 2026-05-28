import type { DashboardData } from "@/lib/types/dims"

/**
 * The backend does not expose /dashboard yet, so this stays mocked. Swap the
 * body for `apiFetch("/dashboard")` once the endpoint exists.
 */
export async function getDashboardData(): Promise<DashboardData> {
  return {
    recientes: [
      { id: "DIMS-2026-04823", proveedor: "Shenzhen Electronics", fecha: "2026-05-10", valor: 9225.0, estado: "borrador" },
      { id: "DIMS-2026-04812", proveedor: "Guangzhou Trading", fecha: "2026-05-08", valor: 14502.0, estado: "enviada" },
      { id: "DIMS-2026-04795", proveedor: "LATAM Distribuidora", fecha: "2026-05-05", valor: 3220.0, estado: "aprobada" },
      { id: "DIMS-2026-04782", proveedor: "Yiwu Wholesale", fecha: "2026-05-03", valor: 6745.0, estado: "aprobada" },
    ],
  }
}
