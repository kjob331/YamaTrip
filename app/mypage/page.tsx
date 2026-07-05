import { redirect } from "next/navigation"
import { Mail, PenSquare } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { PostWithImages } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { MyPostsList } from "@/components/my-posts-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function MyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data } = await supabase
    .from("posts")
    .select("*, post_images(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const posts = (data ?? []) as PostWithImages[]

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 font-heading text-2xl font-bold">マイページ</h1>

        <Card className="mb-8">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <p className="text-xs text-muted-foreground">ログイン中</p>
              <p className="truncate font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">自分の投稿（{posts.length}件）</h2>
          <Button render={<Link href="/posts/new" />} nativeButton={false} size="sm">
            <PenSquare data-icon="inline-start" />
            新規投稿
          </Button>
        </div>

        <MyPostsList posts={posts} />
      </main>
    </div>
  )
}
