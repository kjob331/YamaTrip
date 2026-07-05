"use client"

import { useMemo, useState } from "react"
import { Search, Mountain } from "lucide-react"
import type { PostWithImages } from "@/lib/types"
import { POPULAR_MOUNTAINS } from "@/lib/constants"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function HomeFeed({ posts }: { posts: PostWithImages[] }) {
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")

  const keyword = submitted.trim()

  const filtered = useMemo(() => {
    if (!keyword) return posts
    return posts.filter((p) => p.mountain_name.toLowerCase().includes(keyword.toLowerCase()))
  }, [posts, keyword])

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(query)
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="山名で検索（例：高尾山）"
              className="h-11 pl-9"
              aria-label="山名で検索"
              list="mountain-choices"
              autoComplete="off"
            />
            <datalist id="mountain-choices">
              {POPULAR_MOUNTAINS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <Button type="submit" size="lg" className="h-11 font-medium">
            <Search data-icon="inline-start" />
            検索
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">人気の山</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_MOUNTAINS.map((m) => {
              const isActive = keyword === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setQuery(m)
                    setSubmitted(m)
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
                  )}
                >
                  <Mountain className="size-3.5" />
                  {m}
                </button>
              )
            })}
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setSubmitted("")
                }}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                絞り込みを解除
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-bold">{keyword ? `「${keyword}」の検索結果` : "最新の投稿"}</h2>
          <span className="text-sm text-muted-foreground">{filtered.length}件</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Mountain className="size-8 opacity-40" />
            <p>該当する投稿が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}