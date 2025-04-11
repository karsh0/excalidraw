import {z} from "zod";

export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string()
})

export const SignSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export const CreateRoomSchema = z.object({
    name: z.string()
})