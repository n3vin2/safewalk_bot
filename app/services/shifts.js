import { prisma } from "./db.js";

export const getShift = async () => {
    const shifts = await prisma.shift.findMany({
        include: {
            shift_type: true
        },
        orderBy: { shift_type: {id: "asc"} },
    });

    const shift_times = await prisma.shift_Time.findMany({
        orderBy: { time: "asc" }
    });

    const res = {};
    shift_times.forEach(shift_times =>
        res[shift_times.time] = shifts.filter(shift => shift.shift_start_hour === shift_times.time)
    );

    return res;
}