"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { signInSchema, type SignInInput } from "@/lib/auth/sign-in-schema";

export function SignInForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(input: SignInInput) {
    const { email, password } = signInSchema.parse(input);
    // Sem `callbackURL`: com ele o Better Auth redirecionaria o navegador
    // sozinho após o login. O link reenviado (e-mail não confirmado) leva à home.
    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError("root", { message: signInErrorMessage(error.code) });
      return;
    }

    // `refresh` faz o cabeçalho (Server Component) ler a sessão nova
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormField id="email" label="E-mail institucional" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField id="password" label="Senha" error={errors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <FieldError errors={[errors.root]} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function signInErrorMessage(code: string | undefined) {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-mail ou senha incorretos.";
    case "EMAIL_NOT_VERIFIED":
      return "Confirme seu e-mail antes de entrar. Enviamos um novo link de confirmação.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}
