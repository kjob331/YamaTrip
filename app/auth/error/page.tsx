import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <AuthShell title="認証エラー" description="問題が発生しました">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          認証中に問題が発生しました。お手数ですが、もう一度お試しください。
        </p>
        <Button render={<Link href="/auth/login" />} nativeButton={false} variant="outline" className="w-full">
          ログイン画面へ戻る
        </Button>
      </div>
    </AuthShell>
  )
}
