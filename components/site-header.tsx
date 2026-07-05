import Link from "next/link"
import { Mountain, PenSquare, UserRound } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mountain className="size-5" />
          </span>
          <span className="hidden sm:inline">YamaTrip</span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {user ? (
            <>
              <Button render={<Link href="/posts/new" />} nativeButton={false} size="sm" className="font-medium">
                <PenSquare data-icon="inline-start" />
                <span className="hidden sm:inline">投稿作成</span>
                <span className="sm:hidden">投稿</span>
              </Button>
              <Button render={<Link href="/mypage" />} nativeButton={false} variant="ghost" size="sm">
                <UserRound data-icon="inline-start" />
                <span className="hidden sm:inline">マイページ</span>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button render={<Link href="/auth/login" />} nativeButton={false} variant="ghost" size="sm">
                ログイン
              </Button>
              <Button render={<Link href="/auth/sign-up" />} nativeButton={false} size="sm" className="font-medium">
                新規登録
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
