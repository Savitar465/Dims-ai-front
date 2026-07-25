// Traduce el estado del formulario al cuerpo que espera `PUT /dims/:id`.
//
// El formulario está organizado por cómo se le pregunta al usuario ("Sobre el
// trámite", "Tus datos"); la DIMS del backend está organizada por cómo la
// guarda la aduana. Esta es la única pieza que conoce las dos formas.

import type { DimsUpdate } from "@/lib/types/dims"
import type { DimsFormState, Origen } from "./campos"

export function aDimsUpdate(
  form: DimsFormState,
  origenes: Record<string, Origen>
): DimsUpdate {
  return {
    proveedor: form.proveedor.nombre,
    nit: form.importador.numeroDocumento,
    aduanaIngreso: form.general.aduanaDespacho,
    regimen: form.general.regimen,
    modalidad: form.general.modalidad,
    tipoUsuario: form.general.tipoUsuario,
    importador: {
      tipoDocumento: form.importador.tipoDocumento,
      numeroDocumento: form.importador.numeroDocumento,
      nombreRazonSocial: form.importador.nombreRazonSocial,
      domicilio: form.importador.domicilio,
    },
    departamentoDestino: form.importador.departamentoDestino,
    paisUltimaProcedencia: form.transporte.paisUltimaProcedencia,
    parteRecepcionSiNo: form.general.parteRecepcionSiNo,
    parteRecepcion: form.general.parteRecepcion,
    transporteHastaFrontera: form.transporte.medioHastaFrontera,
    manifiesto: form.transporte.manifiesto,
    transaccion: { ...form.transaccion },
    requiereInfAdicional: form.docsop.requiereInfAdicional,
    infAdicional: form.docsop.infAdicional,
    documentosSoporte: form.docsop.documentos,
    // Se guarda junto con los valores: al reabrir el borrador hay que poder
    // distinguir lo que una persona ya revisó de lo que sigue siendo una
    // suposición, o el formulario volvería a pedir todas las confirmaciones.
    origenes,
  }
}

/** Firma del contenido guardado: evita reenviar un borrador que no cambió. */
export function huella(update: DimsUpdate): string {
  return JSON.stringify(update)
}
