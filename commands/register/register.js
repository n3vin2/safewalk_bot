import { SlashCommandBuilder } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

export const data = new SlashCommandBuilder().setName("register").setDescription("Set daily shift pings for this server.");

export const execute = async (interaction) => {
    try {
        const rawData = await readFile("registered_channels.json", "utf-8");
        let data = JSON.parse(rawData);
        if (!(interaction.guildId in data)) {
            console.log('new guild');
            data = {...data, [interaction.guildId]: []};
        }
        if (data[interaction.guildId].includes(interaction.channelId)) {
            await interaction.reply("This channel has already been set for pings.");
            return;
        }
        data[interaction.guildId] = [...data[interaction.guildId], interaction.channelId];
        await writeFile("registered_channels.json", JSON.stringify(data));
        await interaction.reply("This channel has been successfully set for pings!");
        
    } catch (exception) {
        console.log(exception);
        await interaction.reply("Something went wrong. Please try again.");
    }
}