import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma";

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

const SHIFT_TYPES = [
    { name: "Patroller" },
    { name: "Study" },
    { name: "Trainee" },
    { name: "Trainer" }
]

const SHIFT_TIME = [
    { time: "7:00 PM" },
    { time: "8:00 PM" },
    { time: "9:00 PM" }
]

const main = async () => {
    await Promise.all(
        SHIFT_TYPES.map(async shift_type => {
            await prisma.shift_Type.upsert({
                where: { name: shift_type.name },
                update: shift_type,
                create: shift_type
            })
        })
    );
    
    await Promise.all(
        SHIFT_TIME.map(async shift_time => {
            await prisma.shift_Time.upsert({
                where: { time: shift_time.time },
                update: shift_time,
                create: shift_time
            })
        })
    );
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());