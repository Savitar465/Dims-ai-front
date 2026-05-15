import type { Metadata } from "next"
import Link from "next/link"
import {
  RiAddLine,
  RiSearchLine,
  RiStarLine,
  RiQuestionLine,
  RiArrowRightSLine,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getFlujoData } from "@/lib/services/flujo"

import { FlujoView } from "./_view"

export const metadata: Metadata = { title: "Flujo de declaración · DIMS AI" }

export default async function FlujoPage() {
  const { steps, drafts } = await getFlujoData()

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Flujo de declaración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            5 pasos guiados para generar una DIMS lista para Aduana.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/factura">
            <RiAddLine />
            Empezar nueva DIMS
          </Link>
        </Button>
      </div>

      <FlujoView steps={steps} drafts={drafts} />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickShortcut
          icon={RiSearchLine}
          title="Buscar subpartida"
          sub="Consulta códigos arancelarios"
          href="/buscar"
        />
        <QuickShortcut
          icon={RiStarLine}
          title="Productos recurrentes"
          sub="Reusa clasificaciones guardadas"
          href="/productos"
        />
        <QuickShortcut
          icon={RiQuestionLine}
          title="Centro de ayuda"
          sub="Glosario y guías paso a paso"
          href="/ayuda"
        />
      </div>
    </div>
  )
}

function QuickShortcut({
  icon: Icon,
  title,
  sub,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="flex-row items-center gap-3 p-4 transition-colors hover:bg-surface-2">
        <div className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary">
          <Icon className="size-[17px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <RiArrowRightSLine className="size-4 text-muted-foreground" />
      </Card>
    </Link>
  )
}
