import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { DomainNotAllowedError, resolveUniversityId } from "./email-domain";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./sign-up-schema";

/**
 * Configuração do Better Auth (lado do servidor).
 * Rotas HTTP em /api/auth/* (src/app/api/auth/[...all]/route.ts).
 * Lê BETTER_AUTH_SECRET e BETTER_AUTH_URL do ambiente.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    // O login entra na #19 e a verificação de e-mail na #18
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      // `input: false`: o cliente não pode enviar esses campos no cadastro
      universityId: { type: "string", required: false, input: false },
      whatsapp: { type: "string", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Só aceita e-mail de domínio institucional cadastrado e já vincula
        // o usuário à universidade. Vale para qualquer forma de cadastro.
        before: async (user) => {
          try {
            const universityId = await resolveUniversityId(
              user.email,
              (domain) =>
                prisma.university.findUnique({
                  where: { emailDomain: domain },
                  select: { id: true },
                }),
            );
            return { data: { ...user, universityId } };
          } catch (error) {
            if (error instanceof DomainNotAllowedError) {
              throw new APIError("BAD_REQUEST", {
                code: "EMAIL_DOMAIN_NOT_ALLOWED",
                message: error.message,
              });
            }
            throw error;
          }
        },
      },
    },
  },
  // Permite que Server Actions definam os cookies de sessão
  plugins: [nextCookies()],
});
