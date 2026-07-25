// Fuente única de verdad del formulario DIMS: qué campos existen, cómo se le
// explican a un usuario que nunca usó SUMA, y cuándo cuentan como completos.
//
// La vista no decide si un campo es obligatorio ni cuánto falta: consulta este
// módulo. Así el progreso, el índice lateral y el botón "siguiente pendiente"
// leen siempre el mismo estado.

import type { AduanaTipo, TipoUsuario } from "@/lib/data/aduana"
import {
  ADUANAS_DESPACHO,
  DOCUMENTOS_SOPORTE,
  MODALIDADES,
} from "@/lib/data/aduana"
import { buscarPais, type Pais } from "@/lib/data/paises"

export type SectionId =
  | "general"
  | "importador"
  | "proveedor"
  | "transporte"
  | "transaccion"
  | "items"
  | "docsop"
  | "liquidacion"

export interface DimsFormState {
  general: {
    tipoUsuario: TipoUsuario
    aduanaDespacho: string
    regimen: string
    modalidad: string
    parteRecepcionSiNo: boolean
    parteRecepcion: string
  }
  importador: {
    tipoDocumento: string
    numeroDocumento: string
    nombreRazonSocial: string
    domicilio: string
    departamentoDestino: string
  }
  proveedor: {
    nombre: string
    direccion: string
    pais: string
    rfc: string
    relacion: string
  }
  transporte: {
    paisUltimaProcedencia: string
    medioHastaFrontera: string
    manifiesto: string
  }
  transaccion: {
    valorFobUsd: number
    fleteDeclaradoSiNo: boolean
    fleteUsd: number
    seguroDeclaradoSiNo: boolean
    seguroUsd: number
    cantidadBultos: number
    pesoBruto: number
    pesoNeto: number
  }
  // El nombre del grupo tiene que coincidir con el prefijo del id del campo
  // ("docsop.documentos"): de ahí saca `set` la clave con la que guarda el
  // origen, y con "docSop" quedaba escribiendo una clave que nadie leía.
  docsop: {
    /** Códigos de `DOCUMENTOS_SOPORTE` que el usuario va a adjuntar. */
    documentos: string[]
    requiereInfAdicional: boolean
    infAdicional: string
  }
}

/**
 * De dónde salió el valor que hoy tiene un campo. Es la diferencia entre "está
 * lleno" y "alguien lo revisó": un valor deducido por una regla se muestra
 * distinto y no cuenta como completo hasta que el usuario lo confirma.
 */
export type Origen =
  /** Lo leyó la IA de la factura, el packing list o la guía. */
  | "documento"
  /** Lo dedujo una regla de la normativa a partir de otras respuestas. */
  | "sugerido"
  /** Lo escribió o confirmó el usuario. */
  | "usuario"

/** Todo lo que las reglas necesitan mirar, no solo los campos editables. */
export interface DimsContexto {
  form: DimsFormState
  /** Ítems que la IA no logró clasificar: bloquean la declaración. */
  itemsSinSubpartida: number
  /** Códigos arancelarios ya asignados: algunas modalidades prohíben partidas. */
  subpartidas?: string[]
  /** Origen actual de cada campo, indexado por `CampoSpec.id`. */
  origenes?: Record<string, Origen>
  /**
   * Qué tan segura estaba la IA de cada valor que leyó (0–100), por campo.
   * Un número por sección obliga a decir "revisá todo el bloque"; con el dato
   * por campo se puede señalar exactamente cuáles conviene mirar.
   */
  confianzas?: Record<string, number>
}

/** Debajo de esto un valor leído de un documento se marca para revisar. */
export const UMBRAL_CONFIANZA = 80

/**
 * Un dato que está lleno pero que la aduana rechazaría. No es lo mismo que un
 * campo vacío: acá el usuario ya respondió y hay que decirle qué está mal y
 * cómo arreglarlo, en la misma frase.
 */
export interface Problema {
  /** `error` bloquea la validación; `advertencia` solo avisa. */
  nivel: "error" | "advertencia"
  mensaje: string
}

