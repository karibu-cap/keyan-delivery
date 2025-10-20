"use client";

import { Card } from "@/components/ui/card";

interface WithdrawalInfoProps {
   className?: string;
}

export function WithdrawalInfo({ className }: WithdrawalInfoProps) {
   return (
      <Card className={`p-6 rounded-2xl shadow-card ${className || ""}`}>
         <h3 className="text-lg font-semibold mb-4">Withdrawal Information</h3>
         <div className="space-y-4">
            <div className="bg-accent/50 p-4 rounded-lg">
               <p className="text-sm font-medium mb-2">How it works:</p>
               <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Enter the amount you want to withdraw</li>
                  <li>Provide your MTN Mobile Money number</li>
                  <li>Funds will be sent within 24 hours</li>
                  <li>You'll receive a confirmation SMS</li>
               </ul>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
               <p className="text-sm font-medium mb-2 text-primary">Important:</p>
               <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Minimum withdrawal: $10.00</li>
                  <li>Maximum withdrawal: $1,000.00 per day</li>
                  <li>Ensure your phone number is correct</li>
               </ul>
            </div>
         </div>
      </Card>
   );
}