import Link from "next/link"
import type { Metadata } from "next"
import {
  RiAddLine,
  RiArrowRightSLine,
  RiFileTextLine,
  RiUploadCloud2Line,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getDashboardData } from "@/lib/services/dashboard"
import type { DimsEstado, DimsResumen } from "@/lib/types/dims"

export const metadata: Metadata = { title: "Inicio · DIMS AI" }

type QuickStart = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
  href: string
  accent?: boolean
}

const QUICK_START: QuickStart[] = [
  {
    icon: RiUploadCloud2Line,
    title: "Subir factura",
    sub: "PDF o imagen — la IA extrae los datos",
    href: "/factura",
    accent: true,
  },
  {
    icon: RiFileTextLine,
    title: "Preparar DIMS manualmente",
    sub: "Si no tienes factura digital",
    href: "/dims",
  },
]

const ESTADO_BADGE: Record<
  DimsEstado,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  borrador: { label: "Borrador", variant: "outline" },
  enviada: { label: "Enviada", variant: "default" },
  aprobada: { label: "Aprobada", variant: "secondary" },
}

export default async function InicioPage() {
  const data = await getDashboardData()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <div className="font-serif text-sm text-muted-foreground italic">
            DIMS AI
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            Genera tu Declaración de Importación con IA
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sube una factura y la IA extrae, clasifica y arma tu DIMS lista para
            la Aduana Nacional — en cinco pasos guiados.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/factura">
            <RiAddLine />
            Nueva DIMS
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Empezar rápido</CardTitle>
          </CardHeader>
          <CardContent className="!p-2">
            {QUICK_START.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3.5 rounded-[10px] p-3 transition-colors hover:bg-surface-2"
              >
                <div
                  className={
                    item.accent
                      ? "grid size-[38px] place-items-center rounded-[10px] bg-primary text-primary-foreground"
                      : "grid size-[38px] place-items-center rounded-[10px] bg-surface-2 text-foreground/80"
                  }
                >
                  <item.icon className="size-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.sub}
                  </div>
                </div>
                <RiArrowRightSLine className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>DIMS recientes</CardTitle>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/exportar">
                  Ver todo
                  <RiArrowRightSLine />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="!p-0">
            {data.recientes.map((d, i) => (
              <RecienteRow key={d.id} d={d} showDivider={i > 0} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RecienteRow({
  d,
  showDivider,
}: {
  d: DimsResumen
  showDivider: boolean
}) {
  const badge = ESTADO_BADGE[d.estado]
  return (
    <>
      {showDivider ? <Separator /> : null}
      <div className="flex items-center gap-3 px-5 py-3">
        <RiFileTextLine className="size-4 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[12.5px] font-medium">
            {d.id}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {d.proveedor} · {d.fecha}
          </div>
        </div>
        <div className="text-[13px] font-medium tabular-nums">
          USD {d.valor.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
    </>
  )
}
