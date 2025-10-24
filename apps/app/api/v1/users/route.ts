import { prisma } from '@/lib/prisma'
import { DriverStatus, User, UserRole } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  const data = await request.json()
  if (!data.email || !data.id) {
    return NextResponse.json('Invalid data: email and id are required', { status: 400 })
  }

  // Find user by UID
  const user = await prisma.user.findUnique({
    where: {
      id: data.id,
    },
  });

  if (user) {
    return NextResponse.json({ success: true, data: user }, { status: 201 })
  }

  try {
    // Validate driver requirements
    if (data.roles && data.roles.includes(UserRole.driver)) {
      if (!data.cni || !data.driverDocument) {
        return NextResponse.json(
          'CNI and driver document are required for driver registration',
          { status: 400 }
        )
      }
    }

    const userRoles = data.roles && data.roles.length > 0
      ? data.roles
      : [UserRole.customer]

    // Prepare user data
    const userData: Partial<User> = {
      email: data.email,
      id: data.id,
      name: data.name || null,
      phone: data.phone || null,
      roles: userRoles,
    }

    // Add driver-specific fields if user is a driver
    if (userRoles.includes(UserRole.driver)) {
      userData.cni = data.cni
      userData.driverDocument = data.driverDocument
      userData.driverStatus = DriverStatus.PENDING
    }

    const user = await prisma.user.create({
      data: userData as User,
    })

    // Create wallet for the user
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: 'USD',
      },
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error },
      { status: 500 }
    )
  }
}
