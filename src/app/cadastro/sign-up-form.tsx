"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldError as FormError } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { signUpSchema, type SignUpInput } from "@/lib/auth/sign-up-schema";

export function SignUpForm() {
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(input: SignUpInput) {
    const { name, email, password } = signUpSchema.parse(input);
    const { error } = await authClient.signUp.email({ name, email, password });

    if (!error) {
      setCreatedEmail(email);
      return;
    }

    // Domínio fora da lista: o erro vem do servidor (src/lib/auth/server.ts)
    if (error.code === "EMAIL_DOMAIN_NOT_ALLOWED") {
      setError("email", { message: error.message });
    } else {
      setError("root", {
        message: "Não foi possível criar a conta. Tente novamente.",
      });
    }
  }

  if (createdEmail) {
    return (
      <p role="status" className="text-sm">
        Conta criada para <strong>{createdEmail}</strong>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormField id="name" label="Nome" error={errors.name}>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FormField>

        <FormField
          id="email"
          label="E-mail institucional"
          description="Use o e-mail da sua universidade, ex: nome@ufpi.edu.br"
          error={errors.email}
        >
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
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label="Confirme a senha"
          error={errors.confirmPassword}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        <FieldError errors={[errors.root]} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function FormField({
  id,
  label,
  description,
  error,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: FormError;
  children: React.ReactNode;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
