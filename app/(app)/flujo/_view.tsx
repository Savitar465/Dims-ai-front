"use client"

import * as React from "react"
import Link from "next/link"
import { RiCheckLine, RiArrowRightSLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { DraftInProgress, FlowStep } from "@/lib/types/dims"

export function FlujoView({
  steps,
  drafts,
}: {
  steps: FlowStep[]
  drafts: DraftInProgress[]
}) {
  const [activeDraftId, setActiveDraftId] = React.useState<string | null>(
    drafts[0]?.id ?? null
  )
  const current = drafts.find((d) => d.id === activeDraftId) ?? drafts[0]
  const currentIdx = current?.stepIdx ?? -1

  return (
    <>
      {drafts.length > 0 ? (
        <Card className="mt-6 p-3.5">
          <CardContent className="!p-0">
            <div className="mb-2.5 flex flex-wrap items-center gap-3">
              <div className="text-[12.5px] font-medium uppercase tracking-wider text-muted-foreground">
                Continuar una DIMS en proceso
              </div>
              <Badge variant="outline" className="font-mono">
                {drafts.length} en borrador
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {drafts.map((d) => {
                const active = d.id === current?.id
                const pct = ((d.stepIdx + 1) / steps.length) * 100
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveDraftId(d.id)}
                    className={cn(
                      "min-w-[240px] flex-1 rounded-[10px] border p-3.5 text-left transition-all",
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:bg-surface-2"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold">
                        {d.id}
                      </span>
                      <Badge variant="outline" className="text-[10.5px]">
                        Paso {d.stepIdx + 1}/{steps.length}
                      </Badge>
                    </div>
                    <div className="text-[13px] font-medium">{d.proveedor}</div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {d.items} ítems · USD{" "}
                      {d.valor.toLocaleString("es-BO", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      · {d.actualizada}
                    </div>
                    <Progress value={pct} className="mt-2 h-1" />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-4 px-1 pt-5 pb-1">
        <CardContent className="!p-0">
          <div className="flex items-baseline justify-between px-5 pb-3">
            <div>
              <div className="text-sm font-semibold">
                {current ? (
                  <>
                    Progreso de{" "}
                    <span className="font-mono">{current.id}</span>
                  </>
                ) : (
                  "Pasos del flujo"
                )}
              </div>
              {current ? (
                <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {current.pendiente}
                </div>
              ) : null}
            </div>
            {current ? (
              <div className="font-mono text-xs tabular-nums text-muted-foreground">
                {currentIdx + 1} / {steps.length}
              </div>
            ) : null}
          </div>

          <div className="relative px-2 pb-2">
            {steps.map((s, i) => {
              const status: StepStatus =
                currentIdx < 0
                  ? "pending"
                  : i < currentIdx
                  ? "done"
                  : i === currentIdx
                  ? "current"
                  : "pending"
              return (
                <StepRow
                  key={s.id}
                  step={s}
                  status={status}
                  isLast={i === steps.length - 1}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

type StepStatus = "done" | "current" | "pending"

function StepRow({
  step,
  status,
  isLast,
}: {
  step: FlowStep
  status: StepStatus
  isLast: boolean
}) {
  return (
    <div className="relative flex gap-4 px-3 py-1">
      {!isLast ? (
        <div
          className={cn(
            "absolute left-[42px] top-11 bottom-[-8px] w-[2px]",
            status === "done" ? "bg-success/50" : "bg-border"
          )}
        />
      ) : null}

      <div
        className={cn(
          "z-[1] mt-1.5 grid size-8 shrink-0 place-items-center rounded-full border-2 font-mono text-[13px] font-semibold",
          status === "done" &&
            "border-success bg-success text-white",
          status === "current" &&
            "border-primary bg-primary text-primary-foreground shadow-[0_0_0_5px_color-mix(in_oklch,var(--primary)_18%,transparent)]",
          status === "pending" &&
            "border-border bg-card text-muted-foreground"
        )}
      >
        {status === "done" ? <RiCheckLine className="size-4" /> : step.n}
      </div>

      <Link
        href={`/${step.id}`}
        className={cn(
          "mb-1.5 flex flex-1 items-center gap-3 rounded-[10px] border px-3.5 py-2.5 transition-all",
          status === "current"
            ? "border-primary/35 bg-primary-soft"
            : "border-transparent hover:bg-surface-2"
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <div
              className={cn(
                "text-sm font-semibold",
                status === "current" ? "text-primary" : "text-foreground"
              )}
            >
              {step.title}
            </div>
            {status === "done" ? (
              <Badge variant="secondary" className="text-[10px]">
                Completado
              </Badge>
            ) : null}
            {status === "current" ? (
              <Badge className="text-[10px]">En curso</Badge>
            ) : null}
            <span className="ml-auto font-mono text-[10.5px] text-muted-foreground">
              {step.duration}
            </span>
          </div>
          <div className="text-[12.5px] text-foreground/75">{step.short}</div>
          {status === "current" ? (
            <div className="mt-1.5 border-t border-dashed border-primary/25 pt-2 text-xs text-foreground/75">
              {step.detail}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
            status === "current" && "bg-primary text-primary-foreground",
            status === "done" && "border border-border text-foreground/75",
            status === "pending" && "bg-surface-2 text-foreground/75"
          )}
        >
          {status === "current"
            ? "Continuar"
            : status === "done"
            ? "Revisar"
            : "Abrir"}
          <RiArrowRightSLine className="size-3.5" />
        </div>
      </Link>
    </div>
  )
}
