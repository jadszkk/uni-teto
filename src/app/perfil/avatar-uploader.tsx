"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AVATAR_FORMATS } from "@/lib/cloudinary/avatar-url";
import { getAvatarUploadParams, saveAvatar } from "./actions";

const MAX_SIZE_MB = 5;
const ACCEPT = AVATAR_FORMATS.map((format) =>
  format === "jpg" ? "image/jpeg" : `image/${format}`,
).join(",");

/**
 * Envia a foto direto do navegador para o Cloudinary (a imagem não passa pelo
 * nosso servidor) usando a assinatura gerada em `getAvatarUploadParams`.
 */
export function AvatarUploader({ enabled }: { enabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use uma imagem JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`A imagem pode ter no máximo ${MAX_SIZE_MB} MB.`);
      return;
    }

    setStatus("uploading");
    try {
      const params = await getAvatarUploadParams();
      if (!params) throw new Error("Cloudinary não configurado");

      const body = new FormData();
      body.append("file", file);
      for (const [key, value] of Object.entries(params.fields)) {
        body.append(key, String(value));
      }

      const response = await fetch(params.uploadUrl, { method: "POST", body });
      if (!response.ok) throw new Error(`Cloudinary: ${response.status}`);
      const { secure_url } = (await response.json()) as { secure_url: string };

      const result = await saveAvatar(secure_url);
      if (!result.ok) throw new Error(result.message);
    } catch {
      setError("Não foi possível enviar a foto. Tente novamente.");
    } finally {
      setStatus("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!enabled || status === "uploading"}
        onClick={() => inputRef.current?.click()}
      >
        {status === "uploading" ? "Enviando..." : "Alterar foto"}
      </Button>
      {!enabled && (
        <p className="text-xs text-muted-foreground">
          Envio de foto indisponível no momento.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
