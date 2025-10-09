import { UserRole } from '@prisma/client'
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

export type UserSchemaType = z.infer<typeof userSchema>
export type SignInSchemaType = z.infer<typeof signInSchema>
export type SignUpSchemaType = z.infer<typeof signUpSchema>