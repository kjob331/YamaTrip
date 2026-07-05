import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mountain, Pencil, UtensilsCrossed, Sun, Cloud, CloudRain, Snowflake } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { PostWithImages } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { ImageGallery } from "@/components/image-gallery"
import { DeletePostButton } from "@/components/delete-post-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//  AIハイライトコンポーネントをインポート
import { AiHighlight } from "@/components/ai-highlight"

function getWeatherIcon(main: string) {
  switch (main) {
    case "Clear": return <Sun className="size-5 text-amber-500" />
    case "Rain":
    case "Drizzle": return <CloudRain className="size-5 text-blue-400" />
    case "Snow": return <Snowflake className="size-5 text-sky-300" />
    default: return <Cloud className="size-5 text-muted-foreground" />
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase.from("posts").select("*, post_images(*)").eq("id", id).single()
  if (!data) notFound()

  // 💡 postの型定義を安全に拡張
  const post = data as PostWithImages & { 
    latitude?: number | null; 
    longitude?: number | null;
    mountain_comment?: string | null;
    hot_spring_name?: string | null;
    hot_spring_comment?: string | null;
    restaurant_name?: string | null;
    restaurant_comment?: string | null;
    post_images?: any[] | null; // 💡 確実に配列として扱えるよう型を拡張
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === post.user_id

  const date = new Date(post.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  let weatherData = null
  if (post.latitude && post.longitude) {
    try {
      const apiKey = process.env.OPENWEATHERMAP_API_KEY
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${post.latitude}&lon=${post.longitude}&appid=${apiKey}&units=metric&lang=ja`,
        { next: { revalidate: 1800 } }
      )
      if (res.ok) {
        weatherData = await res.json()
      }
    } catch (error) {
      console.error("Weather fetch error:", error)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          {/* 💡 【対策1】asChildエラーを回避するため、Linkの中にButtonを配置（またはclassNameのみ適用） */}
          <Link href="/">
            <Button variant="ghost" size="sm" type="button">
              <ArrowLeft className="mr-2 size-4" />
              戻る
            </Button>
          </Link>
          
          {isOwner && (
            <div className="flex gap-2">
              {/* 💡 同様に、Linkの中にButtonを内包する形にします */}
              <Link href={`/posts/${post.id}/edit`}>
                <Button variant="outline" size="sm" type="button">
                  <Pencil className="mr-2 size-4" />
                  編集する
                </Button>
              </Link>
              <DeletePostButton
                postId={post.id}
                mountainName={post.mountain_name}
                variant="destructive"
                size="sm"
                redirectTo="/mypage"
              />
            </div>
          )}
        </div>

        <article className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="flex items-center gap-2 font-heading text-2xl font-bold">
                <Mountain className="size-6 text-primary" />
                {post.mountain_name}
              </h1>

              {weatherData && (
                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                  {getWeatherIcon(weatherData.weather[0].main)}
                  <span>{weatherData.weather[0].description}</span>
                  <span className="text-muted-foreground">/</span>
                  <span>{Math.round(weatherData.main.temp)}°C</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{date} の記録</p>
          </header>

          {/* AIハイライトを配置 */}
          <AiHighlight 
            post={{
              mountain_name: post.mountain_name,
              comment: post.mountain_comment || "",
              hot_spring_name: post.hot_spring_name || undefined,
              restaurant_name: post.restaurant_name || undefined
            }} 
          />

          {/* 💡 【対策2】post_imagesが存在し、かつ1件以上ある場合のみ安全にレンダリング */}
          {post.post_images && post.post_images.length > 0 && (
            <ImageGallery images={post.post_images} />
          )}

          {post.mountain_comment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mountain className="size-4 text-primary" />
                  登山記録
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">{post.mountain_comment}</p>
              </CardContent>
            </Card>
          )}

          {(post.hot_spring_name || post.hot_spring_comment) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span aria-hidden className="text-accent">
                    ♨
                  </span>
                  温泉
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {post.hot_spring_name && <p className="font-medium text-foreground">{post.hot_spring_name}</p>}
                {post.hot_spring_comment && (
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{post.hot_spring_comment}</p>
                )}
              </CardContent>
            </Card>
          )}

          {(post.restaurant_name || post.restaurant_comment) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UtensilsCrossed className="size-4 text-accent" />
                  食事処
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {post.restaurant_name && <p className="font-medium text-foreground">{post.restaurant_name}</p>}
                {post.restaurant_comment && (
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {post.restaurant_comment}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </article>
      </main>
    </div>
  )
}