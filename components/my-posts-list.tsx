"use client"

import { useState } from "react"
import Link from "next/link"
import { Mountain, Pencil } from "lucide-react"
import type { PostWithImages } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DeletePostButton } from "@/components/delete-post-button"

export function MyPostsList({ posts }: { posts: PostWithImages[] }) {
  const [items, setItems] = useState(posts)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <Mountain className="size-8 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">まだ投稿がありません。</p>
        <Button render={<Link href="/posts/new" />} nativeButton={false}>
          最初の投稿を作成する
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((post) => {
        const cover = post.post_images?.[0]?.image_url
        return (
          <Card key={post.id} className="flex-row items-center gap-3 p-3">
            <Link
              href={`/posts/${post.id}`}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover || "/placeholder.svg"} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Mountain className="size-6 opacity-40" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="flex items-center gap-1.5 truncate font-heading font-bold">
                  <Mountain className="size-4 shrink-0 text-primary" />
                  {post.mountain_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 gap-1.5">
              <Button render={<Link href={`/posts/${post.id}/edit`} />} nativeButton={false} variant="outline" size="sm">
                <Pencil data-icon="inline-start" />
                <span className="hidden sm:inline">編集</span>
              </Button>
              <DeletePostButton
                postId={post.id}
                mountainName={post.mountain_name}
                variant="ghost"
                size="icon"
                onDeleted={() => setItems((prev) => prev.filter((p) => p.id !== post.id))}
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
