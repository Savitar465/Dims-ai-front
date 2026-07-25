// Shared mock data — Bolivia Aduana context. Backend should expose these
// through service endpoints; for the prototype we read from this in-memory store.

export type LineaId = "blanca" | "negra" | "electronica"

export interface Linea {
  id: LineaId
  label: string
  color: string
}

export const LINEAS: Linea[] = [
  { id: "blanca", label: "Línea Blanca", color: "oklch(0.65 0.07 220)" },
  { id: "negra", label: "Línea Negra", color: "oklch(0.40 0.04 240)" },
  { id: "electronica", label: "Electrónica", color: "oklch(0.55 0.12 295)" },
]

export interface Subpartida {
  code: string
  desc: string
  linea: LineaId
  arancel: number
  iva: number
  ice: number
  gravamen: string
}

export const SUBPARTIDAS: Subpartida[] = [
  { code: "8418.10.00.00", desc: "Combinaciones de refrigerador y congelador con puertas exteriores separadas", linea: "blanca", arancel: 10, iva: 14.94, ice: 0, gravamen: "GA 10%" },
  { code: "8418.21.00.00", desc: "Refrigeradores de uso doméstico, de compresión", linea: "blanca", arancel: 10, iva: 14.94, ice: 0, gravamen: "GA 10%" },
  { code: "8418.29.00.00", desc: "Los demás refrigeradores de uso doméstico", linea: "blanca", arancel: 10, iva: 14.94, ice: 0, gravamen: "GA 10%" },
  { code: "8471.30.00.00", desc: "Máquinas automáticas para tratamiento o procesamiento de datos, portátiles, peso ≤ 10 kg", linea: "electronica", arancel: 5, iva: 14.94, ice: 0, gravamen: "GA 5%" },
  { code: "8471.41.00.00", desc: "Las demás máquinas automáticas para tratamiento de datos que incluyan unidad central de proceso", linea: "electronica", arancel: 5, iva: 14.94, ice: 0, gravamen: "GA 5%" },
  { code: "8528.72.00.00", desc: "Aparatos receptores de televisión en colores, con pantalla", linea: "negra", arancel: 15, iva: 14.94, ice: 18, gravamen: "GA 15% + ICE 18%" },
  { code: "8517.13.00.00", desc: "Teléfonos inteligentes (smartphones)", linea: "electronica", arancel: 5, iva: 14.94, ice: 0, gravamen: "GA 5%" },
  { code: "8517.62.00.00", desc: "Aparatos para la recepción, conversión y transmisión de voz, imágenes y datos", linea: "electronica", arancel: 10, iva: 14.94, ice: 0, gravamen: "GA 10%" },
  { code: "8516.50.00.00", desc: "Hornos de microondas", linea: "blanca", arancel: 15, iva: 14.94, ice: 0, gravamen: "GA 15%" },
  { code: "8450.11.00.00", desc: "Máquinas para lavar ropa de uso doméstico, totalmente automáticas", linea: "blanca", arancel: 10, iva: 14.94, ice: 0, gravamen: "GA 10%" },
  { code: "8508.11.00.00", desc: "Aspiradoras con motor eléctrico incorporado, ≤ 1500 W", linea: "blanca", arancel: 15, iva: 14.94, ice: 0, gravamen: "GA 15%" },
  { code: "8527.13.00.00", desc: "Equipos combinados de radiodifusión con grabador o reproductor de sonido", linea: "negra", arancel: 15, iva: 14.94, ice: 18, gravamen: "GA 15% + ICE 18%" },
  { code: "9504.50.00.00", desc: "Videoconsolas y máquinas de videojuego", linea: "electronica", arancel: 10, iva: 14.94, ice: 18, gravamen: "GA 10% + ICE 18%" },
  { code: "8543.70.90.00", desc: "Las demás máquinas y aparatos eléctricos con función propia", linea: "electronica", arancel: 15, iva: 14.94, ice: 0, gravamen: "GA 15%" },
]

