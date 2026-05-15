import Link from "next/link"
import type { Metadata } from "next"
import {
  RiAddLine,
  RiFileTextLine,
  RiTimeLine,
  RiSparklingLine,
  RiLineChartLine,
  RiUploadCloud2Line,
  RiSearchLine,
  RiStarLine,
  RiArrowRightSLine,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
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
    icon: RiSearchLine,
    title: "Buscar subpartida arancelaria",
    sub: "Por palabras clave del producto",
    href: "/buscar",
  },
  {
    icon: RiStarLine,
    title: "Productos recurrentes",
    sub: "Reutilizar clasificaciones guardadas",
    href: "/productos",
  },
  {
    icon: RiFileTextLine,
    title: "Generar DIMS manualmente",
    sub: "Si no tienes factura digital",
    href: "/dims",
  },
]

const ESTADO_BADGE: Record<DimsEstado, { label: string; variant: "default" | "secondary" | "outline" }> = {
  borrador: { label: "Borrador", variant: "outline" },
  enviada: { label: "Enviada", variant: "default" },
  aprobada: { label: "Aprobada", variant: "secondary" },
}

export default async function InicioPage() {
  const data = await getDashboardData()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-serif text-sm italic text-muted-foreground">
            Buen día,
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            {data.proveedor}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tienes{" "}
            <strong className="text-foreground">
              {data.draftsCount} DIMS
            </strong>{" "}
            en borrador. La IA terminó de extraer {data.facturasExtraidas}{" "}
            factura nueva.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/factura">
            <RiAddLine />
            Nueva DIMS
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="DIMS este mes" value={data.stats.dimsEsteMes.value} sub={data.stats.dimsEsteMes.sub} Icon={RiFileTextLine} />
        <StatCard label="Tiempo promedio" value={data.stats.tiempoPromedio.value} sub={data.stats.tiempoPromedio.sub} Icon={RiTimeLine} />
        <StatCard label="Precisión IA" value={data.stats.precisionIA.value} sub={data.stats.precisionIA.sub} Icon={RiSparklingLine} />
        <StatCard label="Ahorro estimado" value={data.stats.ahorroEstimado.value} sub={data.stats.ahorroEstimado.sub} Icon={RiLineChartLine} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Empezar rápido</CardTitle>
          </CardHeader>
          <CardContent className="!p-2">
            {QUICK_START.map((item, i) => (
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
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
                <RiArrowRightSLine className="size-4 text-muted-foreground" />
                {/* `i` only used to silence noUnused — keep semantic anchor list */}
                <span hidden>{i}</span>
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

      {data.insight ? (
        <Card className="mt-6 flex-row items-center gap-4 border-ai/20 bg-ai-soft/60 p-5 flex-wrap">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ai text-ai-foreground">
            <RiSparklingLine className="size-[18px]" />
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="text-[13.5px] font-semibold">
              {data.insight.titulo}
            </div>
            <div className="mt-0.5 text-[12.5px] text-foreground/75">
              {data.insight.detalle}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              No, gracias
            </Button>
            <Button asChild size="sm">
              <Link href={`/${data.insight.ctaScreen}`}>Crear recurrente</Link>
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  Icon,
}: {
  label: string
  value: string
  sub: string
  Icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 !py-1">
        <div className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight">
            {value}
          </div>
          <div className="text-[11.5px] text-muted-foreground">{sub}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecienteRow({ d, showDivider }: { d: DimsResumen; showDivider: boolean }) {
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
          USD{" "}
          {d.valor.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
    </>
  )
}
