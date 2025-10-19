import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
   try {
      const token = await getUserTokens();


      if (!token?.decodedToken?.uid) {
         return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
         );
      }

      // Get the user
      const user = await prisma.user.findUnique({
         where: { authId: token.decodedToken.uid },
      });

      if (!user) {
         return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 403 }
         );
      }

      // Find wallet by user Firebase UID
      const wallet = await prisma.wallet.findUnique({
         where: {
            userId: user.id,
         },
      });

      if (wallet) {
         return NextResponse.json({ success: true, data: wallet }, { status: 200 })
      }


   } catch (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
         { error: 'Failed to create user', details: error },
         { status: 500 }
      )
   }
}