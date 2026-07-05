"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
import { createClient as supabase } from "@/lib/supabase/client" // ★関数の呼び出しではなく、直接インポートされたオブジェクトを割り当て
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// ⭕ リファクタリング：マジックナンバーを排除するための定数定義
const MIN_PASSWORD_LENGTH = 8

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ⭕ リファクタリング：定数「MIN_PASSWORD_LENGTH」を使用
  const isLongEnough = password.length >= MIN_PASSWORD_LENGTH
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isValid = isLongEnough && hasLetter && hasNumber

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValid) {
      // ⭕ リファクタリング：エラーメッセージ内も定数から動的に生成
      setError(`パスワードは${MIN_PASSWORD_LENGTH}文字以上で、英字と数字を含めてください。`)
      return
    }
    setLoading(true)

    // 1. Supabase Auth にユーザーを登録
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Auth登録成功後、自動でデータベースの「users」テーブルにも同じIDで保存する
    if (authData?.user) {
      const { error: dbError } = await supabase
        .from("users") // ※お使いのテーブル名が profiles の場合はここを 'profiles' に変更してください
        .insert({
          id: authData.user.id, // Authが発行した一意のUUID
          email: email,
          created_at: new Date().toISOString()
        })

      if (dbError) {
        console.error("ユーザーテーブルへの自動保存エラー:", dbError)
        setError(`ユーザー登録は完了しましたが、プロファイルの作成に失敗しました: ${dbError.message}`)
        setLoading(false)
        return
      }
    }

    router.push("/auth/sign-up-success")
  }

  return (
    <AuthShell title="新規登録" description="アカウントを作成して投稿しよう">
      <form onSubmit={handleSignUp}>
        <FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">パスワード</FieldLabel>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <ul className="mt-1 flex flex-col gap-1 text-xs">
              {/* ⭕ リファクタリング：UI上のラベルも定数を利用 */}
              <PasswordRule ok={isLongEnough} label={`${MIN_PASSWORD_LENGTH}文字以上`} />
              <PasswordRule ok={hasLetter} label="英字を含む" />
              <PasswordRule ok={hasNumber} label="数字を含む" />
            </ul>
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登録中..." : "登録する"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
              ログインはこちら
            </Link>
          </p>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-1.5", ok ? "text-primary" : "text-muted-foreground")}>
      {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {label}
    </li>
  )
}