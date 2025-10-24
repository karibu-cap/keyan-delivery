import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const user = await prisma.user.findUnique({
            where: {
                id: params.id,
            },
            include: {
                merchantManagers: {
                    include: {
                        merchant: true,
                    },
                },
                wallet: true,
            },
        })
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 403 })
        }
        return NextResponse.json({ success: true, data: { user: user, merchants: user.merchantManagers.map((manager) => manager.merchant) } })
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 })
    }
}