import * as z from "zod"

export const facultySchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters"}),
    email: z.string().email({ message: "Invalid email address"}),
    role: z.enum(['admin', 'faculty', 'student']),
    department: z.string(),
    image: z.string().optional(),
       
})