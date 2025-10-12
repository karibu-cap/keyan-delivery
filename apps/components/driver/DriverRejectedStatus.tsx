"use client";

import { Card } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { DriverStatus } from "@prisma/client";

interface DriverRejectedStatusProps {
    driverStatus: DriverStatus;
}

export function DriverRejectedStatus({ driverStatus }: DriverRejectedStatusProps) {
    const isBanned = driverStatus === DriverStatus.BANNED;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Card className="p-12 rounded-2xl shadow-card max-w-2xl mx-auto text-center border-red-500">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-4 text-red-600">
                        {isBanned ? "Compte banni" : "Demande rejetée"}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        {isBanned
                            ? "Votre compte chauffeur a été banni."
                            : "Votre demande pour devenir chauffeur a été rejetée."}
                    </p>
                    <div className="bg-red-50 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            {isBanned
                                ? "Veuillez contacter l'administrateur pour plus d'informations."
                                : "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur."}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}