/** Lee el valor actual de un campo a partir de su id. */
export function leerCampo(form: DimsFormState, id: string): unknown {
  const [grupo, campo] = id.split(".") as [keyof DimsFormState, string]
  const actual = form[grupo] as Record<string, unknown> | undefined
  return actual?.[campo]
}

/** Escribe un valor de texto en el formulario a partir del id del campo. */
export function escribirCampo(
  form: DimsFormState,
  id: string,
  valor: string
): DimsFormState {
  const [grupo, campo] = id.split(".") as [keyof DimsFormState, string]
  const actual = form[grupo]
  if (!actual || !(campo in actual)) return form
  return { ...form, [grupo]: { ...actual, [campo]: valor } }
}

export interface CampoSpec {
  /** Sirve de `id` en el DOM: es el destino del botón "siguiente pendiente". */
  id: string
  seccion: SectionId
  /** Pregunta en lenguaje común. Nunca jerga aduanera. */
  label: string
  /** Nombre oficial SUMA, como subtítulo para quien ya conoce el trámite. */
  tecnico?: string
  /** Qué es y en qué papel encontrarlo. Se muestra siempre, no en un tooltip. */
  ayuda?: string
  requerido: (ctx: DimsContexto) => boolean
  completo: (ctx: DimsContexto) => boolean
  /** Reglas de la normativa que el valor puede violar (límites, topes, vetos). */
  problema?: (ctx: DimsContexto) => Problema | undefined
}

const texto = (v: string) => v.trim().length > 0
const positivo = (v: number) => Number.isFinite(v) && v > 0
const usd = (n: number) => `USD ${n.toLocaleString("es-BO", { maximumFractionDigits: 2 })}`

/**
 * Aviso, no error: el catálogo puede quedarse corto y no queremos trabar una
 * declaración por eso, pero un país que no reconocemos suele ser un typo.
 */
function paisDesconocido(valor: string, pais?: Pais): Problema | undefined {
  if (!texto(valor) || pais) return undefined
  return {
    nivel: "advertencia",
    mensaje: `No reconocemos “${valor.trim()}” como país. Revisá que esté bien escrito: este dato viaja a la declaración.`,
  }
}

/** Modalidad elegida, con su límite de valor y de peso si los tiene. */
function modalidadActual(ctx: DimsContexto) {
  return MODALIDADES.find((m) => m.cod === ctx.form.general.modalidad)
}

/** Modalidades donde la Parte de Recepción es obligatoria sí o sí (doc §2). */
const MODALIDADES_CON_PARTE_RECEPCION = ["4101", "4107", "9300"]

/** Partidas arancelarias vetadas por modalidad: vehículos en las de incentivo. */
const PARTIDAS_VETADAS: Record<string, { prefijo: string; que: string }> = {
  "4105": { prefijo: "87", que: "vehículos" },
  "4106": { prefijo: "87", que: "vehículos" },
}

/** La modalidad más barata que sí cubre ese monto, para poder sugerir salida. */
function modalidadQueCubre(regimen: string, valor: number) {
  return MODALIDADES.filter((m) => m.regimen === regimen && m.limite)
    .sort((a, b) => (a.limite ?? 0) - (b.limite ?? 0))
    .find((m) => (m.limite ?? 0) >= valor)
}

/** Aduana de frontera (F) o zona franca (Z): el país de procedencia se asigna solo. */
export function esAduanaFronteriza(codAduana: string): boolean {
  const tipo = tipoDeAduana(codAduana)
  return tipo === "F" || tipo === "Z"
}

export function tipoDeAduana(codAduana: string): AduanaTipo | undefined {
  return ADUANAS_DESPACHO.find((a) => a.cod === codAduana)?.tipo
}

