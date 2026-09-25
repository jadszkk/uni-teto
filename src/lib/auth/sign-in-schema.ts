import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),
  // Sem regra de tamanho: quem valida a senha é o servidor
  password: z.string().min(1, "Informe sua senha."),
});

export type SignInInput = z.input<typeof signInSchema>;
