import { Button } from "@/components/ui/button"
import Link from "next/link"

import { TABS, UserProfile } from "@/components/client/customer/UserProfile"
import { getServerT } from "@/i18n/server-translations"
import { getSession } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/router"


export default async function ProfilePage() {

  const session = await getSession();

  if (!session?.user) {
    redirect(ROUTES.signIn({ redirect: ROUTES.profile }));
  }

  const t = await getServerT();

  const user = await prisma?.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      merchantManagers: {
        include: {
          merchant: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6">
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold">{t("User Not Found")}</h2>
            <p className="mb-6 text-muted-foreground">{t("Please contact support if this issue persists")}</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-[#089808]">{t("Go Home")}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }


  return <UserProfile user={user} initialValue={TABS.PROFILE} />

}