// El orden importa: define el recorrido del botón "siguiente pendiente".
export const CAMPOS: CampoSpec[] = [
  // ── Datos generales ───────────────────────────────────────────────────────
  {
    id: "general.tipoUsuario",
    seccion: "general",
    label: "¿Quién importa y para qué?",
    tecnico: "Modalidad del declarante",
    ayuda: "Define hasta qué monto podés importar y qué documentos vas a tener que adjuntar.",
    requerido: () => true,
    completo: ({ form }) => texto(form.general.tipoUsuario),
  },
  {
    id: "general.aduanaDespacho",
    seccion: "general",
    label: "¿Por qué aduana entra la mercadería?",
    tecnico: "Aduana de despacho",
    ayuda: "El punto de control por donde ingresa a Bolivia. Figura en la guía de transporte.",
    requerido: () => true,
    completo: ({ form }) => texto(form.general.aduanaDespacho),
  },
  {
    id: "general.regimen",
    seccion: "general",
    label: "¿Qué vas a hacer con la mercadería?",
    tecnico: "Destino / Régimen aduanero",
    ayuda: "Quedártela en el país, recibirla como encomienda, o traer tus cosas de mudanza.",
    requerido: () => true,
    completo: ({ form }) => texto(form.general.regimen),
  },
  {
    id: "general.modalidad",
    seccion: "general",
    label: "Tipo de trámite",
    tecnico: "Modalidad del régimen",
    ayuda: "Si no estás seguro, dejá el que viene sugerido según el valor de tu factura.",
    requerido: () => true,
    completo: ({ form }) => texto(form.general.modalidad),
    // El tope de valor es del trámite, no de la mercadería: se avisa acá porque
    // la salida es cambiar de modalidad, no bajar el monto de la factura.
    problema: (ctx) => {
      const mod = modalidadActual(ctx)
      const valor = ctx.form.transaccion.valorFobUsd
      if (!mod?.limite || valor <= mod.limite) return undefined
      const alternativa = modalidadQueCubre(mod.regimen, valor)
      return {
        nivel: "error",
        mensaje: alternativa
          ? `Este trámite llega hasta ${usd(mod.limite)} y tu mercadería vale ${usd(valor)}. Te corresponde “${alternativa.label}”.`
          : `Este trámite llega hasta ${usd(mod.limite)} y tu mercadería vale ${usd(valor)}. Con ese monto no podés usar el régimen simplificado: necesitás una importación general con agente despachante.`,
      }
    },
  },
  {
    id: "general.parteRecepcionSiNo",
    seccion: "general",
    label: "¿El depósito o el courier te dio un comprobante de recepción?",
    tecnico: "Parte de Recepción (Sí/No)",
    ayuda: "Es el papel que te entregan cuando la carga llega al depósito aduanero.",
    requerido: () => true,
    completo: () => true,
    // La contradicción vive acá y no en el número: el usuario respondió que no
    // lo tiene, y el trámite que eligió lo exige (doc §2).
    problema: ({ form }) => {
      if (form.general.parteRecepcionSiNo) return undefined
      if (!MODALIDADES_CON_PARTE_RECEPCION.includes(form.general.modalidad)) {
        return undefined
      }
      return {
        nivel: "error",
        mensaje:
          "Para este trámite el comprobante del depósito es obligatorio. Pedíselo al depósito o al courier: sin ese número la aduana no acepta la declaración.",
      }
    },
  },
  {
    id: "general.parteRecepcion",
    seccion: "general",
    label: "Número de ese comprobante",
    tecnico: "Nº de Parte de Recepción",
    ayuda: "Está arriba a la derecha del comprobante. Suele empezar con PR-.",
    // En 4101, 4107 y 9300 el comprobante es obligatorio aunque el usuario haya
    // respondido que no lo tiene: ahí el campo se pide igual (doc §2).
    requerido: ({ form }) =>
      form.general.parteRecepcionSiNo ||
      MODALIDADES_CON_PARTE_RECEPCION.includes(form.general.modalidad),
    completo: ({ form }) => texto(form.general.parteRecepcion),
  },

  // ── Importador ────────────────────────────────────────────────────────────
  {
    id: "importador.tipoDocumento",
    seccion: "importador",
    label: "¿Con qué documento te identificás?",
    tecnico: "Tipo de documento del importador",
    ayuda: "NIT si importás como empresa; cédula si es a título personal.",
    requerido: () => true,
    completo: ({ form }) => texto(form.importador.tipoDocumento),
  },
  {
    id: "importador.numeroDocumento",
    seccion: "importador",
    label: "Número de ese documento",
    tecnico: "Nº de documento",
    ayuda: "Escribilo sin puntos ni guiones.",
    requerido: () => true,
    completo: ({ form }) => texto(form.importador.numeroDocumento),
  },
  {
    id: "importador.nombreRazonSocial",
    seccion: "importador",
    label: "¿A nombre de quién llega la mercadería?",
    tecnico: "Nombre / Razón social",
    ayuda: "Tal como figura en tu NIT o cédula. Debe coincidir con el destinatario de la factura.",
    requerido: () => true,
    completo: ({ form }) => texto(form.importador.nombreRazonSocial),
  },
  {
    id: "importador.domicilio",
    seccion: "importador",
    label: "Dirección donde estás registrado",
    tecnico: "Domicilio legal",
    ayuda: "Calle, número y ciudad de tu NIT o cédula — no necesariamente la dirección de entrega.",
    requerido: () => true,
    completo: ({ form }) => texto(form.importador.domicilio),
  },
  {
    id: "importador.departamentoDestino",
    seccion: "importador",
    label: "¿A qué departamento va la mercadería?",
    tecnico: "Departamento de destino",
    requerido: () => true,
    completo: ({ form }) => texto(form.importador.departamentoDestino),
  },

  // ── Proveedor ─────────────────────────────────────────────────────────────
  {
    id: "proveedor.nombre",
    seccion: "proveedor",
    label: "¿A quién le compraste?",
    tecnico: "Razón social del proveedor",
    ayuda: "El nombre del vendedor, arriba de la factura.",
    requerido: () => true,
    completo: ({ form }) => texto(form.proveedor.nombre),
  },
  {
    id: "proveedor.pais",
    seccion: "proveedor",
    label: "¿En qué país está el proveedor?",
    tecnico: "País de origen",
    requerido: () => true,
    completo: ({ form }) => texto(form.proveedor.pais),
    problema: ({ form }) =>
      paisDesconocido(form.proveedor.pais, buscarPais(form.proveedor.pais)),
  },
  {
    id: "proveedor.direccion",
    seccion: "proveedor",
    label: "Dirección del proveedor",
    tecnico: "Dirección",
    ayuda: "Opcional. Si está en la factura, copiala tal cual.",
    requerido: () => false,
    completo: ({ form }) => texto(form.proveedor.direccion),
  },
  {
    id: "proveedor.rfc",
    seccion: "proveedor",
    label: "Identificación tributaria del proveedor",
    tecnico: "Tax ID / RFC",
    ayuda: "Opcional. Es el equivalente al NIT en el país del vendedor.",
    requerido: () => false,
    completo: ({ form }) => texto(form.proveedor.rfc),
  },
  {
    id: "proveedor.relacion",
    seccion: "proveedor",
    label: "¿Tenés relación societaria o familiar con el proveedor?",
    tecnico: "Tipo de relación",
    ayuda: "En una compra comercial normal la respuesta es “No”.",
    requerido: () => false,
    completo: ({ form }) => texto(form.proveedor.relacion),
  },

  // ── Lugares y transporte ──────────────────────────────────────────────────
  {
    id: "transporte.paisUltimaProcedencia",
    seccion: "transporte",
    label: "¿Desde qué país se despachó el envío?",
    tecnico: "País de última procedencia",
    ayuda: "No siempre es el país del proveedor: es desde dónde salió físicamente la carga. No puede ser Bolivia.",
    requerido: ({ form }) => !esAduanaFronteriza(form.general.aduanaDespacho),
    completo: ({ form }) => texto(form.transporte.paisUltimaProcedencia),
    problema: ({ form }) => {
      const valor = form.transporte.paisUltimaProcedencia
      const pais = buscarPais(valor)
      if (pais?.cod === "BO") {
        return {
          nivel: "error",
          mensaje:
            "No puede ser Bolivia: es el país desde donde salió la carga hacia acá, no el destino.",
        }
      }
      return paisDesconocido(valor, pais)
    },
  },
  {
    id: "transporte.medioHastaFrontera",
    seccion: "transporte",
    label: "¿Cómo llegó la mercadería hasta Bolivia?",
    tecnico: "Transporte hasta la frontera",
    ayuda: "Camión, avión o correo/courier. Lo indica la guía de transporte.",
    requerido: () => true,
    completo: ({ form }) => texto(form.transporte.medioHastaFrontera),
  },
  {
    id: "transporte.manifiesto",
    seccion: "transporte",
    label: "Número de la guía de transporte",
    tecnico: "Nº de manifiesto de carga",
    ayuda: "Buscalo en la guía aérea (AWB), la carta de porte o el comprobante que te dio el courier.",
    requerido: () => true,
    completo: ({ form }) => texto(form.transporte.manifiesto),
  },

  // ── Transacción y bultos ──────────────────────────────────────────────────
  {
    id: "transaccion.valorFobUsd",
    seccion: "transaccion",
    label: "Valor de la mercadería (USD)",
    tecnico: "Valor FOB total",
    ayuda: "Solo el precio de los productos, sin flete ni seguro: es el subtotal de la factura.",
    requerido: () => true,
    completo: ({ form }) => positivo(form.transaccion.valorFobUsd),
  },
  {
    id: "transaccion.fleteDeclaradoSiNo",
    seccion: "transaccion",
    label: "¿El precio ya incluía el envío hasta Bolivia?",
    tecnico: "Flete pagado hasta el lugar de importación",
    ayuda: "Mirá el Incoterm de la factura: CIF, CFR o DDP = sí; FOB o EXW = no.",
    requerido: () => false,
    completo: () => true,
  },
  {
    id: "transaccion.fleteUsd",
    seccion: "transaccion",
    label: "¿Cuánto pagaste de envío? (USD)",
    tecnico: "Flete declarado",
    requerido: ({ form }) => form.transaccion.fleteDeclaradoSiNo,
    completo: ({ form }) => positivo(form.transaccion.fleteUsd),
  },
  {
    id: "transaccion.seguroDeclaradoSiNo",
    seccion: "transaccion",
    label: "¿Contrataste un seguro para el envío?",
    tecnico: "Costo de seguro (Sí/No)",
    requerido: () => false,
    completo: () => true,
  },
  {
    id: "transaccion.seguroUsd",
    seccion: "transaccion",
    label: "¿Cuánto pagaste de seguro? (USD)",
    tecnico: "Seguro declarado",
    requerido: ({ form }) => form.transaccion.seguroDeclaradoSiNo,
    completo: ({ form }) => positivo(form.transaccion.seguroUsd),
  },
  {
    id: "transaccion.cantidadBultos",
    seccion: "transaccion",
    label: "¿Cuántos bultos, cajas o paquetes son?",
    tecnico: "Cantidad total de bultos",
    ayuda: "Contá los paquetes que llegan, no las unidades de producto.",
    requerido: () => true,
    completo: ({ form }) => positivo(form.transaccion.cantidadBultos),
  },
  {
    id: "transaccion.pesoBruto",
    seccion: "transaccion",
    label: "Peso total con embalaje (kg)",
    tecnico: "Peso bruto total",
    ayuda: "Lo que marca la balanza con caja incluida. Está en la guía de transporte.",
    requerido: () => true,
    completo: ({ form }) => positivo(form.transaccion.pesoBruto),
    // Courier (4107) y tráfico postal (9100) tienen tope de 40 kg: por encima
    // de eso el envío deja de entrar en el régimen simplificado.
    problema: (ctx) => {
      const mod = modalidadActual(ctx)
      const peso = ctx.form.transaccion.pesoBruto
      if (!mod?.pesoMaxKg || peso <= mod.pesoMaxKg) return undefined
      return {
        nivel: "error",
        mensaje: `Este trámite admite hasta ${mod.pesoMaxKg} kg y tu carga pesa ${peso} kg. Con ese peso hay que declararla por otra modalidad.`,
      }
    },
  },
  {
    id: "transaccion.pesoNeto",
    seccion: "transaccion",
    label: "Peso solo de la mercadería (kg)",
    tecnico: "Peso neto total",
    ayuda: "Sin cajas ni embalaje. Siempre menor o igual al peso bruto.",
    requerido: () => true,
    completo: ({ form }) => positivo(form.transaccion.pesoNeto),
    problema: ({ form }) => {
      const { pesoNeto, pesoBruto } = form.transaccion
      if (!positivo(pesoNeto) || !positivo(pesoBruto)) return undefined
      if (pesoNeto <= pesoBruto) return undefined
      return {
        nivel: "error",
        mensaje: `No puede superar al peso con embalaje (${pesoBruto} kg). Si son iguales, poné el mismo número en los dos.`,
      }
    },
  },

  // ── Ítems ─────────────────────────────────────────────────────────────────
  {
    id: "items.subpartidas",
    seccion: "items",
    label: "Clasificación arancelaria de cada producto",
    tecnico: "Subpartida arancelaria",
    ayuda: "Sin subpartida no se puede calcular el impuesto de ese producto.",
    requerido: () => true,
    completo: ({ itemsSinSubpartida }) => itemsSinSubpartida === 0,
    // Las modalidades de incentivo (Ley 1391 y 1546) excluyen los vehículos:
    // se detecta por el capítulo del código arancelario.
    problema: (ctx) => {
      const veto = PARTIDAS_VETADAS[ctx.form.general.modalidad]
      if (!veto) return undefined
      const vetadas = (ctx.subpartidas ?? []).filter((c) =>
        c.replace(/\D/g, "").startsWith(veto.prefijo)
      )
      if (vetadas.length === 0) return undefined
      return {
        nivel: "error",
        mensaje: `Este trámite no admite ${veto.que}, y ${
          vetadas.length === 1
            ? `el producto con código ${vetadas[0]} lo es`
            : `hay ${vetadas.length} productos que lo son`
        }. Elegí otro tipo de trámite o declaralos aparte.`,
      }
    },
  },

  // ── Documentos soporte ────────────────────────────────────────────────────
  {
    id: "docsop.documentos",
    seccion: "docsop",
    label: "¿Qué documentos vas a adjuntar?",
    tecnico: "Documentos soporte",
    ayuda: "Marcá los papeles que tenés. Los vas a subir al presentar la declaración.",
    requerido: () => true,
    completo: ({ form }) => form.docsop.documentos.length > 0,
    // Doc §1.A: en menor cuantía y no presencial hay que acreditar el valor
    // declarado con alguno de los tres documentos que sirven para eso.
    problema: ({ form }) => {
      if (form.general.tipoUsuario !== "noPresencial") return undefined
      const acreditan = DOCUMENTOS_SOPORTE.filter((d) => d.acreditaValor)
      if (form.docsop.documentos.some((c) => acreditan.some((d) => d.cod === c))) {
        return undefined
      }
      return {
        nivel: "error",
        mensaje: `Para este trámite hay que probar cuánto costó la mercadería. Marcá al menos uno: ${acreditan
          .map((d) => d.label.toLowerCase())
          .join(", ")}.`,
      }
    },
  },
  {
    id: "docsop.requiereInfAdicional",
    seccion: "docsop",
    label: "¿La aduana te pidió aclarar algo del envío?",
    tecnico: "Requiere información adicional",
    requerido: () => false,
    completo: () => true,
  },
  {
    id: "docsop.infAdicional",
    seccion: "docsop",
    label: "¿Qué hay que aclarar?",
    tecnico: "Información adicional",
    ayuda: "Escribilo tal como te lo pidieron.",
    requerido: ({ form }) => form.docsop.requiereInfAdicional,
    completo: ({ form }) => texto(form.docsop.infAdicional),
  },
]

