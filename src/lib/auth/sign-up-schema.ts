import { z } from "zod";

// Mesmos limites de senha configurados no Better Auth (src/lib/auth/server.ts)
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Também usado na edição do perfil
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Informe seu nome.")
  .max(100, "O nome pode ter no máximo 100 caracteres.");

export const signUpSchema = z
  .object({
    name: nameSchema,
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Informe um e-mail válido.")),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `A senha pode ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.input<typeof signUpSchema>;
