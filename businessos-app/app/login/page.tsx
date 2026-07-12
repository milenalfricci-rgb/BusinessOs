import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/";
  const hasError = params.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        action={login}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border p-6"
      >
        <div>
          <h1 className="text-lg font-semibold">BusinessOS</h1>
          <p className="text-sm text-muted-foreground">
            Digite a senha para continuar.
          </p>
        </div>

        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoFocus
            required
          />
        </div>

        {hasError && (
          <p className="text-sm text-destructive">Senha incorreta.</p>
        )}

        <Button type="submit">Entrar</Button>
      </form>
    </div>
  );
}