// ── Catálogos del formulario DIMS ────────────────────────────────────────────
// El `cod` es el valor que viaja al backend; el `label` es lo que lee el
// usuario. El `tipo` de aduana condiciona País de Última Procedencia y el
// medio de transporte hasta la frontera.

export type AduanaTipo = "A" | "I" | "P" | "F" | "Z"

export interface AduanaDespacho {
  cod: string
  label: string
  tipo: AduanaTipo
  grupo: string
  /**
   * País limítrofe del paso. En aduanas de frontera (F) y zonas francas (Z) el
   * País de Última Procedencia no se elige: se asigna con este valor (doc §3).
   */
  paisLimitrofe?: string
}

export const ADUANAS_DESPACHO: AduanaDespacho[] = [
  { cod: "IQUIQUE-PISIGA", label: "Pisiga (frontera con Chile, vía Iquique)", tipo: "F", grupo: "Pasos de frontera", paisLimitrofe: "Chile" },
  { cod: "ARICA-TAMBO QUEMADO", label: "Tambo Quemado (frontera con Chile, vía Arica)", tipo: "F", grupo: "Pasos de frontera", paisLimitrofe: "Chile" },
  { cod: "YACUIBA", label: "Yacuiba (frontera con Argentina)", tipo: "F", grupo: "Pasos de frontera", paisLimitrofe: "Argentina" },
  { cod: "VILLAZÓN", label: "Villazón (frontera con Argentina)", tipo: "F", grupo: "Pasos de frontera", paisLimitrofe: "Argentina" },
  { cod: "EL ALTO", label: "Aeropuerto El Alto (La Paz)", tipo: "A", grupo: "Aeropuertos" },
  { cod: "VIRU VIRU", label: "Aeropuerto Viru Viru (Santa Cruz)", tipo: "A", grupo: "Aeropuertos" },
  { cod: "INTERIOR LA PAZ", label: "Aduana Interior La Paz", tipo: "I", grupo: "Aduanas interiores" },
  { cod: "INTERIOR SANTA CRUZ", label: "Aduana Interior Santa Cruz", tipo: "I", grupo: "Aduanas interiores" },
  { cod: "ZOFRACOBIJA", label: "Zona Franca Cobija", tipo: "Z", grupo: "Zonas francas", paisLimitrofe: "Brasil" },
  { cod: "POSTAL LA PAZ", label: "Aduana Postal La Paz (correo)", tipo: "P", grupo: "Postal" },
]

/** Tipo de usuario / modalidad del declarante (`tipoUsuarioDims`). */
export type TipoUsuario = "general" | "noPresencial" | "menajeDomestico"

export const TIPOS_USUARIO: {
  id: TipoUsuario
  label: string
  detalle: string
}[] = [
  { id: "general", label: "Compré mercadería para vender o usar", detalle: "Importación general" },
  { id: "noPresencial", label: "Es una compra chica o una encomienda", detalle: "No presencial / Menor cuantía" },
  { id: "menajeDomestico", label: "Traigo mi mudanza al volver a Bolivia", detalle: "Menaje doméstico" },
]

// El `cod` es el que viaja al backend y el que devuelve la DIMS: código pelado
// ("41", "4101", "4"). Antes el catálogo mezclaba código y nombre en el mismo
// string y ningún valor del backend matcheaba una opción del selector.
export const REGIMENES: { cod: string; label: string; detalle: string }[] = [
  { cod: "41", label: "Me quedo con la mercadería en Bolivia", detalle: "Régimen 41 · Importación a consumo" },
  { cod: "91", label: "Llegó por correo o courier", detalle: "Régimen 91 · Tráfico postal" },
  { cod: "93", label: "Son mis cosas personales de mudanza", detalle: "Régimen 93 · Menaje doméstico" },
]

