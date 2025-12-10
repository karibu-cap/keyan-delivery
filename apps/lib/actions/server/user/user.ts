'use server'
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import z from "zod";
import { ActionError, actionUserClient } from "./user-guard";


export const updateUser = actionUserClient
    .inputSchema(z.object({ id: z.string().min(1), address: z.object({ homeLocation: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(), workLocation: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(), }).nullable().optional() }))
    .action(async ({ parsedInput: { id, address }, ctx }) => {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                address: true,
            },
        });

        if (user?.id != ctx.user.id) {
            throw new ActionError("Unauthorized: user updated");
        }

        if (address?.homeLocation || address?.workLocation) {
            await prisma.user.update({
                where: { id },
                data: { address: { homeLocation: address.homeLocation ?? user.address?.homeLocation, workLocation: address.workLocation ?? user.address?.workLocation } },
            })
        }


        revalidatePath("/profile");
        return { success: true };
    });