export interface EstadoCampo {
  spec: CampoSpec
  requerido: boolean
  completo: boolean
  origen?: Origen
  /** Qué tan segura estaba la IA de este valor, cuando lo leyó de un papel. */
  confianza?: number
  /** Obligatorio y todavía vacío: es lo que se cuenta como "falta". */
  pendiente: boolean
  /** Lleno por una regla, pero nadie lo revisó todavía. */
  porConfirmar: boolean
  /**
   * Lo leyó la IA pero con poca certeza. No bloquea: es la diferencia entre
   * "revisá esta sección" y "revisá estos tres datos".
   */
  aRevisar: boolean
  /** Lleno pero contra una regla de la normativa. */
  problema?: Problema
  /** Ni vacío, ni sin confirmar, ni en conflicto con una regla. */
  resuelto: boolean
}

export interface ResumenSeccion {
  requeridos: number
  pendientes: number
  porConfirmar: number
  aRevisar: number
  errores: number
  completa: boolean
  /** No pide nada: solo muestra un resultado. No va al contador de progreso. */
  informativa: boolean
  /** El trámite elegido la vuelve innecesaria: no se muestra. */
  aplica: boolean
}

export interface ResumenDims {
  campos: EstadoCampo[]
  porSeccion: Record<SectionId, ResumenSeccion>
  requeridos: number
  completos: number
  pendientes: number
  porConfirmar: number
  /** Campos que violan una regla de la normativa: bloquean la validación. */
  errores: EstadoCampo[]
  advertencias: EstadoCampo[]
  /** Leídos con poca certeza: se sugiere revisarlos, pero no bloquean. */
  aRevisar: EstadoCampo[]
  porcentaje: number
  /** No se valida con campos vacíos, sin confirmar o contra una regla. */
  listaParaValidar: boolean
}

