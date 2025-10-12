"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign } from "lucide-react";

interface WithdrawalFormProps {
   availableBalance: number;
   onSuccess?: () => void;
}

export function WithdrawalForm({ availableBalance, onSuccess }: WithdrawalFormProps) {
   const { toast } = useToast();
   const [amount, setAmount] = useState("");
   const [mtnNumber, setMtnNumber] = useState("");
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const withdrawalAmount = parseFloat(amount);

      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
         toast({
            title: "Invalid amount",
            description: "Please enter a valid amount",
            variant: "destructive",
         });
         return;
      }

      if (withdrawalAmount > availableBalance) {
         toast({
            title: "Insufficient balance",
            description: `You only have $${availableBalance.toFixed(2)} available`,
            variant: "destructive",
         });
         return;
      }

      if (!mtnNumber.trim()) {
         toast({
            title: "Phone number required",
            description: "Please enter your MTN Mobile Money number",
            variant: "destructive",
         });
         return;
      }

      // Validate Kenyan phone number format
      const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
      if (!phoneRegex.test(mtnNumber.replace(/\s/g, ""))) {
         toast({
            title: "Invalid phone number",
            description: "Please enter a valid Kenyan MTN number",
            variant: "destructive",
         });
         return;
      }

      setLoading(true);

      try {
         const response = await fetch("/api/v1/driver/withdrawal", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               amount: withdrawalAmount,
               mtnNumber: mtnNumber.replace(/\s/g, ""),
            }),
         });

         const data = await response.json();

         if (data.success) {
            toast({
               title: "Withdrawal request submitted",
               description: `$${withdrawalAmount.toFixed(2)} will be sent to ${mtnNumber}`,
               variant: "default",
            });
            setAmount("");
            setMtnNumber("");
            if (onSuccess) {
               onSuccess();
            }
         } else {
            throw new Error(data.error || "Failed to process withdrawal");
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
      <Card className="rounded-2xl shadow-card">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <DollarSign className="w-5 h-5 text-primary" />
               Withdraw Funds
            </CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-primary">
                     ${availableBalance.toFixed(2)}
                  </p>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount *</Label>
                  <Input
                     id="amount"
                     type="number"
                     step="0.01"
                     min="0"
                     max={availableBalance}
                     placeholder="0.00"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     disabled={loading}
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="mtnNumber">MTN Mobile Money Number *</Label>
                  <Input
                     id="mtnNumber"
                     type="tel"
                     placeholder="+254 712 345 678"
                     value={mtnNumber}
                     onChange={(e) => setMtnNumber(e.target.value)}
                     disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                     Enter your Kenyan MTN Mobile Money number
                  </p>
               </div>

               <Button
                  type="submit"
                  className="w-full rounded-2xl"
                  disabled={loading || availableBalance <= 0}
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