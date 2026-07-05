import { createClient } from "@/lib/supabase/server"
import type { PostWithImages } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { HomeFeed } from "@/components/home-feed"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("posts")
    .select("*, post_images(*)")
    .order("created_at", { ascending: false })

  const posts = (data ?? []) as PostWithImages[]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-mountain.png" alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-primary/55" />
        </div>
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-16 sm:py-24">
          <p className="font-heading text-sm font-medium tracking-wide text-primary-foreground/85">
            山 ＋ ♨ 温泉 ＋ 🍚 ごはん
          </p>
          <h1 className="max-w-2xl text-balance font-heading text-3xl font-black leading-tight text-primary-foreground sm:text-5xl">
            登山の一日を、まるごと記録しよう。
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-primary-foreground/90">
            山の記録に「下山後の温泉」と「美味しいご飯処」をセットで。
            次の遠征の計画も、思い出の振り返りも、これひとつで。
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <HomeFeed posts={posts} />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        YamaTrip — 登山と温泉とごはんの記録
      </footer>
    </div>
  )
}
