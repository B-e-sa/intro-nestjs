import { Body, ConflictException, Controller, HttpCode, Post, UsePipes } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import bcrypt from 'bcrypt'
import { z } from "zod"
import { ZodValidationPipe } from "@/pipes/zod-validation.pipe"

const createAccountBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string()
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller()
export class CreateAccountController {
    constructor(private prisma: PrismaService) { }

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createAccountBodySchema))
    async handle(@Body() body: any) {
        const {
            name,
            email,
            password
        } = createAccountBodySchema.parse(body)

        const userWithSameEmail = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (userWithSameEmail)
            throw new ConflictException('User with same email already exists')

        const hashedPassword = await bcrypt.hash(password, 8)

        await this.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        })
    }
}