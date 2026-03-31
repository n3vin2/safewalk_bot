import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma";

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 1
});

const prisma = new PrismaClient({ adapter });

const SHIFT_TYPES = [
    { name: "Patrol" },
    { name: "Study" },
    { name: "Trainer" },
    { name: "Trainee" }
]

const main = async () => {
    await Promise.all(
        SHIFT_TYPES.map(async shift => {
            await prisma.shift_Type.upsert({
                where: { name: shift.name },
                update: shift,
                create: shift
            })
        })
    )
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());