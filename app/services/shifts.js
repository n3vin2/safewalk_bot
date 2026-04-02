import { prisma } from "./db.js";
import { getCurrentTimeZone } from "./time/timezone.js";

export const getShift = async () => {
    const shifts = await prisma.shift.findMany({
        include: {
            shift_type: true
        },
        orderBy: { shift_type: {id: "asc"} },
    });
    return shifts;
}

export const groupShiftByTime = async (shifts) => {
    const shift_times = await prisma.shift_Time.findMany({
        orderBy: { time: "asc" }
    });

    const res = {};
    shift_times.forEach(shift_times =>
        res[shift_times.time] = shifts.filter(shift => shift.shift_start_hour === shift_times.time)
    );

    return res;
}

export const getShiftCredits = async (email) => {
    const shift_credits = await prisma.shift_Credit.findMany({
        where: {
            user_email: email,
            week: { lt: getCurrentTimeZone(new Date()) }
        },
        orderBy: { week: "asc" }
    });
    return shift_credits;
}