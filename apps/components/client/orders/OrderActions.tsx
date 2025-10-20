"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useT } from "@/hooks/use-inline-translation"
import Link from "next/link"
import { formatOrderId } from "@/lib/orders-utils"

interface OrderActionsProps {
    orderId: string
    status: string
}

export function OrderActions({
    orderId,
    status,
}: OrderActionsProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const t = useT()

    const handleViewReceipt = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/v1/orders/${orderId}/receipt`)

            if (!response.ok) {
                throw new Error("Failed to fetch receipt")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `order-${formatOrderId(orderId)}-receipt.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast({
                title: t("Receipt downloaded"),
                description: t("Your receipt has been downloaded successfully"),
            })
        } catch (error) {
            console.error("Error downloading receipt:", error)
            toast({
                title: t("Error"),
                description: t("Failed to download receipt. Please try again."),
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [orderId])

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <Button
                variant="outline"
                className="flex-1"
                onClick={handleViewReceipt}
                disabled={loading}
            >
                {t("View Receipt")}
            </Button>

            {status === "ON_THE_WAY" && (
                <Button className="flex-1 bg-primary hover:bg-[#089808]" asChild>
                    <Link href={`/orders/${orderId}/track`}>
                        {t("Track Order")}
                    </Link>
                </Button>
            )}
        </div>
    )
}