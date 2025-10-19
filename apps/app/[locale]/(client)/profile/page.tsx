import { Button } from "@/components/ui/button"
import { getUserTokens } from "@/lib/firebase-client/server-firebase-utils"
import Link from "next/link"

import { UserProfile } from "@/components/client/customer/UserProfile"
import { getT } from "@/i18n/server-translations"
import { prisma } from "@/lib/prisma"
import { getLocale } from "next-intl/server"

export default async function ProfilePage() {
  const token = await getUserTokens();
  const locale = await getLocale();
  const t = await getT(locale);

  if (!token?.decodedToken?.uid) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6">
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold">{t("Authentication Required")}</h2>
            <p className="mb-6 text-muted-foreground">{t("Please sign in to view your orders")}</p>
            <Link href="/sign-in">
              <Button className="bg-[#0aad0a] hover:bg-[#089808]">{t("Sign In")}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  if (!token?.decodedToken?.uid) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6">
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold">{t("Authentication Required")}</h2>
            <p className="mb-6 text-muted-foreground">{t("Please sign in to view your orders")}</p>
            <Link href="/sign-in">
              <Button className="bg-[#0aad0a] hover:bg-[#089808]">{t("Sign In")}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }


  const user = await prisma?.user.findUnique({
    where: {
      authId: token.decodedToken.uid,
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
              <Button className="bg-[#0aad0a] hover:bg-[#089808]">{t("Go Home")}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }


  return <UserProfile user={user} initialValue={locale} />

}
