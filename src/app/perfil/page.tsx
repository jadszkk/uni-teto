import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getCloudinaryConfig } from "@/lib/cloudinary/sign-upload";
import { prisma } from "@/lib/prisma";
import { formatWhatsapp } from "@/lib/profile/whatsapp";
import { AvatarUploader } from "./avatar-uploader";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Meu perfil | UniTeto",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      whatsapp: true,
      university: { select: { name: true, acronym: true } },
    },
  });

  return (
    <main className="flex flex-1 justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1>Meu perfil</h1>
          </CardTitle>
          <CardDescription>
            Seus dados aparecem para quem se interessar pelos seus anúncios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar name={user.name} image={user.image} size={96} />
            <AvatarUploader enabled={getCloudinaryConfig() !== null} />
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">E-mail</dt>
            <dd>{user.email}</dd>
            <dt className="text-muted-foreground">Universidade</dt>
            <dd>
              {user.university
                ? `${user.university.name} (${user.university.acronym})`
                : "Não vinculada"}
            </dd>
          </dl>

          <ProfileForm
            defaultValues={{
              name: user.name,
              whatsapp: user.whatsapp ? formatWhatsapp(user.whatsapp) : "",
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
