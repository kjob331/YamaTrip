import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // フロントエンドから送られてくる緯度・経度(lat, lon)を取得
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: '緯度と経度が必要です。' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  try {
    // OpenWeatherMapの「Current Weather Data」APIを呼び出す
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`
    )

    if (!response.ok) {
      throw new Error('天気データの取得に失敗しました')
    }

    const data = await response.json()

    // 画面に表示したい最低限必要なデータだけをフロントに返す
    return NextResponse.json({
      temp: data.main.temp,               // 気温
      description: data.weather[0].description, // 天気の説明（曇りがち、など）
      icon: data.weather[0].icon,         // 天気アイコンのID
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}