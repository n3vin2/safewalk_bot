import { PrismaClient } from "../generated/prisma/index.js";

export const prisma = new PrismaClient();

// WAL persists on the file; foreign_keys must be enabled per connection.
await prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;");
await prisma.$queryRawUnsafe("PRAGMA foreign_keys=ON;");
