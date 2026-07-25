"use client"

import * as React from "react"
import { RiExternalLinkLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { documentoUrl } from "@/lib/services/facturas"
import type { FacturaDocumento, FacturaDocumentoTipo } from "@/lib/types/dims"

export const DOC_TIPO_LABEL: Record<FacturaDocumentoTipo, string> = {
  factura: "Factura comercial",
  packingList: "Packing list",
  guiaTransporte: "Guía de transporte",
  otro: "Documento de respaldo",
}

/**
 * El documento tal como lo subió el usuario. Poder mirar el papel mientras se
 * revisan los datos extraídos es lo que convierte "confiá en la IA" en "mirá,
 * es este número": sin esto hay que abrir el PDF por fuera de la aplicación.
 */
export function VisorDocumentos({
  facturaId,
  documentos,
}: {
  facturaId: string
  documentos: FacturaDocumento[]
}) {
  const disponibles = documentos.filter((d) => documentoUrl(facturaId, d))
  const [activo, setActivo] = React.useState(0)

  if (disponibles.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-md border border-dashed border-border bg-surface-2 px-3 py-8 text-center text-[11px] text-muted-foreground"
        style={{ aspectRatio: "3/4" }}
      >
        No guardamos una copia de estos archivos
      </div>
    )
  }

  const doc = disponibles[Math.min(activo, disponibles.length - 1)]
  const url = documentoUrl(facturaId, doc)!
  const esImagen = doc.mimeType.startsWith("image/")

  return (
    <div>
      <div className="overflow-hidden rounded-md border bg-surface-2">
        {esImagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={doc.nombre}
            className="max-h-[420px] w-full object-contain"
          />
        ) : (
          <iframe
            src={url}
            title={doc.nombre}
            className="h-[420px] w-full border-0 bg-white"
          />
        )}
      </div>

      {disponibles.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {disponibles.map((d, i) => (
            <button
              key={d.id ?? d.nombre}
              type="button"
              onClick={() => setActivo(i)}
              className={cn(
                "max-w-full truncate rounded border px-2 py-1 text-[11px] transition-colors",
                i === activo
                  ? "border-primary bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-surface-2"
              )}
            >
              {DOC_TIPO_LABEL[d.tipo]}
            </button>
          ))}
        </div>
      ) : null}

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
      >
        <RiExternalLinkLine className="size-3" />
        Abrir en una pestaña aparte
      </a>
    </div>
  )
}
