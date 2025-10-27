"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useT } from "@/hooks/use-inline-translation";
import { updateUserRole } from "@/lib/actions/server/admin/users";
import { UserRole } from "@prisma/client";
import { Loader2, Shield, Store, Truck, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

interface UserRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        id: string;
        name: string;
        email: string;
        roles: UserRole[];
    };
}



export default function UserRoleDialog({ open, onOpenChange, user }: UserRoleDialogProps) {
    const t = useT();
    const router = useRouter();
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(user.roles);

    const handleRoleToggle = (role: UserRole) => {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    };

    const AVAILABLE_ROLES = [
        {
            value: UserRole.customer,
            label: t("Customer"),
            description: t("Can place orders and shop"),
            icon: User,
            color: "text-gray-600",
        },
        {
            value: UserRole.driver,
            label: t("Driver"),
            description: t("Can deliver orders"),
            icon: Truck,
            color: "text-green-600",
        },
        {
            value: UserRole.merchant,
            label: t("Merchant"),
            description: t("Can manage stores and products"),
            icon: Store,
            color: "text-blue-600",
        },
        {
            value: UserRole.super_admin,
            label: t("Super Admin"),
            description: t("Can manage users and content"),
            icon: Shield,
            color: "text-purple-600",
        },
    ];

    const {
        execute: updateUserRoleExec,
        isExecuting: isUpdating,
    } = useAction(updateUserRole, {
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot update roles"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to update user roles"),
                    variant: "destructive",
                });
            }
        },
    });

    const handleSave = async () => {

        try {
            // Determine roles to add and remove
            const rolesToAdd = selectedRoles.filter((role) => !user.roles.includes(role));
            const rolesToRemove = user.roles.filter((role) => !selectedRoles.includes(role));

            // Add roles
            for (const role of rolesToAdd) {
                updateUserRoleExec({ userId: user.id, role, action: "add" });
            }

            // Remove roles
            for (const role of rolesToRemove) {
                updateUserRoleExec({ userId: user.id, role, action: "remove" });
            }

            router.refresh();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to update user roles"),
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("Manage User Roles")}</DialogTitle>
                    <DialogDescription>
                        {t("Select roles for")} <strong>{user.name || user.email}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Roles */}
                    <div>
                        <Label className="text-sm font-medium">{t("Current Roles")}</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                    <Badge key={role} variant="secondary">
                                        {role}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">{t("No roles assigned")}</p>
                            )}
                        </div>
                    </div>

                    {/* Available Roles */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">{t("Available Roles")}</Label>
                        <div className="space-y-3">
                            {AVAILABLE_ROLES.map((role) => {
                                const Icon = role.icon;
                                const isChecked = selectedRoles.includes(role.value);

                                return (
                                    <div
                                        key={role.value}
                                        className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${isChecked
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                        onClick={() => handleRoleToggle(role.value)}
                                    >
                                        <Checkbox
                                            id={role.value}
                                            checked={isChecked}
                                            onCheckedChange={() => handleRoleToggle(role.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-4 w-4 ${role.color}`} />
                                                <Label
                                                    htmlFor={role.value}
                                                    className="font-semibold cursor-pointer"
                                                >
                                                    {role.label}
                                                </Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {role.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Warning for Super Admin */}
                    {selectedRoles.includes(UserRole.super_admin) && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                ⚠️ {t("Super Admin role grants full access to the platform. Use with caution.")}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                        {t("Cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("Saving...")}
                            </>
                        ) : (
                            t("Save Changes")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}