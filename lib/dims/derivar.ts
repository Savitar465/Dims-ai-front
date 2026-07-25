// Reglas que deducen un campo de la DIMS a partir de otros que el usuario ya
// respondió. Evitan preguntar lo que la normativa ya determina (doc §1–§3).
//
// Una derivación NUNCA es un valor definitivo: se escribe en el formulario como
// "sugerido" y el usuario tiene que confirmarla. Un valor que se cuela sin que
// nadie lo mire es exactamente el problema que estas reglas vienen a resolver.

import { ADUANAS_DESPACHO, MODALIDADES, type TipoUsuario } from "@/lib/data/aduana"
import { tipoDeAduana, type DimsFormState } from "./campos"

export interface Sugerencia {
  valor: string
  /** Por qué se dedujo, en lenguaje común. Se muestra debajo del campo. */
  motivo: string
}

/** Régimen aduanero: lo fija el tipo de usuario, no se elige libremente. */
export function regimenSugerido(
  tipoUsuario: TipoUsuario
): Sugerencia | undefined {
  if (tipoUsuario === "menajeDomestico") {
    return {
      valor: "93",
      motivo: "Traer tu mudanza va siempre por el régimen de menaje doméstico.",
    }
  }
  return undefined
}

/**
 * Modalidad del régimen. Solo se sugiere cuando la regla es inequívoca: entre
 * las modalidades de incentivo (4105/4106) decide el tipo de mercadería, no el
 * monto, así que ahí no se sugiere nada y elige el usuario.
 */
export function modalidadSugerida(
  regimen: string,
  valorFobUsd: number
): Sugerencia | undefined {
  if (regimen === "93") {
    return { valor: "9300", motivo: "Corresponde al régimen de menaje doméstico." }
  }
  if (regimen === "91") {
    return {
      valor: "9100",
      motivo:
        "Es la modalidad de los paquetes que llegan por correo. Si tu envío vino por una empresa expresa (DHL, FedEx), elegí “Envío por empresa de servicio expreso”.",
    }
  }
  if (regimen !== "41" || valorFobUsd <= 0) return undefined
  if (valorFobUsd <= 2000) {
    return {
      valor: "4101",
      motivo: `Tu mercadería vale USD ${fmt(valorFobUsd)} y esta modalidad cubre hasta USD 2.000.`,
    }
  }
  if (valorFobUsd <= 3500) {
    return {
      valor: "4103",
      motivo: `USD ${fmt(valorFobUsd)} supera el límite de la modalidad común (USD 2.000), pero entra en esta.`,
    }
  }
  return undefined
}

/** Medio de transporte hasta la frontera (doc §3). */
export function medioTransporteSugerido(
  regimen: string,
  codAduana: string
): Sugerencia | undefined {
  if (regimen === "91") {
    return {
      valor: "5",
      motivo: "Los envíos de correo o courier viajan siempre por esa vía.",
    }
  }
  const tipo = tipoDeAduana(codAduana)
  if (!tipo) return undefined
  if (tipo === "A" || tipo === "Z") {
    return { valor: "4", motivo: "La aduana que elegiste es aeroportuaria." }
  }
  if (tipo === "F") {
    return {
      valor: "3",
      motivo: "Por un paso de frontera la carga entra por carretera.",
    }
  }
  if (tipo === "P") {
    return { valor: "5", motivo: "La aduana postal recibe correo y courier." }
  }
  // Aduana interior (I): se llega por cualquier medio, no hay regla que valga.
  return undefined
}

/**
 * País de última procedencia. En frontera (F) y zona franca (Z) el campo se
 * deshabilita y lo asigna la aduana: acá se muestra ese valor en vez de dejar
 * un campo gris y vacío que el usuario no entiende por qué no puede tocar.
 */
export function paisProcedenciaSugerido(
  codAduana: string
): Sugerencia | undefined {
  const aduana = ADUANAS_DESPACHO.find((a) => a.cod === codAduana)
  if (!aduana?.paisLimitrofe) return undefined
  if (aduana.tipo !== "F" && aduana.tipo !== "Z") return undefined
  return {
    valor: aduana.paisLimitrofe,
    motivo: `La aduana de ${aduana.label.split(" (")[0]} asigna este país automáticamente.`,
  }
}

/** Modalidades que tiene sentido ofrecer para el régimen elegido. */
export function modalidadesDe(regimen: string) {
  const filtradas = MODALIDADES.filter((m) => m.regimen === regimen)
  return filtradas.length > 0 ? filtradas : MODALIDADES
}

/**
 * Todas las sugerencias aplicables al estado actual, indexadas por id de campo
 * para que se puedan cruzar directamente con el catálogo de `campos.ts`.
 */
export function sugerencias(form: DimsFormState): Record<string, Sugerencia> {
  const out: Record<string, Sugerencia> = {}
  const agregar = (id: string, s?: Sugerencia) => {
    if (s) out[id] = s
  }

  agregar("general.regimen", regimenSugerido(form.general.tipoUsuario))
  agregar(
    "general.modalidad",
    modalidadSugerida(form.general.regimen, form.transaccion.valorFobUsd)
  )
  agregar(
    "transporte.medioHastaFrontera",
    medioTransporteSugerido(form.general.regimen, form.general.aduanaDespacho)
  )
  agregar(
    "transporte.paisUltimaProcedencia",
    paisProcedenciaSugerido(form.general.aduanaDespacho)
  )

  return out
}

function fmt(n: number): string {
  return n.toLocaleString("es-BO", { maximumFractionDigits: 2 })
}