/**
 * Secciones que no piden nada: muestran el resultado del cálculo. Antes salían
 * en el índice siempre en verde y con badge "Completo", inflando el contador
 * con una sección que el usuario no puede completar ni dejar incompleta.
 */
export const SECCIONES_INFORMATIVAS: SectionId[] = ["liquidacion"]

/**
 * Preguntar solo lo que el trámite necesita. La respuesta a "¿quién importa y
 * para qué?" ya descarta bloques enteros: en una mudanza no hubo compra, así
 * que no hay proveedor que declarar ni impuestos de una factura que mostrar.
 */
export function seccionAplica(id: SectionId, ctx: DimsContexto): boolean {
  const menaje = ctx.form.general.tipoUsuario === "menajeDomestico"
  if (id === "proveedor") return !menaje
  return true
}

const seccionVacia = (id: SectionId): ResumenSeccion => ({
  requeridos: 0,
  pendientes: 0,
  porConfirmar: 0,
  aRevisar: 0,
  errores: 0,
  completa: true,
  informativa: SECCIONES_INFORMATIVAS.includes(id),
  aplica: true,
})

const SECCIONES_VACIAS = (ctx: DimsContexto): Record<SectionId, ResumenSeccion> =>
  Object.fromEntries(
    (
      [
        "general",
        "importador",
        "proveedor",
        "transporte",
        "transaccion",
        "items",
        "docsop",
        "liquidacion",
      ] as SectionId[]
    ).map((id) => [id, { ...seccionVacia(id), aplica: seccionAplica(id, ctx) }])
  ) as Record<SectionId, ResumenSeccion>

