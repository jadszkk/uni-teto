export type EmailContent = { subject: string; text: string; html: string };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** E-mail com o link de confirmação enviado após o cadastro. */
export function verificationEmail({
  name,
  url,
  expiresInHours,
}: {
  name: string;
  url: string;
  expiresInHours: number;
}): EmailContent {
  const subject = "Confirme seu e-mail no UniTeto";
  const text = [
    `Olá, ${name}!`,
    "",
    "Para ativar sua conta no UniTeto, confirme seu e-mail abrindo o link abaixo:",
    url,
    "",
    `O link vale por ${expiresInHours} horas. Se você não criou uma conta, ignore este e-mail.`,
  ].join("\n");

  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);
  const html = `<p>Olá, ${safeName}!</p>
<p>Para ativar sua conta no UniTeto, confirme seu e-mail:</p>
<p><a href="${safeUrl}">Confirmar e-mail</a></p>
<p>Se o botão não funcionar, copie e cole este endereço no navegador:<br>${safeUrl}</p>
<p>O link vale por ${expiresInHours} horas. Se você não criou uma conta, ignore este e-mail.</p>`;

  return { subject, text, html };
}
