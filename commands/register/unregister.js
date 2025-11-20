import { SlashCommandBuilder } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

export const data = new SlashCommandBuilder().setName("unregister").setDescription("Remove daily shift pings for this server.");

export const execute = async (interaction) => {
    try {
        const rawData = await readFile("registered_channels.json", "utf-8");
        let data = JSON.parse(rawData);
        if (!(interaction.guildId in data) || !(data[interaction.guildId].includes(interaction.channelId))) {
            await interaction.reply("This channel was not set for pings.");
            return;
        }
        data[interaction.guildId] = data[interaction.guildId].filter(id => id != interaction.channelId);
        await writeFile("registered_channels.json", JSON.stringify(data));
        await interaction.reply("This channel will no longer be set for pings.");
    } catch (exception) {
        console.log(exception);
        await interaction.reply("Something went wrong. Please try again.");
    }
}