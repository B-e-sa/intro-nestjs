import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/app.module";
import { Test } from "@nestjs/testing";
import request from 'supertest'
import { faker } from "@faker-js/faker";
import { PrismaService } from "@/prisma/prisma.service";

describe("Create account (E2E)", () => {
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

    test('[GET] /account', async () => {
        const email = faker.internet.email()

        const req = await request(app.getHttpServer())
            .post('/accounts')
            .send({
                name: faker.person.fullName(),
                email,
                password: faker.internet.password()
            })

        expect(req.statusCode).toBe(201)
        const createdUser = await prisma.user.findUnique({
            where: { email }
        })

        expect(createdUser).toBeTruthy()
    });

    afterAll(async () => await app.close());
})
