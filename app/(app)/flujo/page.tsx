import type { Metadata } from "next"
import Link from "next/link"
import { RiAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
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
    </div>
  )
}
