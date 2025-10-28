// File: /components/wallet/WithdrawalStatusCard.tsx
// Card showing the status of the latest withdrawal

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, Loader2, Wallet } from "lucide-react";
import { WithdrawalStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface WithdrawalData {
    id: string;
    amount: number;
    phoneNumber: string;
    status: WithdrawalStatus;
    createdAt: Date;
    transaction: {
        id: string;
        status: string;
    };
}

interface WithdrawalStatusCardProps {
    withdrawal: WithdrawalData | null;
}

export function WithdrawalStatusCard({ withdrawal }: WithdrawalStatusCardProps) {
    if (!withdrawal) {
        return (
            <Card className="rounded-2xl shadow-card border-dashed animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader>
                    <CardTitle className="text-base">Latest Withdrawal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-700">
                            <div className="p-4 bg-muted/50 rounded-full">
                                <Wallet className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm text-muted-foreground">No withdrawal requests yet</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusConfig = (status: WithdrawalStatus) => {
        switch (status) {
            case WithdrawalStatus.COMPLETED:
                return {
                    icon: CheckCircle2,
                    color: "text-green-600",
                    bgColor: "bg-green-50 dark:bg-green-950/20",
                    borderColor: "border-green-200 dark:border-green-800",
                    title: "Withdrawal Successful",
                    message: "Your money has been sent successfully!",
                };
            case WithdrawalStatus.FAILED:
            case WithdrawalStatus.INITIALIZATION_FAILED:
                return {
                    icon: XCircle,
                    color: "text-red-600",
                    bgColor: "bg-red-50 dark:bg-red-950/20",
                    borderColor: "border-red-200 dark:border-red-800",
                    title: "Withdrawal Failed",
                    message: "Your withdrawal request failed. Please try again.",
                };
            case WithdrawalStatus.PENDING:
            case WithdrawalStatus.INITIALIZATION:
                return {
                    icon: Loader2,
                    color: "text-orange-600",
                    bgColor: "bg-orange-50 dark:bg-orange-950/20",
                    borderColor: "border-orange-200 dark:border-orange-800",
                    title: "Withdrawal In Progress",
                    message: "Please be patient, your money is on the way!",
                    animate: true,
                };
            default:
                return {
                    icon: Clock,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50 dark:bg-gray-950/20",
                    borderColor: "border-gray-200 dark:border-gray-800",
                    title: "Withdrawal Pending",
                    message: "Your withdrawal is being processed.",
                };
        }
    };

    const config = getStatusConfig(withdrawal.status);
    const Icon = config.icon;

    return (
        <Card className={cn(
            "rounded-2xl shadow-card border-2 animate-in fade-in slide-in-from-right-4 duration-500",
            config.borderColor, 
            config.bgColor
        )}>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", config.color, config.animate && "animate-spin")} />
                    {config.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-2xl font-bold">KES {withdrawal.amount.toFixed(2)}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                    <p className="font-medium">{withdrawal.phoneNumber}</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                    <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {withdrawal.transaction.id}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-sm">
                        {new Date(withdrawal.createdAt).toLocaleString('en-KE', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        })}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", config.bgColor, config.color)}>
                        {withdrawal.status}
                    </div>
                </div>

                {config.message && (
                    <div className={cn("p-3 rounded-lg", config.bgColor)}>
                        <p className={cn("text-sm font-medium", config.color)}>
                            {config.message}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
