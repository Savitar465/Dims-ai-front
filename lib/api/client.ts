// Central HTTP client for the DIMS AI backend.
// Base URL is the backend route described in openapi.json. Defaults to the
// local backend co-located on port 3001 (`localhost:3001/api`); override with
// NEXT_PUBLIC_API_URL when pointing at a remote environment.

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "")

export class ApiError extends Error {
  status: number
  code?: string
  /**
   * Contenido variable según el `code`: los errores de validación mandan un
   * `string[]`, y `extraccion_fallida` manda un objeto con el detalle por
   * documento. Se deja sin tipar acá y se estrecha en quien conoce el código
   * (ver `esExtraccionFallida` en lib/services/facturas.ts).
   */
  details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

type Query = Record<string, string | number | boolean | null | undefined>

export function buildQuery(query?: Query): string {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON body — serialized automatically. Use `rawBody` for FormData/binary. */
  body?: unknown
  rawBody?: BodyInit
  query?: Query
}

function authHeaders(): Record<string, string> {
  // Server-side bearer token for machine-to-machine calls. The browser relies
  // on cookies/session; wire a real auth source here when available.
  const token = process.env.API_BEARER_TOKEN
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, rawBody, query, headers, ...rest } = options
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...authHeaders(),
    ...(headers as Record<string, string>),
  }

  let finalBody: BodyInit | undefined
  if (rawBody !== undefined) {
    finalBody = rawBody
  } else if (body !== undefined) {
    finalBody = JSON.stringify(body)
    finalHeaders["Content-Type"] = "application/json"
  }

  const res = await fetch(url, {
    cache: "no-store",
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  })

  if (res.status === 204) return undefined as T

  const isJson = res.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    const err = (payload && typeof payload === "object" ? payload.error : null) ?? {}
    throw new ApiError(
      res.status,
      err.message || `Request to ${path} failed with ${res.status}`,
      err.code,
      err.details,
    )
  }

  return payload as T
}
