"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, AlertTriangle } from "lucide-react" // AlertTriangleを追加

interface AiHighlightProps {
  post: {
    mountain_name: string
    comment: string
    hot_spring_name?: string
    restaurant_name?: string
  }
}

export function AiHighlight({ post }: AiHighlightProps) {
  const [highlight, setHighlight] = useState<{ summary: string[]; tags: string[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // ⭐ エラーメッセージ用のステート

  useEffect(() => {
    async function fetchAiData() {
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(post),
        })

        // ⭐ 修正ポイント：レスポンスが正常(200番台)でない場合の処理
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          setErrorMessage(errorData.error || "AIハイライトの読み込みに失敗しました。")
          return
        }

        const data = await res.json()
        if (data && !data.error) {
          setHighlight(data)
        }
      } catch (err) {
        console.error(err)
        setErrorMessage("通信エラーが発生しました。")
      } finally {
        setLoading(false)
      }
    }
    fetchAiData()
  }, [post])

  if (loading) return <div className="text-sm text-gray-500 animate-pulse">🪄 AIがハイライトを生成中...</div>

  // ⭐ 修正ポイント：制限エラーに達した時、画面に親切なメッセージを出す
  if (errorMessage) {
    return (
      <Card className="border-amber-200 bg-amber-50/30 my-4">
        <CardContent className="pt-4 flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>{errorMessage}</div>
        </CardContent>
      </Card>
    )
  }

  if (!highlight) return null

  return (
    <Card className="border-emerald-200 bg-emerald-50/30 my-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-1 text-emerald-700">
          <Sparkles className="w-4 h-4" /> AI登山体験ハイライト
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
          {highlight.summary.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          {highlight.tags.map((tag, i) => (
            <span key={i} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}