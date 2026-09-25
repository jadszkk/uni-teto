import { describe, expect, it } from "vitest";
import { verificationEmail } from "./templates";

const url =
  "http://localhost:3000/api/auth/verify-email?token=abc&callbackURL=%2F";

describe("verificationEmail", () => {
  it("inclui o nome, o link e a validade no texto", () => {
    const email = verificationEmail({ name: "Maria", url, expiresInHours: 24 });

    expect(email.subject).toBe("Confirme seu e-mail no UniTeto");
    expect(email.text).toContain("Olá, Maria!");
    expect(email.text).toContain(url);
    expect(email.text).toContain("24 horas");
  });

  it("coloca o link no HTML escapando o &", () => {
    const { html } = verificationEmail({
      name: "Maria",
      url,
      expiresInHours: 24,
    });
    expect(html).toContain(
      'href="http://localhost:3000/api/auth/verify-email?token=abc&amp;callbackURL=%2F"',
    );
  });

  it("escapa HTML no nome do usuário", () => {
    const { html } = verificationEmail({
      name: '<script>alert("x")</script>',
      url,
      expiresInHours: 24,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });
});
