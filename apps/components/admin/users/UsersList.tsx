"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Shield, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/hooks/use-inline-translation";
import { UserRole } from "@prisma/client";
import UserRoleDialog from "./UserRoleDialog";
import DeleteUserDialog from "./DeleteUserDialog";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    roles: UserRole[];
    driverStatus: string | null;
    emailVerified: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    _count: {
        orders: number;
    };
}

interface UsersListProps {
    users: User[];
}

export default function UsersList({ users }: UsersListProps) {
    const t = useT();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const currentSearch = searchParams.get("search") || "";
    const currentRole = searchParams.get("role") || "all";
    const currentDriverStatus = searchParams.get("driverStatus") || "all";

    const handleSearchChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("search", value);
        } else {
            params.delete("search");
        }
        router.push(`/admin/users?${params.toString()}`);
    };

    const handleRoleFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value !== "all") {
            params.set("role", value);
        } else {
            params.delete("role");
        }
        router.push(`/admin/users?${params.toString()}`);
    };

    const handleDriverStatusFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value !== "all") {
            params.set("driverStatus", value);
        } else {
            params.delete("driverStatus");
        }
        router.push(`/admin/users?${params.toString()}`);
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case "super_admin":
                return "bg-red-500/10 text-red-700 border-red-500/20";
            case "merchant":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20";
            case "driver":
                return "bg-green-500/10 text-green-700 border-green-500/20";
            case "customer":
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }
    };

    const getDriverStatusBadge = (status: string | null) => {
        if (!status) return null;

        const colors = {
            APPROVED: "bg-green-500/10 text-green-700 border-green-500/20",
            PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
            REJECTED: "bg-red-500/10 text-red-700 border-red-500/20",
            BANNED: "bg-red-700/10 text-red-900 border-red-700/20",
        };

        return (
            <Badge variant="outline" className={colors[status as keyof typeof colors]}>
                {t(status)}
            </Badge>
        );
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("Search by name, email, or phone...")}
                        defaultValue={currentSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={currentRole} onValueChange={handleRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t("Filter by role")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Roles")}</SelectItem>
                        <SelectItem value="customer">{t("Customer")}</SelectItem>
                        <SelectItem value="driver">{t("Driver")}</SelectItem>
                        <SelectItem value="merchant">{t("Merchant")}</SelectItem>
                        <SelectItem value="admin">{t("Admin")}</SelectItem>
                        <SelectItem value="super_admin">{t("Super Admin")}</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={currentDriverStatus} onValueChange={handleDriverStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t("Driver status")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Statuses")}</SelectItem>
                        <SelectItem value="APPROVED">{t("Approved")}</SelectItem>
                        <SelectItem value="PENDING">{t("Pending")}</SelectItem>
                        <SelectItem value="REJECTED">{t("Rejected")}</SelectItem>
                        <SelectItem value="BANNED">{t("Banned")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                {t("Showing {count} users", { count: users.length })}
            </div>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    {users.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">{t("No users found")}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {t("Try adjusting your search or filters")}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("User")}</TableHead>
                                        <TableHead>{t("Contact")}</TableHead>
                                        <TableHead>{t("Roles")}</TableHead>
                                        <TableHead>{t("Driver Status")}</TableHead>
                                        <TableHead>{t("Orders")}</TableHead>
                                        <TableHead>{t("Joined")}</TableHead>
                                        <TableHead className="text-right">{t("Actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.image || undefined} />
                                                        <AvatarFallback>
                                                            {user.name?.[0]?.toUpperCase() ||
                                                                user.email[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name || t("No name")}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.phone ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        {user.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        {t("No phone")}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="outline"
                                                            className={getRoleBadgeColor(role)}
                                                        >
                                                            {t(role)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getDriverStatusBadge(user.driverStatus)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">
                                                    {user._count.orders}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {user.createdAt ? t.formatDateTime(user.createdAt) : "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setRoleDialogOpen(true);
                                                            }}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            {t("Manage Roles")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            {t("Delete User")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            {selectedUser && (
                <>
                    <UserRoleDialog
                        open={roleDialogOpen}
                        onOpenChange={setRoleDialogOpen}
                        user={selectedUser}
                    />
                    <DeleteUserDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        user={selectedUser}
                    />
                </>
            )}
        </div>
    );
}