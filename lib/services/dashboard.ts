import type { DashboardData } from "@/lib/types/dims"

/**
 * Mock — replace with `fetch(`${API_URL}/dashboard`, { headers })` once the backend exists.
 * Keeping this as an async function so the page can `await` it today and stay unchanged later.
 */
export async function getDashboardData(): Promise<DashboardData> {
  return {
    proveedor: "María Quispe",
    draftsCount: 2,
    facturasExtraidas: 1,
    stats: {
      dimsEsteMes: { value: "12", sub: "+3 vs mes anterior" },
      tiempoPromedio: { value: "8m 42s", sub: "−62% vs manual" },
      precisionIA: { value: "93%", sub: "extracción de facturas" },
      ahorroEstimado: { value: "USD 340", sub: "en horas de trabajo" },
    },
    recientes: [
      { id: "DIMS-2026-04823", proveedor: "Shenzhen Electronics", fecha: "2026-05-10", valor: 9225.0, estado: "borrador" },
      { id: "DIMS-2026-04812", proveedor: "Guangzhou Trading", fecha: "2026-05-08", valor: 14502.0, estado: "enviada" },
      { id: "DIMS-2026-04795", proveedor: "LATAM Distribuidora", fecha: "2026-05-05", valor: 3220.0, estado: "aprobada" },
      { id: "DIMS-2026-04782", proveedor: "Yiwu Wholesale", fecha: "2026-05-03", valor: 6745.0, estado: "aprobada" },
    ],
    insight: {
      titulo: "La IA detectó un patrón en tus importaciones",
      detalle:
        'En las últimas 4 facturas usaste la subpartida 8471.30.00.00 para "Laptop". ¿Crearlo como producto recurrente?',
      ctaScreen: "productos",
    },
  }
}
