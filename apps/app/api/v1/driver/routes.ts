import { getUserTokens } from "@/lib/firebase-client/firebase-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const token = await getUserTokens();

      if (!token?.decodedToken?.uid) {
         return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
         );
      }

      const body = await request.json();
      const { cni, driverDocument } = body;

      if (!cni || !driverDocument) {
         return NextResponse.json(
            { success: false, error: "CNI and driver document are required" },
            { status: 400 }
         );
      }

      // Update user with driver documents and status
      const user = await prisma.user.update({
         where: { authId: token.decodedToken.uid },
         data: {
            cni,
            driverDocument,
            driverStatus: "PENDING",
            roles: {
               set: ["driver", "customer"],
            },
         },
      });

      return NextResponse.json({
         success: true,
         data: user,
         message: "Driver application submitted successfully",
      });
   } catch (error) {
      console.error("Error updating user to driver:", error);
      return NextResponse.json(
         {
            success: false,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to submit driver application",
         },
         { status: 500 }
      );
   }
}