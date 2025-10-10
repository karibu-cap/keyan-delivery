import { getUserTokens } from '@/lib/firebase-client/firebase-utils'
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

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully'
    }, { status: 200 })
  } catch (e) {
    console.error('Error creating/updating user:', e)
    return NextResponse.json({ success: false, error: `Internal error: ${e}` }, { status: 500 })
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const token = await getUserTokens();

    if (!token?.decodedToken?.uid) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        authId: token.decodedToken.uid,
      },
      include: {
        merchantManagers: {
          include: {
            merchant: {
              include: {
                categories: {
                  select: {
                    category: {
                      select: {
                        id: true,
                        name: true,
                        slug: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        merchants: user.merchantManagers.map(manager => ({
          id: manager.merchant.id,
          businessName: manager.merchant.businessName,
          phone: manager.merchant.phone,
          logoUrl: manager.merchant.logoUrl,
          bannerUrl: manager.merchant.bannerUrl,
          isVerified: manager.merchant.isVerified,
          merchantType: manager.merchant.merchantType,
          address: manager.merchant.address,
          rating: manager.merchant.rating,
          deliveryTime: manager.merchant.deliveryTime,
          categories: manager.merchant.categories.map(cat => cat.category),
          managedAt: manager.assignedAt
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching user merchants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user merchants' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