/** Modalidades del régimen (`modReg.cod`) con su límite de valor FOB. */
export const MODALIDADES: {
  cod: string
  /** Régimen al que pertenece: filtra las opciones que se le muestran. */
  regimen: string
  label: string
  detalle: string
  limite?: number
  pesoMaxKg?: number
}[] = [
  { cod: "4101", regimen: "41", label: "Compra común de bajo valor", detalle: "4101 · Menor Cuantía General", limite: 2000 },
  { cod: "4103", regimen: "41", label: "Compra de bajo valor (régimen especial)", detalle: "4103 · Menor Cuantía Especial", limite: 3500 },
  { cod: "4105", regimen: "41", label: "Maquinaria o bienes de capital", detalle: "4105 · Incentivos Ley 1391", limite: 35000 },
  { cod: "4106", regimen: "41", label: "Bienes con incentivo Ley 1546", detalle: "4106 · Incentivos Ley 1546" },
  { cod: "4107", regimen: "41", label: "Encomienda courier o carga en abandono", detalle: "4107 · Abandono / Courier", limite: 1000, pesoMaxKg: 40 },
  { cod: "9100", regimen: "91", label: "Paquete llegado por correo", detalle: "9100 · Tráfico Postal (Ingreso)", pesoMaxKg: 40 },
  { cod: "9200", regimen: "91", label: "Envío por empresa de servicio expreso", detalle: "9200 · Servicio Expreso (Courier)" },
  { cod: "9300", regimen: "93", label: "Mudanza / menaje doméstico", detalle: "9300 · Menaje Doméstico", limite: 35000 },
]

export const TIPOS_DOCUMENTO: { cod: string; label: string; detalle: string }[] = [
  { cod: "NIT", label: "NIT — importo como empresa o con actividad registrada", detalle: "NIT" },
  { cod: "CI - Cédula de Identidad", label: "Cédula de identidad — importo a título personal", detalle: "CI" },
  { cod: "CEX - Carnet de Extranjería", label: "Carnet de extranjería", detalle: "CEX" },
]

export const DEPARTAMENTOS = [
  "La Paz",
  "Santa Cruz",
  "Cochabamba",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando",
]

export const MEDIOS_TRANSPORTE: { cod: string; label: string; detalle: string }[] = [
  { cod: "3", label: "En camión o bus (por carretera)", detalle: "3 · Carretero" },
  { cod: "4", label: "En avión (carga aérea)", detalle: "4 · Aéreo" },
  { cod: "5", label: "Por correo o courier (DHL, FedEx, etc.)", detalle: "5 · Postal o Courier" },
  { cod: "1", label: "Por barco (hasta el puerto)", detalle: "1 · Marítimo" },
]

/**
 * Documentos soporte que se adjuntan a la declaración. `acreditaValor` marca
 * los que sirven para probar cuánto costó la mercadería: en menor cuantía y no
 * presencial hay que presentar al menos uno de ellos (doc §1.A).
 */
export interface DocumentoSoporte {
  cod: string
  label: string
  ayuda: string
  acreditaValor: boolean
}

export const DOCUMENTOS_SOPORTE: DocumentoSoporte[] = [
  {
    cod: "CM-003",
    label: "Factura comercial del proveedor",
    ayuda: "La que te dio el vendedor del exterior.",
    acreditaValor: true,
  },
  {
    cod: "CM-004",
    label: "Factura de compra local",
    ayuda: "Si le compraste a alguien que ya importó la mercadería a Bolivia.",
    acreditaValor: true,
  },
  {
    cod: "CM-007",
    label: "Declaración jurada del valor",
    ayuda: "Sirve cuando no tenés factura: declarás vos cuánto vale.",
    acreditaValor: true,
  },
  {
    cod: "OT-001",
    label: "Comprobante de recepción del depósito",
    ayuda: "El papel que te dio el depósito aduanero o el courier.",
    acreditaValor: false,
  },
]

export interface ProductoFavorito {
  id: string
  nombre: string
  codigo: string
  linea: LineaId
  ultimoUso: string
  vecesImportado: number
}

