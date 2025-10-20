"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import { TransactionStatus } from "@prisma/client";
import { useTransactions } from "@/hooks/use-transactions";
import { useEffect } from "react";

export function TransactionHistory() {
   const { transactions, loading, error, refreshTransactions } = useTransactions();

   useEffect(() => {
      refreshTransactions();
   }, [refreshTransactions]);

   const getStatusColor = (status: TransactionStatus) => {
      switch (status) {
         case TransactionStatus.COMPLETED:
            return "bg-success text-success-foreground";
         case TransactionStatus.PENDING:
            return "bg-warning text-warning-foreground";
         case TransactionStatus.FAILED:
            return "bg-destructive text-destructive-foreground";
         default:
            return "bg-muted text-muted-foreground";
      }
   };

   if (loading) {
      return (
         <Card className="rounded-2xl shadow-card">
            <CardContent className="p-8 text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
               <p className="text-muted-foreground">Loading transactions...</p>
            </CardContent>
         </Card>
      );
   }

   if (error) {
      return (
         <Card className="rounded-2xl shadow-card">
            <CardContent className="p-8 text-center">
               <p className="text-destructive mb-2">Error loading transactions</p>
               <p className="text-muted-foreground">{error}</p>
            </CardContent>
         </Card>
      );
   }

   return (
      <Card className="rounded-2xl shadow-card">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Clock className="w-5 h-5 text-primary" />
               Transaction History
            </CardTitle>
         </CardHeader>
         <CardContent>
            {transactions.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {transactions.map((transaction) => (
                     <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                     >
                        <div className="flex items-center gap-3">
                           <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "credit"
                                 ? "bg-success/10"
                                 : "bg-destructive/10"
                                 }`}
                           >
                              {transaction.type === "credit" ? (
                                 <ArrowDownCircle className="w-5 h-5 text-success" />
                              ) : (
                                 <ArrowUpCircle className="w-5 h-5 text-destructive" />
                              )}
                           </div>
                           <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                 {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                 })}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                           </Badge>
                           <p
                              className={`text-lg font-bold ${transaction.type === "credit" ? "text-success" : "text-destructive"
                                 }`}
                           >
                              {transaction.type === "credit" ? "+" : "-"}$
                              {transaction.amount.toFixed(2)}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </CardContent>
      </Card>
   );
}