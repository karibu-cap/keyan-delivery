import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getUserTokens } from "@/lib/firebase-client/firebase-utils"

import { prisma } from "@/lib/prisma"
import { UserProfile } from "@/components/customer/UserProfile"

export default async function ProfilePage() {
  const token = await getUserTokens();

  if (!token?.decodedToken?.uid) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold">Authentication Required</h2>
            <p className="mb-6 text-muted-foreground">Please sign in to view your orders</p>
            <Link href="/sign-in">
              <Button className="bg-[#0aad0a] hover:bg-[#089808]">Sign In</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  if (!token?.decodedToken?.uid) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold">Authentication Required</h2>
            <p className="mb-6 text-muted-foreground">Please sign in to view your orders</p>
            <Link href="/sign-in">
              <Button className="bg-[#0aad0a] hover:bg-[#089808]">Sign In</Button>
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
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold">User Not Found</h2>
            <p className="mb-6 text-muted-foreground">Please contact support if this issue persists</p>
            <Link href="/">
              <Button className="bg-[#0aad0a] hover:bg-[#089808]">Go Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }


  return <UserProfile user={user} />

}
