import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { PostWithImages } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { PostForm } from "@/components/post-form"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data } = await supabase
    .from("posts")
    .select("*, post_images(*)")
    .eq("id", id)
    .single()

  if (!data) notFound()
  const post = data as PostWithImages
  if (post.user_id !== user.id) redirect(`/posts/${id}`)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 font-heading text-2xl font-bold">投稿編集</h1>
        <PostForm post={post} />
      </main>
    </div>
  )
}
