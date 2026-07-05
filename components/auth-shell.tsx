import Link from "next/link"
import { Mountain } from "lucide-react"

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Mountain className="size-5" />
        </span>
        YamaTrip
      </Link>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col gap-1 text-center">
          <h1 className="font-heading text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
