import { ZodValidationPipe } from "@/pipes/zod-validation.pipe"
import { PrismaService } from "@/prisma/prisma.service"
import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException, UsePipes } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { compare } from "bcrypt"
import { z } from "zod"

const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string()
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/auth')
export class AuthenticateController {
    constructor(
        private jwt: JwtService,
        private prisma: PrismaService
    ) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(authenticateBodySchema))
    async handle(@Body() body: AuthenticateBodySchema) {
        const {
            email,
            password
        } = body

        const user = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (!user) throw new UnauthorizedException('User not found')

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid)
            throw new UnauthorizedException('Invalid password')

        const token = this.jwt.sign({
            sub: user.id
        })

        return { token }
    }
}