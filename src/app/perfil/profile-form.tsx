"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  profileSchema,
  type ProfileData,
  type ProfileInput,
} from "@/lib/profile/profile-schema";
import { updateProfile } from "./actions";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: ProfileInput;
}) {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileInput, unknown, ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit() {
    setSaved(false);
    // Manda o que foi digitado: o servidor valida e normaliza de novo
    const values = getValues();
    const result = await updateProfile(values);
    if (result.ok) {
      reset(values);
      setSaved(true);
      return;
    }

    for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
      setError(field as keyof ProfileInput, { message: messages[0] });
    }
    if (result.message) setError("root", { message: result.message });
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
          id="whatsapp"
          label="WhatsApp (opcional)"
          description="Aparece nos seus anúncios para os interessados falarem com você."
          error={errors.whatsapp}
        >
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(86) 99999-8888"
            aria-invalid={!!errors.whatsapp}
            {...register("whatsapp")}
          />
        </FormField>

        <FieldError errors={[errors.root]} />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
          {saved && !isDirty && (
            <p role="status" className="text-sm text-muted-foreground">
              Alterações salvas.
            </p>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