/** Evalúa el formulario completo: es lo único que la vista necesita llamar. */
export function evaluarDims(ctx: DimsContexto): ResumenDims {
  const campos: EstadoCampo[] = CAMPOS.map((spec) => {
    // Una sección que el trámite no necesita no deja campos obligatorios
    // sueltos: si no, quedarían pendientes invisibles, imposibles de completar.
    const aplica = seccionAplica(spec.seccion, ctx)
    const requerido = aplica && spec.requerido(ctx)
    const completo = spec.completo(ctx)
    const origen = ctx.origenes?.[spec.id]
    const confianza = ctx.confianzas?.[spec.id]
    const pendiente = requerido && !completo
    const porConfirmar = requerido && completo && origen === "sugerido"
    // Una regla no se evalúa sobre un campo vacío: ahí el mensaje útil es
    // "falta", no "está mal".
    const problema = pendiente || !aplica ? undefined : spec.problema?.(ctx)
    return {
      spec,
      requerido,
      completo,
      origen,
      confianza,
      pendiente,
      porConfirmar,
      aRevisar:
        requerido &&
        completo &&
        origen === "documento" &&
        confianza !== undefined &&
        confianza < UMBRAL_CONFIANZA,
      problema,
      resuelto: completo && !porConfirmar && problema?.nivel !== "error",
    }
  })

  const porSeccion = SECCIONES_VACIAS(ctx)
  for (const c of campos) {
    if (!c.requerido) continue
    const s = porSeccion[c.spec.seccion]
    s.requeridos++
    if (c.pendiente) s.pendientes++
    if (c.porConfirmar) s.porConfirmar++
    if (c.aRevisar) s.aRevisar++
    if (c.problema?.nivel === "error") s.errores++
    if (!c.resuelto) s.completa = false
  }

  const requeridos = campos.filter((c) => c.requerido).length
  const pendientes = campos.filter((c) => c.pendiente).length
  const porConfirmar = campos.filter((c) => c.porConfirmar).length
  const errores = campos.filter((c) => c.problema?.nivel === "error")
  const advertencias = campos.filter((c) => c.problema?.nivel === "advertencia")
  const aRevisar = campos.filter((c) => c.aRevisar)
  // Un valor deducido por una regla todavía no cuenta: el progreso mide lo que
  // el usuario ya dio por bueno, no lo que hay escrito en el formulario.
  const completos = requeridos - pendientes - porConfirmar

  return {
    campos,
    porSeccion,
    requeridos,
    completos,
    pendientes,
    porConfirmar,
    errores,
    advertencias,
    aRevisar,
    porcentaje: requeridos === 0 ? 100 : Math.round((completos / requeridos) * 100),
    listaParaValidar:
      pendientes === 0 && porConfirmar === 0 && errores.length === 0,
  }
}

