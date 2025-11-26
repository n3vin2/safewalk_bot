import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

export const data = new SlashCommandBuilder().setName("unregister").setDescription("Remove daily shift pings for this server.");

export const execute = async (interaction) => {
    try {
        if (interaction.user.id === process.env.dev_id || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const rawData = await readFile("registered_channels.json", "utf-8");
            let data = JSON.parse(rawData);

            let newGuildObj = null;
            data.forEach(guild => {
                if (guild.guildId === interaction.guildId) {
                    guild.channels.forEach(channel => {
                        if (channel.channelId === interaction.channelId) {
                            newGuildObj = guild;
                        }
                    });
                }
            });
            if (!newGuildObj) {
                await interaction.reply("This channel was not set for pings.");
                return;
            }
            
            newGuildObj = {
                ...newGuildObj,
                channels: newGuildObj.channels.filter(channel => channel.channelId !== interaction.channelId)
            }
            data = [...data.filter(guild => guild.guildId !== interaction.guildId), newGuildObj];
            await writeFile("registered_channels.json", JSON.stringify(data));
            await interaction.reply("This channel will no longer be set for pings.");
        } else {
            await interaction.reply("Insufficient permissions to run this command.");
        }
    } catch (exception) {
        console.log(exception);
        await interaction.reply("Something went wrong. Please try again.");
    }
}