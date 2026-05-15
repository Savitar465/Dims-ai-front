"use client"

import * as React from "react"
import {
  RiCheckLine,
  RiCheckboxCircleFill,
  RiDownload2Line,
  RiEyeLine,
  RiFileTextLine,
  RiInformationLine,
  RiPrinterLine,
  RiSendPlaneLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type FormatId = "xml" | "pdf" | "json" | "print"

const FORMATS: {
  id: FormatId
  label: string
  sub: string
  ext: string
  size: string
}[] = [
  { id: "xml", label: "XML oficial SUMA", sub: "Para presentación electrónica en la plataforma de Aduana", ext: ".xml", size: "24 KB" },
  { id: "pdf", label: "PDF formato oficial", sub: "Para impresión y respaldo físico, sello AN", ext: ".pdf", size: "180 KB" },
  { id: "json", label: "JSON estructurado", sub: "Para integración con ERP o sistemas propios", ext: ".json", size: "8 KB" },
  { id: "print", label: "Impresión amigable", sub: "Vista preparada para imprimir directamente", ext: "", size: "" },
]

const XML_PREVIEW = `<?xml version="1.0" encoding="UTF-8"?>
<DIMS xmlns="http://aduana.gob.bo/dims/v2">
  <Cabecera>
    <NumeroDIMS>DIMS-2026-04823</NumeroDIMS>
    <FechaPresentacion>2026-05-14</FechaPresentacion>
    <AduanaIngreso>030</AduanaIngreso>
    <Regimen>IM4</Regimen>
    <Modalidad>SIMPLIFICADA</Modalidad>
    <NIT>7234182013</NIT>
  </Cabecera>
  <Proveedor>
    <RazonSocial>Shenzhen Electronics Co., Ltd.</RazonSocial>
    <PaisOrigen>CN</PaisOrigen>
  </Proveedor>
  <Factura numero="INV-2026-04-1842" fecha="2026-04-22">
    <Moneda>USD</Moneda>
    <Incoterm>FOB</Incoterm>
    <ValorCIF>9225.00</ValorCIF>
  </Factura>
  <Liquidacion>
    <GA>692.50</GA>
    <IVA>1481.42</IVA>
    <TotalBOB>15022.16</TotalBOB>
  </Liquidacion>
</DIMS>`

const JSON_PREVIEW = `{
  "numero": "DIMS-2026-04823",
  "fecha": "2026-05-14",
  "importador": { "nit": "7234182013" },
  "proveedor": { "pais": "CN", "razon_social": "Shenzhen..." },
  "factura": { "numero": "INV-2026-04-1842", "cif": 9225.00 },
  "liquidacion": { "ga": 692.50, "iva": 1481.42, "total_bob": 15022.16 }
}`

export function ExportarView() {
  const [selected, setSelected] = React.useState<FormatId>("xml")
  const [email, setEmail] = React.useState("")
  const [sent, setSent] = React.useState(false)

  const send = () => {
    if (!email) return
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  const selectedFormat = FORMATS.find((f) => f.id === selected)!

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Formato
          </div>
          <div className="flex flex-col gap-2">
            {FORMATS.map((f) => {
              const active = f.id === selected
              const Icon = f.id === "print" ? RiPrinterLine : RiFileTextLine
              return (
                <Card
                  key={f.id}
                  onClick={() => setSelected(f.id)}
                  className={cn(
                    "!flex-row cursor-pointer items-center gap-3.5 p-3.5 transition-all",
                    active
                      ? "border-primary bg-primary-soft ring-2 ring-primary/30"
                      : "hover:bg-surface-2"
                  )}
                >
                  <div
                    className={cn(
                      "grid size-[38px] shrink-0 place-items-center rounded-[10px]",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-foreground/75"
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold">{f.label}</div>
                    <div className="mt-0.5 text-xs text-foreground/75">
                      {f.sub}
                    </div>
                  </div>
                  {f.ext ? (
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-[11.5px] text-muted-foreground">
                        {f.ext}
                      </div>
                      {f.size ? (
                        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {f.size}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              )
            })}
          </div>

          <Separator className="my-5" />

          <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Enviar por correo
          </div>
          <Card className="p-5">
            <CardContent className="!p-0">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[200px] flex-1">
                  <div className="mb-1 text-xs text-foreground/75">
                    Destinatario
                  </div>
                  <Input
                    type="email"
                    placeholder="agente@despachante.bo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button onClick={send}>
                  {sent ? (
                    <>
                      <RiCheckLine /> Enviado
                    </>
                  ) : (
                    <>
                      <RiSendPlaneLine /> Enviar
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                <RiInformationLine className="size-3" /> Se enviará el archivo{" "}
                {selectedFormat.label} adjunto.
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Vista previa
          </div>
          <Card className="p-5 lg:sticky lg:top-20">
            <CardContent className="!p-0">
              {selected === "xml" ? (
                <pre className="m-0 max-h-[380px] overflow-auto rounded-md bg-surface-2 p-3.5 font-mono text-[11.5px] leading-[1.55]">
                  {XML_PREVIEW}
                </pre>
              ) : null}
              {selected === "json" ? (
                <pre className="m-0 max-h-[380px] overflow-auto rounded-md bg-surface-2 p-3.5 font-mono text-[11.5px] leading-[1.55]">
                  {JSON_PREVIEW}
                </pre>
              ) : null}
              {selected === "pdf" ? (
                <div>
                  <div
                    className="grid place-items-center rounded-md border border-dashed border-border bg-[repeating-linear-gradient(135deg,var(--surface-2)_0_10px,color-mix(in_oklch,var(--surface-2)_60%,var(--background))_10px_20px)] font-mono text-[11px] text-muted-foreground"
                    style={{ aspectRatio: "3/4" }}
                  >
                    DIMS-2026-04823.pdf · 4 páginas
                  </div>
                  <div className="mt-3 flex justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <RiEyeLine /> Ver completo
                    </Button>
                    <Button variant="outline" size="sm">
                      <RiPrinterLine /> Imprimir
                    </Button>
                  </div>
                </div>
              ) : null}
              {selected === "print" ? (
                <div className="py-5 text-center">
                  <RiPrinterLine className="mx-auto mb-3 size-9 text-muted-foreground" />
                  <div className="mb-1 font-medium">
                    Vista de impresión preparada
                  </div>
                  <div className="mb-4 text-xs text-muted-foreground">
                    Formato A4 · 4 páginas · Optimizado para impresora láser
                  </div>
                  <Button>
                    <RiPrinterLine /> Imprimir ahora
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3.5 rounded-xl border border-success/25 bg-success-soft px-5 py-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-success text-white">
          <RiCheckboxCircleFill className="size-[18px]" />
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="text-[13.5px] font-semibold">
            Tu DIMS está lista para presentar
          </div>
          <div className="mt-0.5 text-[12.5px] text-foreground/75">
            Una vez descargada o enviada, súbela en <strong>SUMA</strong>{" "}
            (suma.aduana.gob.bo) para iniciar el despacho.
          </div>
        </div>
        <Button size="lg">
          <RiDownload2Line />
          Descargar {selectedFormat.ext}
        </Button>
      </div>
    </>
  )
}
