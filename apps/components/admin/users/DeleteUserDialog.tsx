"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useT } from "@/hooks/use-inline-translation";
import { deleteUser } from "@/lib/actions/server/admin/users";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

interface DeleteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        id: string;
        name: string;
        email: string;
        _count: {
            orders: number;
        };
    };
}

export default function DeleteUserDialog({ open, onOpenChange, user }: DeleteUserDialogProps) {
    const t = useT();
    const router = useRouter();
    const [confirmText, setConfirmText] = useState("");



    const {
        execute: deleteUserExec,
        isExecuting: isDeleting,
    } = useAction(deleteUser, {
        onSuccess: () => {
            toast({
                title: t("User deleted"),
                description: t("The user has been permanently deleted"),
            });
            router.refresh();
            onOpenChange(false);
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot delete user"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to delete user"),
                    variant: "destructive",
                });
            }
        },
    });

    const handleDelete = async () => {
        if (confirmText !== "DELETE") {
            toast({
                title: t("Error"),
                description: t("Please type DELETE to confirm"),
                variant: "destructive",
            });
            return;
        }
        deleteUserExec({ userId: user.id });
    };

    const handleClose = () => {
        setConfirmText("");
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-primary dark:text-red-400" />
                        </div>
                        <AlertDialogTitle>{t("Delete User")}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="space-y-3">
                        <p>
                            {t("Are you sure you want to delete")} <strong>{user.name || user.email}</strong>?
                        </p>
                        <p className="text-destructive font-semibold">
                            {t("This action cannot be undone. All user data will be permanently deleted.")}
                        </p>
                        {user._count.orders > 0 && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    ⚠️ {t("This user has {count} orders. Deletion may fail.", { count: user._count.orders })}
                                </p>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <Label htmlFor="confirm" className="text-sm">
                        {t("Type")} <strong className="text-destructive">DELETE</strong> {t("to confirm")}
                    </Label>
                    <Input
                        id="confirm"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="mt-2"
                        disabled={isDeleting}
                    />
                </div>

                <AlertDialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                        {t("Cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || confirmText !== "DELETE"}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("Deleting...")}
                            </>
                        ) : (
                            t("Delete User")
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}