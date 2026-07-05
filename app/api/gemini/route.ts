import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { mountain_name, comment, hot_spring_name, restaurant_name } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 })
    }

    const prompt = `
以下の登山記録を分析して、次の2つのデータを必ず指定のJSON形式で出力してください。

【登山記録】
・山名: ${mountain_name}
・感想: ${comment}
・温泉: ${hot_spring_name || "なし"}
・食事処: ${restaurant_name || "なし"}

【出力形式】
以下のJSONフォーマットの文字列のみを返してください。前後に解説やタイトル、挨拶などは一切不要です。必ず「{」から始めてください。
{
  "summary": ["1行目のまとめ", "2行目のまとめ", "3行目のまとめ"],
  "tags": ["#タグ1", "#タグ2", "#タグ3"]
}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    )

    // ⭐ 修正ポイント：429エラー（回数制限）またはそれ以外のエラーのハンドリング
    if (response.status === 429 || !response.ok) {
      console.warn(`Gemini API エラー発生。ステータスコード: ${response.status}`)
      return NextResponse.json(
        { error: "Gemini API の制限に達したか、エラーが発生しました。しばらく待って再試行してください。" },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!aiText) {
      console.error("Geminiからの応答が空です:", data)
      return NextResponse.json({ error: "AIの応答が空でした" }, { status: 500 })
    }

    console.log("--- Geminiの生の返答ここから ---")
    console.log(aiText)
    console.log("--- Geminiの生の返答ここまで ---")

    const firstOpenBrace = aiText.indexOf("{")
    const lastCloseBrace = aiText.lastIndexOf("}")

    if (firstOpenBrace !== -1 && lastCloseBrace !== -1 && firstOpenBrace < lastCloseBrace) {
      aiText = aiText.substring(firstOpenBrace, lastCloseBrace + 1)
    }

    try {
      const result = JSON.parse(aiText)
      return NextResponse.json(result)
    } catch (parseError) {
      console.error("JSONのパースに失敗しました。整形後のテキスト:", aiText)
      return NextResponse.json({
        summary: [`${mountain_name}の登山記録が更新されました！`],
        tags: ["#登山", "#山登り"]
      })
    }

  } catch (error) {
    console.error("Geminiシステムエラー:", error)
    return NextResponse.json({ error: "AI生成に失敗しました" }, { status: 500 })
  }
}