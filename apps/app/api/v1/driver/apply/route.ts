"use server"

import { getUserTokens } from "@/lib/firebase-client/firebase-utils";
import { prisma } from "@/lib/prisma";
import { uploadBase64DriverToCloudinary } from "@/lib/utils/server/base_64";
import { DriverStatus, UserRole } from "@prisma/client";
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
      const { cniBase64, licenseBase64 } = body;

      if (!cniBase64 || !licenseBase64) {
         return NextResponse.json(
            { success: false, error: "CNI and driver document are required" },
            { status: 400 }
         );
      }

      const cniUrl = await uploadBase64DriverToCloudinary(cniBase64);
      const licenseUrl = await uploadBase64DriverToCloudinary(licenseBase64);

      const user = await prisma.user.update({
         where: { authId: token.decodedToken.uid },
         data: {
            cni: cniUrl,
            driverDocument: licenseUrl,
            driverStatus: DriverStatus.PENDING,
            roles: {
               push: UserRole.driver,
            },
         },
      });

      console.log('user', user);
      return NextResponse.json({ success: true, data: user });
   } catch (error) {
      console.error("Error uploading driver documents:", error);
      return NextResponse.json(
         {
            success: false,
            error: error instanceof Error ? error.message : "Failed to upload documents",
         },
         { status: 500 }
      );
   }
}