export const PRODUCTOS_FAV: ProductoFavorito[] = [
  { id: "p1", nombre: "Laptop Lenovo IdeaPad", codigo: "8471.30.00.00", linea: "electronica", ultimoUso: "hace 3 días", vecesImportado: 24 },
  { id: "p2", nombre: "Refrigerador Samsung 2 puertas", codigo: "8418.10.00.00", linea: "blanca", ultimoUso: "hace 1 semana", vecesImportado: 12 },
  { id: "p3", nombre: 'TV LED 55"', codigo: "8528.72.00.00", linea: "negra", ultimoUso: "hace 2 semanas", vecesImportado: 18 },
  { id: "p4", nombre: "Smartphone gama media", codigo: "8517.13.00.00", linea: "electronica", ultimoUso: "ayer", vecesImportado: 47 },
  { id: "p5", nombre: "Lavadora 12 kg", codigo: "8450.11.00.00", linea: "blanca", ultimoUso: "hace 1 mes", vecesImportado: 6 },
]

export interface FacturaItem {
  id: string
  descripcion: string
  cantidad: number
  unidad: string
  precioUnit: number
  subtotal: number
  subpartida: string | null
  confidence: number
  aiSuggested: boolean
  clasificada: boolean
  razon?: string
}

export interface FacturaEjemplo {
  proveedor: {
    nombre: string
    direccion: string
    pais: string
    rfc: string
    confidence: number
  }
  factura: {
    numero: string
    fecha: string
    moneda: string
    incoterm: string
    puertoEmbarque: string
    confidence: number
  }
  items: FacturaItem[]
  totales: {
    subtotal: number
    flete: number
    seguro: number
    cif: number
  }
}

export const FACTURA_EJEMPLO: FacturaEjemplo = {
  proveedor: {
    nombre: "Shenzhen Electronics Co., Ltd.",
    direccion: "Building 5, Bao'an District, Shenzhen, China",
    pais: "China",
    rfc: "CN-91440300MA5...",
    confidence: 96,
  },
  factura: {
    numero: "INV-2026-04-1842",
    fecha: "2026-04-22",
    moneda: "USD",
    incoterm: "FOB",
    puertoEmbarque: "Shenzhen",
    confidence: 91,
  },
  items: [
    { id: "i1", descripcion: 'Laptop 14" Intel Core i5, 8GB RAM, 512GB SSD', cantidad: 20, unidad: "UND", precioUnit: 385.0, subtotal: 7700.0, subpartida: "8471.30.00.00", confidence: 94, aiSuggested: true, clasificada: true, razon: "Computadora portátil con CPU y memoria integradas." },
    { id: "i2", descripcion: "Mouse inalámbrico óptico USB", cantidad: 100, unidad: "UND", precioUnit: 4.5, subtotal: 450.0, subpartida: "8471.60.00.00", confidence: 78, aiSuggested: true, clasificada: true, razon: "Dispositivo de entrada periférico para computadora." },
    { id: "i3", descripcion: "Cargador USB-C 65W con cable", cantidad: 50, unidad: "UND", precioUnit: 8.2, subtotal: 410.0, subpartida: "8504.40.00.00", confidence: 62, aiSuggested: true, clasificada: true, razon: "Convertidor estático / fuente de alimentación." },
    { id: "i4", descripcion: 'Funda protectora para laptop 14"', cantidad: 30, unidad: "UND", precioUnit: 3.1, subtotal: 93.0, subpartida: null, confidence: 0, aiSuggested: false, clasificada: true, razon: "Accesorio textil/plástico — no encaja en la sección de máquinas." },
  ],
  totales: { subtotal: 8653.0, flete: 480.0, seguro: 92.0, cif: 9225.0 },
}

export interface GlosarioTerm {
  term: string
  def: string
}

