import type { FlujoData } from "@/lib/types/dims"

export async function getFlujoData(): Promise<FlujoData> {
  return {
    steps: [
      {
        id: "factura",
        n: 1,
        title: "Cargar factura",
        short: "Sube PDF o foto de la factura comercial",
        detail:
          "La IA extrae automáticamente proveedor, ítems, cantidades y precios. Soporta PDF, JPG y PNG hasta 10 MB.",
        duration: "~30 seg",
        hu: "HU-003",
      },
      {
        id: "editar",
        n: 2,
        title: "Editar datos",
        short: "Revisa y corrige lo que la IA extrajo",
        detail:
          "Confirma los datos del proveedor, ítems y montos. Resaltamos en amarillo los campos con baja confianza para que los revises primero.",
        duration: "~3 min",
        hu: "HU-004",
      },
      {
        id: "dims",
        n: 3,
        title: "Generar DIMS",
        short: "La IA arma el formulario de Aduana",
        detail:
          "Se calculan automáticamente CIF, GA, IVA e ICE según la subpartida de cada ítem. Puedes ajustar antes de validar.",
        duration: "~20 seg",
        hu: "HU-005",
      },
      {
        id: "validar",
        n: 4,
        title: "Validar",
        short: "Verifica contra el sistema SUMA",
        detail:
          "Comprobamos consistencia tributaria, subpartidas vigentes y restricciones. Te avisamos antes de enviar si algo está mal.",
        duration: "~10 seg",
        hu: "HU-006",
      },
      {
        id: "exportar",
        n: 5,
        title: "Exportar",
        short: "Descarga PDF/XML o envía a SUMA",
        detail:
          "Genera el archivo oficial para presentar en Aduana, o transmítelo directamente al sistema SUMA.",
        duration: "~5 seg",
        hu: "HU-008",
      },
    ],
    drafts: [
      {
        id: "DIMS-2026-04823",
        proveedor: "Shenzhen Electronics",
        items: 4,
        valor: 9225.0,
        actualizada: "hace 12 min",
        stepIdx: 1,
        stepScreen: "editar",
        pendiente: "1 ítem sin clasificar",
      },
      {
        id: "DIMS-2026-04821",
        proveedor: "Yiwu Wholesale",
        items: 7,
        valor: 4180.0,
        actualizada: "hace 2 días",
        stepIdx: 3,
        stepScreen: "validar",
        pendiente: "Esperando confirmación SUMA",
      },
    ],
  }
}
