import { ContainerBuilder } from "discord.js"
import { getDispatchers } from "../../services/dispatchers.js"
import { getCurrentTimeZone } from "../../services/time/timezone.js"
import { prisma } from "../../services/db.js"

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shift_type_length = "Patroller ".length;
const shift_status_length = "🟡 Part Open ".length

const getStatus = (signed_up, capacity) => {
    if (signed_up === 0) {
        return "🟢 Open";
    } else if (signed_up < capacity) {
        return "🟡 Part Open";
    } else {
        return "🔴 Filled";
    }
}

const buildShiftText = (shift) => {
    return `${shift.shift_type_name.padEnd(shift_type_length, " ")}${getStatus(shift.signed_up, shift.capacity).padEnd(shift_status_length, " ")}(${shift.signed_up}/${shift.capacity})`;
}

export const buildPingComponent = async (role_id, shifts) => {
    const dispatchers = await getDispatchers();

    const today = getCurrentTimeZone(new Date());

    const container = new ContainerBuilder()
        .setAccentColor(0xffff00)
        .addTextDisplayComponents(textDisplay =>
            textDisplay.setContent(`**Hi <@&${role_id}>, happy ${days[today.getDay()]}!\nDispatcher${dispatchers.length === 1 ? "" : "s"}: ${dispatchers.join(", ")}**`)
        )

        const shift_times = await prisma.shift_Time.findMany({
            select: { time: true },
            orderBy: { time: "asc" }
        });

        shift_times.forEach(time => {
            container.addSeparatorComponents(separator => separator);
            container.addTextDisplayComponents(textDisplay =>
                textDisplay.setContent(`**${time.time} shifts**`)
            )
            container.addTextDisplayComponents(
                textDisplay => textDisplay.setContent(`\`\`\`${shifts[time.time].map(shift => buildShiftText(shift)).join("\n")}\`\`\``)
            )
        });

    return container;
}