export const GLOSARIO: GlosarioTerm[] = [
  { term: "DIMS", def: "Declaración de Importación de Mercancías Simplificada. Formulario oficial de la Aduana Nacional de Bolivia para importaciones bajo régimen simplificado." },
  { term: "CIF", def: "Costo, Seguro y Flete. Valor de la mercancía incluyendo transporte y seguro hasta el puerto de destino." },
  { term: "FOB", def: "Free On Board. Valor de la mercancía puesta a bordo del transporte en el puerto de origen." },
  { term: "GA", def: "Gravamen Arancelario. Impuesto aplicado a la importación según la subpartida." },
  { term: "IVA", def: "Impuesto al Valor Agregado. En Bolivia, tasa efectiva sobre importaciones del 14.94%." },
  { term: "ICE", def: "Impuesto a los Consumos Específicos. Aplica a productos específicos como vehículos, bebidas, electrónica de lujo." },
  { term: "Subpartida arancelaria", def: "Código de 10 dígitos del Arancel de Importaciones que identifica la mercancía y su tratamiento tributario." },
  { term: "Incoterm", def: "Términos comerciales internacionales (FOB, CIF, EXW, etc.) que definen las responsabilidades del comprador y vendedor." },
  { term: "SUMA", def: "Sistema Único de Modernización Aduanera. Plataforma electrónica de la Aduana Nacional de Bolivia." },
  { term: "Régimen aduanero", def: "Qué se hace con la mercadería al entrar al país: quedársela (importación a consumo), recibirla por correo, o traerla como mudanza. Determina qué modalidades podés usar." },
  { term: "Modalidad", def: "Variante del régimen, con su propio tope de valor y de peso. Por ejemplo: Menor Cuantía General llega hasta USD 2.000." },
  { term: "Menor cuantía", def: "Importaciones de bajo valor que se declaran con la DIMS, sin agente despachante. El tope depende de la modalidad." },
  { term: "Menaje doméstico", def: "Las cosas de casa de quien vuelve a vivir a Bolivia después de residir en el exterior. Va por el régimen 93." },
  { term: "Aduana de despacho", def: "El punto de control por donde ingresa la mercadería. Si es un paso de frontera o una zona franca, la aduana asigna sola el país de procedencia." },
  { term: "País de última procedencia", def: "El país desde donde salió físicamente la carga hacia Bolivia. No siempre coincide con el país del proveedor, y nunca puede ser Bolivia." },
  { term: "Parte de Recepción", def: "Comprobante que emite el depósito aduanero o el courier cuando recibe la carga. En algunas modalidades es obligatorio." },
  { term: "Manifiesto de carga", def: "Documento con el que el transportista declara la carga que trae. Su número está en la guía aérea (AWB) o en la carta de porte." },
  { term: "Flete", def: "Lo que cuesta traer la mercadería hasta Bolivia. Si no lo declarás, la aduana lo estima con su tabla oficial y lo suma al CIF igual." },
  { term: "Bulto", def: "Cada caja, paquete o pieza que se transporta, no cada unidad de producto: diez celulares en una caja son un bulto." },
  { term: "Peso bruto", def: "El peso de la mercadería con su embalaje, tal como lo pesa el transportista." },
  { term: "Peso neto", def: "El peso de la mercadería sola, sin cajas ni embalaje. Siempre menor o igual al peso bruto." },
  { term: "Documentos soporte", def: "Los papeles que respaldan la declaración: factura, comprobante del depósito, guía de transporte. Cada uno tiene un código oficial (CM-003, OT-001…)." },
  { term: "Importador", def: "La persona o empresa a cuyo nombre llega la mercadería. Es quien responde ante la aduana por lo declarado." },
]

/**
 * Definición del glosario que corresponde a un nombre técnico de la DIMS.
 * Busca el término más largo contenido en el texto, para que "Valor FOB total"
 * caiga en FOB y "Peso bruto total" en Peso bruto y no en un prefijo genérico.
 */
export function buscarGlosario(tecnico?: string): GlosarioTerm | undefined {
  if (!tecnico) return undefined
  const texto = tecnico.toLowerCase()
  return [...GLOSARIO]
    .sort((a, b) => b.term.length - a.term.length)
    .find((g) => palabraSuelta(g.term).test(texto))
}

/**
 * El término tiene que aparecer como palabra, admitiendo el plural: si no,
 * "GA" matchea dentro de "legal" y "Domicilio legal" queda explicado como
 * Gravamen Arancelario.
 */
function palabraSuelta(term: string): RegExp {
  const escapado = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|[^\\p{L}])${escapado}s?($|[^\\p{L}])`, "u")
}
