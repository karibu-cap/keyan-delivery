import { DriverStatus, UserRole } from '@prisma/client'
import * as z from 'zod'
const required_error = 'This field cannot be blank'
const invalid_type_error = 'Invalid type provided for this field'


export const userSchema = z.object({
    email: z.string().email({ message: invalid_type_error }),
    fullName: z.string().min(2, { message: required_error }),
    password: z.string().min(8, { message: required_error }),
    createdAt: z.date({ message: invalid_type_error }),
    updatedAt: z.date({ message: invalid_type_error }),
    cni: z.instanceof(File).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    driverDocument: z.instanceof(File).optional(),
    driverStatus: z.enum([DriverStatus.PENDING, DriverStatus.APPROVED, DriverStatus.REJECTED, DriverStatus.BANNED]).optional(),
    role: z.enum([UserRole.customer, UserRole.merchant, UserRole.driver, UserRole.business_manager, UserRole.merchant, UserRole.super_admin], { message: invalid_type_error }),
})

export const signInSchema = z.object({
    email: z.string().email({ message: invalid_type_error }),
    password: z.string().min(8, { message: required_error }),
})

export const signUpSchema = z.object({
    fullName: z.string().min(2, { message: required_error }),
    email: z.string().email({ message: invalid_type_error }),
    password: z.string().min(8, { message: required_error }),
    phone: z.string().min(1, { message: required_error }),
    cni: z.instanceof(File).optional(),
    driverDocument: z.instanceof(File).optional(),
    role: z.enum([UserRole.customer, UserRole.merchant, UserRole.driver, UserRole.business_manager, UserRole.merchant, UserRole.super_admin], { message: invalid_type_error }),
})

export const driverApplicationSchema = z.object({
    cni: z.instanceof(File, { message: 'CNI document is required' }),
    driverDocument: z.instanceof(File, { message: 'Driver license is required' }),
}).refine((data) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    return data.cni.size <= maxSize && data.driverDocument.size <= maxSize;
}, {
    message: 'Files must be smaller than 5MB',
}).refine((data) => {
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(data.cni.type) && validTypes.includes(data.driverDocument.type);
}, {
    message: 'Files must be JPEG, PNG',
});

export type UserSchemaType = z.infer<typeof userSchema>
export type SignInSchemaType = z.infer<typeof signInSchema>
export type SignUpSchemaType = z.infer<typeof signUpSchema>
export type DriverApplicationSchemaType = z.infer<typeof driverApplicationSchema>