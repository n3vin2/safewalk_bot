import { ContainerBuilder } from "discord.js"

export const buildCreditsComponent = async (credits) => {
    const total_credits = credits.reduce((acc, cur) => acc + cur.credits * 10, 0);
    const percentage = (total_credits / (credits.length * 10)).toFixed(2) * 100
    const container = new ContainerBuilder()
        .setAccentColor(0xffff00)
        .addTextDisplayComponents(textDisplay =>
            textDisplay.setContent("# Your Shift Credits")
        )
        .addSeparatorComponents(separator => separator)
        .addTextDisplayComponents(textDisplay => 
            textDisplay.setContent(`Your current shift credit completion is at **${percentage}%**`)
        );

    return container;
}