import Link from "next/link"
import { CheckCircle2 } from "lucide-react" // アイコンをチェックマークに変更
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <AuthShell title="登録が完了しました" description="ご登録ありがとうございます">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          アカウントの登録が正常に完了しました。
        </p>
        <Button render={<Link href="/auth/login" />} nativeButton={false} variant="outline" className="w-full">
          ログイン画面へ
        </Button>
      </div>
    </AuthShell>
  )
}