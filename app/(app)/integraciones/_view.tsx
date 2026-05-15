"use client"

import * as React from "react"
import {
  RiAddLine,
  RiBox3Line,
  RiBuildingLine,
  RiCheckLine,
  RiDatabase2Line,
  RiEyeLine,
  RiFileCopyLine,
  RiGlobalLine,
  RiRefreshLine,
  RiSettings3Line,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Status = "connected" | "disconnected" | "beta"

const INTEGRATIONS: {
  id: string
  name: string
  desc: string
  status: Status
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}[] = [
  { id: "suma", name: "SUMA Aduana Nacional", desc: "Plataforma oficial para presentación de DIMS", status: "connected", icon: RiBuildingLine, badge: "Oficial" },
  { id: "erp", name: "ERP Propio", desc: "Sincroniza catálogo de productos y proveedores", status: "connected", icon: RiDatabase2Line },
  { id: "inv", name: "Sistema de Inventario", desc: "Importa productos importados al inventario", status: "disconnected", icon: RiBox3Line },
  { id: "cont", name: "Software Contable", desc: "Asienta operaciones automáticamente", status: "disconnected", icon: RiBuildingLine },
  { id: "banking", name: "Banca electrónica", desc: "Pre-llena planillas de pago a Aduana", status: "beta", icon: RiGlobalLine },
]

const WEBHOOKS = [
  { url: "https://erp.miempresa.bo/webhooks/dims", events: "dims.created, dims.approved" },
  { url: "https://contabilidad.local/api/import", events: "dims.approved" },
]

const HISTORY = [
  { time: "14 may, 09:42", target: "ERP Propio", count: "12 productos sincronizados", ok: true },
  { time: "14 may, 09:35", target: "SUMA", count: "DIMS-2026-04812 confirmada", ok: true },
  { time: "13 may, 18:21", target: "ERP Propio", count: "3 proveedores actualizados", ok: true },
  { time: "13 may, 11:08", target: "Banca electrónica", count: "Error: token expirado", ok: false },
]

export function IntegracionesView() {
  return (
    <Tabs defaultValue="conexiones">
      <TabsList>
        <TabsTrigger value="conexiones">Conexiones</TabsTrigger>
        <TabsTrigger value="api">API &amp; Webhooks</TabsTrigger>
        <TabsTrigger value="historico">Historial</TabsTrigger>
      </TabsList>

      <TabsContent value="conexiones" className="mt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {INTEGRATIONS.map((it) => (
            <Card key={it.id} className="p-5">
              <CardContent className="!flex !flex-col gap-3 !p-0">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-foreground/75">
                    <it.icon className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-semibold">{it.name}</div>
                      {it.badge ? (
                        <Badge className="bg-primary-soft text-primary">
                          {it.badge}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-foreground/75">
                      {it.desc}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {it.status === "connected" ? (
                    <Badge className="bg-success-soft text-success hover:bg-success-soft">
                      <RiCheckLine /> Conectado
                    </Badge>
                  ) : it.status === "beta" ? (
                    <Badge className="bg-warning-soft text-warning hover:bg-warning-soft">
                      Beta · Disponible
                    </Badge>
                  ) : (
                    <Badge variant="outline">No conectado</Badge>
                  )}
                  {it.status === "connected" ? (
                    <Button variant="outline" size="sm">
                      <RiSettings3Line />
                      Configurar
                    </Button>
                  ) : (
                    <Button size="sm">Conectar</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="api" className="mt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-5">
            <CardContent className="!p-0">
              <div className="mb-2 text-sm font-semibold">API Keys</div>
              <div className="mb-3.5 text-[12.5px] text-foreground/75">
                Usa estas credenciales para integrar DIMS AI con tu ERP o
                aplicaciones propias.
              </div>
              <KeyBox
                label="Producción"
                value="dims_live_••••••••••••••••a72f"
                masked
              />
              <KeyBox label="Sandbox" value="dims_test_5fb9c8e2a47d3" />
              <Separator className="my-3" />
              <Button variant="outline">
                <RiAddLine />
                Crear nueva clave
              </Button>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardContent className="!p-0">
              <div className="mb-2 text-sm font-semibold">Webhooks</div>
              <div className="mb-3.5 text-[12.5px] text-foreground/75">
                Recibe notificaciones cuando una DIMS cambia de estado.
              </div>
              {WEBHOOKS.map((w, i) => (
                <div
                  key={w.url}
                  className={cn(
                    "py-2.5",
                    i > 0 && "border-t border-border/60"
                  )}
                >
                  <div className="font-mono text-xs">{w.url}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {w.events} · <span className="text-success">● activo</span>
                  </div>
                </div>
              ))}
              <Separator className="my-3" />
              <Button variant="outline">
                <RiAddLine />
                Agregar webhook
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="historico" className="mt-5">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <div className="text-[13px] font-semibold">
              Últimas sincronizaciones
            </div>
            <Button variant="ghost" size="sm" className="ml-auto">
              <RiRefreshLine />
              Sincronizar ahora
            </Button>
          </div>
          {HISTORY.map((row, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3",
                i > 0 && "border-t border-border/60"
              )}
            >
              <div
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  row.ok ? "bg-success" : "bg-destructive"
                )}
              />
              <div className="w-[110px] font-mono text-xs tabular-nums text-muted-foreground">
                {row.time}
              </div>
              <div className="w-[180px] text-[13px] font-medium">
                {row.target}
              </div>
              <div className="flex-1 text-[12.5px] text-foreground/75">
                {row.count}
              </div>
            </div>
          ))}
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function KeyBox({
  label,
  value,
  masked,
}: {
  label: string
  value: string
  masked?: boolean
}) {
  return (
    <div className="mb-2.5 rounded-md bg-surface-2 p-3">
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 font-mono text-[12.5px]">
        <span className="flex-1 truncate">{value}</span>
        {masked ? (
          <Button variant="ghost" size="icon-sm">
            <RiEyeLine />
          </Button>
        ) : null}
        <Button variant="ghost" size="icon-sm">
          <RiFileCopyLine />
        </Button>
      </div>
    </div>
  )
}
