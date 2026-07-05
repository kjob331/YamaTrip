import Link from "next/link"
import { MailCheck } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <AuthShell title="確認メールを送信しました" description="登録ありがとうございます">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ご登録のメールアドレスに確認メールをお送りしました。
          メール内のリンクをクリックして登録を完了してください。
        </p>
        <Button render={<Link href="/auth/login" />} nativeButton={false} variant="outline" className="w-full">
          ログイン画面へ
        </Button>
      </div>
    </AuthShell>
  )
}
