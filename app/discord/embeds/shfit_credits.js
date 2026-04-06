import { ContainerBuilder } from "discord.js"
import { emojis } from "../config/emojis.js";

const emoji_color_order = [
    "fffde7",
    "fff9c4",
    "fff176",
    "ffee58",
    "ffca28",
    "ffa000",
    "e65100",
    "bf360c",
]

const not_counted_color = "1e1a2e";
const no_contribution_color = "4a4d52";

const getCreditColor = (credit) => {
    if (credit === 0) {
        return emojis[no_contribution_color]
    }
    const emoji_color = emoji_color_order[Math.min(emoji_color_order.length - 1, Math.floor(credit))];
    return emojis[emoji_color];
}

export const buildCreditsComponent = async (credits) => {
    const total_credits = credits.reduce((acc, cur) => acc + (cur.credits !== null ? cur.credits * 10 : 0), 0);
    const total_count = credits.reduce((acc, cur) => acc + (cur.credits !== null ? 10 : 0), 0);
    const percentage = Math.round((total_credits / total_count) * 100)

    const credit_emojis = credits.map(credit => credit.credits !== null ? getCreditColor(credit.credits) : emojis[not_counted_color])

    const container = new ContainerBuilder()
        .setAccentColor(0xffff00)
        .addTextDisplayComponents(textDisplay =>
            textDisplay.setContent("# Your Shift Credits")
        )
        .addSeparatorComponents(separator => separator)
        .addTextDisplayComponents(textDisplay => 
            textDisplay.setContent(`Your current shift credit completion is at **${percentage}%**`)
        )
        .addSeparatorComponents(separator => separator)
        .addTextDisplayComponents(
            textDisplay => textDisplay.setContent("## Shift Credits Earned Weekly"),
            textDisplay => textDisplay.setContent(`**Less ${emoji_color_order.map(color => emojis[color]).join("")} More **`),
            textDisplay => textDisplay.setContent(`**${emojis[not_counted_color]} = Not Counted **`),
            textDisplay => textDisplay.setContent(credit_emojis.join(""))
        );

    return container;
}