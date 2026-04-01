import { prisma } from "./db.js";

export const getDispatchers = async () => {
    const dispatchers = await prisma.dispatcher.findMany({
        select: { name: true }
    });

    return dispatchers.map(dispatcher => dispatcher.name);
}