import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/app.module";
import { Test } from "@nestjs/testing";
import request from 'supertest'
import { faker } from "@faker-js/faker";
import { PrismaService } from "@/prisma/prisma.service";
import bcrypt from 'bcrypt'

describe("Authenticate account (E2E)", () => {
    let app: INestApplication;
    let prisma: PrismaService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService)

        await app.init();
    });

    test('[POST] /auth', async () => {
        const password = await bcrypt.hash(
            faker.internet.password(),
            8
        )

        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
                password
            }
        })

        const res = await request(app.getHttpServer())
            .post('/auth')
            .send({
                email: user.email,
                password: user.password
            })

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            token: expect.any(String)
        })
    });

    afterAll(async () => await app.close());
})
