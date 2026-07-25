// Países en español con su código ISO 3166-1 alfa-2, que es lo que viaja a la
// aduana. Antes el país era un campo de texto libre: cualquier variante
// ("CHINA", "R.P. China", "Chna") viajaba tal cual a una declaración jurada.
//
// La lista se escribe compacta a propósito: es un catálogo, no lógica.

const CRUDO =
  "AF:Afganistán|AL:Albania|DE:Alemania|AD:Andorra|AO:Angola|AI:Anguila|AG:Antigua y Barbuda|" +
  "SA:Arabia Saudita|DZ:Argelia|AR:Argentina|AM:Armenia|AW:Aruba|AU:Australia|AT:Austria|" +
  "AZ:Azerbaiyán|BS:Bahamas|BD:Bangladés|BB:Barbados|BH:Baréin|BE:Bélgica|BZ:Belice|BJ:Benín|" +
  "BM:Bermudas|BY:Bielorrusia|BO:Bolivia|BA:Bosnia y Herzegovina|BW:Botsuana|BR:Brasil|" +
  "BN:Brunéi|BG:Bulgaria|BF:Burkina Faso|BI:Burundi|BT:Bután|CV:Cabo Verde|KH:Camboya|" +
  "CM:Camerún|CA:Canadá|QA:Catar|TD:Chad|CZ:Chequia|CL:Chile|CN:China|CY:Chipre|VA:Ciudad del Vaticano|" +
  "CO:Colombia|KM:Comoras|KP:Corea del Norte|KR:Corea del Sur|CI:Costa de Marfil|CR:Costa Rica|" +
  "HR:Croacia|CU:Cuba|CW:Curazao|DK:Dinamarca|DM:Dominica|EC:Ecuador|EG:Egipto|SV:El Salvador|" +
  "AE:Emiratos Árabes Unidos|ER:Eritrea|SK:Eslovaquia|SI:Eslovenia|ES:España|US:Estados Unidos|" +
  "EE:Estonia|SZ:Esuatini|ET:Etiopía|PH:Filipinas|FI:Finlandia|FJ:Fiyi|FR:Francia|GA:Gabón|" +
  "GM:Gambia|GE:Georgia|GH:Ghana|GI:Gibraltar|GD:Granada|GR:Grecia|GL:Groenlandia|GP:Guadalupe|" +
  "GU:Guam|GT:Guatemala|GF:Guayana Francesa|GG:Guernsey|GN:Guinea|GQ:Guinea Ecuatorial|" +
  "GW:Guinea-Bisáu|GY:Guyana|HT:Haití|HN:Honduras|HK:Hong Kong|HU:Hungría|IN:India|ID:Indonesia|" +
  "IQ:Irak|IR:Irán|IE:Irlanda|IS:Islandia|KY:Islas Caimán|IL:Israel|IT:Italia|JM:Jamaica|" +
  "JP:Japón|JO:Jordania|KZ:Kazajistán|KE:Kenia|KG:Kirguistán|KI:Kiribati|KW:Kuwait|LA:Laos|" +
  "LS:Lesoto|LV:Letonia|LB:Líbano|LR:Liberia|LY:Libia|LI:Liechtenstein|LT:Lituania|LU:Luxemburgo|" +
  "MO:Macao|MK:Macedonia del Norte|MG:Madagascar|MY:Malasia|MW:Malaui|MV:Maldivas|ML:Malí|" +
  "MT:Malta|MA:Marruecos|MQ:Martinica|MU:Mauricio|MR:Mauritania|MX:México|FM:Micronesia|" +
  "MD:Moldavia|MC:Mónaco|MN:Mongolia|ME:Montenegro|MZ:Mozambique|MM:Birmania|NA:Namibia|" +
  "NR:Nauru|NP:Nepal|NI:Nicaragua|NE:Níger|NG:Nigeria|NO:Noruega|NC:Nueva Caledonia|" +
  "NZ:Nueva Zelanda|OM:Omán|NL:Países Bajos|PK:Pakistán|PW:Palaos|PS:Palestina|PA:Panamá|" +
  "PG:Papúa Nueva Guinea|PY:Paraguay|PE:Perú|PF:Polinesia Francesa|PL:Polonia|PT:Portugal|" +
  "PR:Puerto Rico|GB:Reino Unido|CF:República Centroafricana|CG:República del Congo|" +
  "CD:República Democrática del Congo|DO:República Dominicana|RE:Reunión|RW:Ruanda|RO:Rumanía|" +
  "RU:Rusia|WS:Samoa|KN:San Cristóbal y Nieves|SM:San Marino|VC:San Vicente y las Granadinas|" +
  "LC:Santa Lucía|ST:Santo Tomé y Príncipe|SN:Senegal|RS:Serbia|SC:Seychelles|SL:Sierra Leona|" +
  "SG:Singapur|SX:San Martín|SY:Siria|SO:Somalia|LK:Sri Lanka|ZA:Sudáfrica|SD:Sudán|" +
  "SS:Sudán del Sur|SE:Suecia|CH:Suiza|SR:Surinam|TH:Tailandia|TW:Taiwán|TZ:Tanzania|" +
  "TJ:Tayikistán|TL:Timor Oriental|TG:Togo|TO:Tonga|TT:Trinidad y Tobago|TN:Túnez|TM:Turkmenistán|" +
  "TR:Turquía|TV:Tuvalu|UA:Ucrania|UG:Uganda|UY:Uruguay|UZ:Uzbekistán|VU:Vanuatu|VE:Venezuela|" +
  "VN:Vietnam|YE:Yemen|DJ:Yibuti|ZM:Zambia|ZW:Zimbabue"

