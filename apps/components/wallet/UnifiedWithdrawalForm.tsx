// File: /components/wallet/UnifiedWithdrawalForm.tsx
// Unified withdrawal form for all user types

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, WalletIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MIN_WITHDRAWAL_AMOUNT = 500; // KES

// Country codes supportés
const COUNTRY_CODES = [
    { code: '+254', country: 'Kenya', flag: '🇰🇪', regex: /^[17]\d{8}$/ },
    // On peut ajouter d'autres pays plus tard
    // { code: '+256', country: 'Uganda', flag: '🇺🇬', regex: /^[37]\d{8}$/ },
    // { code: '+255', country: 'Tanzania', flag: '🇹🇿', regex: /^[67]\d{8}$/ },
];

export type WalletUserType = 'driver' | 'merchant' | 'customer';

interface UnifiedWithdrawalFormProps {
    availableBalance: number;
    userType: WalletUserType;
    onSuccess?: () => void;
    hasPendingWithdrawal?: boolean;
    merchantId?: string; // Required for merchant withdrawals
}

export function UnifiedWithdrawalForm({
    availableBalance,
    userType,
    onSuccess,
    hasPendingWithdrawal = false,
    merchantId
}: UnifiedWithdrawalFormProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState('+254');
    const [loading, setLoading] = useState(false);

    // Validation du formulaire
    const isAmountValid = () => {
        if (amount.trim() === '') return null; // Pas encore touché
        const withdrawalAmount = parseFloat(amount);

        // Si balance est 0, montrer un message spécial
        if (availableBalance === 0) return false;

        return (
            !isNaN(withdrawalAmount) &&
            withdrawalAmount >= MIN_WITHDRAWAL_AMOUNT &&
            withdrawalAmount <= availableBalance
        );
    };

    const isPhoneValid = () => {
        if (phoneNumber.trim() === '') return null; // Pas encore touché

        // Trouver le pays sélectionné
        const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
        if (!selectedCountry) return false;

        // Valider selon le regex du pays
        return selectedCountry.regex.test(phoneNumber.replace(/\s/g, ""));
    };

    const isFormValid = () => {
        return isAmountValid() === true && isPhoneValid() === true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const withdrawalAmount = parseFloat(amount);

        // Validate amount
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        // Check minimum withdrawal
        if (withdrawalAmount < MIN_WITHDRAWAL_AMOUNT) {
            toast({
                title: "Amount too low",
                description: `Minimum withdrawal amount is KES ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`,
                variant: "destructive",
            });
            return;
        }

        // Check balance
        if (withdrawalAmount > availableBalance) {
            toast({
                title: "Insufficient balance",
                description: `You only have KES ${availableBalance.toFixed(2)} available`,
                variant: "destructive",
            });
            return;
        }

        // Validate phone number
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            toast({
                title: "Phone number required",
                description: "Please enter your mobile money number",
                variant: "destructive",
            });
            return;
        }

        const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
        if (!selectedCountry || !selectedCountry.regex.test(phoneNumber.replace(/\s/g, ""))) {
            toast({
                title: "Invalid phone number",
                description: `Please enter a valid ${selectedCountry?.country} mobile number`,
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Construire le numéro complet avec country code
            const fullPhoneNumber = countryCode + phoneNumber.replace(/\s/g, "");

            const response = await fetch("/api/v1/wallet/withdrawal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: withdrawalAmount,
                    phoneNumber: fullPhoneNumber,
                    userType,
                    ...(userType === 'merchant' && merchantId ? { merchantId } : {}),
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Withdrawal request submitted",
                    description: `KES ${withdrawalAmount.toFixed(2)} will be sent to ${phoneNumber}`,
                    variant: "default",
                });
                setAmount("");
                setPhoneNumber("");
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                throw new Error(data.message || "Failed to process withdrawal");
            }
        } catch (error) {
            toast({
                title: "Withdrawal failed",
                description: error instanceof Error ? error.message : "Please try again",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="rounded-2xl shadow-card animate-in fade-in slide-in-from-left-4 duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <WalletIcon className="w-5 h-5 text-primary" />
                    Withdraw Funds
                </CardTitle>
            </CardHeader>
            <CardContent className="animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                {/* Alert si balance insuffisante */}
                {availableBalance < MIN_WITHDRAWAL_AMOUNT && (
                    <Alert className="mb-4 border-red-200 bg-red-50 animate-in fade-in zoom-in duration-300">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            <strong>Insufficient Balance!</strong>
                            <br />
                            You need at least <strong>KES {MIN_WITHDRAWAL_AMOUNT.toFixed(2)}</strong> to withdraw.
                            <br />
                            Current balance: <strong>KES {availableBalance.toFixed(2)}</strong>
                            <br />
                            {availableBalance === 0
                                ? '💡 Start earning by completing deliveries!'
                                : `💡 You need KES ${(MIN_WITHDRAWAL_AMOUNT - availableBalance).toFixed(2)} more.`
                            }
                        </AlertDescription>
                    </Alert>
                )}

                {/* Alert si withdrawal en cours */}
                {hasPendingWithdrawal && (
                    <Alert className="mb-4 border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            You have a pending withdrawal. Please wait for it to complete before requesting another.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 bg-accent/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                        <p className="text-2xl font-bold text-primary">
                            KES {availableBalance.toFixed(2)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Withdrawal Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min={MIN_WITHDRAWAL_AMOUNT}
                            max={availableBalance}
                            placeholder={`Min: ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading || hasPendingWithdrawal}
                            className={
                                isAmountValid() === false
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : isAmountValid() === true
                                        ? 'border-green-500 focus-visible:ring-green-500'
                                        : ''
                            }
                        />
                        <p className={`text-xs ${isAmountValid() === false ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {isAmountValid() === false
                                ? availableBalance === 0
                                    ? '⚠️ Insufficient balance. You need to earn money first!'
                                    : `Amount must be between KES ${MIN_WITHDRAWAL_AMOUNT} and KES ${availableBalance.toFixed(2)}`
                                : `Minimum withdrawal: KES ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`
                            }
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Mobile Money Number *</Label>
                        <div className="flex gap-2">
                            {/* Country Code Selector */}
                            <Select value={countryCode} onValueChange={setCountryCode}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRY_CODES.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{country.flag}</span>
                                                <span>{country.code}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Phone Number Input */}
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="712 345 678"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={loading || hasPendingWithdrawal}
                                className={cn(
                                    "flex-1",
                                    isPhoneValid() === false
                                        ? 'border-red-500 focus-visible:ring-red-500'
                                        : isPhoneValid() === true
                                            ? 'border-green-500 focus-visible:ring-green-500'
                                            : ''
                                )}
                            />
                        </div>
                        <p className={`text-xs ${isPhoneValid() === false ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {isPhoneValid() === false
                                ? `Invalid format. Example: 712345678 or 112345678`
                                : `Enter your ${COUNTRY_CODES.find(c => c.code === countryCode)?.country} mobile number`
                            }
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-2xl"
                        disabled={loading || availableBalance < MIN_WITHDRAWAL_AMOUNT || hasPendingWithdrawal || !isFormValid()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Request Withdrawal"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
