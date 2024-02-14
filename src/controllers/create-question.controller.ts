import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { CurrentUser } from "@/auth/current-user.decorator";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { TokenPayload } from "@/auth/jwt.strategy";
import { ZodValidationPipe } from "@/pipes/zod-validation.pipe";
import { PrismaService } from "@/prisma/prisma.service";
import { z } from "zod";

const createQuestionBodySchema = z.object({
    content: z.string(),
    title: z.string()
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(
        private prisma: PrismaService
    ) { }

    private convertToSlug(title: string) {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u336f]/q, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createQuestionBodySchema))
    async handle(
        @Body() body: CreateQuestionBodySchema,
        @CurrentUser() user: TokenPayload
    ) {
        const { title, content } = body
        const userId = user.sub

        await this.prisma.question.create({
            data: {
                authorId: userId,
                title,
                content,
                slug: "asd"
            }
        })

        return 'ok'
    }
}