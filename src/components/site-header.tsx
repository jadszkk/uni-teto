import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { SignOutButton } from "./sign-out-button";
import { UserAvatar } from "./user-avatar";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          UniTeto
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {session ? (
            <>
              <Link
                href="/perfil"
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <UserAvatar
                  name={session.user.name}
                  image={session.user.image}
                  size={24}
                />
                Olá, {session.user.name}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Entrar
              </Link>
              <Link href="/cadastro" className={buttonVariants({ size: "sm" })}>
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
