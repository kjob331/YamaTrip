"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function DeletePostButton({
  postId,
  mountainName,
  variant = "outline",
  size = "default",
  redirectTo,
  onDeleted,
}: {
  postId: string
  mountainName: string
  variant?: "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "icon"
  redirectTo?: string
  onDeleted?: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient
    const { error } = await supabase.from("posts").delete().eq("id", postId)
    if (error) {
      console.log("[v0] delete error:", error)
      toast.error("削除に失敗しました。")
      setLoading(false)
      return
    }
    toast.success("投稿を削除しました。")
    setOpen(false)
    if (onDeleted) onDeleted()
    if (redirectTo) {
      router.push(redirectTo)
    }
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} size={size} />}>
        <Trash2 data-icon="inline-start" />
        {size !== "icon" && "削除する"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>投稿を削除しますか？</DialogTitle>
          <DialogDescription>
            「{mountainName}」の投稿を削除します。この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={loading} />}>キャンセル</DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 data-icon="inline-start" className="animate-spin" />}
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
