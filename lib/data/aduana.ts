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
    { id: "i1", descripcion: 'Laptop 14" Intel Core i5, 8GB RAM, 512GB SSD', cantidad: 20, unidad: "UND", precioUnit: 385.0, subtotal: 7700.0, subpartida: "8471.30.00.00", confidence: 94, aiSuggested: true },
    { id: "i2", descripcion: "Mouse inalámbrico óptico USB", cantidad: 100, unidad: "UND", precioUnit: 4.5, subtotal: 450.0, subpartida: "8471.60.00.00", confidence: 78, aiSuggested: true },
    { id: "i3", descripcion: "Cargador USB-C 65W con cable", cantidad: 50, unidad: "UND", precioUnit: 8.2, subtotal: 410.0, subpartida: "8504.40.00.00", confidence: 62, aiSuggested: true },
    { id: "i4", descripcion: 'Funda protectora para laptop 14"', cantidad: 30, unidad: "UND", precioUnit: 3.1, subtotal: 93.0, subpartida: null, confidence: 0, aiSuggested: false },
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
]
