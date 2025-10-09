import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  const data = await request.json()

  if (!data.email || !data.authId) {
    return NextResponse.json('Invalid data: email and authId are required', { status: 400 })
  }

  try {
    if (data.roles && data.roles.includes(UserRole.driver)) {
      if (!data.cni || !data.driverDocument) {
        return NextResponse.json(
          'CNI and driver document are required for driver registration',
          { status: 400 }
        )
      }
    }

    const userRoles = data.roles && data.roles.length > 0
      ? data.roles.map((role: string) => role as UserRole)
      : [UserRole.customer]

    const user = await prisma.user.upsert({
      where: {
        authId: data.authId,
      },
      update: {
        email: data.email,
        fullName: data.fullName || null,
        phone: data.phone || null,
        roles: userRoles,
        cni: data.cni || null,
        driverDocument: data.driverDocument || null,
      },
      create: {
        authId: data.authId,
        email: data.email,
        fullName: data.fullName || null,
        phone: data.phone || null,
        roles: userRoles,
        cni: data.cni || null,
        driverDocument: data.driverDocument || null,
      },
    })

    return NextResponse.json(user, { status: 200 })
  } catch (e) {
    console.error('Error creating/updating user:', e)
    return NextResponse.json(`Internal error: ${e}`, { status: 500 })
  }
}
