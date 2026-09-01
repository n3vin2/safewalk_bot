import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3(
    {
        url: process.env.DATABASE_URL,
        timeout: 5000
    }
);
export const prisma = new PrismaClient({ adapter });

// WAL persists on the file; foreign_keys must be enabled per connection.
await prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;");
await prisma.$queryRawUnsafe("PRAGMA foreign_keys=ON;");