/** Acceso por id para que la vista pinte cada campo con su estado real. */
export function mapaDeCampos(
  resumen: ResumenDims
): Record<string, EstadoCampo> {
  return Object.fromEntries(resumen.campos.map((c) => [c.spec.id, c]))
}

/**
 * Próximo campo obligatorio sin resolver, empezando en `desdeSeccion` y dando
 * la vuelta al llegar al final: así el botón siempre avanza en vez de rebotar
 * contra el primer pendiente de la declaración. Primero los vacíos y después
 * los que solo falta confirmar, para no interrumpir con revisiones a alguien
 * que todavía está llenando.
 */
export function siguientePendiente(
  resumen: ResumenDims,
  ordenSecciones: SectionId[],
  desdeSeccion?: SectionId
): EstadoCampo | undefined {
  const pendientes = [
    ...resumen.campos.filter((c) => c.problema?.nivel === "error"),
    ...resumen.campos.filter((c) => c.pendiente),
    ...resumen.campos.filter((c) => c.porConfirmar),
    // Los de poca confianza van últimos: no bloquean nada, así que solo se
    // ofrecen cuando ya no queda nada que realmente falte.
    ...resumen.campos.filter((c) => c.aRevisar),
  ]
  if (pendientes.length === 0) return undefined

  const desde = desdeSeccion ? ordenSecciones.indexOf(desdeSeccion) : 0
  const posicion = (c: EstadoCampo) => ordenSecciones.indexOf(c.spec.seccion)

  return (
    pendientes.find((c) => posicion(c) >= Math.max(0, desde)) ?? pendientes[0]
  )
}
