import { AppSidebar } from "./_components/app-sidebar"
import { AppTopbar } from "./_components/app-topbar"
import { getFlujoData } from "@/lib/services/flujo"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { drafts } = await getFlujoData()

  return (
    <div className="grid min-h-svh grid-cols-[248px_1fr]">
      <AppSidebar drafts={drafts} />
      <main className="flex min-w-0 flex-col">
        <AppTopbar />
        <div className="mx-auto w-full max-w-[1280px] px-8 pb-16 pt-7">
          {children}
        </div>
      </main>
    </div>
  )
}
