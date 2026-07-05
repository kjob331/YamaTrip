import Link from "next/link"
import { Mountain, UtensilsCrossed } from "lucide-react"
import type { PostWithImages } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PostCard({ post }: { post: PostWithImages }) {
  const cover = post.post_images?.[0]?.image_url

  return (
    <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover || "/placeholder.svg"}
            alt={`${post.mountain_name}の写真`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Mountain className="size-10 opacity-40" />
          </div>
        )}
        {post.post_images?.length > 1 && (
          <Badge variant="secondary" className="absolute right-2 top-2 bg-background/80">
            {post.post_images.length}枚
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 font-heading text-lg font-bold text-foreground">
          <Mountain className="size-4 shrink-0 text-primary" />
          <span className="truncate">{post.mountain_name}</span>
        </h3>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {post.hot_spring_name && (
            <p className="flex items-center gap-1.5 truncate">
              <span aria-hidden className="text-accent">
                ♨
              </span>
              <span className="truncate">{post.hot_spring_name}</span>
            </p>
          )}
          {post.restaurant_name && (
            <p className="flex items-center gap-1.5 truncate">
              <UtensilsCrossed className="size-3.5 shrink-0 text-accent" />
              <span className="truncate">{post.restaurant_name}</span>
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button render={<Link href={`/posts/${post.id}`} />} nativeButton={false} variant="outline" size="sm" className="w-full">
          詳細を見る
        </Button>
      </CardFooter>
    </Card>
  )
}