export interface Pais {
  cod: string
  nombre: string
}

export const PAISES: Pais[] = CRUDO.split("|").map((entrada) => {
  const [cod, nombre] = entrada.split(":")
  return { cod, nombre }
})

/** Nombres alternativos frecuentes en facturas, para no marcarlos como error. */
const ALIAS: Record<string, string> = {
  usa: "US",
  "u.s.a.": "US",
  "estados unidos de america": "US",
  eeuu: "US",
  "ee.uu.": "US",
  "united states": "US",
  china: "CN",
  "p.r. china": "CN",
  "republica popular china": "CN",
  "prc": "CN",
  "korea": "KR",
  "south korea": "KR",
  "corea": "KR",
  "reino unido de gran bretana": "GB",
  uk: "GB",
  "great britain": "GB",
  inglaterra: "GB",
  holanda: "NL",
  "paises bajos": "NL",
  japan: "JP",
  brasil: "BR",
  brazil: "BR",
  espana: "ES",
  spain: "ES",
  germany: "DE",
  alemania: "DE",
  italy: "IT",
  france: "FR",
  india: "IN",
  taiwan: "TW",
  "taiwan, china": "TW",
  turquia: "TR",
  turkey: "TR",
  mexico: "MX",
  peru: "PE",
  chile: "CL",
  argentina: "AR",
  bolivia: "BO",
}

function normalizar(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

/**
 * Encuentra el país que el usuario quiso escribir, tolerando mayúsculas,
 * acentos y los nombres que suelen venir en las facturas ("USA", "P.R. China").
 * Devuelve undefined si no hay una correspondencia clara: ahí conviene avisar
 * en vez de adivinar, porque el valor viaja a una declaración jurada.
 */
export function buscarPais(valor: string): Pais | undefined {
  const limpio = normalizar(valor)
  if (!limpio) return undefined

  const porNombre = PAISES.find((p) => normalizar(p.nombre) === limpio)
  if (porNombre) return porNombre

  const codAlias = ALIAS[limpio]
  if (codAlias) return PAISES.find((p) => p.cod === codAlias)

  // Un código ISO suelto ("CN") también es una respuesta válida.
  if (limpio.length === 2) {
    return PAISES.find((p) => p.cod.toLowerCase() === limpio)
  }
  return undefined
}
