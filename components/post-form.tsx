"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Loader2, Mountain, UtensilsCrossed, X } from "lucide-react"
import { createClient as supabase } from "@/lib/supabase/client" // ★インポート変数をそのまま使えるように変更
import { POST_IMAGES_BUCKET } from "@/lib/constants"
import type { PostWithImages } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type ExistingImage = { id: string; image_url: string }
type NewImage = { id: string; file: File; preview: string }

export function PostForm({ post }: { post?: PostWithImages }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = Boolean(post)

  const [mountainName, setMountainName] = useState(post?.mountain_name ?? "")
  const [mountainComment, setMountainComment] = useState(post?.mountain_comment ?? "")
  const [hotSpringName, setHotSpringName] = useState(post?.hot_spring_name ?? "")
  const [hotSpringComment, setHotSpringComment] = useState(post?.hot_spring_comment ?? "")
  const [restaurantName, setRestaurantName] = useState(post?.restaurant_name ?? "")
  const [restaurantComment, setRestaurantComment] = useState(post?.restaurant_comment ?? "")

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    post?.post_images?.map((img) => ({ id: img.id, image_url: img.image_url })) ?? [],
  )
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [submitting, setSubmitting] = useState(false)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const additions = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }))
    setNewImages((prev) => [...prev, ...additions])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeExisting(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
    setRemovedImageIds((prev) => [...prev, id])
  }

  function removeNew(id: string) {
    setNewImages((prev) => prev.filter((img) => img.id !== id))
  }

  // ★自動で画像をStorageへアップロードしURLを取得する関数
  async function uploadImages(userId: string): Promise<string[]> {
    const urls: string[] = []
    for (const img of newImages) {
      const ext = img.file.name.split(".").pop() ?? "jpg"
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      
      // Storageにアップロード
      const { error } = await supabase.storage.from(POST_IMAGES_BUCKET).upload(path, img.file)
      if (error) throw error
      
      // アップロードした写真の公開URLを自動で取得
      const { data } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mountainName.trim()) {
      toast.error("山名を入力してください。")
      return
    }
    setSubmitting(true)

    try {
      // 1. ログイン中のユーザー情報を自動で取得
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("ログインが必要です。")
        router.push("/auth/login")
        return
      }

      const payload = {
        mountain_name: mountainName.trim(),
        mountain_comment: mountainComment.trim() || null,
        hot_spring_name: hotSpringName.trim() || null,
        hot_spring_comment: hotSpringComment.trim() || null,
        restaurant_name: restaurantName.trim() || null,
        restaurant_comment: restaurantComment.trim() || null,
      }

      let postId = post?.id

      // 2. postsテーブルへの保存処理
      if (isEdit && postId) {
        const { error } = await supabase.from("posts").update(payload).eq("id", postId)
        if (error) throw error
      } else {
        // 新規投稿時：user_idをセットしてインサートし、作成された投稿のidを自動で取得する
        const { data, error } = await supabase
          .from("posts")
          .insert({ ...payload, user_id: user.id })
          .select("id")
          .single()
        if (error) throw error
        postId = data.id
      }

      // 3. 削除された既存画像のデータを削除
      if (removedImageIds.length > 0) {
        await supabase.from("post_images").delete().in("id", removedImageIds)
      }

      // 4. 【自動化】選択された新規画像をStorageにアップロードし、URLリストを生成
      const uploadedUrls = await uploadImages(user.id)
      
      // 5. 【自動化】取得したURL群と、さきほど自動取得したpostIdを紐付けてpost_imagesテーブルへ一気に挿入
      if (uploadedUrls.length > 0 && postId) {
        const { error } = await supabase
          .from("post_images")
          .insert(uploadedUrls.map((url) => ({ post_id: postId, image_url: url })))
        if (error) throw error
      }

      toast.success(isEdit ? "投稿を更新しました。" : "投稿を作成しました。")
      router.push(isEdit ? `/posts/${postId}` : "/")
      router.refresh()
    } catch (err) {
      console.error("[v0] post submit error:", err)
      toast.error("保存に失敗しました。もう一度お試しください。")
      setSubmitting(false)
    }
  }

  return (
    // UI部分は変更ありません（既存のままでOKです）
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* ...既存のUIコード... */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mountain className="size-4 text-primary" />
            登山情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="mountain">
                山名 <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="mountain"
                required
                value={mountainName}
                onChange={(e) => setMountainName(e.target.value)}
                placeholder="例：谷川岳"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="mountainComment">登山記録・感想</FieldLabel>
              <Textarea
                id="mountainComment"
                rows={4}
                value={mountainComment}
                onChange={(e) => setMountainComment(e.target.value)}
                placeholder="天気やルート、見どころなど"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span aria-hidden className="text-accent">♨</span>
            温泉情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="hotSpring">温泉名</FieldLabel>
              <Input
                id="hotSpring"
                value={hotSpringName}
                onChange={(e) => setHotSpringName(e.target.value)}
                placeholder="例：谷川温泉 湯テルメ"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="hotSpringComment">温泉の感想</FieldLabel>
              <Textarea
                id="hotSpringComment"
                rows={3}
                value={hotSpringComment}
                onChange={(e) => setHotSpringComment(e.target.value)}
                placeholder="泉質や雰囲気、料金など"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="size-4 text-accent" />
            食事処情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="restaurant">食事処名</FieldLabel>
              <Input
                id="restaurant"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="例：水上 そば処"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="restaurantComment">食事の感想</FieldLabel>
              <Textarea
                id="restaurantComment"
                rows={3}
                value={restaurantComment}
                onChange={(e) => setRestaurantComment(e.target.value)}
                placeholder="おすすめメニューや味の感想など"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImagePlus className="size-4 text-primary" />
            写真
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-secondary"
            >
              <ImagePlus className="size-6" />
              写真を選択（複数可）
            </button>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {existingImages.map((img) => (
                  <ImageThumb key={img.id} src={img.image_url} onRemove={() => removeExisting(img.id)} />
                ))}
                {newImages.map((img) => (
                  <ImageThumb key={img.id} src={img.preview} onRemove={() => removeNew(img.id)} />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={submitting}>
          キャンセル
        </Button>
        <Button type="submit" className="w-full flex-1 font-medium" disabled={submitting}>
          {submitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isEdit ? "変更を保存する" : "投稿する"}
        </Button>
      </div>
    </form>
  )
}

function ImageThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
      <img src={src || "/placeholder.svg"} alt="" className="size-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="写真を削除"
        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}